import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/Layouts/AdminLayout";
import {listPayments} from "@/endpoints/axios"

export const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all payments from backend (admin only)
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await listPayments();
        setPayments(res.data);
      } catch (err) {
        console.error("Error fetching payments:", err);
        toast.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <AdminLayout>
        <div className="p-8 bg-gray-50 min-h-screen">
        <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
                💳 Payment Records
            </CardTitle>
            </CardHeader>
            <CardContent>
            {loading ? (
                <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                </div>
            ) : payments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No payments found.</p>
            ) : (
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {payments.map((p) => (
                        <TableRow key={p.id}>
                        <TableCell>{p.user_email || "Unknown"}</TableCell>
                        <TableCell>{p.order_id}</TableCell>
                        <TableCell>{p.payment_id}</TableCell>
                        <TableCell>₹{p.amount}</TableCell>
                        <TableCell>
                            <Badge
                            className={`${
                                p.status === "success"
                                ? "bg-green-500 hover:bg-green-600"
                                : p.status === "failed"
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-yellow-500 hover:bg-yellow-600"
                            } text-white`}
                            >
                            {p.status.toUpperCase()}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {new Date(p.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            })}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            )}
            </CardContent>
        </Card>
        </div>
    </AdminLayout>
  );
};

export default AdminPayments;
