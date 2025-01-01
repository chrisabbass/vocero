import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

  return (
    <div className="flex justify-end space-x-2 mt-2">
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
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Twitter
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          LinkedIn
        </Button>
      </div>
    </div>
  );
};

export default PostActions;