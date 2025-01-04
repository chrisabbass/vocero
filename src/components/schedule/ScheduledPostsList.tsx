import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScheduledPost = {
  id: string;
  content: string;
  platform: string;
  scheduled_for: string;
};

type ScheduledPostsListProps = {
  posts: ScheduledPost[] | null;
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export const ScheduledPostsList = ({
  posts,
  isLoading,
  onDelete,
  isDeleting,
}: ScheduledPostsListProps) => {
  if (isLoading) {
    return <p>Loading scheduled posts...</p>;
  }

  if (!posts?.length) {
    return <p>No scheduled posts yet.</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-card rounded-lg p-4 flex justify-between items-start"
        >
          <div>
            <p className="font-medium">{post.content}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(post.scheduled_for), "PPP 'at' p")}
              </span>
              <span className="capitalize">• {post.platform}</span>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(post.id)}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};