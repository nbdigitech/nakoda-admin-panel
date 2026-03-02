"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import StateCard from "@/components/master/state-card";
import DistrictCard from "@/components/master/district-card";
import CityVillageCard from "@/components/master/city-village-card";
import InfluencerCategoryCard from "@/components/master/influencer-category-card";
import UnitCard from "@/components/master/unit-card";
import StaffCard from "@/components/master/staff-card";
import ValidityPeriodCard from "@/components/master/validity-period-card";

export default function MasterPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-2 gap-6">
        <StateCard />
        <DistrictCard />
        <CityVillageCard />
        <InfluencerCategoryCard />
        <UnitCard />
        <StaffCard />
        <ValidityPeriodCard />
      </div>
    </DashboardLayout>
  );
}
