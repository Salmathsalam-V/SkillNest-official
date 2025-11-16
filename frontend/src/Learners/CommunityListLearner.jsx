import React, { useEffect, useState } from "react";
import { fetchLearnerCommunities,fetchUnreadCount } from "../endpoints/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LearnerLayout from "@/components/Layouts/LearnerLayout";
import { Loader }  from '@/components/Layouts/Loader';


export const CommunityListLearner = () => {
  const [communities, setCommunities] = useState([]);
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const LIMIT = 6;
  const [unreadCounts, setUnreadCounts] = useState({});


  useEffect(() => {
    const loadData = async () => {
      const res = await fetchLearnerCommunities(LIMIT, offset);
      console.log("Fetched communities: learner:b", res.results);
      if (offset === 0) {
          setCommunities(res.results);
        } else {
          setCommunities((prev) => [...prev, ...res.results]);
        }
      setNext(res.next);
      setLoading(false);
    };
    loadData();
  }, [offset]);
    const handleLoadMore = () => {
    if (next) {
      // Extract offset from next URL (e.g., ?limit=6&offset=12)
      const urlParams = new URLSearchParams(new URL(next).search);
      const newOffset = parseInt(urlParams.get("offset")) || 0;
      setOffset(newOffset);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        next
      ) {
        handleLoadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next]);
  console.log("Communities state:", communities);

  useEffect(() => {
  const loadCounts = async () => {
    const counts = {};
    console.log("Loading unread counts for learner communities", communities);

    for (const c of communities) {
      console.log("Fetching unread count for:", c.chat_room_uuid);
      const obj = await fetchUnreadCount(c.chat_room_uuid);
      counts[c.chat_room_uuid] = obj.data; // store count
    }

    setUnreadCounts(counts);
    console.log("Unread counts loaded:", counts);
  };

  if (communities.length > 0) {
    loadCounts();
  }
}, [communities]);

  if (loading) return <Loader text="Loading communities..." />; // or redirect to login
  
  return (
    <LearnerLayout>
        <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Your Communities</h1>

        {/* Community List */}
        {communities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
            <Card key={community.id} className="shadow-lg rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{community.name}</h2>
                <p className="text-sm text-gray-600">{community.description}</p>
                <p className="text-xs text-gray-400">
                  Members: {community.members?.length || 0}
                </p>

                {unreadCounts[community.chat_room_uuid] > 0 && (
                  <span className="text-xs bg-red-600 text-white rounded-full px-2 py-1">
                    {unreadCounts[community.chat_room_uuid]}
                  </span>
                )}

                <Button
                  onClick={() => navigate(`/learner/communities/${community.id}`)}
                  variant="custom"
                >
                  View
                </Button>
              </CardContent>
            </Card>

            ))}
            </div>
        ) : (
            <p className="text-gray-500">You haven’t joined any communities yet.</p>
        )}
        </div>
    </LearnerLayout>
  );
};
