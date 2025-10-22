import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchInvites,respondToInvite } from "@/endpoints/axios";
import { toast } from "react-hot-toast";

const InviteModal = ({ open, setOpen }) => {
  const [invites, setInvites] = useState([]);
  useEffect(() => {
    if (open) loadInvites();
  }, [open]);

  const loadInvites = async () => {
    try {
        const res = await fetchInvites();
        console.log("Invite fetch response:", res);
        setInvites(res);
        
    } catch (err) {
      console.error(err);
    }
  };

  const handleResponse = async (inviteId, action) => {
    try {
      await respondToInvite(inviteId, action);
      toast.success(`Invite ${action}ed successfully`);
      setInvites(invites.filter(inv => inv.id !== inviteId));
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Community Invitations</DialogTitle>
        </DialogHeader>

        {/* {Array.isArray(invites) && invites.length === 0 ? (
        <p className="text-center text-gray-500">No pending invitations 🎉</p>
        ) : (
        <div className="space-y-3">
            {Array.isArray(invites) &&
            invites.map((inv) => (
                <div key={inv.id} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                <p>
                    <strong>{inv.invited_by?.username}</strong> invited you to join{" "}
                    <strong>{inv.community?.name}</strong>
                </p>
                </div>
            ))}
        </div>
        )} */}

    
        {Array.isArray(invites) && invites.length === 0 ? (
          <p className="text-center text-gray-500">No pending invitations 🎉</p>
        ) : (
          <div className="space-y-3">
            { Array.isArray(invites) &&
            invites.map((inv) => (
              <div
                key={inv.id}
                className="flex justify-between items-center border p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="font-medium">
                    <span className="text-indigo-600">{inv.invited_by_username}
                        </span> invited you to
                    join <span className="text-blue-600">{inv.community_name}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleResponse(inv.id, "accept")}>
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(inv.id, "decline")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>

    </Dialog>
  );
};

export default InviteModal;
