// src/components/PostModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getPostById } from "@/endpoints/axios";

export const PostModal = ({ postId, open, onClose }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const res = await getPostById(postId);
      setPost(res.data);
    } catch (err) {
      console.error("Error fetching post details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && postId) fetchPostDetails();
  }, [open, postId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex justify-between items-center w-full">
            <span>Post Details</span>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 h-[70vh]">
          {/* Left side: Image */}
          <div className="bg-gray-100 flex items-center justify-center">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              post?.image && (
                <img
                  src={post.image}
                  alt="post"
                  className="h-full w-full object-cover"
                />
              )
            )}
          </div>

          {/* Right side: Details */}
          <div className="p-4 overflow-y-auto space-y-4">
            {/* Author Info */}
            {loading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post?.user?.profile} />
                  <AvatarFallback>
                    {post?.user?.username?.slice(0, 2)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post?.user?.username}</p>
                </div>
              </div>
            )}

            {/* Caption */}
            <div>
              {loading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <p>{post?.caption}</p>
              )}
            </div>

            {/* Likes & Comments count */}
            {loading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {post?.likes_count} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {post?.comments?.length} comments
                </span>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Comments</h3>

              {loading ? (
                <>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </>
              ) : post?.comments?.length ? (
                post.comments.map((c) => (
                  <Card key={c.id} className="shadow-sm">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.user?.profile} />
                        <AvatarFallback>
                          {c.user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-semibold text-sm">
                          {c.user?.username}
                        </p>
                        <p className="text-gray-600 text-sm">{c.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

