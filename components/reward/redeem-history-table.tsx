"use client";

import { Edit, Loader2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

interface RedeemData {
  id: string;
  influencerId: string;
  subDealerName?: string;
  redeemPoints: number;
  createdAt: any;
  rewardsId: string;
  status: string;
  productTitle?: string;
  category?: string;
}

interface RedeemHistoryTableProps {
  data: RedeemData[];
  loading?: boolean;
  onEditClick: (data: RedeemData) => void;
  showEditButton?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "rejected":
      return "bg-red-100 text-red-700";
    case "approved":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "N/A";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "Error Date";
  }
};

export default function RedeemHistoryTable({
  data,
  loading,
  onEditClick,
  showEditButton = true,
}: RedeemHistoryTableProps) {
  const exportToExcel = () => {
    const dataToExport = data.map((item, index) => {
      const formatDateStr = (timestamp: any) => {
        if (!timestamp) return "N/A";
        try {
          const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
          if (isNaN(date.getTime())) return "Invalid Date";
          return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        } catch (e) {
          return "Error Date";
        }
      };

      return {
        "S No.": index + 1,
        "Sub Dealer Name": item.subDealerName || "-",
        "Redeem Pts": item.redeemPoints || 0,
        "Redeem Date": formatDateStr(item.createdAt),
        "Product Claim": item.productTitle || "-",
        Category: item.category || "-",
        Status: item.status || "Pending",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RedeemHistory");
    XLSX.writeFile(workbook, "redeem_history_export.xlsx");
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                S No.
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Sub Dealer Name
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Redeem Pts
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Redeem Date
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Product Claim
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Status
              </th>
              {showEditButton && (
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-gray-500 italic"
                >
                  No redemptions found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    {item.subDealerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-bold">
                    {item.redeemPoints}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.productTitle}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      className={`${getStatusColor(item.status)} px-3 py-1 border-none shadow-none text-[10px] items-center font-bold uppercase`}
                    >
                      {item.status}
                    </Badge>
                  </td>
                  {showEditButton && (
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onEditClick(item)}
                        className="text-orange-500 hover:text-orange-600 flex items-center gap-1 font-bold"
                      >
                        <Edit className="w-4 h-4" />
                        Update Status
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && data.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 font-medium">
            Total Requests: {data.length}
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-6 py-2 bg-[#F87B1B] text-white rounded-lg font-semibold hover:bg-[#e66a15] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      )}
    </div>
  );
}
