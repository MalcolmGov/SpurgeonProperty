import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, MessageCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/hooks/use-ai-chat";
import ChatPropertyCard from "@/components/ChatPropertyCard";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    messages,
    inputMessage,
    setInputMessage,
    isProcessing,
    sendMessage,
    handleKeyPress,
    handleSuggestionClick,
    clearSession,
    formatTimestamp,
    messagesEndRef,
    inputRef,
  } = useAIChat();

  const closeAndReset = () => {
    setIsOpen(false);
    clearSession();
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[380px] h-[500px] max-h-[70vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-3 flex items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">Property Assistant</h3>
                <p className="text-white/80 text-xs truncate">Online • Ready to help</p>
              </div>
              <button
                onClick={closeAndReset}
                aria-label="Close chat"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800/50">
              <ScrollArea className="h-full p-3">
                <div className="space-y-3">
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
                          "max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-sm",
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
                            {message.properties.slice(0, 3).map((property: any) => (
                              <ChatPropertyCard key={property.id} property={property} />
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
                        <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">Assistant is typing...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative min-w-0">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about properties..."
                      disabled={isProcessing}
                      className="w-full py-2 text-xs border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    className="h-9 w-9 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg flex-shrink-0"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by OpenAI GPT-4o
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        onClick={() => (isOpen ? closeAndReset() : setIsOpen(true))}
        aria-label={isOpen ? "Close property assistant" : "Open property assistant"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 shadow-xl flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ opacity: 0, rotate: 45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -45 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></span>
        )}
      </motion.button>
    </div>
  );
}
