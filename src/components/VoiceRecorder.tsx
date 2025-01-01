import React, { useState, useRef } from 'react';
import { Mic, Square, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = async (e) => {
        const audioBlob = new Blob([e.data], { type: 'audio/wav' });
        // Here you would typically send the blob to a speech-to-text service
        // For now, we'll just simulate transcription
        setTranscript("This is a simulated transcription of your voice note. In a real implementation, this would be the actual transcribed text from your voice recording.");
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      console.log('Recording started');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(transcript);
    toast({
      title: "Copied!",
      description: "Post copied to clipboard",
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Voice Note to Post</h1>
        <p className="text-slate-600 mb-6">Record your voice to create a social post</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 bg-red-500 rounded-full animate-recording-pulse" />
          )}
          <Button
            onClick={isRecording ? stopRecording : startRecording}
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

      {transcript && (
        <div className="space-y-4">
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[150px] p-4"
            placeholder="Your transcribed text will appear here..."
          />
          
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Post
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;