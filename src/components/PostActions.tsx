import { Share2, Twitter, Linkedin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

interface PostActionsProps {
  onSave: () => void;
  textToShare: string;
}

const PostActions = ({ onSave, textToShare }: PostActionsProps) => {
  const { toast } = useToast();

  const shareToTwitter = () => {
    const encodedText = encodeURIComponent(textToShare);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
    toast({
      title: "Opening Twitter",
      description: "Redirecting you to post on Twitter",
    });
  };

  const shareToLinkedIn = () => {
    const encodedText = encodeURIComponent(textToShare);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://example.com&summary=${encodedText}`, '_blank');
    toast({
      title: "Opening LinkedIn",
      description: "Redirecting you to post on LinkedIn",
    });
  };

  return (
    <div className="flex gap-4">
      <Button
        onClick={onSave}
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
  );
};

export default PostActions;