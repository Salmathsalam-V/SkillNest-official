import React, { useEffect, useState,useMemo } from 'react';
import axios from 'axios';
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
import { toast } from 'sonner';
import { Loader } from '@/components/Layouts/Loader';
import { get_learners } from '@/endpoints/axios';

const LearnerList = () => {
  const [learners, setLearners] = useState([]);
  const [editingLearner, setEditingLearner] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const response = await get_learners();
        if (response.data.success) {
          setLearners(response.data.learners);
        }
      } catch (error) {
        console.error('Failed to fetch learners:', error);
        toast.error("Failed to fetch learners");
      }
    };
    fetchLearners();
  }, []);

  
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
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLearners.map((learner) => (
              <TableRow key={learner.id}>
                <TableCell>{learner.username}</TableCell>
                <TableCell>{learner.fullname}</TableCell>
                <TableCell>{learner.email}</TableCell>
                <TableCell className="text-right space-x-2">
    
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

        
      </div>
    </AdminLayout>
  );
};

export default LearnerList;
