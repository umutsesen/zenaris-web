import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import {
  Mic,
  FileText,
  Camera,
  Lightbulb,
  X,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Upload,
  Settings,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Crop,
  Eye,
  CameraOff,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ConflictIndicator,
  SeverityConfirmation,
  QuickActionButtons,
  ProcessingState,
  PrivacyNotice,
  LanguageSupport,
  MicroCopy,
} from './MobileAIHelpers';
import type { Food, DislikedFood, Allergy } from '../DataManager';

type InputMode = 'voice' | 'text' | 'photo' | 'suggest';
type ProcessingStep = 'input' | 'processing' | 'preview' | 'confirmation' | 'success';
type VoiceState = 'idle' | 'listening' | 'processing' | 'transcribing' | 'preview' | 'error';

interface PreviewItem {
  id: string;
  text: string;
  type: 'favorite' | 'avoid' | 'allergy';
  severity?: 'mild' | 'severe';
  level?: 'mild' | 'moderate' | 'absolute';
  category?: string;
  confidence: number;
  conflicts?: string[];
  selected: boolean;
  source: 'voice' | 'text' | 'photo' | 'ai';
}

interface MobileAIInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'favorites' | 'dislikes' | 'allergies' | 'notes';
  elderName: string;
  onAdd: (items: (Food | DislikedFood | Allergy)[]) => void;
}

