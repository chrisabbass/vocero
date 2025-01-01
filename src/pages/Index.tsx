import React, { Suspense } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  console.log('Rendering Index page');
  const { savedPosts, savePost, deletePost } = useSavedPosts();
  
  console.log('Index page savedPosts:', savedPosts);

  const handleSavePost = (content: string) => {
    const success = savePost(content);
    if (success) {
      toast({
        title: "Success",
        description: "Post saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Maximum number of saved posts reached (10)",
        variant: "destructive",
      });
    }
    return success;
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<LoadingSpinner />}>
        <VoiceRecorder 
          savedPosts={savedPosts}
          onSavePost={handleSavePost}
          onDeletePost={deletePost}
        />
      </Suspense>
    </div>
  );
};

export default Index;