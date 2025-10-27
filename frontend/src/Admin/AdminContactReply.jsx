import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {sendContactReply} from "@/endpoints/axios"

const AdminContactReply = ({ contactId, onReplySent }) => {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      setSending(true);
      const res = await sendContactReply(contactId, reply);
      toast.success("Reply sent successfully!");
      setReply("");
      if (onReplySent) onReplySent();
    } catch (err) {
      console.error("Failed to send reply:", err.response?.data || err);
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <Textarea
        placeholder="Type your reply here..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        className="min-h-[80px]"
      />
      <Button
        onClick={handleReply}
        disabled={sending}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {sending ? "Sending..." : "Send Reply"}
      </Button>
    </div>
  );
};

export default AdminContactReply;
