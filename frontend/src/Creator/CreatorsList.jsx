import LearnerLayout from '@/components/Layouts/LearnerLayout';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export const CreatorsListPublic = () => {
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/admin/creators/");
        if (response.data.success) {
          setCreators(response.data.creators);
          setFilteredCreators(response.data.creators);
        }
      } catch (error) {
        toast.error("Failed to fetch creators");
        console.error("Failed to fetch creators:", error);
      }
    };
    fetchCreators();
  }, []);

  // search filter
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredCreators(creators);
    } else {
      setFilteredCreators(
        creators.filter(c =>
          c.username.toLowerCase().includes(search.toLowerCase()) ||
          c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.creator_profile?.category?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, creators]);

  return (
    <LearnerLayout>
      <div className="flex flex-col items-center p-6">
        {/* Search bar */}
        <Input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/2 mb-6"
        />

        {/* Creators grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredCreators.map((creator) => (
            <Card key={creator.id} className="shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {creator.fullname || "Unnamed"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-16 w-16">
                            {creator?.profile ? (
                              <img
                                src={creator.profile}
                                alt="Profile"
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFallback>{creator?.username?.[0].toUpperCase()}</AvatarFallback>
                            )}
                          </Avatar>
                <p className="text-sm text-gray-600">
                  <strong>Username:</strong> {creator.username}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Category:</strong> {creator.category || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {" "}
                  {creator.description || "No description"}
                </p>
                <Button
                  className="w-full " variant="custom"
                  onClick={() => navigate(`/creators/${creator.id}`)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LearnerLayout>
  );
};
