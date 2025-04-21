
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { decryptData } from '@/lib/encryption';
import { Card } from '@/components/ui/card';
import type { Post } from '@/types/database';

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    // @ts-ignore - Intentionally bypassing type check for table that exists in DB but not in types
    const { data, error } = await supabase
      .from('crypto_posts')
      .select('id, encrypted_title, encrypted_content, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
      setLoading(false);
      return;
    }
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-white text-xl mb-4 font-semibold">Posts</h2>
      {loading && <p className="text-gray-300">Loading posts...</p>}
      {!loading && posts.length === 0 && (
        <p className="text-gray-500">No posts found.</p>
      )}
      {!loading && posts.length > 0 && (
        posts.map((post) => {
          const decryptedTitle = decryptData(post.encrypted_title) || '[Decryption failed]';
          const decryptedContent = decryptData(post.encrypted_content) || '[Decryption failed]';
          return (
            <Card
              key={post.id}
              className="bg-[#1A1F2C] border-none p-4"
            >
              <h3 className="text-white text-lg font-semibold">{decryptedTitle}</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{decryptedContent}</p>
              <p className="text-[#8E9196] text-sm mt-2">{new Date(post.created_at).toLocaleString()}</p>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default PostList;
