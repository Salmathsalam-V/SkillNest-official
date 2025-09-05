import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LearnerLayout from "@/components/Layouts/LearnerLayout";
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import { get_learners } from "@/endpoints/axios";

export const LearnerListPublic = () => {
  const [learners, setLearners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const user = useSelector((state) => state.user.user);
  const userType = user?.user_type;

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const learnersData = await get_learners(); // API returns an array
        setLearners(learnersData);
      } catch (error) {
        console.error("Failed to fetch learners:", error);
      }
    };

    fetchLearners();
  }, []);

  const filteredLearners = useMemo(() => {
    return learners.filter((learner) =>
      (learner.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (learner.fullname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (learner.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, learners]);

  const Layout = userType === "creator" ? CreatorLayout : LearnerLayout;

  return (
    <Layout>
      <div className="flex flex-col items-center p-6">
        {/* Search bar */}
        <Input
          type="text"
          placeholder="Search learners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 mb-6"
        />

        {/* Learners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {filteredLearners.map((learner) => (
            <Card key={learner.id} className="shadow-md rounded-xl p-4">
              <CardHeader className="flex flex-col items-center">
                <Avatar className="h-16 w-16 mb-2">
                  {learner?.profile ? (
                    <img
                      src={learner.profile}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback>
                      {learner?.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-lg font-semibold text-center">
                  {learner.fullname || "Unnamed"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Username:</strong> {learner.username || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {learner.email || "N/A"}
                </p>
                <Button
                  variant="custom"
                  className="mt-2 "
                >
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
