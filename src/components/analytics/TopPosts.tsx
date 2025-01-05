import { Twitter, Linkedin } from 'lucide-react';

interface TopPost {
  content: string;
  platform: string;
  totalImpressions: number;
  updated_at: string;
}

interface TopPostsProps {
  posts: TopPost[];
}

const TopPosts = ({ posts }: TopPostsProps) => {
  const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow p-6">
        {posts && posts.length > 0 ? (
          <ol className="list-decimal list-inside space-y-6">
            {posts.map((post, index) => (
              <li key={index} className="pb-4 border-b last:border-0">
                <div className="mt-2">
                  <p className="text-base">{post.content}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">
                        {post.totalImpressions.toLocaleString()}
                      </span>
                      impressions on 
                      <span className="flex items-center gap-1">
                        <PlatformIcon platform={post.platform} />
                        {post.platform}
                      </span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500 text-center py-8">No posts to display in this category yet.</p>
        )}
      </div>
    </div>
  );
};

export default TopPosts;