import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useIsMobile } from '../../utils/use-mobile';
import { Sheet, SheetContent } from '../ui/sheet';
import Lottie from 'lottie-react';
import dictationAnimation from '../../assets/dictation.json';
import { Button } from '../ui/button';

type VoiceState = 'idle' | 'listening' | 'transcribing' | 'error';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onVoiceResult?: (text: string) => void;
}

export function VoiceInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  disabled,
  onVoiceResult
}: VoiceInputProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const startListening = async () => {
    if (disabled) return;
    
    try {
      // Check for microphone permission
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(permission.state);
      
      if (permission.state === 'denied') {
        setVoiceState('error');
        toast.error('Microphone permission required');
        return;
      }

      setVoiceState('listening');
      
      setTimeout(() => {
        setVoiceState('transcribing');
        
        setTimeout(() => {
          const mockTranscript = 'chicken soup';
          if (onVoiceResult) {
            onVoiceResult(mockTranscript);
          } else {
            onChange(mockTranscript);
          }
          setVoiceState('idle');
          toast.success('Voice input added');
        }, 2000);
      }, 3000);
      
    } catch {
      setVoiceState('error');
      toast.error('Microphone access failed');
    }
  };

  const stopListening = () => {
    if (voiceState === 'listening') {
      setVoiceState('transcribing');
      setTimeout(() => {
        setVoiceState('idle');
      }, 1500);
    }
  };

  const getMicIcon = () => {
    switch (voiceState) {
      case 'listening':
        return <MicOff className="h-4 w-4 text-red-500 cursor-pointer" onClick={stopListening} aria-label="Stop listening" />;
      case 'transcribing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" aria-label="Transcribing speech" />;
      case 'error':
        return <MicOff className="h-4 w-4 text-red-500 cursor-pointer" onClick={() => setVoiceState('idle')} aria-label="Voice input failed, click to try again" />;
      default:
        return <Mic className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" onClick={startListening} aria-label="Start voice input" />;
    }
  };

  const getMicTooltip = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening… (click to stop)';
      case 'transcribing':
        return 'Transcribing…';
      case 'error':
        return 'Click to try again';
      default:
        return 'Click to speak';
    }
  };

  return (
  <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`pr-10 ${className}`}
        disabled={disabled}
        aria-describedby={voiceState !== 'idle' ? 'voice-status' : undefined}
      />
      
      {/* Microphone Icon */}
      <div 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center"
        title={getMicTooltip()}
        aria-label={getMicTooltip()}
      >
        {voiceState === 'listening' && (
          <>
            {/* invisible outer outline to push the visible border a bit outward */}
            <div className="absolute -inset-2 rounded-full pointer-events-none" aria-hidden="true" />
            {/* visible pulsing border */}
            <div className="absolute inset-4 rounded-full border-2 border-red-500 animate-pulse pointer-events-none" />
          </>
        )}
        {getMicIcon()}
      </div>

      {/* Screen reader announcements */}
      {voiceState !== 'idle' && (
        <div id="voice-status" className="sr-only" aria-live="polite">
          {voiceState === 'listening' && 'Dinleniyor…'}
          {voiceState === 'transcribing' && 'Çevriliyor…'}
          {voiceState === 'error' && 'Mikrofon izni gerekli'}
        </div>
      )}

  {isMobile && voiceState === 'listening' && (
    <Sheet open onOpenChange={(open) => { if (!open) stopListening(); }}>
          <SheetContent side="bottom" className="w-full p-0 border-t bg-white">
            <div className="flex flex-col items-center justify-center p-6 gap-4">
              <div className="w-48 h-48">
                <Lottie animationData={dictationAnimation} loop autoplay />
              </div>
              <div className="text-sm text-muted-foreground">Listening… tap close to stop</div>
      <Button variant="outline" size="lg" onClick={() => stopListening()}>
                Close
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}