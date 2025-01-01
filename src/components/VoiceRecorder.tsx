import React, { useState, useRef } from 'react';
import { Mic, Square, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const generateVariations = async (text: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: "You are a social media post optimizer. Generate 3 variations of the given text, optimizing for engagement while maintaining the original message. Make each variation unique in style."
          }, {
            role: "user",
            content: text
          }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      console.log('OpenAI response:', data);
      
      if (data.choices && data.choices[0]) {
        const variations = data.choices[0].message.content
          .split('\n')
          .filter((v: string) => v.trim().length > 0)
          .slice(0, 3);
        setVariations(variations);
        setSelectedVariation(variations[0]);
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast({
        title: "Error",
        description: "Failed to generate variations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = async (e) => {
        const audioBlob = new Blob([e.data], { type: 'audio/wav' });
        // Here you would typically send the blob to a speech-to-text service
        // For now, we'll use a simulated transcription
        const simulatedTranscript = "This is a simulated transcription of your voice note. In a real implementation, this would be the actual transcribed text from your voice recording.";
        setTranscript(simulatedTranscript);
        generateVariations(simulatedTranscript);
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
    const textToShare = selectedVariation || transcript;
    navigator.clipboard.writeText(textToShare);
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

      {(transcript || variations.length > 0) && (
        <div className="space-y-4">
          {isGenerating ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2">Generating variations...</span>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Choose a variation:</h2>
                <RadioGroup 
                  value={selectedVariation} 
                  onValueChange={setSelectedVariation}
                  className="space-y-4"
                >
                  {variations.length > 0 ? variations.map((variation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <RadioGroupItem value={variation} id={`variation-${index}`} />
                      <Label htmlFor={`variation-${index}`} className="text-sm leading-relaxed">
                        {variation}
                      </Label>
                    </div>
                  )) : (
                    <Textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="min-h-[150px] p-4"
                      placeholder="Your transcribed text will appear here..."
                    />
                  )}
                </RadioGroup>
              </div>
              
              <Button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Post
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;