// src/Creator/FeedbackListModal.jsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchFeedbacks } from "@/endpoints/axios";
import { Loader } from "@/components/Layouts/Loader";
import { toast } from "sonner";

export const FeedbackListModal = ({ open, onOpenChange, communityId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const loadFeedbacks = async () => {
      try {
        const data = await fetchFeedbacks(communityId);
        console.log(data)
        setFeedbacks(data);
      } catch (err) {
        toast.error("Failed to load feedbacks");
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, [open, communityId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Feedback</DialogTitle>
        </DialogHeader>
        {loading ? (
          <Loader text="Loading feedbacks..." />
        ) : feedbacks.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {feedbacks.map((f) => (
              <div key={f.id} className="p-3 border rounded-lg bg-gray-50">
                <p className="text-gray-800">{f.feedback}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(f.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">No feedback yet.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
