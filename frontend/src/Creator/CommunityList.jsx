import React, { useEffect, useState } from "react";
import { fetchCommunities, createCommunity, fetchAllFollowers,deleteCommunity,fetchUnreadCount } from "../endpoints/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent, } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { Loader }  from '@/components/Layouts/Loader';
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { useSelector } from "react-redux";
export const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [next, setNext] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // modal state
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const user = useSelector((state) => state.user.user); // current logged in user
  const [unreadCounts, setUnreadCounts] = useState({});
  const [filter, setFilter] = useState("all"); 

  const navigate = useNavigate();
  const LIMIT = 6;

  
  // Fetch communities and users
 useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCommunities(LIMIT, offset);
        if (offset === 0) {
          setCommunities(data.results);
        } else {
          setCommunities((prev) => [...prev, ...data.results]);
        }
        setNext(data.next);
        // const userRes = await fetchUsers();
        // console.log("Fetched users for members in community:", userRes);
        // setUsers(userRes || []);
      } catch (err) {
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [offset]);
useEffect(() => {
  const loadAllUsers = async () => {
    try {
      console.log("before fetch followers")
      const userRes = await fetchAllFollowers(); // ✅ now fetches ALL pages
      console.log("Fetched users for members in community:", userRes);
      setUsers(userRes || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };
  loadAllUsers();
}, []);

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


  const handleMemberToggle = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Name is required");
    try {
      const newCommunity = await createCommunity(name, description, selectedMembers);
      setCommunities([...communities, newCommunity]);
      setName("");
      setDescription("");
      setSelectedMembers([]);
    } catch (err) {
      console.error("Error creating community:", err);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.username} ${user.email} ${user.full_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

// const handleDelete = async (id) => {
//   if (!window.confirm("Are you sure you want to delete this community?")) return;

//   try {
//     await deleteCommunity(id); // use the Axios function
//     setCommunities((prev) => prev.filter((c) => c.id !== id));
//     toast.success("Community deleted successfully");
//   } catch (err) {
//     toast.error("Failed to delete community");
//   }
// };
const handleDeleteClick = (id) => {
  setDeleteId(id); // opens modal
};

const confirmDelete = async () => {
  try {
    await deleteCommunity(deleteId);
    setCommunities(prev => prev.filter(c => c.id !== deleteId));
    toast.success("Community deleted successfully");
  } catch (err) {
    toast.error("Failed to delete community");
  } finally {
    setDeleteId(null);
  }
};
const createdByMe = communities.filter(
  (c) => c.creator?.id === user.id
);

const memberOf = communities.filter(
  (c) => c.creator?.id !== user.id && c.members?.some((m) => m.id === user.id)
);

useEffect(() => {
  const loadCounts = async () => {
    const counts = {};
    console.log("Loading unread counts for communities", communities);
    for (const c of communities) {
      console.log("Fetching unread count for community:", c.chat_room_uuid);
      const obj = await fetchUnreadCount(c.chat_room_uuid);
      counts[c.chat_room_uuid]=obj.data
      console.log(`Community ${c.id} has ${counts[c.chat_room_uuid]} unread messages`);
    }
    setUnreadCounts(counts);
    console.log("Unread counts loaded:", counts);
  };

  if (communities.length > 0) loadCounts();
}, [communities]);

let listToShow = communities;

if (filter === "mine") {
  listToShow = createdByMe;
} else if (filter === "member") {
  listToShow = memberOf;
}

  if (loading) return <Loader text="Loading communities..." />; // or redirect to login

  return (
    <CreatorLayout>
      <div className="p-6 space-y-6">

        <h1 className="text-2xl font-bold">My Communities</h1>
        
        <div className="flex gap-3 mb-4">
  <Button 
    variant={filter === "all" ? "default" : "outline"} 
    onClick={() => setFilter("all")}
  >
    All
  </Button>

  <Button 
    variant={filter === "mine" ? "default" : "outline"} 
    onClick={() => setFilter("mine")}
  >
    Your Communities
  </Button>

  <Button 
    variant={filter === "member" ? "default" : "outline"} 
    onClick={() => setFilter("member")}
  >
    Member Of
  </Button>
</div>


        {/* Community List */}
        {listToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listToShow.map((community) => (
  <Card key={community.id} className="shadow-lg rounded-2xl">
    <CardContent className="p-4">
      <h2 className="text-lg font-semibold">{community.name}</h2>
      <p className="text-sm text-gray-600">{community.description}</p>
      <p className="text-xs text-gray-400">
        Members: {community.members?.length || 0}
      </p>
    </CardContent>
    <div className="flex gap-2 p-2">
      <Button
        onClick={() => navigate(`/creator/communities/${community.id}`)}
        variant="custom"
      >
        View
      </Button>
      <Button
        onClick={() => handleDeleteClick(community.id)}
        variant="destructive"
      >
        Delete
      </Button>

{/* {community.creator?.id === user.id && (
          <Button
            onClick={() => handleDeleteClick(community.id)}
            variant="destructive"
          >
            Delete
          </Button>
        )} */}

      {unreadCounts[community.chat_room_uuid] > 0 && (
        <span className="text-xs bg-red-600 text-white rounded-full px-2 py-1">
          {unreadCounts[community.chat_room_uuid]}
        </span>
      )}

    </div>
  </Card>
))}

          </div>
        ) : (
          <p>No communities created yet.</p>
        )}
        {/* Plus Button */}
        <div className="flex justify-center my-4">
          <Button
            size="lg"
            className="rounded-full w-12 h-12 flex items-center justify-center text-3xl"
            onClick={() => setIsModalOpen(true)}
          >
            +
          </Button>
        </div>


        <DeleteConfirmModal 
          open={!!deleteId} 
          onClose={() => setDeleteId(null)} 
          onConfirm={confirmDelete} 
        />
        
       {/* Create Community Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <Input
                placeholder="Community Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="space-y-2">
                <h3 className="text-md font-semibold">Add Members</h3>
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <label key={user.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(user.id)}
                          onChange={() => handleMemberToggle(user.id)}
                        />
                        <span>
                          <span className="font-semibold">{user.username}</span> (
                          {user.email}) - {user.full_name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No users found.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CreatorLayout>
  );
};
