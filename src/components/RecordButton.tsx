import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordButtonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordButton = ({ isRecording, onStartRecording, onStopRecording }: RecordButtonProps) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-red-500 rounded-full animate-recording-pulse" />
        )}
        <Button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`relative z-10 w-16 h-16 rounded-full ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
          }`}
        >
          {isRecording ? (
            <Square className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default RecordButton;