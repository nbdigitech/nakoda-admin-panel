"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getState,
  getDistrict,
  getCity,
  getInfluencerCategory,
  getUnit,
  getDesignation,
  getValidityPeriod,
} from "@/services/masterData";

interface MasterDataContextType {
  states: any[];
  districts: any[];
  cities: any[];
  influencerCategories: any[];
  units: any[];
  designations: any[];
  validityPeriods: any[];
  loading: boolean;
  refreshStates: () => Promise<void>;
  refreshDistricts: () => Promise<void>;
  refreshCities: () => Promise<void>;
  refreshInfluencerCategories: () => Promise<void>;
  refreshUnits: () => Promise<void>;
  refreshDesignations: () => Promise<void>;
  refreshValidityPeriods: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(
  undefined,
);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [influencerCategories, setInfluencerCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [validityPeriods, setValidityPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialFetched, setInitialFetched] = useState(false);

  const refreshStates = useCallback(async () => {
    try {
      const res = await getState();
      setStates(res.data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  }, []);

  const refreshDistricts = useCallback(async () => {
    try {
      const res = await getDistrict();
      setDistricts(res.data || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  }, []);

  const refreshCities = useCallback(async () => {
    try {
      const res = await getCity();
      setCities(res.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  }, []);

  const refreshInfluencerCategories = useCallback(async () => {
    try {
      const res = await getInfluencerCategory();
      setInfluencerCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching influencer categories:", error);
    }
  }, []);

  const refreshUnits = useCallback(async () => {
    try {
      const res = await getUnit();
      setUnits(res.data || []);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  }, []);

  const refreshDesignations = useCallback(async () => {
    try {
      const res = await getDesignation();
      setDesignations(res.data || []);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  }, []);

  const refreshValidityPeriods = useCallback(async () => {
    try {
      const res = await getValidityPeriod();
      setValidityPeriods(res.data || []);
    } catch (error) {
      console.error("Error fetching validity periods:", error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, dRes, cRes, iRes, uRes, deRes, vRes] = await Promise.all([
        getState(),
        getDistrict(),
        getCity(),
        getInfluencerCategory(),
        getUnit(),
        getDesignation(),
        getValidityPeriod(),
      ]);
      setStates(sRes.data || []);
      setDistricts(dRes.data || []);
      setCities(cRes.data || []);
      setInfluencerCategories(iRes.data || []);
      setUnits(uRes.data || []);
      setDesignations(deRes.data || []);
      setValidityPeriods(vRes.data || []);
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setLoading(false);
      setInitialFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!initialFetched) {
      refreshAll();
    }
  }, [initialFetched, refreshAll]);

  return (
    <MasterDataContext.Provider
      value={{
        states,
        districts,
        cities,
        influencerCategories,
        units,
        designations,
        validityPeriods,
        loading,
        refreshStates,
        refreshDistricts,
        refreshCities,
        refreshInfluencerCategories,
        refreshUnits,
        refreshDesignations,
        refreshValidityPeriods,
        refreshAll,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (context === undefined) {
    throw new Error("useMasterData must be used within a MasterDataProvider");
  }
  return context;
};
