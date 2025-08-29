import { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Mic, MicOff, Loader2, X, Check, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type VoiceState = 'idle' | 'listening' | 'transcribing' | 'preview';

interface VoiceToken {
  id: string;
  text: string;
  type: 'food' | 'category' | 'modifier' | 'separator';
}

interface VoiceInputWithStatesProps {
  onAdd: (tokens: VoiceToken[]) => void;
  placeholder?: string;
  hint?: string;
}

export function VoiceInputWithStates({ 
  onAdd, 
  placeholder = "Tap mic and say foods, preferences, or allergies",
  hint = "Say: 'loves pasta; never serve spicy; lactose intolerant.'"
}: VoiceInputWithStatesProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [tokens, setTokens] = useState<VoiceToken[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const mockTranscription = useMemo(() => [
    { id: '1', text: 'chicken soup', type: 'food' as const },
    { id: '2', text: '•', type: 'separator' as const },
    { id: '3', text: 'lunch', type: 'category' as const },
    { id: '4', text: '•', type: 'separator' as const },
    { id: '5', text: 'loves pasta', type: 'food' as const },
    { id: '6', text: '•', type: 'separator' as const },
    { id: '7', text: 'no nuts', type: 'modifier' as const },
  ], []);

  const startListening = useCallback(() => {
    setVoiceState('listening');
    setIsRecording(true);
    
    setTimeout(() => {
      setVoiceState('transcribing');
      setIsRecording(false);
      
      setTimeout(() => {
        setTokens(mockTranscription);
        setVoiceState('preview');
      }, 2000);
    }, 3000);
  }, [mockTranscription]);

  const stopListening = useCallback(() => {
    if (voiceState === 'listening') {
      setVoiceState('transcribing');
      setIsRecording(false);
      
      setTimeout(() => {
        setTokens(mockTranscription);
        setVoiceState('preview');
      }, 1500);
    }
  }, [voiceState, mockTranscription]);

  const handleAdd = useCallback(() => {
    onAdd(tokens);
    setVoiceState('idle');
    setTokens([]);
  }, [tokens, onAdd]);

  const handleCancel = useCallback(() => {
    setVoiceState('idle');
    setTokens([]);
    setIsRecording(false);
  }, []);

  const removeToken = useCallback((tokenId: string) => {
    setTokens(prev => prev.filter(t => t.id !== tokenId));
  }, []);

  const getTokenColor = (type: VoiceToken['type']) => {
    switch (type) {
      case 'food': return 'bg-green-100 text-green-800 border-green-200';
      case 'category': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'modifier': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'separator': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Animated waveform component
  const Waveform = () => (
    <div className="flex items-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-red-500 rounded-full"
          animate={{
            height: isRecording ? [8, 24, 16, 32, 12] : [8, 8, 8, 8, 8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Main Voice Input */}
      <Card className="border-2 border-dashed border-ai-border bg-ai-bg/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Voice Button */}
            <Button
              onClick={voiceState === 'listening' ? stopListening : startListening}
              disabled={voiceState === 'transcribing'}
              variant={voiceState === 'listening' ? 'destructive' : 'default'}
              size="lg"
              className={`
                h-12 w-12 rounded-full p-0 
                ${voiceState === 'listening' 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-ai-brand hover:bg-ai-brand/90'
                }
              `}
            >
              <AnimatePresence mode="wait">
                {voiceState === 'transcribing' ? (
                  <motion.div
                    key="transcribing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </motion.div>
                ) : voiceState === 'listening' ? (
                  <motion.div
                    key="listening"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <MicOff className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Mic className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Status and Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {voiceState === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-ai-brand font-medium">{placeholder}</p>
                    <p className="text-sm text-muted-foreground mt-1">{hint}</p>
                  </motion.div>
                )}

                {voiceState === 'listening' && (
                  <motion.div
                    key="listening"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3"
                  >
                    <Waveform />
                    <div>
                      <p className="text-red-600 font-medium flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Listening...
                      </p>
                      <p className="text-sm text-muted-foreground">Tap the red button to stop</p>
                    </div>
                  </motion.div>
                )}

                {voiceState === 'transcribing' && (
                  <motion.div
                    key="transcribing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-ai-brand font-medium flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Transcribing...
                    </p>
                    <p className="text-sm text-muted-foreground">Processing your voice input</p>
                  </motion.div>
                )}

                {voiceState === 'preview' && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-ai-brand font-medium mb-2">Preview & Edit</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tokens.map((token) => (
                        <Badge
                          key={token.id}
                          variant="outline"
                          className={`${getTokenColor(token.type)} cursor-pointer hover:bg-opacity-80 transition-colors`}
                        >
                          {token.text}
                          {token.type !== 'separator' && (
                            <button
                              onClick={() => removeToken(token.id)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAdd}
                        size="sm"
                        className="bg-ai-success hover:bg-ai-success/90 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Add All
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}