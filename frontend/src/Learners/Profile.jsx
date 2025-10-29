import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LearnerLayout from "@/components/Layouts/LearnerLayout";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { setUser } from "../Redux/userSlice";
import { toast } from "sonner";
import { Loader } from "@/components/Layouts/Loader";
import { updateLearner } from "../endpoints/axios";

// 🆕 Import your PaymentButton
import PaymentButton from "@/Creator/PaymentButton";

const Profile = () => {
  const [learner, setLearner] = useState(null);
  const [editingLearner, setEditingLearner] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false); // 🆕 upgrade modal
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch learner data
  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/admin/learners/${user.id}/`);
        setLearner(res.data);
      } catch (error) {
        console.error("Failed to fetch learner data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchLearner();
  }, [user]);

  if (loading) return <Loader text="Loading learner profile..." />;

  const handleEditClick = (learner) => {
    setEditingLearner({ ...learner });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingLearner((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Upload profile picture
  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:8000/api/upload-image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const url = res.data.url;
      setEditingLearner((prev) => ({ ...prev, profile: url }));
      toast.success("Profile image uploaded");
    } catch (error) {
      toast.error("Profile image upload failed");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save learner update
  const handleUpdateLearner = async (e) => {
    e.preventDefault();

    try {
      const res = await updateLearner(editingLearner.id, editingLearner);
      toast.success("Profile updated successfully");
      setLearner(res.data);
      setIsEditOpen(false);
      dispatch(setUser(res.data));
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data) {
        const errors = err.response.data;
        for (const [field, messages] of Object.entries(errors)) {
          toast.error(`${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`);
        }
      } else {
        toast.error("Something went wrong while updating profile.");
      }
    }
  };

  return (
    <LearnerLayout>
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="w-full max-w-sm shadow-xl rounded-2xl p-4">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold">Profile</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-16 w-16">
              {learner?.profile ? (
                <img src={learner.profile} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <AvatarFallback>{user?.username?.[0].toUpperCase()}</AvatarFallback>
              )}
            </Avatar>

            <div className="text-sm text-gray-700">Username: {user.username}</div>
            <div className="text-sm text-gray-700">Email: {user.email}</div>
            <div className="text-sm text-gray-700">Name: {user.fullname}</div>

            <div className="flex flex-col gap-2 mt-2">
              <Button onClick={() => handleEditClick(learner)} variant="link">
                Edit
              </Button>

              {/* 🆕 Beautiful Upgrade Button */}
              <Button
                onClick={() => setIsUpgradeOpen(true)}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold shadow-md hover:scale-105 transition-transform"
              >
                🌟 Upgrade for ₹299
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ✨ Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleUpdateLearner}>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your profile details below.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="profile">Profile Picture</Label>
                  {editingLearner?.profile && (
                    <img
                      src={editingLearner.profile}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover mb-2"
                    />
                  )}
                  <Input type="file" accept="image/*" onChange={handleProfileUpload} />
                  {uploading && <p className="text-xs text-gray-400">Uploading...</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={editingLearner?.username || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={editingLearner?.email || ""} disabled />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    value={editingLearner?.fullname || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 🆕 Upgrade Modal */}
        <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
          <DialogContent className="max-w-md text-center space-y-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-purple-600">Upgrade Your Plan ✨</DialogTitle>
              <DialogDescription className="text-gray-600">
                Unlock premium creator access for just <span className="font-semibold text-pink-500">₹299</span>.
              </DialogDescription>
            </DialogHeader>

            {/* Pass props to PaymentButton */}
            <div className="flex justify-center py-4">
              <PaymentButton email={user.email} amount={299} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LearnerLayout>
  );
};

export default Profile;
