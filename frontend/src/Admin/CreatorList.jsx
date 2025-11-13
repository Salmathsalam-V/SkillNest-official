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
import { listCreators, updateCreatorProfile, deleteCreator } from '../endpoints/axios';

const CreatorList = () => {
  const [creators, setCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await listCreators();
        if (response.data.success) {
          setCreators(response.data.creators);
        }
      } catch (error) {
        toast.error("Failed to fetch creators");
        console.error('Failed to fetch creators:', error);
      } finally {
        setLoading(false);
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
      toast.success("Creator deleted successfully");
    } else {
      toast.error("Failed to delete creator");
      console.error("Error deleting creator:", res.error);
    }
  };

  const handleViewMore = (id) => {
    navigate(`/creators-view/${id}`);
  };

  const handleBlock = async (creatorId) => {
    try {
      const target = creators.find(c => c.id === creatorId);
      if (!target) return;
      const updatedStatus = !target.is_block;

      const res = await updateCreatorProfile(creatorId, { is_block: updatedStatus });

      if (res.success) {
        setCreators(prev =>
          prev.map(c =>
            c.id === creatorId ? { ...c, is_block: updatedStatus } : c
          )
        );
        toast.success(updatedStatus ? "Creator has been blocked" : "Creator has been unblocked");
      } else {
        toast.error("Failed to update block status");
        console.error("API error:", res.errors);
      }
    } catch (err) {
      console.error("Error in handleBlock:", err);
      toast.error("Something went wrong while updating block status");
    }
  };

  if (loading) return <Loader text="Loading ..." />;

  return (
    <AdminLayout>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Creator Users</h2>

        {/* Search input */}
        <div className="max-w-md mb-4">
          <Input
            type="text"
            placeholder="Search by username, fullname, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table for medium+ screens */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="min-w-[600px] md:min-w-full">
            <TableCaption>A list of all creator users.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ispayed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.map((creator) => (
                <TableRow key={creator.id} className="hover:bg-gray-50">
                  <TableCell>{creator.username}</TableCell>
                  <TableCell>{creator.fullname}</TableCell>
                  <TableCell>{creator.email}</TableCell>
                  <TableCell>{creator.approve}</TableCell>
                  <TableCell>{creator.has_paid ? "Payed" : "NotPayed"}</TableCell>
                  <TableCell className="text-right space-x-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBlock(creator.id)}
                    >
                      {creator.is_block ? "Unblock" : "Block"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMore(creator.id)}
                    >
                      View more
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(creator.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {filteredCreators.length === 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No creators found.
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        {/* Card layout for small screens */}
        <div className="md:hidden space-y-4">
          {filteredCreators.map((creator) => (
            <div key={creator.id} className="border rounded-lg p-4 shadow-sm">
              <p><strong>Username:</strong> {creator.username}</p>
              <p><strong>Full Name:</strong> {creator.fullname}</p>
              <p><strong>Email:</strong> {creator.email}</p>
              <p><strong>Status:</strong> {creator.approve}</p>
              <p><strong>Paid:</strong> {creator.has_paid ? "Payed" : "NotPayed"}</p>
              <div className="flex flex-col space-y-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBlock(creator.id)}
                >
                  {creator.is_block ? "Unblock" : "Block"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewMore(creator.id)}
                >
                  View more
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(creator.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {filteredCreators.length === 0 && (
            <p className="text-center text-muted-foreground">No creators found.</p>
          )}
        </div>

        {/* Create button */}
        <div className="mt-4">
          <Button variant="custom" onClick={() => navigate('/createcreator')}>
            Create
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreatorList;
