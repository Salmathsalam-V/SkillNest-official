import React, { useEffect, useRef } from 'react';
import { logout } from "../endpoints/axios";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Layouts/AdminLayout';
import LearnerBanner from '../assets/learner-banner.jpg';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import Dashboard from './Dashboard';

export const AdminHome = () => {



  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};
