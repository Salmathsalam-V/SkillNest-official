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
    <div className="p-4 md:p-6">
      <Card className="shadow-sm">
        <CardContent className="p-4 md:p-6">

          <h1 className="text-2xl font-semibold mb-6">Communities</h1>

          {/* Responsive Scroll Wrapper */}
          <div className="overflow-x-auto border rounded-lg">
            <Table className="min-w-[700px] w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Creator</TableHead>
                  <TableHead className="font-semibold">Members</TableHead>
                  <TableHead className="text-center font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {communities.map((c) => (
                  <TableRow key={c.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {c.description}
                    </TableCell>
                    <TableCell>{c.creator}</TableCell>
                    <TableCell>{c.members.length}</TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <div className="flex gap-2 justify-center">

                        {/* VIEW MEMBERS BUTTON */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCommunity(c);
                                fetchMembers(c.id);
                              }}
                            >
                              View
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Members of {selectedCommunity?.name}
                              </DialogTitle>
                            </DialogHeader>

                            {selectedMembers.length > 0 ? (
                              <ul className="mt-2 space-y-2">
                                {selectedMembers.map((m) => (
                                  <li
                                    key={m.id}
                                    className="p-2 border rounded-md shadow-sm"
                                  >
                                    <span className="block font-medium">
                                      {m.username}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {m.email}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 mt-2">
                                No members yet.
                              </p>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* DELETE BUTTON */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);
}
