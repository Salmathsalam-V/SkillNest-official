import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import AdminLayout from "@/components/Layouts/AdminLayout";
import {getCommunities,getCommunityMembers,deleteCommunities } from "../endpoints/axios";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function CommunityListAdmin() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

useEffect(() => {
  const loadCommunities = async () => {
    try {
      const data = await getCommunities();  
      setCommunities(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("fetch communities admin:", error);
    } finally {
      setLoading(false);
    }
  };
  loadCommunities();
}, []);




  const fetchMembers = async (communityId) => {
          
          try {
            const data = await getCommunityMembers(communityId);      // no destructuring
            setSelectedMembers(data);
          } catch (error) {
            console.error("fetch communities admin:", error);
          } finally {
            setLoading(false);
          }
    };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this community?")) return;

    try {
      const data = await deleteCommunities(id);;
      setCommunities((prev) => prev.filter((c) => c.id !== id));
      toast.success("Community deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete community.");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <AdminLayout>
    <Card className="m-6 p-4">
      <CardContent>
        <h1 className="text-2xl font-semibold mb-4">Communities</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Members Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communities.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.description}</TableCell>
                <TableCell>{c.creator}</TableCell>
                <TableCell>{c.members.length}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCommunity(c);
                          fetchMembers(c.id);
                        }}
                      >
                        View Members
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          Members of {selectedCommunity?.name}
                        </DialogTitle>
                      </DialogHeader>
                      {selectedMembers.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {selectedMembers.map((m) => (
                            <li key={m.id} className="flex flex-col border-b pb-1">
                              <span className="font-medium">{m.username}</span>
                              <span className="text-sm text-gray-600">{m.email}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-gray-500">No members yet.</p>
                      )}
                    </DialogContent>
                  </Dialog>
                   {/* 🗑️ DELETE BUTTON */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </AdminLayout>
  );
}
