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
import { getDesignation, getDistrict, getState } from "@/services/masterData";
import { changeUserStatus, getUsers } from "@/services/user";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";
import { Loader2 } from "lucide-react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getFirestoreDB, getFirebaseStorage } from "@/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

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

  const [stateId, setStateId] = React.useState<string | null>(
    staff?.stateId || null,
  );
  const [districtId, setDistrictId] = React.useState<string | null>(
    staff?.districtId || null,
  );
  const [city, setCity] = React.useState<string>(staff?.city || "");
  const [designationId, setDesignationId] = React.useState<string | null>(
    staff?.staffCategoryId || null,
  );

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
      stateId: stateId,
      districtId: districtId,
      city: city,
      staffCategoryId: designationId,
      role: currentRoleValue,
      permissions: permissions,
      ...updates,
      updatedAt: serverTimestamp(),
    };

    try {
      setIsSubmitting(true);
      const db = getFirestoreDB();
      const staffRef = doc(db, "users", staff.id);
      await updateDoc(staffRef, payload);

      setOpen(false);
      toast({
        title: "Success",
        description: "Staff updated successfully!",
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.message || "Failed to update staff",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!authReady || !user) return;
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
  }, [authReady, user]);

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
                        disabled={isAsm}
                      />
                      <span className="text-sm">Order Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={staffManagement}
                        onChange={(e) => setStaffManagement(e.target.checked)}
                        disabled={isAsm}
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
                        disabled={isAsm}
                      />
                      <span className="text-sm">Master Data Management</span>
                    </div>
                  </div>
                </div>
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
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      State
                    </label>
                    <Combobox
                      options={states.map((s) => ({
                        label: s.stateName,
                        value: String(s.id),
                      }))}
                      value={stateId ?? ""}
                      onValueChange={(val) => {
                        setStateId(val);
                        setDistrictId(null);
                      }}
                      placeholder="Select State"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-2 text-gray-700">
                      District
                    </label>
                    <Combobox
                      options={filteredDistricts.map((d) => ({
                        label: d.districtName,
                        value: String(d.id),
                      }))}
                      value={districtId ?? ""}
                      onValueChange={(val) => setDistrictId(val)}
                      disabled={!stateId}
                      placeholder="Select District"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    ASM Name (Current User)
                  </label>
                  <Input
                    value={(userData as any)?.name || "N/A"}
                    disabled
                    className="w-full border-2 bg-gray-50"
                  />
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
