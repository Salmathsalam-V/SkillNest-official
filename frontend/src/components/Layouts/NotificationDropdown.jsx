import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";

export function NotificationDropdown({ notifications, onNotificationClick }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  console.log("Notofication from",notifications);

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        🔔
        {notifications.some((n) => !n.read) && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-lg bg-white shadow-lg border border-gray-200 z-[9999]">
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 text-sm hover:bg-gray-100 border-b border-gray-100 cursor-pointer"
                onClick={() => {
                  if (n.post_id) {
                    onNotificationClick(n.post_id);            
                    setOpen(false);
                  }
                }}
              >
                <span className="font-semibold">{n.sender} </span>{n.post_id}{" "}
                {n.notif_type === "like"
                  ? "liked your post"
                  : n.notif_type === "comment"
                  ? "commented on your post"
                  : n.notif_type === "comment_like"
                  ? "liked comment on your post"
                  : n.notif_type === "follow"
                  ? "followed you"
                  : ""}

                <div className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </div>
                {n.notif_type === "follow" && (
                  <button className="text-blue-600 text-xs underline mt-1"
                          onClick={() => navigate(`/creator-profile/${userId}`)}>
                    View Profile
                  </button>
                )}

                {/* NEW: View Post link only if post_id exists */}
                {n.post_id && (
                  <button className="text-blue-600 text-xs underline mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNotificationClick(n.post_id);
                            setOpen(false);
                          }}>
                    View Post
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
