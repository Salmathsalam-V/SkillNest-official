import React, { useEffect, useRef } from 'react';
import { logout } from "../endpoints/axios";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Layouts/AdminLayout';
import LearnerBanner from '../assets/learner-banner.jpg';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

export const AdminHome = () => {
  const navigate = useNavigate();
  const creatorChartRef = useRef(null);
  const learnerChartRef = useRef(null);
  const creatorChartInstance = useRef(null);
  const learnerChartInstance = useRef(null);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
      toast.success("Logout successfully")
    }
  };

  useEffect(() => {
    if (creatorChartInstance.current) creatorChartInstance.current.destroy();
    if (learnerChartInstance.current) learnerChartInstance.current.destroy();

    const creatorCtx = creatorChartRef.current.getContext('2d');
    const learnerCtx = learnerChartRef.current.getContext('2d');

    creatorChartInstance.current = new Chart(creatorCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Creators',
          data: [3, 5, 4, 6, 7, 4, 5],
          backgroundColor: 'rgba(78, 205, 196, 0.2)',
          borderColor: '#4ECDC4',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    learnerChartInstance.current = new Chart(learnerCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Learners',
          data: [10, 14, 12, 13, 15, 9, 11],
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          borderColor: '#FF6B6B',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    return () => {
      creatorChartInstance.current?.destroy();
      learnerChartInstance.current?.destroy();
    };
  }, []);

  const communities = [
    {
      name: "Porttary with crafts_by_lemma",
      members: 8,
      id: 1
    },
    {
      name: "SkillNest Innovators",
      members: 15,
      id: 2
    },
    {
      name: "Creative Coders Hub",
      members: 12,
      id: 3
    }
  ];

  return (
    <AdminLayout>
      {/* Banner */}
      <div
        className="w-full bg-cover bg-center h-48 rounded-lg mb-6 flex items-center justify-center text-white shadow"
        style={{ backgroundImage: `url(${LearnerBanner})` }}
      >
        <div className="bg-black/50 p-4 rounded">
          <h1 className="text-2xl font-bold">Welcome to the Admin Zone</h1>
          <p className="text-sm">Here where creators meet community.</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <Button variant="custom" onClick={handleLogout}>Logout</Button>
        <Button variant="success" onClick={() => navigate('/')}>Menu</Button>
      </div>

      {/* Graphs */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Creators Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={creatorChartRef} height="120"></canvas>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learners Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={learnerChartRef} height="120"></canvas>
          </CardContent>
        </Card>
      </div>

      {/* Communities Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Featured Communities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card key={community.id}>
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <p>{community.members} members</p>
                <Button variant="outline" size="sm">View More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
