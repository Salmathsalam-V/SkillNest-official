import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { setUser } from '../Redux/userSlice';
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import { toast } from 'sonner';


const CreatorProfile = () => {
//   const [userdata, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState([]);
  const user = useSelector((state) => state.user.user);
  const [editingCreator, setEditingCreator] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const dispatch = useDispatch();

  if (!user) {
    return <div>Loading...</div>; // or redirect to login
  }
    const handleEditClick = (creator) => {
    setEditingCreator({ ...creator }); // Clone to avoid direct state mutation
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCreators(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateCreator = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:8000/api/admin/creators/${editingCreator.id}/`, editingCreator);
      alert("Creator updated successfully");
      toast.success("Creator updated successfully");
      setCreators(prev => prev.map(l => l.id === editingCreator.id ? editingCreator : l));
      setIsEditOpen(false);
      dispatch(setUser(creators));
    } catch (err) {
      console.error("Update error:", err);
      toast.error("creator Update failed")
    }
  };

  return (
    <>
    <CreatorLayout>
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Profile
          </CardTitle>
        </CardHeader>
         {/* {user && <h2>Welcome, {user.fullname}</h2>} */}
        <CardContent className="flex flex-col items-center gap-4">
            <div className="text-sm text-gray-700">Username: {user.fullname}</div>
          <Avatar className="h-16 w-16">
            <AvatarFallback>{user?.username?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-sm text-gray-700">Username: {user.username}</div>
          <div className="text-sm text-gray-700">Email: {user.email}</div>
          <div className="text-sm text-gray-700">
            Name: {user.fullname}
          </div>
            <Button onClick={() => handleEditClick(user)} variant='link'>Edit</Button>
          
        </CardContent>
      </Card>
       {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdateCreator}>
            <DialogHeader>
              <DialogTitle>Edit Creator</DialogTitle>
              <DialogDescription>
                Make changes to creator info. Click save when you're done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={editingCreator?.username || ''} onChange={handleEditChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={editingCreator?.email || ''} onChange={handleEditChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input id="fullname" name="fullname" value={editingCreator?.fullname || ''} onChange={handleEditChange} />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </CreatorLayout>
    </>
  );
};

export default CreatorProfile;
