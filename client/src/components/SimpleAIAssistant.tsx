import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, MessageCircle, Loader2, Home, Calculator, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SimpleAIAssistantProps {
  onSearchQuery?: (query: string, filters: any) => void;
  propertyContext?: any;
  className?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function SimpleAIAssistant({ onSearchQuery, propertyContext, className }: SimpleAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm Emma, your property assistant. I can help you find properties, calculate mortgages, and provide insights about South African real estate. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Find 3 bedroom houses under R2 million",
        "Tell me about Sandton neighborhoods", 
        "Calculate mortgage for R1.5 million",
        "What are the best family areas?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const processLocalMessage = (message: string): { response: string; suggestions?: string[]; searchQuery?: string; filters?: any } => {
    const lowerMessage = message.toLowerCase();
    
    // Property search patterns
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('looking for')) {
      const filters: any = {};
      let searchQuery = message;
      
      // Extract bedrooms
      const bedroomMatch = lowerMessage.match(/(\d+)\s*bedroom/);
      if (bedroomMatch) {
        filters.bedrooms = parseInt(bedroomMatch[1]);
      }
      
      // Extract bathrooms
      const bathroomMatch = lowerMessage.match(/(\d+)\s*bathroom/);
      if (bathroomMatch) {
        filters.bathrooms = parseInt(bathroomMatch[1]);
      }
      
      // Extract price ranges
      const priceMatch = lowerMessage.match(/under\s*r?(\d+(?:\.\d+)?)\s*(million|mil|m)/i);
      if (priceMatch) {
        const amount = parseFloat(priceMatch[1]);
        const unit = priceMatch[2].toLowerCase();
        filters.maxPrice = unit.includes('mil') || unit.includes('m') ? amount * 1000000 : amount;
      }
      
      // Extract property type
      if (lowerMessage.includes('house')) filters.propertyType = 'house';
      else if (lowerMessage.includes('apartment')) filters.propertyType = 'apartment';
      else if (lowerMessage.includes('townhouse')) filters.propertyType = 'townhouse';
      
      // Extract locations
      const locations = ['sandton', 'cape town', 'durban', 'johannesburg', 'pretoria', 'centurion', 'stellenbosch'];
      for (const location of locations) {
        if (lowerMessage.includes(location)) {
          filters.city = location;
          break;
        }
      }
      
      let response = "I'll help you search for properties! ";
      if (filters.bedrooms) response += `Looking for ${filters.bedrooms} bedroom properties `;
      if (filters.maxPrice) response += `under R${(filters.maxPrice / 1000000).toFixed(1)}M `;
      if (filters.city) response += `in ${filters.city} `;
      if (filters.propertyType) response += `(${filters.propertyType}s) `;
      
      response += "Let me find some options for you.";
      
      return {
        response,
        suggestions: [
          "Show me more details about these properties",
          "What neighborhoods should I consider?",
          "Calculate my mortgage options",
          "Tell me about schools in the area"
        ],
        searchQuery,
        filters
      };
    }
    
    // Mortgage and financing
    if (lowerMessage.includes('mortgage') || lowerMessage.includes('finance') || lowerMessage.includes('loan')) {
      return {
        response: "I can help with mortgage calculations! For properties in South Africa, you'll typically need a 10-20% deposit. Current interest rates are around 11-12%. Transfer duties and bond registration costs also apply. Would you like me to calculate monthly payments for a specific property price?",
        suggestions: [
          "Calculate for R1.5 million property",
          "Calculate for R2 million property", 
          "What deposit do I need?",
          "Explain transfer duties"
        ]
      };
    }
    
    // Neighborhood and area information
    if (lowerMessage.includes('neighborhood') || lowerMessage.includes('area') || lowerMessage.includes('sandton') || lowerMessage.includes('cape town')) {
      const area = lowerMessage.includes('sandton') ? 'Sandton' : 
                   lowerMessage.includes('cape town') ? 'Cape Town' : 'the area';
      
      return {
        response: `${area} is a fantastic choice! It offers excellent schools, shopping centers, and good security. The area has strong property value growth and great amenities. Would you like specific information about schools, crime rates, or property prices in ${area}?`,
        suggestions: [
          `Find properties in ${area}`,
          `Tell me about schools in ${area}`,
          `What are property prices like?`,
          `Is it good for families?`
        ]
      };
    }
    
    // Investment advice
    if (lowerMessage.includes('invest') || lowerMessage.includes('buy') || lowerMessage.includes('property value')) {
      return {
        response: "Property investment in South Africa can be rewarding! Key factors to consider: location growth potential, rental yields (aim for 8-12%), proximity to amenities, and future development plans. Areas like Sandton, Cape Town, and Durban typically show good growth. Would you like advice on a specific area or property type?",
        suggestions: [
          "Best areas for investment",
          "Calculate rental yields",
          "What makes a good investment?",
          "Show me investment properties"
        ]
      };
    }
    
    // General property advice
    if (lowerMessage.includes('buy') || lowerMessage.includes('process') || lowerMessage.includes('help')) {
      return {
        response: "I'm here to help with your property journey! The buying process typically involves: getting pre-approved for a bond, finding the right property, making an offer, getting a home inspection, and transferring ownership. I can assist with property searches, mortgage calculations, and area insights. What specific help do you need?",
        suggestions: [
          "Find properties in my budget",
          "Calculate what I can afford",
          "Tell me about the buying process",
          "Best areas for families"
        ]
      };
    }
    
    // Default response
    return {
      response: "I'd be happy to help you with property-related questions! I can assist with finding properties, calculating mortgages, providing area insights, and guiding you through the buying process. What would you like to know about?",
      suggestions: [
        "Search for properties",
        "Calculate mortgage payments",
        "Learn about neighborhoods",
        "Get buying advice"
      ]
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = processLocalMessage(userMessage.content);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: result.response,
      timestamp: new Date(),
      suggestions: result.suggestions
    };

    setMessages(prev => [...prev, assistantMessage]);

    // If there's a search query, execute it
    if (result.searchQuery && onSearchQuery) {
      onSearchQuery(result.searchQuery, result.filters || {});
    }

    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          Property Assistant
          <Badge variant="secondary" className="ml-auto">
            Emma
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.type === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-blue-100">
                    <AvatarFallback>
                      <Bot className="w-4 h-4 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.type === 'user'
                      ? "bg-blue-500 text-white ml-12"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
                
                {message.type === 'user' && (
                  <Avatar className="w-8 h-8 bg-gray-100">
                    <AvatarFallback>
                      <User className="w-4 h-4 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Suggestions */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && (
              <div className="flex flex-wrap gap-2 mt-4">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-blue-100">
                  <AvatarFallback>
                    <Bot className="w-4 h-4 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about properties, neighborhoods, or financing..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              size="icon"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Home className="w-3 h-3" />
              Property Search
            </div>
            <div className="flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              Mortgage Advice
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Area Insights
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}