import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostActionsProps {
  textToShare: string;
  onSave?: () => void;
  onDelete?: () => void;
}

const PostActions = ({ textToShare, onSave, onDelete }: PostActionsProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleShare = async (platform: 'twitter' | 'linkedin') => {
    console.log('Sharing post with text:', textToShare, 'to platform:', platform);
    if (!textToShare || textToShare.trim() === '') {
      console.error('No content to share');
      toast({
        title: "Error",
        description: "No content to share",
        variant: "destructive",
      });
      return;
    }

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
      toast({
        title: "Error",
        description: "Failed to share content",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleShare('twitter')}>
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('linkedin')}>
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {onSave && (
        <Button
          variant="outline"
          size="icon"
          onClick={onSave}
          className="flex-shrink-0"
        >
          Save
        </Button>
      )}

      {onDelete && (
        <Button
          variant="outline"
          size="icon"
          onClick={onDelete}
          className="flex-shrink-0"
        >
          Delete
        </Button>
      )}
    </div>
  );
};

export default PostActions;