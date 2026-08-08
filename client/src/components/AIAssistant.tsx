import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, MessageCircle, Loader2, Home, Calculator, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { showsBedroomsAndBathrooms } from "@/lib/property-display";
import { useAIChat } from "@/hooks/use-ai-chat";

interface AIAssistantProps {
  onSearchQuery?: (query: string, filters: any) => void;
  propertyContext?: any;
  className?: string;
}

export default function AIAssistant({ onSearchQuery, propertyContext, className }: AIAssistantProps) {
  const {
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
  } = useAIChat({ onSearchQuery });

  // Quick suggestions for user convenience
  const quickSuggestions = [
    "Find properties under R2 million",
    "Show me 3 bedroom houses",
    "Tell me about Sandton",
    "Calculate mortgage options"
  ];

  return (
    <div className={cn("flex flex-col w-full max-w-full h-[380px] sm:h-[420px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden", className)}>
      {/* Chatbot Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-2 sm:p-3 flex items-center gap-2">
        <div className="relative">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg truncate">Property Assistant</h3>
          <p className="text-white/80 text-xs sm:text-sm truncate">Online • Ready to help you find your perfect home</p>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
          AI Powered
        </Badge>
      </div>
      
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800/50">
        <ScrollArea className="h-full p-2 sm:p-3">
          <div className="space-y-2 sm:space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-full",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.type === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm shadow-sm",
                    message.type === 'user'
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.properties && message.properties.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-blue-600">
                        Found {message.properties.length} property matches:
                      </p>
                      {message.properties.slice(0, 3).map((property: any, index: number) => (
                        <div key={index} className="p-2 sm:p-3 bg-white/90 dark:bg-gray-800/90 rounded border text-gray-900 dark:text-gray-100">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                            <p className="text-xs font-medium line-clamp-2 flex-1">
                              {property.title}
                            </p>
                            <Badge variant="outline" className="text-xs self-start sm:ml-2 shrink-0">
                              {property.price ? `R${parseInt(property.price).toLocaleString()}` : 'Contact for price'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {showsBedroomsAndBathrooms(property.propertyType)
                              ? `${property.bedrooms} bed, ${property.bathrooms} bath • `
                              : ""}
                            {property.suburb}, {property.city}
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
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
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
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">Assistant is typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Chat Input Area */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1 relative min-w-0">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about properties..."
                disabled={isProcessing}
                className="w-full py-2 sm:py-3 text-xs sm:text-sm border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg flex-shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="text-xs px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 flex-shrink-0"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isProcessing}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Powered by indicator */}
          <div className="flex items-center justify-center mt-3 text-xs text-gray-400 dark:text-gray-500">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by OpenAI GPT-4o
          </div>
        </div>
      </div>
    </div>
  );
}