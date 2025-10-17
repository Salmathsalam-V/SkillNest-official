import React, { useEffect, useState,useMemo } from 'react';
import axios from 'axios';
import { get_learners } from '@/endpoints/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Layouts/AdminLayout';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const LearnerList = () => {
  const [learners, setLearners] = useState([]);
  const [editingLearner, setEditingLearner] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const learners = await get_learners();  // returns array
        console.log('Fetched learners:', learners);
        setLearners(learners);
      } catch (error) {
        console.error('Failed to fetch learners:', error);
      }
    };
    fetchLearners();
  }, []);


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/admin/learners/${id}/`);
      setLearners(prev => prev.filter(learner => learner.id !== id));
      alert("Learner deleted successfully");
    } catch (err) {
      console.error('Error deleting learner:', err);
      alert('Failed to delete learner.');
    }
  };

  const handleEditClick = (learner) => {
    setEditingLearner({ ...learner });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingLearner(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateLearner = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:8000/api/admin/learners/${editingLearner.id}/`, editingLearner);
      alert("Learner updated successfully");
      setLearners(prev =>
        prev.map(l => l.id === editingLearner.id ? editingLearner : l)
      );
      setIsEditOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update learner");
    }
  };
  const filteredLearners = useMemo(() => {
    return learners.filter(learner =>
      learner.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, learners]);
  return (
    <AdminLayout>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Learner Users</h2>

        <div className="mb-4 max-w-sm">
          <Input
            type="text"
            placeholder="Search by username, fullname, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableCaption>List of registered learners.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLearners.map((learner) => (
              <TableRow key={learner.id}>
                
                <TableCell>
                  <img
                    src={learner.profile || 'https://via.placeholder.com/40'} // fallback if empty
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell>{learner.username}</TableCell>
                <TableCell>{learner.fullname}</TableCell>
                <TableCell>{learner.email}</TableCell>
                <TableCell className="text-right space-x-2">
                  {/* <Button variant="outline" size="sm" onClick={() => handleEditClick(learner)}>
                    Edit
                  </Button> */}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(learner.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Button variant="custom" onClick={() => navigate('/createlearner')}>
            Create Learner
          </Button>
        </div>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleUpdateLearner}>
              <DialogHeader>
                <DialogTitle>Edit Learner</DialogTitle>
                <DialogDescription>
                  Update learner information below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={editingLearner?.username || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={editingLearner?.email || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    value={editingLearner?.fullname || ''}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default LearnerList;
