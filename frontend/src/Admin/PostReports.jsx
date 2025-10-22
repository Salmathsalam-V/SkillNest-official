import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { postReportsView } from "@/endpoints/axios";
import AdminLayout from "@/components/Layouts/AdminLayout";

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await postReportsView();
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err.response?.data || err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );

  if (reports.length === 0)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        No reports found.
      </div>
    );

  return (
    <AdminLayout>
    <ScrollArea className="h-[calc(100vh-4rem)] p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Reported Posts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {report.post_caption ||"Untitled Post"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={report.post_image}
                alt={report.post_title}
                className="rounded-lg w-full h-40 object-cover mb-3"
              />
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold">Reported by:</span>
                <Avatar>
                  <AvatarImage
                    src={report.reported_by_profile}
                    alt={report.reported_by_username}
                  />
                  <AvatarFallback>
                    {report.reported_by_username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">
                  {report.reported_by_username || report.reported_by_email}
                </p>
              </div>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Reason:</span> {report.reason}
              </p>
              <p className="text-xs text-gray-500">
                Reported on {new Date(report.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
    </AdminLayout>
  );
};

