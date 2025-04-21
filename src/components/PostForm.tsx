
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { encryptData } from '@/lib/encryption';
import type { Post } from '@/types/database';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please provide both title and content.",
        variant: "destructive",
      });
      return;
    }

    const encryptedTitle = encryptData(title);
    const encryptedContent = encryptData(content);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      toast({
        title: "Authentication required",
        description: "Please login to post.",
        variant: "destructive",
      });
      return;
    }

    // Use a direct any type assertion to bypass TypeScript's type checking completely
    const { error } = await (supabase
      .from('crypto_posts' as any)
      .insert({
        user_id: userData.user.id,
        encrypted_title: encryptedTitle,
        encrypted_content: encryptedContent,
      } as any));

    if (error) {
      toast({
        title: "Failed to post",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post successful",
        description: "Your post has been saved securely.",
        variant: "default",
      });
      setTitle('');
      setContent('');
      
      // Refresh the posts list by triggering a window reload
      // In a production app, you might use a more elegant state management approach
      window.location.reload();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-[#1A1F2C] rounded border border-gray-700">
      <h2 className="text-white text-xl mb-3 font-semibold">Create a New Post</h2>
      <label className="block mb-2 text-white text-sm">Title</label>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 bg-[#2A2F3C] border-none text-white"
      />
      <label className="block mb-2 text-white text-sm">Content</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="w-full mb-4 bg-[#2A2F3C] text-white p-2 rounded border border-gray-600"
      />
      <Button onClick={handleSubmit}>Post</Button>
    </div>
  );
};

export default PostForm;