export function MobileAIInterface({
  isOpen,
  onClose,
  section,
  elderName,
  onAdd,
}: MobileAIInterfaceProps) {
  const [mode, setMode] = useState<InputMode>('voice');
  const [step, setStep] = useState<ProcessingStep>('input');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [undoTimer, setUndoTimer] = useState(0);
  const [showUndo, setShowUndo] = useState(false);
  const [showSeverityConfirmation, setShowSeverityConfirmation] = useState(false);
  const [pendingAllergy, setPendingAllergy] = useState<{ name: string; id: string } | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'conflicts' | 'safe' | 'breakfast' | 'lunch' | 'dinner'>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCropMode, setImageCropMode] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Camera states/refs
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [usingFrontCamera, setUsingFrontCamera] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const recordingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Responsive check (using window.innerWidth instead of useMediaQuery)
  const [isDesktop] = useState(window.innerWidth >= 768);

  const modeLabels: Record<InputMode, string> = {
    voice: 'Voice',
    text: 'Text',
    photo: 'Photo',
    suggest: 'Suggest',
  };

  const sectionLabels = {
    favorites: 'favorite foods',
    dislikes: 'dislikes',
    allergies: 'allergies',
    notes: 'special needs',
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'favorites':
        return `${elderName}'s Favorites`;
      case 'dislikes':
        return `${elderName}'s Dislikes`;
      case 'allergies':
        return `${elderName}'s Allergies`;
      case 'notes':
        return `${elderName}'s Special Needs`;
      default:
        return `AI Assistant for ${elderName}`;
    }
  };

  const getVoiceHint = () => {
    switch (section) {
      case 'favorites':
        return "Say something like 'loves pasta and chicken, prefers Italian food'";
      case 'dislikes':
        return "Say something like 'doesn't like spicy food, never serve mushrooms'";
      case 'allergies':
        return "Say something like 'has nut allergy, lactose intolerant'";
      case 'notes':
        return "Say something like 'needs soft foods, prefers warm meals'";
      default:
        return 'Tell us about preferences...';
    }
  };

  const getPrimaryAction = () => {
    switch (mode) {
      case 'voice':
        return voiceState === 'listening' ? 'Stop listening' : 'Start listening';
      case 'text':
        return 'Process text';
      case 'photo':
        if (imageCropMode && imageFile) return 'Process image';
        if (isCameraOpen && capturedBlob) return 'Continue with this photo';
        return isCameraOpen ? 'Take photo' : 'Open camera';
      case 'suggest':
        return 'Generate suggestions';
      default:
        return 'Process';
    }
  };

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setVoiceState('listening');

      recordingRef.current = setInterval(() => {
        // visual feedback
      }, 100);

      setTimeout(() => {
        setVoiceState('transcribing');
        setTranscript('Loves pasta, doesn\'t like spicy food at all, has mushroom allergy...');
        setTimeout(() => {
          setVoiceState('preview');
          generatePreviewFromVoice();
        }, 1500);
      }, 3000);
    } catch {
      setHasPermission(false);
      toast.error('Microphone permission required - Enable in settings');
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    setVoiceState('transcribing');
    if (recordingRef.current) {
      clearInterval(recordingRef.current);
    }
  };

  const generatePreviewFromVoice = () => {
    const mockItems: PreviewItem[] = [
      {
        id: '1',
        text: 'Pasta dishes',
        type: section === 'favorites' ? 'favorite' : 'avoid',
        category: 'Main course',
        confidence: 95,
        selected: true,
        source: 'voice',
      },
      {
        id: '2',
        text: 'Mushrooms',
        type: 'allergy',
        severity: 'mild',
        confidence: 90,
        conflicts: ['🍳 Conflicts with favorites'],
        selected: true,
        source: 'voice',
      },
      {
        id: '3',
        text: 'Spicy foods',
        type: 'avoid',
        level: 'moderate',
        confidence: 88,
        selected: true,
        source: 'voice',
      },
    ];

    setPreviewItems(mockItems);
    setSelectedCount(mockItems.filter((item) => item.selected).length);
    setStep('preview');
  };

  const processTextInput = () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);

    setTimeout(() => {
      const mockItems: PreviewItem[] = [
        {
          id: '4',
          text: 'Lactose intolerance',
          type: 'allergy',
          severity: 'mild',
          confidence: 98,
          selected: true,
          source: 'text',
        },
        {
          id: '5',
          text: 'Shellfish',
          type: 'allergy',
          severity: 'severe',
          confidence: 95,
          conflicts: ['⚠ Conflicts with allergies'],
          selected: true,
          source: 'text',
        },
      ];

      setPreviewItems(mockItems);
      setSelectedCount(mockItems.filter((item) => item.selected).length);
      setIsProcessing(false);
      setStep('preview');
    }, 2000);
  };

  const handleAddSelected = () => {
    const selectedItems = previewItems.filter((item) => item.selected);
    const convertedItems = selectedItems.map(item => {
      if (item.type === 'favorite') {
        return { id: item.id, name: item.text, category: item.category as "breakfast"|"lunch"|"dinner"|"snack"|undefined } as Food;
      } else if (item.type === 'avoid') {
        return { id: item.id, name: item.text, level: item.level || 'mild' } as DislikedFood;
      } else {
        return { id: item.id, label: item.text, severity: item.severity || 'mild' } as Allergy;
      }
    });
    onAdd(convertedItems);
    setStep('success');

    // Start undo timer
    setShowUndo(true);
    setUndoTimer(10);

    undoRef.current = setInterval(() => {
      setUndoTimer((prev) => {
        if (prev <= 1) {
          setShowUndo(false);
          if (undoRef.current) clearInterval(undoRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast.success(`${selectedItems.length} items added`, {
      action: {
        label: 'Undo',
        onClick: handleUndo,
      },
    });
  };

  const handleUndo = () => {
    setShowUndo(false);
    if (undoRef.current) clearInterval(undoRef.current);
    toast.success('Action undone');
  };

  const handleQuickAction = (itemId: string, actionType: 'favorite' | 'avoid' | 'allergy') => {
    const item = previewItems.find((p) => p.id === itemId);
    if (!item) return;

    if (actionType === 'allergy' && item.severity === 'severe') {
      setPendingAllergy({ name: item.text, id: itemId });
      setShowSeverityConfirmation(true);
      return;
    }

    setPreviewItems((prev) => prev.map((p) => (p.id === itemId ? { ...p, type: actionType } : p)));

    toast.success(
      `${item.text} moved to ${
        actionType === 'favorite' ? 'favorites' : actionType === 'avoid' ? 'avoid list' : 'allergies'
      }`,
    );
  };

  const handleSeverityConfirm = () => {
    if (pendingAllergy) {
      setPreviewItems((prev) => prev.map((p) => (p.id === pendingAllergy.id ? { ...p, type: 'allergy' } : p)));
      toast.success(`${pendingAllergy.name} added as a severe allergy`);
    }
    setShowSeverityConfirmation(false);
    setPendingAllergy(null);
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setOcrError("File too large. Please select a file smaller than 10MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setOcrError('Please select a valid image file.');
      return;
    }

    setImageFile(file);
    setImageCropMode(true);
    setOcrError(null);
  };

  const processImage = () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setImageCropMode(false);

    setTimeout(() => {
      const mockItems: PreviewItem[] = [
        {
          id: '6',
          text: 'Pizza Margherita',
          type: 'favorite',
          category: 'Main course',
          confidence: 87,
          selected: true,
          source: 'photo',
          conflicts: ['🍳 Conflicts with favorites'],
        },
        {
          id: '7',
          text: 'Contains gluten',
          type: 'allergy',
          severity: 'mild',
          confidence: 92,
          selected: true,
          source: 'photo',
        },
      ];

      setPreviewItems(mockItems);
      setSelectedCount(mockItems.filter((item) => item.selected).length);
      setIsProcessing(false);
      setStep('preview');
    }, 3000);
  };

  const getFilteredItems = () => {
    switch (filterMode) {
      case 'conflicts':
        return previewItems.filter((item) => item.conflicts && item.conflicts.length > 0);
      case 'safe':
        return previewItems.filter((item) => !item.conflicts || item.conflicts.length === 0);
      case 'breakfast':
      case 'lunch':
      case 'dinner':
        return previewItems.filter((item) => item.category?.toLowerCase().includes(filterMode));
      default:
        return previewItems;
    }
  };

  const toggleItemSelection = (id: string) => {
    setPreviewItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
    setSelectedCount((prev) => {
      const item = previewItems.find((p) => p.id === id);
      return item?.selected ? prev - 1 : prev + 1;
    });
  };

  const getSeverityChip = (item: PreviewItem) => {
    if (item.type === 'allergy') {
      return (
        <Badge variant={item.severity === 'severe' ? 'destructive' : 'secondary'} className="text-xs">
          {item.severity === 'severe' ? 'Severe' : 'Mild'}
        </Badge>
      );
    }
    if (item.type === 'avoid') {
      const levelMap: Record<string, string> = { mild: 'Mild', moderate: 'Moderate', absolute: 'Never' };
      return (
        <Badge variant={item.level === 'absolute' ? 'destructive' : 'secondary'} className="text-xs">
          {levelMap[item.level || 'mild']}
        </Badge>
      );
    }
    return null;
  };

  // -------- Camera helpers --------
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  const openCamera = async (facing: 'user' | 'environment' = usingFrontCamera ? 'user' : 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError('Camera permission required or camera could not be opened.');
    }
  };

  const flipCamera = async () => {
    const next = !usingFrontCamera;
    setUsingFrontCamera(next);
    if (cameraStream) stopCamera();
    await openCamera(next ? 'user' : 'environment');
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) setCapturedBlob(blob);
        resolve();
      }, 'image/jpeg', 0.92);
    });
  };

  const useCaptured = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleImageUpload(file); // continues into crop mode
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedBlob(null);
  };

  // Stop camera on close/unmount or when leaving photo tab
  useEffect(() => {
    if (!isOpen && isCameraOpen) stopCamera();
    return () => {
      if(isCameraOpen) stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (mode !== 'photo' && isCameraOpen) stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  
  // Reusable content components
  const SuccessContent = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </motion.div>
      <h2 className="text-xl font-semibold mb-2">Success!</h2>
      <p className="text-muted-foreground mb-6">{selectedCount} items added to the {sectionLabels[section]} section</p>
      {showUndo && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-orange-800">{undoTimer} seconds to undo</span>
            <Button size="sm" variant="outline" onClick={handleUndo}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Undo
            </Button>
          </div>
        </motion.div>
      )}
      <Button onClick={onClose} className="w-full max-w-xs">
        Close
      </Button>
    </div>
  );

  const PreviewContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => setStep('input')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="font-semibold">Preview</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden p-4 space-y-3 bg-white">
         <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">AI Extracted Items</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPreviewItems((prev) => prev.map((item) => ({ ...item, selected: true })));
                      setSelectedCount(previewItems.length);
                    }}
                  >
                    Select All
                  </Button>
                  <Button size="sm" variant="outline">Merge Similar</Button>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { key: 'all', label: 'All', icon: null },
                  { key: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
                  { key: 'safe', label: 'Safe', icon: Shield },
                  { key: 'breakfast', label: 'Breakfast', icon: null },
                  { key: 'lunch', label: 'Lunch', icon: null },
                  { key: 'dinner', label: 'Dinner', icon: null },
                ].map((filter: { key: string; label: string; icon: React.ComponentType<{className?: string}> | null }) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.key}
                      size="sm"
                      variant={filterMode === filter.key ? 'default' : 'outline'}
                      onClick={() => setFilterMode(filter.key as 'all' | 'conflicts' | 'safe' | 'breakfast' | 'lunch' | 'dinner')}
                      className="whitespace-nowrap h-7 px-2 text-xs"
                    >
                      {Icon && <Icon className="h-3 w-3 mr-1" />}
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {getFilteredItems().map((item) => (
              <motion.div key={item.id} layout className={`border rounded-md p-3 ${item.selected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mt-1" onClick={() => toggleItemSelection(item.id)}>
                    <div
                      className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                        item.selected ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {item.selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{item.text}</h4>
                      <Badge variant="outline" className="text-xs ml-2">{item.confidence}% confident</Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityChip(item)}
                      {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                      <Badge variant="outline" className="text-xs">from {item.source === 'voice' ? 'Voice' : item.source === 'text' ? 'Text' : 'Photo'}</Badge>
                    </div>

                    <ConflictIndicator conflicts={item.conflicts} />

                    <QuickActionButtons
                      onAddFavorite={() => handleQuickAction(item.id, 'favorite')}
                      onAddAvoid={() => handleQuickAction(item.id, 'avoid')}
                      onAddAllergy={() => handleQuickAction(item.id, 'allergy')}
                      selectedType={item.type}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
      </div>
      <div className="border-t bg-white p-4 sticky bottom-0">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <span className="text-sm font-medium">{selectedCount} items found</span>
          <Button onClick={handleAddSelected} disabled={selectedCount === 0} className="bg-primary hover:bg-primary/90">
            Add Selected
          </Button>
        </div>
      </div>
      {showSeverityConfirmation && (
        <SeverityConfirmation
          severity="severe"
          onConfirm={handleSeverityConfirm}
          onCancel={() => setShowSeverityConfirmation(false)}
          allergyName={pendingAllergy?.name || ""}
        />
      )}
    </>
  );

  const MainContent = () => (
    <>
      <SheetHeader className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-base">{getSectionTitle()}</SheetTitle>
        </div>
        <p className="text-sm text-muted-foreground text-left">
           {section === 'favorites'
              ? 'Add foods and preferences.'
              : section === 'dislikes'
              ? 'Add foods they want to avoid.'
              : section === 'allergies'
              ? 'Add allergies and restrictions.'
              : 'Add special instructions and preferences.'}
        </p>
      </SheetHeader>
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-20">
        <div className={`flex bg-muted rounded-md p-1 ${isDesktop ? 'justify-center' : ''}`}>
          {(['voice', 'text', 'photo', 'suggest'] as InputMode[]).map((modeOption) => (
            <button
              key={modeOption}
              onClick={() => setMode(modeOption)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                mode === modeOption ? 'bg-white shadow-sm border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {modeOption === 'voice' && <Mic className="h-4 w-4" />}
                {modeOption === 'text' && <FileText className="h-4 w-4" />}
                {modeOption === 'photo' && <Camera className="h-4 w-4" />}
                {modeOption === 'suggest' && <Lightbulb className="h-4 w-4" />}
                <span>{modeLabels[modeOption]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
           {mode === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
                {/* Voice Status Bar */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {voiceState === 'idle' && 'Ready'}
                      {voiceState === 'listening' && 'Listening...'}
                      {voiceState === 'transcribing' && 'Transcribing...'}
                      {voiceState === 'preview' && 'Processing...'}
                    </span>
                    {voiceState === 'listening' && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-600">REC</span>
                      </div>
                    )}
                  </div>

                  {voiceState !== 'idle' && (
                    <div className="mt-2 space-y-2">
                      <Progress
                        value={voiceState === 'listening' ? 30 : voiceState === 'transcribing' ? 70 : voiceState === 'preview' ? 100 : 0}
                        className="h-1"
                      />

                      {voiceState === 'listening' && (
                        <div className="flex justify-center pt-2">
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex space-x-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ height: ['8px', '24px', '8px'], backgroundColor: ['#3b82f6', '#1d4ed8', '#3b82f6'] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                className="w-1 bg-blue-500 rounded-full"
                                style={{ height: '8px' }}
                              />
                            ))}
                          </motion.div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Transcript */}
                {(transcript || voiceState === 'listening') && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Live Transcript:</h4>
                      <div className="bg-muted rounded p-3 min-h-[60px]">
                        {transcript || <span className="text-muted-foreground text-sm">{getVoiceHint()}</span>}
                        {voiceState === 'listening' && (
                          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block ml-1 w-2 h-4 bg-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Voice Hint */}
                {voiceState === 'idle' && (
                  <div className="text-center p-6">
                    <Mic className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Add by Voice</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tell us about {elderName}'s {sectionLabels[section]}.
                    </p>
                    <MicroCopy section={section} type="voice" />
                  </div>
                )}

                {/* Permission Error */}
                {!hasPermission && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-center">
                      <MicOff className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <h4 className="font-medium text-red-900 mb-1">Microphone Disabled</h4>
                      <p className="text-sm text-red-700 mb-3">Permission is required for voice input.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.mediaDevices
                            .getUserMedia({ audio: true })
                            .then(() => setHasPermission(true))
                            .catch(() => setHasPermission(false));
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Enable in Settings
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {mode === 'text' && (
              <motion.div key="text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
                <div className="text-center p-6">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Extract from Text</h3>
                  <p className="text-sm text-muted-foreground mb-4">Paste care notes, reports, or lists of preferences.</p>
                </div>

                <Textarea
                  placeholder="Paste notes here... (e.g., 'allergic to peanuts, dislikes spicy food')"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[120px] text-base"
                />

                <MicroCopy section={section} type="text" />

                <ProcessingState isProcessing={isProcessing} step="analyzing" progress={65} />
              </motion.div>
            )}

            {mode === 'photo' && (
              <motion.div key="photo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
                <div className="text-center p-6">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Extract from Photo</h3>
                  <p className="text-sm text-muted-foreground mb-4">Upload a photo of a menu, recipe card, or medical report.</p>
                </div>

                {/* Camera Live View / Capture */}
                {isCameraOpen ? (
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative bg-black">
                        {!capturedBlob && (
                          <video ref={videoRef} playsInline muted autoPlay className="w-full aspect-[3/4] object-cover" />
                        )}

                        {capturedBlob && (
                          <img src={URL.createObjectURL(capturedBlob)} alt="Captured photo" className="w-full aspect-[3/4] object-cover" />
                        )}
                      </div>

                      <canvas ref={canvasRef} className="hidden" />

                      <div className="p-3 grid grid-cols-3 gap-2">
                        {!capturedBlob ? (
                          <>
                            <Button variant="outline" onClick={flipCamera}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Flip
                            </Button>
                            <Button onClick={capturePhoto}>
                              <Camera className="h-4 w-4 mr-2" />
                              Capture
                            </Button>
                            <Button variant="destructive" onClick={stopCamera}>
                              <CameraOff className="h-4 w-4 mr-2" />
                              Close
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" onClick={retakePhoto}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retake
                            </Button>
                            <Button onClick={useCaptured} className="col-span-2">
                              <Eye className="h-4 w-4 mr-2" />
                              Use This Photo
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Upload UI */}
                    <Card className="border-dashed border-2 border-muted">
                      <CardContent className="p-8 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*;capture=environment"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">Upload a photo or drag and drop</p>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="h-4 w-4 mr-2" />
                            Choose Photo
                          </Button>
                          <Button onClick={() => openCamera()}>
                            <Camera className="h-4 w-4 mr-2" />
                            Open Camera
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {cameraError && (
                      <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-900 mb-1">Camera Error</h4>
                              <p className="text-sm text-red-700 mb-2">{cameraError}</p>
                              <Button size="sm" variant="outline" onClick={() => openCamera()}>
                                Try Again
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Image Crop Mode */}
                {imageCropMode && imageFile && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-blue-900">Edit Image</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setImageCropMode(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white rounded border p-4 mb-3">
                        <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                          <div className="text-center">
                            <Crop className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Crop Area</p>
                            <p className="text-xs text-gray-500">{imageFile.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Crop className="h-4 w-4 mr-1" />
                          Crop
                        </Button>
                        <Button size="sm" onClick={processImage} className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* OCR Errors */}
                {ocrError && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900 mb-1">Image Error</h4>
                          <p className="text-sm text-red-700 mb-2">{ocrError}</p>
                          <Button size="sm" variant="outline" onClick={() => setOcrError(null)}>
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <MicroCopy section={section} type="photo" />
                <PrivacyNotice show={true} />
                <LanguageSupport />
              </motion.div>
            )}

            {mode === 'suggest' && (
              <motion.div key="suggest" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
                <div className="text-center p-6">
                  <Lightbulb className="h-16 w-16 mx-auto mb-4 text-ai-brand" />
                  <h3 className="font-medium mb-2">Smart Suggestions</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get suggestions based on existing data.</p>
                  <p className="text-xs text-muted-foreground">AI will suggest items based on {elderName}'s current preferences.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Only safe</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Only conflicts</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Breakfast/Lunch/Dinner</span>
                  </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
      <div className="border-t bg-white p-4 sticky bottom-0">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {step === 'input' && (
            <Button
              onClick={async () => {
                if (mode === 'voice') {
                  if (isRecording) {
                    stopVoiceRecording();
                  } else {
                    await startVoiceRecording();
                  }
                } else if (mode === 'text') {
                  processTextInput();
                } else if (mode === 'photo') {
                  if (imageCropMode && imageFile) processImage();
                  else if (isCameraOpen && capturedBlob) {
                    useCaptured();
                  }
                  else if (!isCameraOpen) await openCamera();
                  else if (isCameraOpen && !capturedBlob) await capturePhoto();
                } else if (mode === 'suggest') {
                  toast.message('Suggestions coming soon 💡');
                }
              }}
              size="lg"
              disabled={(mode === 'text' && !textInput.trim()) || (mode === 'voice' && !hasPermission) || isProcessing}
              className={`${mode === 'voice' && isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {mode === 'voice' && isRecording ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    {mode === 'voice' && <Play className="h-4 w-4 mr-2" />}
                    {mode === 'text' && <FileText className="h-4 w-4 mr-2" />}
                    {mode === 'photo' && <Camera className="h-4 w-4 mr-2" />}
                    {mode === 'suggest' && <Lightbulb className="h-4 w-4 mr-2" />}
                    {getPrimaryAction()}
                  </>
                )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
  
  const renderContent = () => {
    switch (step) {
      case 'success':
        return <SuccessContent />;
      case 'preview':
        return <PreviewContent />;
      default:
        return <MainContent />;
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full p-0 flex flex-col h-[90vh] max-h-[800px] overflow-hidden gap-0">
          {renderContent()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full p-0 flex flex-col h-full overflow-hidden" style={{ gap: 0 }} side="bottom">
        {renderContent()}
      </SheetContent>
    </Sheet>
  );
}