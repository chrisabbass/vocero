import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useState } from "react";

const formSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platform: z.enum(["twitter", "linkedin"]),
  scheduledFor: z.string().min(1, "Schedule time is required"),
});

type ScheduleFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isSubmitting: boolean;
};

export const ScheduleForm = ({ onSubmit, isSubmitting }: ScheduleFormProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      platform: "twitter",
      scheduledFor: new Date().toISOString(),
    },
  });

  return (
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Post"}
          </Button>
        </form>
      </Form>
    </div>
  );
};