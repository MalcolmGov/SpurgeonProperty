import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceSearchProps {
  onSearchQuery: (query: string, filters: any) => void;
  isProcessing?: boolean;
}

interface RecognitionResult {
  transcript: string;
  confidence: number;
}

export default function VoiceSearchComponent({ onSearchQuery, isProcessing }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [browserSupported, setBrowserSupported] = useState(true);
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setBrowserSupported(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-ZA'; // South African English
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast({
        title: "Voice Search Active",
        description: "Speak your property search requirements...",
      });
    };

    recognitionRef.current.onresult = (event: any) => {
      const result = event.results[event.resultIndex];
      const transcriptText = result[0].transcript;
      const confidenceScore = result[0].confidence;
      
      setTranscript(transcriptText);
      setConfidence(confidenceScore);
      
      if (result.isFinal && transcriptText.trim()) {
        processVoiceQuery(transcriptText, confidenceScore);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = "Speech recognition failed";
      switch (event.error) {
        case 'no-speech':
          errorMessage = "No speech detected. Please try again.";
          break;
        case 'audio-capture':
          errorMessage = "Microphone not accessible. Please check permissions.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone permission denied. Please enable in browser settings.";
          break;
        case 'network':
          errorMessage = "Network error. Please check your connection.";
          break;
      }
      
      toast({
        title: "Voice Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast]);

  const startListening = async () => {
    if (!browserSupported) {
      toast({
        title: "Browser Not Supported",
        description: "Voice search requires a modern browser with speech recognition support.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setTranscript("");
      setConfidence(0);
      recognitionRef.current?.start();
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
      
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please enable microphone access to use voice search.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsListening(false);
  };

  const processVoiceQuery = async (voiceInput: string, confidenceScore: number) => {
    if (confidenceScore < 0.6) {
      toast({
        title: "Low Confidence",
        description: "Speech wasn't clear enough. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingAI(true);
    
    try {
      const response = await fetch('/api/ai/voice-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: voiceInput,
          confidence: confidenceScore,
        }),
      });

      if (!response.ok) {
        throw new Error('AI processing failed');
      }

      const result = await response.json();
      
      toast({
        title: "Voice Search Processed",
        description: `Found ${result.searchQuery} with smart filters applied`,
      });

      // Execute the search with AI-enhanced filters
      onSearchQuery(result.searchQuery, result.filters);
      
    } catch (error) {
      console.error('AI processing error:', error);
      toast({
        title: "AI Processing Failed",
        description: "Using basic search instead. Try speaking more clearly.",
        variant: "destructive",
      });
      
      // Fallback to basic search
      onSearchQuery(voiceInput, {});
    } finally {
      setIsProcessingAI(false);
    }
  };

  const playExamplePrompt = () => {
    const utterance = new SpeechSynthesisUtterance(
      "Try saying: Show me 3 bedroom houses under 2 million Rand in Sandton"
    );
    utterance.lang = 'en-ZA';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  if (!browserSupported) {
    return (
      <Card className="p-4 border-dashed">
        <CardContent className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Voice search not supported in this browser
          </p>
          <p className="text-xs text-muted-foreground">
            Try Chrome, Safari, or Edge for best experience
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className={cn(
        "transition-all duration-300 border-2",
        isListening && "border-blue-500 shadow-lg bg-blue-50/50",
        isProcessingAI && "border-purple-500 shadow-lg bg-purple-50/50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">AI Voice Search</h3>
              {(isListening || isProcessingAI) && (
                <Badge variant="secondary" className="animate-pulse">
                  {isListening ? "Listening..." : "Processing..."}
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={playExamplePrompt}
              className="text-muted-foreground hover:text-foreground"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              Example
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessingAI || isProcessing}
              size="lg"
              className={cn(
                "w-20 h-20 rounded-full transition-all duration-300",
                isListening 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-blue-500 hover:bg-blue-600",
                isProcessingAI && "bg-purple-500"
              )}
            >
              {isProcessingAI ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              ) : isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </Button>

            <div className="text-center space-y-2 min-h-[60px]">
              {transcript && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">"{transcript}"</p>
                  {confidence > 0 && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <Badge variant={confidence > 0.8 ? "default" : confidence > 0.6 ? "secondary" : "destructive"}>
                        {Math.round(confidence * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              {!transcript && !isListening && !isProcessingAI && (
                <p className="text-sm text-muted-foreground">
                  Click to start voice search and describe your ideal property
                </p>
              )}
              
              {isListening && !transcript && (
                <p className="text-sm text-blue-600 animate-pulse">
                  Listening for your voice...
                </p>
              )}
              
              {isProcessingAI && (
                <p className="text-sm text-purple-600">
                  AI is analyzing your request...
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Speak naturally: "3 bedroom house under R2 million in Sandton with pool"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}