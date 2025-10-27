import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { listCreators,updateCreator,deleteCreator,updateCreatorProfile } from '../endpoints/axios';

const CreatorList = () => {
  const [creators, setCreators] = useState([]);
  const [editingCreators, setEditingCreators] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState("");
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


const handleBlock = async (creatorId) => {
  try {
    // Find the creator object from your local state
    const target = creators.find(c => c.id === creatorId);
    if (!target) return;

    // Toggle the block status
    const updatedStatus = !target.is_block;

    // Make API call
    const res = await updateCreatorProfile(creatorId, { is_block: updatedStatus });

    if (res.success) {
      // Update state locally so UI refreshes immediately
      setCreators(prev =>
        prev.map(c =>
          c.id === creatorId ? { ...c, is_block: updatedStatus } : c
        )
      );

      toast.success(
        updatedStatus ? "Creator has been blocked" : "Creator has been unblocked"
      );
    } else {
      toast.error("Failed to update block status");
      console.error("API error:", res.errors);
    }
  } catch (err) {
    console.error("Error in handleBlock:", err);
    toast.error("Something went wrong while updating block status");
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
                  <TableCell>{creator.is_block? "True": "False"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm"onClick={() => handleBlock(creator.id)}>
                      {creator.is_block ? "Unblock" : "Block"}
                    </Button>

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

     
      </div>
    </AdminLayout>
  );
};

export default CreatorList;
