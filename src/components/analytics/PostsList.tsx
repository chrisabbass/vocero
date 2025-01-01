import PostMetrics from "@/components/PostMetrics";

interface PostsListProps {
  posts: string[];
}

const PostsList = ({ posts }: PostsListProps) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Individual Post Performance</h2>
      {posts && posts.length > 0 ? (
        <div className="space-y-8">
          {posts.map((postContent) => (
            <div key={postContent} className="bg-white rounded-lg shadow p-6">
              <p className="text-sm mb-4">{postContent}</p>
              <PostMetrics postContent={postContent} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No shared posts found. Share some posts on Twitter or LinkedIn to see their performance here.
        </div>
      )}
    </>
  );
};

export default PostsList;