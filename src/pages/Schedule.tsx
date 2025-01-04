import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      platform: "twitter",
      scheduledFor: new Date().toISOString(),
    },
  });

  // Fetch scheduled posts
  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["scheduledPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Create scheduled post mutation
  const createPost = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { error } = await supabase.from("scheduled_posts").insert([
        {
          content: values.content,
          platform: values.platform,
          scheduled_for: values.scheduledFor,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledPosts"] });
      toast({
        title: "Success",
        description: "Post scheduled successfully",
      });
      form.reset();
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
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledPosts"] });
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPost.mutate(values);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Schedule Posts</h1>

      {/* Create post form */}
      <div className="bg-card rounded-lg p-6 mb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's on your mind?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <FormControl>
                    <select
                      className="w-full p-2 border rounded"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedPlatform(e.target.value);
                      }}
                    >
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule For</FormLabel>
                  <FormControl>
                    <input
                      type="datetime-local"
                      className="w-full p-2 border rounded"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending ? "Scheduling..." : "Schedule Post"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Scheduled posts list */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
        {isLoading ? (
          <p>Loading scheduled posts...</p>
        ) : scheduledPosts?.length === 0 ? (
          <p>No scheduled posts yet.</p>
        ) : (
          <div className="space-y-4">
            {scheduledPosts?.map((post) => (
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
                  onClick={() => deletePost.mutate(post.id)}
                  disabled={deletePost.isPending}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;