import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  author: string;
  featured: boolean;
  published: boolean;
  image_url?: string;
  tags?: string[];
  meta_description?: string;
  slug?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export const useBlogPosts = (published = true) => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('blog-posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['blog-posts', published],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (published) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    }
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogPost])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create blog post');
      console.error('Error creating blog post:', error);
    }
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update blog post');
      console.error('Error updating blog post:', error);
    }
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete blog post');
      console.error('Error deleting blog post:', error);
    }
  });
};