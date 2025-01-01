import React, { useState } from 'react';
import { Share2, Save, Copy, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostActionsProps {
  onSave: () => void;
  textToShare: string;
  isSavedPost?: boolean;
}

const PostActions = ({ onSave, textToShare, isSavedPost = false }: PostActionsProps) => {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleShare = async (platform: 'twitter' | 'linkedin') => {
    console.log('Sharing post with text:', textToShare, 'to platform:', platform);
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
      if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
        window.open(twitterUrl, '_blank');
        console.log('Opened Twitter share window');
      } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(textToShare)}`;
        window.open(linkedinUrl, '_blank');
        console.log('Opened LinkedIn share window');
      }
      
      toast({
        title: "Success",
        description: `Opening ${platform} to share`,
      });
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            disabled={isGeneratingUrl}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {isGeneratingUrl ? 'Sharing...' : 'Share'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleShare('twitter')} className="gap-2">
            <Twitter className="w-4 h-4" />
            Share on Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('linkedin')} className="gap-2">
            <Linkedin className="w-4 h-4" />
            Share on LinkedIn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PostActions;