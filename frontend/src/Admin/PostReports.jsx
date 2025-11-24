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

   if (!loading && reports.length === 0) {
    return (
      <AdminLayout>
        <ScrollArea className="h-[calc(100vh-4rem)] p-6 bg-gray-50">
          <div className="flex justify-center items-center h-full text-gray-600 text-lg">
            No reports found.
          </div>
        </ScrollArea>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <ScrollArea className="h-[calc(100vh-4rem)] p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Reported Posts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-lg hover:shadow-xl transition duration-300 ease-in-out border-gray-100">
            <CardHeader className="p-4 border-b">
              {/* --- Post Author & Title Section --- */}
              <div className="flex items-center space-x-3">
                {/* Post Author Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={report.post_author_profile}
                    alt={report.post_author || "Post Author"}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                    {report.post_author?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>

                {/* Post Author Name and Post Caption */}
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-800 m-0">
                    {report.post_author || "Unknown Author"}
                  </CardTitle>
                  <p className="text-xl font-bold text-gray-900 leading-snug mt-0.5">
                    {report.post_caption || "Untitled Post"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {/* --- Reported Post Image --- */}
              {report.post_image && (
                <img
                  src={report.post_image}
                  alt={report.post_caption || "Reported Post Image"}
                  className="rounded-lg w-full h-48 object-cover mb-4 border border-gray-200"
                />
              )}

              {/* --- Reported By Section --- */}
              <div className="mb-4 pt-2 border-t border-dashed border-gray-200">
                <p className="font-semibold text-sm text-red-600 mb-2">Report Details</p>

                {/* Reporter Info */}
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-600">Reported by:</span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={report.reported_by_profile}
                      alt={report.reported_by_username || "Reporter"}
                    />
                    <AvatarFallback className="text-xs bg-red-100 text-red-600">
                      {report.reported_by_username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-gray-700">
                    {report.reported_by_username || report.reported_by_email}
                  </p>
                </div>

                {/* Reason */}
                <p className="text-sm text-gray-800 mt-3 p-2 bg-gray-50 rounded-md border border-gray-100">
                  <span className="font-bold text-red-700">Reason:</span> {report.reason}
                </p>
              </div>

              {/* --- Timestamp --- */}
              <p className="text-xs text-gray-500 mt-4 text-right">
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

