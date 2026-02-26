"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getInfluencerOrderFulfillments,
  getDistributorOrderFulfillments,
} from "@/services/orders";
import { Loader2, PackageCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Fulfillment {
  id: string;
  acceptedQtyTons: number;
  createdAt: any;
  date: any;
  distributorId?: string;
  distributorOrderId?: string;
  influencerOrderId?: string;
  status: string;
  rate: number;
}

interface ViewFulfillmentProps {
  orderId: string;
  displayId?: string;
  distributorId?: string;
  orderSource: "dealer" | "sub-dealer";
}

export default function ViewFulfillment({
  orderId,
  displayId,
  distributorId,
  orderSource,
}: ViewFulfillmentProps) {
  const [open, setOpen] = useState(false);
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFulfillments();
    }
  }, [open]);

  const loadFulfillments = async () => {
    try {
      setLoading(true);
      const data: any =
        orderSource === "sub-dealer"
          ? await getInfluencerOrderFulfillments()
          : await getDistributorOrderFulfillments();

      // Filter: Strictly by Order ID
      const filteredData = data.filter((f: any) => {
        return (
          f.distributorOrderId === orderId || f.influencerOrderId === orderId
        );
      });

      setFulfillments(filteredData);
    } catch (error) {
      console.error("Error loading fulfillments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
        >
          <Eye className="w-4 h-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <PackageCheck className="w-6 h-6 text-[#F87B1B]" />
            History for #{displayId || "Order"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Review all partial fulfillments for this order.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
            <p className="text-sm text-gray-500 mt-4 font-medium">
              Fetching records...
            </p>
          </div>
        ) : fulfillments.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">
              No fulfillments found for this order.
            </p>
          </div>
        ) : (
          <div className="pt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-[10px] font-black uppercase tracking-wider h-10">
                    Date
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider h-10">
                    Accepted Qty
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider h-10 text-right">
                    Rate
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-wider h-10 text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fulfillments.map((f) => (
                  <TableRow key={f.id} className="hover:bg-gray-50/50">
                    <TableCell className="py-3 text-[11px] font-medium text-gray-600">
                      {formatDate(f.createdAt)}
                    </TableCell>
                    <TableCell className="py-3 text-[12px] font-bold text-gray-800">
                      {f.acceptedQtyTons}{" "}
                    </TableCell>
                    <TableCell className="py-3 text-[12px] font-bold text-green-700 text-right">
                      ₹{f.rate?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black uppercase h-5 px-2 ${
                          f.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {f.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Average Rate Row */}
                {/* {fulfillments.length > 0 && (
                  <TableRow className="bg-orange-50/30 border-t-2 border-orange-100">
                    <TableCell className="py-4 text-[11px] font-black text-orange-600 uppercase">
                      Average Rate
                    </TableCell>
                    <TableCell className="py-4 text-[12px] font-black text-gray-800">
                      {fulfillments
                        .reduce(
                          (acc, current) =>
                            acc + (current.acceptedQtyTons || 0),
                          0,
                        )
                        .toFixed(2)}
                      <span className="text-[10px] text-gray-400 ml-1">t</span>
                    </TableCell>
                    <TableCell className="py-4 text-[14px] font-black text-[#009846] text-right">
                      ₹
                      {(
                        fulfillments.reduce(
                          (acc, current) =>
                            acc +
                            (current.acceptedQtyTons || 0) *
                              (current.rate || 0),
                          0,
                        ) /
                        fulfillments.reduce(
                          (acc, current) =>
                            acc + (current.acceptedQtyTons || 0),
                          1,
                        )
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Badge className="bg-orange-500 text-white text-[9px] font-black border-none">
                        CALCULATED
                      </Badge>
                    </TableCell>
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
