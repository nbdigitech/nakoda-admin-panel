"use client";

import UpdateRateDrawer from "@/components/dashboard/update-rate-drawer";

export default function TodayRateCard() {
  return (
    <div
      className="w-full flex items-center justify-between rounded-lg px-6 py-3 -mt-2"
      style={{ backgroundColor: "#F87B1B1A" }}
    >
      {/* Left Content */}
      <div className="flex items-center gap-8 ">
        <div>

        <h3 className="text-[18px] pb-1 font-semibold text-[#F87B1B]">
          Today Rate
        </h3>
          <p className="text-sm font-medium ">
            Rs. 45,500 MT • 18 Jan 2026
          </p>
        </div>

       <div className="flex items-center gap-1.5 ml-14">
  <span className="text-[#0A8F3E] text-[15px] font-bold ">
    ₹ 150
  </span>

  <span className=" text-[#0A8F3E] text-[12px] leading-none">
    ▲
  </span>
</div>

      </div>

      {/* Button */}
      <UpdateRateDrawer
        trigger={
          <button
            className="text-white text-sm font-semibold px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#F87B1B" }}
          >
            + Update Rate
          </button>
        }
      />
    </div>
  );
}
