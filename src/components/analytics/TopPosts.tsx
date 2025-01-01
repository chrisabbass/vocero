interface TopPost {
  content: string;
  platform: string;
  totalImpressions: number;
}

interface TopPostsProps {
  posts: TopPost[];
}

const TopPosts = ({ posts }: TopPostsProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Top Performing Posts</h2>
      <div className="bg-white rounded-lg shadow p-6">
        {posts && posts.length > 0 ? (
          <ol className="list-decimal list-inside space-y-4">
            {posts.map((post, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">
                  {post.content}
                </span>
                <span className="text-gray-500 ml-2">
                  ({post.totalImpressions.toLocaleString()} impressions on {post.platform})
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500 text-center">No posts to display yet.</p>
        )}
      </div>
    </div>
  );
};

export default TopPosts;