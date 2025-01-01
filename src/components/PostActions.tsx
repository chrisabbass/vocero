import React, { useState } from 'react';
import { Share2, Save, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface PostActionsProps {
  onSave: () => void;
  textToShare: string;
  isSavedPost?: boolean;
}

const PostActions = ({ onSave, textToShare, isSavedPost = false }: PostActionsProps) => {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleShare = async () => {
    console.log('Sharing post with text:', textToShare);
    if (!textToShare || textToShare.trim() === '') {
      console.error('No content to share');
      toast({
        title: "Error",
        description: "No content available to share",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingUrl(true);

    try {
      if (isMobile && navigator.share) {
        console.log('Using native share on mobile');
        await navigator.share({
          text: textToShare,
        });
        console.log('Successfully shared via native share');
        toast({
          title: "Success",
          description: "Content shared successfully",
        });
      } else {
        console.log('Using clipboard share');
        await navigator.clipboard.writeText(textToShare);
        console.log('Successfully copied to clipboard');
        toast({
          title: "Success",
          description: "Content copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to share content";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleCopy = async () => {
    console.log('Copying to clipboard:', textToShare);
    if (!textToShare || textToShare.trim() === '') {
      console.error('No content to copy');
      toast({
        title: "Error",
        description: "No content available to copy",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      console.log('Successfully copied to clipboard');
      toast({
        title: "Success",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to copy content";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2 justify-center mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy
      </Button>
      
      {!isSavedPost && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
      )}

      <Button
        variant="default"
        size="sm"
        onClick={handleShare}
        disabled={isGeneratingUrl}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        {isGeneratingUrl ? 'Sharing...' : 'Share'}
      </Button>
    </div>
  );
};

export default PostActions;