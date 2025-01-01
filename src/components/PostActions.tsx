import React, { useState } from 'react';
import { Share2, Save, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface PostActionsProps {
  onSave: () => void;
  textToShare: string;
}

const PostActions = ({ onSave, textToShare }: PostActionsProps) => {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleShare = async () => {
    console.log('Sharing post...');
    setIsGeneratingUrl(true);

    try {
      if (isMobile && navigator.share) {
        console.log('Using native share on mobile');
        await navigator.share({
          text: textToShare,
        });
        toast({
          title: "Success",
          description: "Content shared successfully",
        });
      } else {
        console.log('Using clipboard share');
        await navigator.clipboard.writeText(textToShare);
        toast({
          title: "Success",
          description: "Content copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share content",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleCopy = async () => {
    console.log('Copying to clipboard...');
    try {
      await navigator.clipboard.writeText(textToShare);
      toast({
        title: "Success",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying:', error);
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2 justify-end mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        className="flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save
      </Button>

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