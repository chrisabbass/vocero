import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Save, Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PostActionsProps {
  textToShare: string;
  onSave: () => void;
  isSavedPost: boolean;
}

const PostActions = ({ textToShare, onSave, isSavedPost }: PostActionsProps) => {
  const handleShare = async (platform: 'twitter' | 'linkedin') => {
    try {
      let shareUrl = '';
      const encodedText = encodeURIComponent(textToShare);
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodedText}`;
          break;
      }
      
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast({
        title: "Share initiated",
        description: `Opening ${platform} share dialog...`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToShare);
      toast({
        title: "Success",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying text:', error);
      toast({
        title: "Error",
        description: "Failed to copy text. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isSavedPost && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleShare('twitter')}>
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('linkedin')}>
            LinkedIn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PostActions;