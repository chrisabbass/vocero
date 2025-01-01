import React, { useState, useRef } from 'react';
import { Mic, Square, Share2, Loader2, Twitter, Linkedin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SavedPosts from './SavedPosts';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const { savedPosts, savePost, deletePost } = useSavedPosts();

  const generateVariations = async (text: string) => {
    setIsGenerating(true);
    try {
      console.log('Generating variations for text:', text);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to generate variations');
      }

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
        description: "Failed to generate variations. Please check if your OpenAI API key is set correctly.",
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

  const handleSavePost = () => {
    const textToSave = selectedVariation || transcript;
    if (!textToSave) {
      toast({
        title: "Error",
        description: "No content to save",
        variant: "destructive",
      });
      return;
    }

    const saved = savePost(textToSave);
    if (saved) {
      toast({
        title: "Success",
        description: "Post saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Maximum number of saved posts reached (10)",
        variant: "destructive",
      });
    }
  };

  const shareToTwitter = () => {
    const textToShare = selectedVariation || transcript;
    const encodedText = encodeURIComponent(textToShare);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
    toast({
      title: "Opening Twitter",
      description: "Redirecting you to post on Twitter",
    });
  };

  const shareToLinkedIn = () => {
    const textToShare = selectedVariation || transcript;
    const encodedText = encodeURIComponent(textToShare);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://example.com&summary=${encodedText}`, '_blank');
    toast({
      title: "Opening LinkedIn",
      description: "Redirecting you to post on LinkedIn",
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
              
              <div className="flex gap-4">
                <Button
                  onClick={handleSavePost}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Post
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Post
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={shareToTwitter}>
                      <Twitter className="mr-2 h-4 w-4" />
                      Share on Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToLinkedIn}>
                      <Linkedin className="mr-2 h-4 w-4" />
                      Share on LinkedIn
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      )}

      <SavedPosts posts={savedPosts} onDelete={deletePost} />
    </div>
  );
};

export default VoiceRecorder;
