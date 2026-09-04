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
import { getDesignation, getDistrict, getState, getCity } from "@/services/masterData";
import { changeUserStatus, getUsers } from "@/services/user";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";
import { Loader2 } from "lucide-react";
import { doc, updateDoc, serverTimestamp, deleteField } from "firebase/firestore";
import { getFirestoreDB, getFirebaseStorage } from "@/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { addNotification } from "@/services/notifications";
import { toast as toastifyToast } from "react-toastify";

export default function EditStaffModal({
  trigger,
  onSuccess,
  staff,
}: {
  trigger: React.ReactElement<any>;
  onSuccess?: () => void;
  staff: any;
}) {
  const [step, setStep] = React.useState(1);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const { user, userData, authReady } = useFirebaseAuth();
  const { toast } = useToast();

  // dropdown data
  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);
  const [designations, setDesignations] = React.useState<any[]>([]);

  // form fields
  const [staffName, setStaffName] = React.useState<string>(staff?.name || "");
  const [phone, setPhone] = React.useState<string>(staff?.phoneNumber || "");
  const [email, setEmail] = React.useState<string>(staff?.email || "");
  const [dob, setDob] = React.useState<string>(() => {
    if (!staff?.dob) return "";
    try {
      // Handle Firebase Timestamp or string
      const date = staff.dob?.toDate ? staff.dob.toDate() : new Date(staff.dob);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch (e) {
      console.error("Error parsing DOB:", e);
      return "";
    }
  });
  const [imageBase64, setImageBase64] = React.useState<string>(
    staff?.imagePath || "",
  );
  const [aadhaarBase64, setAadhaarBase64] = React.useState<string>(
    staff?.aadhaarPath || "",
  );

  const [state, setState] = React.useState<string>(
    staff?.state || staff?.stateId || "",
  );
  const [district, setDistrict] = React.useState<string>(
    staff?.district || staff?.districtId || "",
  );
  const [city, setCity] = React.useState<string>(
    staff?.city || staff?.cityName || staff?.cityId || "",
  );
  const [locality, setLocality] = React.useState<string>(
    staff?.locality || "",
  );
  const [pincode, setPincode] = React.useState<string>(staff?.pincode || "");
  const [loadingPincode, setLoadingPincode] = React.useState<boolean>(false);
  const [designationId, setDesignationId] = React.useState<string | null>(
    staff?.staffCategoryId || null,
  );

  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/\D/g, "").slice(0, 6);
    setPincode(cleanPin);

    if (cleanPin.length < 6) {
      setState("");
      setDistrict("");
      setCity("");
      setCities([]);
      return;
    }

    if (cleanPin.length === 6) {
      setLoadingPincode(true);
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${cleanPin}`,
        );
        const data = await res.json();
        if (
          data &&
          data[0] &&
          data[0].Status === "Success" &&
          data[0].PostOffice?.length > 0
        ) {
          const postOffices = data[0].PostOffice;
          const apiStateName = postOffices[0].State;
          const apiDistrictName = postOffices[0].District;

          setState(apiStateName);
          setDistrict(apiDistrictName);

          const cityNames = Array.from(
            new Set(postOffices.map((po: any) => po.Name).filter(Boolean)),
          ) as string[];

          setCities(cityNames);
          if (cityNames.length > 0) {
            setCity(cityNames[0]);
          } else {
            setCity("");
          }

          toastifyToast.success(
            `Location found: ${apiDistrictName}, ${apiStateName}`,
          );
        } else {
          toastifyToast.error("Location details not found for this PIN code");
          setState("");
          setDistrict("");
          setCity("");
          setCities([]);
        }
      } catch (err) {
        console.error("Error fetching pincode info:", err);
        toastifyToast.error("Failed to fetch location by PIN code");
        setState("");
        setDistrict("");
        setCity("");
        setCities([]);
      } finally {
        setLoadingPincode(false);
      }
    }
  };

  // permissions
  const [orderManagement, setOrderManagement] = React.useState<boolean>(
    staff?.permissions?.includes("order_management") || false,
  );
  const [staffManagement, setStaffManagement] = React.useState<boolean>(
    staff?.permissions?.includes("staff_management") || false,
  );
  const [masterDataManagement, setMasterDataManagement] =
    React.useState<boolean>(
      staff?.permissions?.includes("master_data_management") || false,
    );

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const currentRoleValue = React.useMemo(() => {
    const selectedDesignation = designations.find(
      (d) => String(d.id) === designationId,
    );
    return selectedDesignation
      ? (selectedDesignation.staffCategoryName || "").toLowerCase()
      : staff?.role || "";
  }, [designations, designationId, staff]);

  const isAsm = currentRoleValue === "asm";

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result?.toString() ?? ""));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const b = await fileToBase64(f);
      setImageBase64(b); // Store full data URL
    } catch (err) {
      console.error(err);
    }
  };

  const handleAadhaarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const b = await fileToBase64(f);
      setAadhaarBase64(b); // Store full data URL
    } catch (err) {
      console.error(err);
    }
  };

  const uploadFileToStorage = async (dataUrl: string, path: string) => {
    if (!dataUrl) return null;
    if (dataUrl.startsWith("http")) return dataUrl; // Already a URL
    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, path);
      await uploadString(storageRef, dataUrl, "data_url");
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading to storage:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!pincode?.trim() || !state?.trim() || !district?.trim() || !city?.trim()) {
      toastifyToast.error("Please fill all required address fields (Pincode, State, District, City)");
      return;
    }

    const permissions: string[] = [];
    if (!isAsm) {
      if (orderManagement) permissions.push("order_management");
      if (staffManagement) permissions.push("staff_management");
      if (masterDataManagement) permissions.push("master_data_management");
    }

    const updates: any = {};
    if (imageBase64 && imageBase64.startsWith("data:")) {
      updates.imagePath = await uploadFileToStorage(
        imageBase64,
        `staff/${phone}/profile-${Date.now()}`,
      );
    }
    if (aadhaarBase64 && aadhaarBase64.startsWith("data:")) {
      updates.aadhaarPath = await uploadFileToStorage(
        aadhaarBase64,
        `staff/${phone}/aadhaar-${Date.now()}`,
      );
    }

    const payload = {
      name: staffName,
      email: email || null,
      dob: (() => {
        if (!dob) return null;
        const date = new Date(dob);
        return isNaN(date.getTime()) ? null : date.toISOString();
      })(),
      state: state,
      district: district,
      city: city,
      locality: locality || null,
      pincode: pincode,
      staffCategoryId: designationId,
      role: currentRoleValue,
      permissions: permissions,
      asmId:
        (userData as any)?.id || (userData as any)?.uid || staff?.asmId || "",
      asmName:
        (userData as any)?.name ||
        (userData as any)?.displayName ||
        staff?.asmName ||
        "",
      stateId: deleteField(),
      districtId: deleteField(),
      cityId: deleteField(),
      ...updates,
      updatedAt: serverTimestamp(),
    };

    try {
      setIsSubmitting(true);
      const db = getFirestoreDB();
      const staffRef = doc(db, "users", staff.id);
      await updateDoc(staffRef, payload);

      await addNotification(
        "Staff Member Updated",
        `Staff ${staffName} details were successfully updated.`,
        "staff",
      );

      setOpen(false);
      toastifyToast.success("Staff updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toastifyToast.error(err?.message || "Failed to update staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!open || !authReady || !user) return;
    const loadData = async () => {
      try {
        const [stateRes, districtRes, designationRes] = await Promise.all([
          getState(),
          getDistrict(),
          getDesignation(),
        ]);
        setStates(stateRes?.data ?? stateRes ?? []);
        setDistricts(districtRes?.data ?? districtRes ?? []);
        setDesignations(designationRes?.data ?? designationRes ?? []);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    };
    loadData();
  }, [open, authReady, user]);

  React.useEffect(() => {
    if (!district) {
      setCities([]);
      return;
    }
    const matchedDistObj = districts.find(
      (d) =>
        (d.districtName || d.name) === district ||
        String(d.id) === String(district),
    );
    const distObjId = matchedDistObj?.id || matchedDistObj?._id || district;

    const fetchCities = async () => {
      try {
        const res: any = await getCity({ districtId: distObjId });
        const data = res?.data?.data || res?.data || res || [];
        setCities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    };
    fetchCities();
  }, [district, districts]);

  const selectedStateObj = states.find(
    (s) =>
      (s.stateName || s.name) === state ||
      String(s.id) === String(state) ||
      String(s.stateId) === String(state) ||
      String(s._id) === String(state),
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
              Edit Staff Member
            </DialogTitle>
          </DialogHeader>

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

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      Staff Name *
                    </label>
                    <Input
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full border-2 border-gray-300 focus:border-[#F87B1B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      Phone No. (Read Only)
                    </label>
                    <Input
                      value={phone}
                      disabled
                      className="w-full border-2 bg-gray-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      E-Mail (Optional)
                    </label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-2 border-gray-300 focus:border-[#F87B1B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      DOB
                    </label>
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full border-2 border-gray-300 focus:border-[#F87B1B]"
                    />
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

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">
                Organization Detail
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      Designation *
                    </label>
                    <Combobox
                      options={designations.map((d) => ({
                        label: d.staffCategoryName,
                        value: String(d.id),
                      }))}
                      value={designationId ?? ""}
                      onValueChange={(value) => setDesignationId(value)}
                      placeholder="Select Designation"
                      searchPlaceholder="Search designation..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      Update Aadhar Icon (Image)
                    </label>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleAadhaarChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      Update Profile Selfie
                    </label>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                {!isAsm && (
                  <div className="border-t pt-6">
                    <label className="text-sm font-semibold text-gray-700 block mb-4">
                      Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={orderManagement}
                          onChange={(e) => setOrderManagement(e.target.checked)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Order Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={staffManagement}
                          onChange={(e) => setStaffManagement(e.target.checked)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Staff Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={masterDataManagement}
                          onChange={(e) =>
                            setMasterDataManagement(e.target.checked)
                          }
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Master Data Management</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
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

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700">Address</h3>
              <div className="space-y-4">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "pincode"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="Enter 6-digit PIN code (e.g. 493118)"
                      maxLength={6}
                      className={`w-full border-2 transition ${
                        focusedField === "pincode"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("pincode")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {loadingPincode && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-[#F87B1B]" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "state"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State (auto-filled by PIN code)"
                      className={`w-full border-2 transition ${
                        focusedField === "state"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("state")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "district"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      District <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District (auto-filled by PIN code)"
                      className={`w-full border-2 transition ${
                        focusedField === "district"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("district")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "city"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      City / Area <span className="text-red-500">*</span>
                    </label>
                    {cities.length > 0 ? (
                      <Combobox
                        options={cities.map((c: any) => ({
                          label: typeof c === "string" ? c : c.cityName || c.name,
                          value: typeof c === "string" ? c : c.cityName || c.name,
                        }))}
                        value={city}
                        onValueChange={(val) => setCity(val)}
                        placeholder="Select City / Area"
                        searchPlaceholder="Search city..."
                      />
                    ) : (
                      <Input
                        placeholder="Enter city / area"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`w-full border-2 transition ${
                          focusedField === "city"
                            ? "!border-[#F87B1B]"
                            : "!border-gray-300"
                        }`}
                        onFocus={() => setFocusedField("city")}
                        onBlur={() => setFocusedField(null)}
                      />
                    )}
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "locality"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Locality / Specific Area <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <Input
                      placeholder="Enter street / landmark / locality"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "locality"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("locality")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
