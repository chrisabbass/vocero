import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import RecordButton from './RecordButton';
import LoadingSpinner from './LoadingSpinner';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface RecordingSectionProps {
  isGenerating: boolean;
  onTranscriptGenerated: (transcript: string) => void;
  recordingCount: number;
  onShowPaywall: () => void;
}

const RecordingSection = ({
  isGenerating,
  onTranscriptGenerated,
  recordingCount,
  onShowPaywall,
}: RecordingSectionProps) => {
  const { toast } = useToast();
  const { 
    isRecording, 
    transcript, 
    startRecording, 
    stopRecording 
  } = useVoiceRecorder();

  const handleStartRecording = async () => {
    if (recordingCount >= 3) {
      onShowPaywall();
      return;
    }
    startRecording();
  };

  React.useEffect(() => {
    if (!isRecording && transcript) {
      onTranscriptGenerated(transcript);
    }
  }, [transcript, isRecording, onTranscriptGenerated]);

  return (
    <div className="space-y-6">
      <RecordButton
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
      />
      
      {isGenerating && (
        <LoadingSpinner message="Generating variations..." />
      )}
    </div>
  );
};

export default RecordingSection;