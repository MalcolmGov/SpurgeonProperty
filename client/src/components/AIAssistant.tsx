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

interface AIAssistantProps {
  onSearchQuery?: (query: string, filters: any) => void;
  propertyContext?: any;
  className?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  propertyData?: any;
  suggestions?: string[];
  properties?: any[];
  intent?: string;
  confidence?: number;
}

interface ChatSession {
  sessionId: string;
  userPreferences: any;
  conversationContext: any;
}

export default function AIAssistant({ onSearchQuery, propertyContext, className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your personal property assistant. I can help you find your perfect home, answer questions about properties, neighborhoods, financing, and much more. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Find 3 bedroom houses under R2 million",
        "Tell me about Sandton neighborhoods", 
        "Calculate mortgage for R1.5 million",
        "What are the best family areas in Cape Town?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    // Generate or retrieve session ID
    const stored = localStorage.getItem('ai-chat-session');
    if (stored) {
      return stored;
    }
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('ai-chat-session', newSessionId);
    return newSessionId;
  });
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId,
          userId: null // Can be added for user tracking
        }),
      });

      if (!response.ok) {
        throw new Error('AI chat failed');
      }

      const result = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        properties: result.properties || [],
        suggestions: result.suggestions || [],
        intent: result.intent,
        confidence: result.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If the AI found properties and we have a search handler
      if (result.properties && result.properties.length > 0 && onSearchQuery) {
        // Trigger property display with the found properties
        onSearchQuery(result.response, result.filters || {});
      }

    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Assistant Unavailable",
        description: "The AI assistant is temporarily unavailable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
            AI Powered
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
                  
                  {message.properties && message.properties.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-blue-600">
                        Found {message.properties.length} property matches:
                      </p>
                      {message.properties.slice(0, 3).map((property: any, index: number) => (
                        <div key={index} className="p-2 bg-white/90 dark:bg-gray-800/90 rounded border text-gray-900 dark:text-gray-100">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-medium truncate flex-1">
                              {property.title}
                            </p>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {property.price ? `R${parseInt(property.price).toLocaleString()}` : 'Contact for price'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {property.bedrooms} bed, {property.bathrooms} bath • {property.suburb}, {property.city}
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {property.propertyType}
                            </Badge>
                            {property.area && (
                              <Badge variant="outline" className="text-xs">
                                {property.area}m²
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {message.properties.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{message.properties.length - 3} more properties found
                        </p>
                      )}
                    </div>
                  )}
                  
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