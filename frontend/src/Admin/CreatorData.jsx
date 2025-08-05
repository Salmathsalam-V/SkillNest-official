import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminLayout from '@/components/Layouts/AdminLayout';

export function CreatorData() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/admin/creators-view/${id}/`);
        if (response.data.success) {
          setCreator(response.data.creator);
          setStatus(response.data.creator.approve);
        } else {
          setError("Creator not found");
        }
      } catch (err) {
        console.error("Failed to fetch creator:", err);
        setError("Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [id]);

const handleApprove = async () => {
  try {
    const response = await axios.patch(`http://localhost:8000/api/admin/creators-view/${id}/`, {
      approve: "accept"
    });
    if (response.data.success) {
      setStatus("accept");
    }
  } catch (err) {
    console.error("Approval failed", err);
  }
};

const handleReject = async () => {
  try {
    const response = await axios.patch(`http://localhost:8000/api/admin/creators-view/${id}/`, {
      approve: "reject"
    });
    if (response.data.success) {
      setStatus("reject");
    }
  } catch (err) {
    console.error("Rejection failed", err);
  }
};


  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <AdminLayout>
    <div className="max-w-6xl mx-auto p-6">
      {/* Banner */}
     <div
        className="relative p-6 rounded-xl shadow-md text-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${creator.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
  {/* Optional overlay for better contrast */}
  <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-blue-100 opacity-80 z-0"></div>

      {/* Content over image */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-sky-700">SkillNest</h1>
        <p className="text-md text-gray-700 mt-2">
          {creator.category} Creator - {creator.username}
        </p>
      </div>
    </div>


      {/* Creator Card */}
      <Card className="mt-6 p-6 flex gap-6 items-center">
        <img
          src={creator.profile}
          alt="creator"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">@{creator.username}</h2>
          <p className="text-gray-600 text-sm mb-1">Category: {creator.category}</p>
          <p className="text-gray-700">{creator.description}</p>

          <div className="mt-4 flex gap-3">
            {status === 'pending' ? (
              <>
                <Button onClick={handleApprove}>Accept</Button>
                <Button onClick={handleReject} variant="destructive">Reject</Button>
              </>
            ) : (
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  status === 'accept'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {status === 'accept' ? 'Accepted' : 'Rejected'}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="posts" className="mt-8">
        <TabsList className="mb-4 bg-muted p-1 rounded-md w-fit">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <p className="text-muted-foreground text-center mt-6">No posts available.</p>
        </TabsContent>

        <TabsContent value="courses">
          <p className="text-muted-foreground text-center mt-6">No courses yet.</p>
        </TabsContent>

        <TabsContent value="reviews">
          <p className="text-muted-foreground text-center mt-6">No reviews yet.</p>
        </TabsContent>
      </Tabs>
    </div>
    </AdminLayout>
  );
}
