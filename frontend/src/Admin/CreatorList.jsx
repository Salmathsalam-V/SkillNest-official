import React, { useEffect, useMemo, useState } from 'react';
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader } from '@/components/Layouts/Loader';
import { listCreators,updateCreator,deleteCreator } from '../endpoints/axios';

const CreatorList = () => {
  const [creators, setCreators] = useState([]);
  const [editingCreators, setEditingCreators] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await listCreators();
        console.log("Creators fetched from creator list :", response.data.creators);
        if (response.data.success) {
          setCreators(response.data.creators);
        }
      } catch (error) {
        toast.error("Failed to fetch creators");
        console.error('Failed to fetch creators:', error);
      }
    };
    fetchCreators();
  }, []);

  const filteredCreators = useMemo(() => {
    return creators.filter(creator =>
      creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, creators]);

const handleDelete = async (id) => {
  const res = await deleteCreator(id);
  if (res.success) {
    setCreators(prev => prev.filter(creator => creator.id !== id));
    toast.error("Creator deleted successfully");
  } else {
    console.error("Error deleting creator:", res.error);
    toast.error("Failed to delete creator");
  }
};

  
 const handleViewMore = (id) => {
  navigate(`/creators-view/${id}`);
};

  const handleEditClick = (creator) => {
    setEditingCreators({ ...creator });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCreators(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateCreators = async (e) => {
    e.preventDefault();
    const res = await updateCreator(editingCreators.id, editingCreators);

    if (res.success) {
      setCreators(prev =>
        prev.map(l => (l.id === editingCreators.id ? editingCreators : l))
      );
      toast.success("Creator updated successfully");
      setIsEditOpen(false);
    } else {
      console.error("Update error:", res.error);
      toast.error("Failed to update creator");
    }
  };
    if (!loading) return <Loader text="Loading ..." />; // or redirect to login
  

  return (
    <AdminLayout>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Creator Users</h2>

        <div className="max-w-md mb-4">
          <Input
            type="text"
            placeholder="Search by username, fullname, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto mb-6">
          <Table>
            <TableCaption>A list of all creator users.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map((creator) => (
                <TableRow key={creator.id}>
                  <TableCell>{creator.username}</TableCell>
                  <TableCell>{creator.fullname}</TableCell>
                  <TableCell>{creator.email}</TableCell>
                  <TableCell>{creator.approve}</TableCell>
                  <TableCell className="text-right space-x-2">
                     <Button variant="outline" size="sm" onClick={() => handleViewMore(creator.id)}>
                      View more
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(creator.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {filteredCreators.length === 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No creators found.
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        <Button variant="custom" onClick={() => navigate('/createcreator')}>Create</Button>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleUpdateCreators}>
              <DialogHeader>
                <DialogTitle>Edit Creator</DialogTitle>
                <DialogDescription>
                  Make changes to the creator's info. Click save when you're done.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={editingCreators?.username || ''} onChange={handleEditChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={editingCreators?.email || ''} onChange={handleEditChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" name="fullname" value={editingCreators?.fullname || ''} onChange={handleEditChange} />
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
    </AdminLayout>
  );
};

export default CreatorList;
