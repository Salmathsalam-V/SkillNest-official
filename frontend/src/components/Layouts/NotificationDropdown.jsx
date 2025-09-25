import React, { useState,useEffect } from "react";
import axios from "axios";
export function NotificationDropdown({notifications}) {
  const [open, setOpen] = useState(false);
  console.log("Notifications in Dropdown:", notifications);
  return (
    <div className="relative mb-6">
      {/* Bell icon / button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        🔔
        {notifications.some((n) => ! n.read) && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-lg bg-white shadow-lg border border-gray-200">
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 text-sm hover:bg-gray-100 border-b border-gray-100"
              >
                <span className="font-semibold">{n.sender}</span>{" "}
                {n.notif_type} your post
                {/* {n.type === "follow" && "followed you"} */}
                <div className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
