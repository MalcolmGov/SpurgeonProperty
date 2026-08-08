import OpenAI from "openai";
import { db } from "./db";
import { chatSessions, chatMessages, properties, agents } from "@shared/schema";
import { eq, desc, and, or, gte, lte, ilike } from "drizzle-orm";
import type { ChatSession, ChatMessage, InsertChatSession, InsertChatMessage, PropertyWithAgent } from "@shared/schema";
import { matchFAQ } from "./knowledge-base/faq-matcher";
import { parsePropertyQuery, findProperties, formatPropertyResponse } from "./knowledge-base/property-query";
import { submitLead } from "./knowledge-base/lead-capture";

interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  suggestions?: string[];
  properties?: PropertyWithAgent[];
  filters?: any;
  intent: string;
  confidence: number;
}

interface UserPreferences {
  budgetMin?: number;
  budgetMax?: number;
  preferredAreas?: string[];
  propertyTypes?: string[];
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  lifestyle?: string[];
}

interface ConversationContext {
  lastSearch?: any;
  propertyViewed?: number[];
  interests?: string[];
  stage?: string;
}

class AIChatbotService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async processChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Get or create chat session
      const session = await this.getOrCreateSession(request.sessionId, request.userId);

      // Save user message
      await this.saveMessage(session.sessionId, 'user', request.message);

      // 1. FAQ knowledge base - answered from static Q&A data, no LLM call
      const faqMatch = matchFAQ(request.message);
      if (faqMatch) {
        const response: ChatResponse = {
          response: faqMatch.entry.answer,
          sessionId: session.sessionId,
          suggestions: faqMatch.entry.suggestions || [],
          properties: [],
          filters: {},
          intent: "faq",
          confidence: faqMatch.score
        };
        await this.saveMessage(session.sessionId, 'assistant', response.response, {
          intent: "faq",
          faqId: faqMatch.entry.id,
          confidence: faqMatch.score
        });
        return response;
      }

      // 2. Property listings - answered from a direct DB lookup, no LLM call
      const propertyQuery = await parsePropertyQuery(request.message);
      if (propertyQuery.isPropertyQuery) {
        const { results, totalActive } = await findProperties(propertyQuery.filters);
        const responseText = formatPropertyResponse(results, propertyQuery.filters, totalActive);
        const suggestions = this.generateSuggestions("property_search", session, results);

        const response: ChatResponse = {
          response: responseText,
          sessionId: session.sessionId,
          suggestions,
          properties: results,
          filters: propertyQuery.filters,
          intent: "property_search",
          confidence: 0.85
        };
        await this.saveMessage(session.sessionId, 'assistant', response.response, {
          intent: "property_search",
          searchFilters: propertyQuery.filters
        });
        await this.updateSessionContext(session.sessionId, {
          ...session.conversationContext,
          lastSearch: propertyQuery.filters
        });
        return response;
      }

      // 3. Fall back to the LLM for anything not covered by the FAQ or
      // property knowledge base (general conversation, advice, follow-ups)
      const history = await this.getConversationHistory(session.sessionId);
      const aiResponse = await this.generateAIResponse(request.message, session, history);

      // Save AI response
      await this.saveMessage(session.sessionId, 'assistant', aiResponse.response, aiResponse.metadata);

      // Update session context
      await this.updateSessionContext(session.sessionId, aiResponse.context);

      return {
        response: aiResponse.response,
        sessionId: session.sessionId,
        suggestions: aiResponse.suggestions,
        properties: aiResponse.properties,
        filters: aiResponse.filters,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence
      };
    } catch (error) {
      console.error("Error processing chat:", error);
      return this.fallbackResponse(request.sessionId || this.generateSessionId());
    }
  }

  private async getOrCreateSession(sessionId?: string, userId?: string): Promise<ChatSession> {
    if (sessionId) {
      const existing = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId)).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
    }

    const newSessionId = sessionId || this.generateSessionId();
    const [session] = await db.insert(chatSessions).values({
      sessionId: newSessionId,
      userId: userId || null,
      userPreferences: {},
      conversationContext: {}
    }).returning();

    return session;
  }

  private async saveMessage(sessionId: string, role: string, content: string, metadata?: any): Promise<void> {
    await db.insert(chatMessages).values({
      sessionId,
      role,
      content,
      metadata: metadata || {}
    });
  }

  private async getConversationHistory(sessionId: string, limit: number = 10): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  private async generateAIResponse(message: string, session: ChatSession, history: ChatMessage[]): Promise<{
    response: string;
    suggestions: string[];
    properties: PropertyWithAgent[];
    filters: any;
    intent: string;
    confidence: number;
    context: any;
    metadata: any;
  }> {
    if (!this.openai) {
      return this.fallbackAIResponse(message, session);
    }

    const systemPrompt = this.buildSystemPrompt(session);
    const conversationHistory = this.formatConversationHistory(history);

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message }
        ],
        functions: [
          {
            name: "search_properties",
            description: "Search for properties based on user criteria",
            parameters: {
              type: "object",
              properties: {
                minPrice: { type: "number", description: "Minimum price in ZAR" },
                maxPrice: { type: "number", description: "Maximum price in ZAR" },
                propertyType: { type: "string", enum: ["house", "apartment", "townhouse", "flat", "cluster_home", "farm", "vacant_land"] },
                bedrooms: { type: "number", description: "Number of bedrooms" },
                bathrooms: { type: "number", description: "Number of bathrooms" },
                city: { type: "string", description: "City name" },
                suburb: { type: "string", description: "Suburb name" },
                features: { type: "array", items: { type: "string" }, description: "Required features" }
              }
            }
          },
          {
            name: "update_preferences",
            description: "Update user preferences based on conversation",
            parameters: {
              type: "object",
              properties: {
                budgetMin: { type: "number" },
                budgetMax: { type: "number" },
                preferredAreas: { type: "array", items: { type: "string" } },
                propertyTypes: { type: "array", items: { type: "string" } },
                bedrooms: { type: "number" },
                bathrooms: { type: "number" },
                features: { type: "array", items: { type: "string" } },
                lifestyle: { type: "array", items: { type: "string" } }
              }
            }
          },
          {
            name: "submit_lead",
            description: "Send the user's contact details to the Spurgeon Property team as a lead or property viewing request. Only call this once you have the user's full name and email address (phone is optional but helpful). Call it when the user wants to book a viewing, wants an agent to contact them, or expresses clear interest in being followed up with.",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "The user's full name" },
                email: { type: "string", description: "The user's email address" },
                phone: { type: "string", description: "The user's phone number, if given" },
                requestType: {
                  type: "string",
                  enum: ["viewing", "general_inquiry"],
                  description: "'viewing' if the user wants to book a viewing of a specific property, otherwise 'general_inquiry'"
                },
                propertyId: { type: "number", description: "The id of the property the user is interested in, if known from the conversation" },
                preferredDateText: { type: "string", description: "The user's preferred viewing date/time in their own words, e.g. 'Saturday afternoon'" },
                preferredDateISO: { type: "string", description: "ISO 8601 datetime for the preferred viewing time, only if you can confidently resolve it from the conversation" },
                message: { type: "string", description: "Any other relevant context about what the user is asking for" }
              },
              required: ["name", "email", "requestType"]
            }
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message;
      const functionCall = response.function_call;

      let properties: PropertyWithAgent[] = [];
      let filters: any = {};
      let updatedPreferences: UserPreferences = session.userPreferences;
      let leadConfirmation: string | null = null;

      if (functionCall) {
        const args = JSON.parse(functionCall.arguments);

        if (functionCall.name === "search_properties") {
          properties = await this.searchProperties(args);
          filters = args;
        } else if (functionCall.name === "update_preferences") {
          updatedPreferences = { ...session.userPreferences, ...args };
        } else if (functionCall.name === "submit_lead") {
          try {
            const result = await submitLead(args);
            leadConfirmation = result.confirmationNote;
          } catch (error) {
            console.error("Failed to submit lead from chat:", error);
            leadConfirmation = "I couldn't submit that just now - please contact us directly on 084 208 9307 or Peter@spurgeonproperty.com and we'll take it from there.";
          }
        }
      }

      const intent = this.determineIntent(message, functionCall?.name);
      const suggestions = this.generateSuggestions(intent, session, properties);

      return {
        response: leadConfirmation || response.content || "I'm here to help you find the perfect property!",
        suggestions,
        properties,
        filters,
        intent,
        confidence: 0.9,
        context: {
          ...session.conversationContext,
          lastSearch: filters,
          propertyViewed: [...(session.conversationContext.propertyViewed || [])],
          interests: this.extractInterests(message, session.conversationContext.interests || [])
        },
        metadata: {
          functionCall: functionCall?.name,
          searchFilters: filters,
          intent,
          confidence: 0.9
        }
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return this.fallbackAIResponse(message, session);
    }
  }

  private buildSystemPrompt(session: ChatSession): string {
    const preferences = session.userPreferences;
    const context = session.conversationContext;

    return `You are a helpful and knowledgeable South African real estate assistant. Your role is to help users find their perfect property.

User Profile:
- Budget: ${preferences.budgetMin ? `R${preferences.budgetMin.toLocaleString()}` : 'Not specified'} - ${preferences.budgetMax ? `R${preferences.budgetMax.toLocaleString()}` : 'Not specified'}
- Preferred Areas: ${preferences.preferredAreas?.join(', ') || 'Not specified'}
- Property Types: ${preferences.propertyTypes?.join(', ') || 'Not specified'}
- Bedrooms: ${preferences.bedrooms || 'Not specified'}
- Bathrooms: ${preferences.bathrooms || 'Not specified'}
- Desired Features: ${preferences.features?.join(', ') || 'Not specified'}
- Lifestyle Preferences: ${preferences.lifestyle?.join(', ') || 'Not specified'}

Conversation Context:
- Stage: ${context.stage || 'browsing'}
- Previous Interests: ${context.interests?.join(', ') || 'None'}
- Properties Viewed: ${context.propertyViewed?.length || 0} properties

Guidelines:
1. Be conversational, friendly, and professional
2. Use South African terminology and currency (ZAR/Rand)
3. Ask follow-up questions to understand needs better
4. Provide personalized recommendations based on user preferences
5. Use property search when users express specific criteria
6. Update user preferences when they mention new requirements
7. Suggest relevant properties and neighborhoods
8. Be helpful with property market insights for South Africa

Booking a viewing or passing on a lead:
- If the user wants to book a viewing, wants an agent to contact them, or clearly wants to be followed up with, collect their full name and email address (phone is a nice-to-have but not required) before calling submit_lead. Ask for whichever of these you don't already have from earlier in the conversation - one at a time, don't interrogate them.
- If they're asking about a specific property that was mentioned earlier in this conversation, pass its id as propertyId and set requestType to "viewing". Otherwise use requestType "general_inquiry".
- If they mention a preferred day/time for a viewing, put it in preferredDateText verbatim, and only fill preferredDateISO if you can confidently resolve it to a real date.
- Once submit_lead succeeds, don't submit the same request again in this conversation - just confirm it's been sent and offer to help with anything else.

Always format prices in South African Rand (R) and use local property terminology.`;
  }

  private formatConversationHistory(history: ChatMessage[]): Array<{ role: string; content: string }> {
    return history
      .reverse()
      .slice(-5) // Last 5 messages for context
      .map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }));
  }

  private async searchProperties(filters: any): Promise<PropertyWithAgent[]> {
    let query = db.select({
      property: properties,
      agent: agents
    })
    .from(properties)
    .leftJoin(agents, eq(properties.agentId, agents.id))
    .where(eq(properties.status, 'active'));

    // Apply filters
    const conditions = [eq(properties.status, 'active')];

    if (filters.minPrice) {
      // Convert price string to number for comparison
      conditions.push(gte(properties.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice.toString()));
    }

    if (filters.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }

    if (filters.bedrooms) {
      conditions.push(eq(properties.bedrooms, filters.bedrooms));
    }

    if (filters.city) {
      conditions.push(ilike(properties.city, `%${filters.city}%`));
    }

    if (filters.suburb) {
      conditions.push(ilike(properties.suburb, `%${filters.suburb}%`));
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(6).execute();

    return results.map(result => ({
      ...result.property,
      agent: result.agent || undefined
    }));
  }

  private determineIntent(message: string, functionCall?: string): string {
    if (functionCall === "search_properties") return "property_search";
    if (functionCall === "update_preferences") return "preference_update";
    if (functionCall === "submit_lead") return "lead_submitted";

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("search") || lowerMessage.includes("find") || lowerMessage.includes("looking for")) {
      return "property_search";
    }
    if (lowerMessage.includes("budget") || lowerMessage.includes("price") || lowerMessage.includes("afford")) {
      return "budget_inquiry";
    }
    if (lowerMessage.includes("area") || lowerMessage.includes("location") || lowerMessage.includes("suburb")) {
      return "location_inquiry";
    }
    if (lowerMessage.includes("bedroom") || lowerMessage.includes("bathroom") || lowerMessage.includes("space")) {
      return "specification_inquiry";
    }
    
    return "general_inquiry";
  }

  private generateSuggestions(intent: string, session: ChatSession, properties: PropertyWithAgent[]): string[] {
    const suggestions: string[] = [];

    switch (intent) {
      case "property_search":
        if (properties.length > 0) {
          suggestions.push("Tell me more about property features");
          suggestions.push("Show me properties in other areas");
          suggestions.push("What's the neighborhood like?");
        } else {
          suggestions.push("Expand my search criteria");
          suggestions.push("Show me similar properties");
          suggestions.push("What areas fit my budget?");
        }
        break;
      case "budget_inquiry":
        suggestions.push("What can I get for my budget?");
        suggestions.push("Show me financing options");
        suggestions.push("Compare different price ranges");
        break;
      case "location_inquiry":
        suggestions.push("Tell me about schools in the area");
        suggestions.push("What amenities are nearby?");
        suggestions.push("Show me transport options");
        break;
      case "lead_submitted":
        suggestions.push("Find more properties");
        suggestions.push("What are your business hours?");
        break;
      default:
        suggestions.push("Help me find a property");
        suggestions.push("What's my budget range?");
        suggestions.push("Show me popular areas");
    }

    return suggestions;
  }

  private extractInterests(message: string, currentInterests: string[]): string[] {
    const interests = [...currentInterests];
    const lowerMessage = message.toLowerCase();

    const interestKeywords = [
      "garden", "pool", "garage", "security", "school", "shopping", "transport",
      "beach", "mountain", "city", "quiet", "family", "investment", "retirement"
    ];

    for (const keyword of interestKeywords) {
      if (lowerMessage.includes(keyword) && !interests.includes(keyword)) {
        interests.push(keyword);
      }
    }

    return interests.slice(-10); // Keep last 10 interests
  }

  private async updateSessionContext(sessionId: string, context: any): Promise<void> {
    await db.update(chatSessions)
      .set({
        conversationContext: context,
        updatedAt: new Date()
      })
      .where(eq(chatSessions.sessionId, sessionId));
  }

  private fallbackAIResponse(message: string, session: ChatSession): {
    response: string;
    suggestions: string[];
    properties: PropertyWithAgent[];
    filters: any;
    intent: string;
    confidence: number;
    context: any;
    metadata: any;
  } {
    return {
      response: "I'm here to help you find the perfect property! I can search for homes based on your budget, preferred areas, and requirements. What are you looking for?",
      suggestions: [
        "Help me find a property",
        "What's in my budget range?",
        "Show me popular areas",
        "Tell me about property types"
      ],
      properties: [],
      filters: {},
      intent: "general_inquiry",
      confidence: 0.5,
      context: session.conversationContext,
      metadata: {}
    };
  }

  private fallbackResponse(sessionId: string): ChatResponse {
    return {
      response: "I'm here to help you find your perfect property! Ask me about homes, areas, or your budget.",
      sessionId,
      suggestions: [
        "Help me find a property",
        "What's in my budget?",
        "Show me popular areas"
      ],
      intent: "general_inquiry",
      confidence: 0.5
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    return await this.getConversationHistory(sessionId, 50);
  }

  async updateUserPreferences(sessionId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const session = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId)).limit(1);
    if (session.length > 0) {
      const updatedPreferences = { ...session[0].userPreferences, ...preferences };
      await db.update(chatSessions)
        .set({ userPreferences: updatedPreferences })
        .where(eq(chatSessions.sessionId, sessionId));
    }
  }
}

export const aiChatbotService = new AIChatbotService();