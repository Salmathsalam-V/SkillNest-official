import React, { useEffect, useState } from "react";
import { fetchCommunities, createCommunity, fetchUsers } from "../endpoints/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import { useNavigate } from "react-router-dom";

export const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const navigate = useNavigate();

  // Fetch communities and users
  useEffect(() => {
    const loadData = async () => {
      const res = await fetchCommunities();
      setCommunities(res || []);

      const userRes = await fetchUsers();
      setUsers(userRes || []);
    };
    loadData();
  }, []);

  const handleMemberToggle = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return alert("Name is required");
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

  return (
    <CreatorLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">My Communities</h1>

        {/* Community List */}
        {communities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card key={community.id} className="shadow-lg rounded-2xl">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">{community.name}</h2>
                  <p className="text-sm text-gray-600">{community.description}</p>
                  <p className="text-xs text-gray-400">
                    Members: {community.members?.length || 0} {community.id}
                  </p>
                </CardContent>
                {/* Navigate to community page with ID */}
               <Button
                  onClick={() => navigate(`/creator/communities/${community.id}`)}
                  variant="custom"
                >
                  View
                </Button>

              </Card>
            ))}
          </div>
        ) : (
          <p>No communities created yet.</p>
        )}

        {/* Create Form */}
        <div className="p-4 border rounded-xl space-y-3">
          <h2 className="text-lg font-semibold">Create New Community</h2>
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

          {/* Members Selection with Search */}
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

          <Button onClick={handleCreate}>Create</Button>
        </div>
      </div>
    </CreatorLayout>
  );
};
