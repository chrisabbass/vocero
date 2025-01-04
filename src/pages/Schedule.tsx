import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { ScheduledPostsList } from "@/components/schedule/ScheduledPostsList";
import * as z from "zod";

// Define the form schema
const formSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platform: z.enum(["twitter", "linkedin"]),
  scheduledFor: z.string().min(1, "Schedule time is required"),
});

const Schedule = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    
    checkUser();
  }, []);

  // Fetch scheduled posts
  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["scheduledPosts", user?.id],
    queryFn: async () => {
      console.log("Fetching scheduled posts for user:", user?.id);
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user?.id)
        .order("scheduled_for", { ascending: true });

      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  // Create scheduled post mutation
  const createPost = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      console.log("Creating post for user:", user?.id);
      const { error } = await supabase.from("scheduled_posts").insert([
        {
          content: values.content,
          platform: values.platform,
          scheduled_for: values.scheduledFor,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledPosts", user?.id] });
      toast({
        title: "Success",
        description: "Post scheduled successfully",
      });
    },
    onError: (error) => {
      console.error("Error scheduling post:", error);
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete scheduled post mutation
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting post:", id);
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledPosts", user?.id] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return <div>Please log in to access this feature.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Schedule Posts</h1>
      
      <ScheduleForm 
        onSubmit={(values) => createPost.mutate(values)}
        isSubmitting={createPost.isPending}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
        <ScheduledPostsList
          posts={scheduledPosts}
          isLoading={isLoading}
          onDelete={(id) => deletePost.mutate(id)}
          isDeleting={deletePost.isPending}
        />
      </div>
    </div>
  );
};

export default Schedule;