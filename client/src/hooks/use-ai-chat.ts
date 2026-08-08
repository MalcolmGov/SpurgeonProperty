import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface AIChatMessage {
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

const WELCOME_MESSAGE: AIChatMessage = {
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
};

interface UseAIChatOptions {
  onSearchQuery?: (query: string, filters: any) => void;
}

export function useAIChat({ onSearchQuery }: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<AIChatMessage[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState<string>(() => {
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: AIChatMessage = {
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
          userId: null
        }),
      });

      if (!response.ok) {
        throw new Error('AI chat failed');
      }

      const result = await response.json();

      const assistantMessage: AIChatMessage = {
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

      if (result.properties && result.properties.length > 0 && onSearchQuery) {
        onSearchQuery(result.response, result.filters || {});
      }
    } catch (error) {
      console.error('AI chat error:', error);

      const errorMessage: AIChatMessage = {
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

  return {
    messages,
    inputMessage,
    setInputMessage,
    isProcessing,
    sendMessage,
    handleKeyPress,
    handleSuggestionClick,
    formatTimestamp,
    messagesEndRef,
    inputRef,
  };
}
