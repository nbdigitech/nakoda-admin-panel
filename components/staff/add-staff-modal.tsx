"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserByPhone } from "@/services/user";
import {
  getCity,
  getDesignation,
  getDistrict,
  getState,
} from "@/services/masterData";
import { Timestamp } from "firebase/firestore";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";

export default function AddStaffModal({
  trigger,
}: {
  trigger: React.ReactElement<any>;
}) {
  const [step, setStep] = React.useState(1);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const { user, authReady } = useFirebaseAuth();
  const { toast } = useToast();

  // dropdown data
  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);
  const [designations, setDesignations] = React.useState<any[]>([]);

  // selected values (ID stored)
  const [stateId, setStateId] = React.useState<string | null>(null);
  const [districtId, setDistrictId] = React.useState<string | null>(null);
  const [cityId, setCityId] = React.useState<string | null>(null);
  const [designationId, setDesignationId] = React.useState<string | null>(null);

  // No UID states needed

  // form fields
  const [staffName, setStaffName] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [dob, setDob] = React.useState<string>("");
  const [aadhaarBase64, setAadhaarBase64] = React.useState<string>("");
  const [imageBase64, setImageBase64] = React.useState<string>("");
  const [locationValue, setLocationValue] = React.useState<string>("");

  // permissions
  const [orderManagement, setOrderManagement] = React.useState<boolean>(false);
  const [staffManagement, setStaffManagement] = React.useState<boolean>(false);
  const [masterDataManagement, setMasterDataManagement] =
    React.useState<boolean>(false);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result?.toString() ?? ""));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleAadhaarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const f = e.target.files?.[0];
    if (!f) return setAadhaarBase64("");
    try {
      const b = await fileToBase64(f);
      setAadhaarBase64(b.split(",")[1] ?? b);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return setImageBase64("");
    try {
      const b = await fileToBase64(f);
      setImageBase64(b.split(",")[1] ?? b);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    const permissions: string[] = [];
    if (orderManagement) permissions.push("order_management");
    if (staffManagement) permissions.push("staff_management");
    if (masterDataManagement) permissions.push("master_data_management");

    const selectedDesignation = designations.find(
      (d) => String(d.id) === designationId,
    );
    const roleValue = selectedDesignation
      ? (selectedDesignation.staffCategoryName || "").toLowerCase()
      : "";

    const payload = {
      email: email || null,
      phoneNumber: phone ? phone.replace(/^\+91/, "").replace(/\D/g, "") : null,
      name: staffName,
      permissions: permissions,
      allotment_area: districtId,
      dob: dob ? new Date(dob).toISOString() : null,
      aadhaarBase64: aadhaarBase64 || "",
      imageBase64: imageBase64 || "",
      stateId: stateId,
      districtId: districtId ? String(districtId) : null,
      cityId: cityId ? String(cityId) : null,
      staffCategoryId: designationId,
      role: roleValue,
      address: locationValue,
    };

    console.log("CREATE USER PAYLOAD", payload);

    try {
      const res = await createUserByPhone(payload);
      console.log("User created:", res);
      setOpen(false);
      toast({
        title: "Success",
        description: "User created successfully!",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (!authReady || !user) return;

    let mounted = true;
    const loadData = async () => {
      try {
        const [stateRes, districtRes, cityRes, designationRes] =
          await Promise.all([
            getState(),
            getDistrict(),
            getCity(),
            getDesignation(),
          ]);

        if (!mounted) return;

        setStates(stateRes?.data ?? stateRes ?? []);
        setDistricts(districtRes?.data ?? districtRes ?? []);
        setCities(cityRes?.data ?? cityRes ?? []);
        setDesignations(designationRes?.data ?? designationRes ?? []);
        console.log(designationRes);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [authReady, user]);

  const filteredCities = cities.filter(
    (c) => String(c.districtId) === String(districtId),
  );

  const filteredDistricts = districts.filter(
    (d) => String(d.stateId) === String(stateId),
  );

  return (
    <>
      {React.cloneElement(trigger as React.ReactElement<any>, {
        onClick: () => setOpen(true),
      })}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add Staff Member
            </DialogTitle>
          </DialogHeader>

          {/* ===== 
         Indicator ===== */}
          <div className="flex items-center justify-between mt-4 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${step >= s ? "bg-[#F87B1B] text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {s}
                </div>
                {s !== 3 && (
                  <div
                    className={`flex-1 h-[2px] mx-2
                  ${step > s ? "bg-[#F87B1B]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Personal Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "staffName"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Staff Name
                    </label>
                    <Input
                      placeholder="Kunal"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "staffName"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("staffName")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "phone"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Phone No.
                    </label>
                    <Input
                      placeholder="9405005285"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "phone" ? "!border-[#F87B1B]" : null
                      }`}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "email"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      E-Mail
                    </label>
                    <Input
                      placeholder="Kunal@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "email"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "password"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Password
                    </label>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "password"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "dob"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      DOB
                    </label>
                    <Input
                      placeholder="DD/MM/YYYY"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "dob"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("dob")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "allotmentArea"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Allotment Area
                    </label>
                    <Select
                      value={districtId ?? ""}
                      onValueChange={(value) => {
                        setDistrictId(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem
                            key={d.id} // ✅ UNIQUE
                            value={String(d.id)}
                          >
                            {d.districtName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12"
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Organization Detail
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "designation"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Designation
                    </label>
                    <Select
                      value={designationId ?? ""}
                      onValueChange={(value) => {
                        setDesignationId(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.staffCategoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "aadhar"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Upload Aadhar
                    </label>
                    <Input
                      type="file"
                      onChange={handleAadhaarChange}
                      className={`w-full border-2 transition ${
                        focusedField === "aadhar"
                          ? "border-[#F87B1B]"
                          : "border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("aadhar")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "selfie"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Upload Your Selfie
                    </label>
                    <Input
                      type="file"
                      placeholder="Choose file"
                      onChange={handleImageChange}
                      className={`w-full border-2 transition ${
                        focusedField === "selfie"
                          ? "border-[#F87B1B]"
                          : "border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("selfie")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <label className="text-sm font-semibold text-gray-700 block mb-4">
                    Permissions
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="orderManagement"
                        checked={orderManagement}
                        onChange={(e) => setOrderManagement(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#F87B1B] cursor-pointer"
                      />
                      <label
                        htmlFor="orderManagement"
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        Order Management
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="staffManagement"
                        checked={staffManagement}
                        onChange={(e) => setStaffManagement(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#F87B1B] cursor-pointer"
                      />
                      <label
                        htmlFor="staffManagement"
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        Staff Management
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="masterDataManagement"
                        checked={masterDataManagement}
                        onChange={(e) =>
                          setMasterDataManagement(e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#F87B1B] cursor-pointer"
                      />
                      <label
                        htmlFor="masterDataManagement"
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        Master Data Management
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 px-8"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12"
                  onClick={() => setStep(3)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">Address</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "state"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      State
                    </label>
                    <Select
                      value={stateId ?? ""}
                      onValueChange={(value) => {
                        setStateId(value);
                        // reset children
                        setDistrictId(null);
                        setCityId(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.stateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "district"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      District
                    </label>
                    <Select
                      value={districtId ?? ""}
                      disabled={!stateId}
                      onValueChange={(value) => {
                        setDistrictId(value);
                        setCityId(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDistricts.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.districtName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "city"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      City
                    </label>
                    <Select
                      value={cityId ?? ""}
                      disabled={!districtId}
                      onValueChange={(value) => {
                        setCityId(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCities.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.cityName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "location"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Location
                    </label>
                    <Input
                      placeholder="Pandit Roosal"
                      value={locationValue}
                      onChange={(e) => setLocationValue(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "location"
                          ? "border-[#F87B1B]"
                          : "border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("location")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 px-8"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
