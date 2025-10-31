import {createFeedback} from '@/endpoints/axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
export const FeedbackModal = ({ open, onOpenChange, communityId, members, creatorId, userId }) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim() || !selectedUser) {
      toast.error("Select a member and enter feedback");
      return;
    }

    try {
      setSending(true);
      console.log("data from communityPage: ",communityId,creatorId,selectedUser.id,feedbackText)
      const res = await createFeedback(
        communityId,creatorId,selectedUser.id,feedbackText
      );
      console.log(res)
      toast.success("Feedback sent!");
      setFeedbackText("");
      setSelectedUser(null);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send feedback");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback to Members</DialogTitle>
        </DialogHeader>

        {members?.length > 0 ? (
          <>
            {/* Select Member */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Select Member</label>
              <select
                className="w-full border rounded-md p-2"
                value={selectedUser?.id || ""}
                onChange={(e) => {
                  const selected = members.find((m) => m.id === parseInt(e.target.value));
                  setSelectedUser(selected || null);
                }}
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.username} ({m.email} {m.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Feedback Input */}
            <div className="mt-3 space-y-2">
              <label className="text-sm font-medium text-gray-600">Feedback</label>
              <Textarea
                rows={4}
                placeholder="Write your feedback here..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end mt-4">
              <Button onClick={handleSendFeedback} disabled={sending}>
                {sending ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center">No members available to send feedback.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
