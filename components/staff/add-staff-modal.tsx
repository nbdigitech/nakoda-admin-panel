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
import { createUserByPhone, checkUserBeforeLogin } from "@/services/user";
import { getDesignation, getDistrict, getState } from "@/services/masterData";
import { Timestamp } from "firebase/firestore";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";
import { Loader2 } from "lucide-react";

export default function AddStaffModal({
  trigger,
  onSuccess,
}: {
  trigger: React.ReactElement<any>;
  onSuccess?: () => void;
}) {
  const [step, setStep] = React.useState(1);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const { user, userData, authReady } = useFirebaseAuth();

  React.useEffect(() => {
    if (userData) {
      setAsmId((userData as any).id || (userData as any).uid || "");
      setAsmName((userData as any).name || (userData as any).displayName || "");
    }
  }, [userData]);
  const { toast } = useToast();

  // dropdown data
  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [designations, setDesignations] = React.useState<any[]>([]);

  // selected values (ID stored)
  const [stateId, setStateId] = React.useState<string | null>(null);
  const [districtId, setDistrictId] = React.useState<string | null>(null);
  const [city, setCity] = React.useState<string>("");
  const [designationId, setDesignationId] = React.useState<string | null>(null);

  // No UID states needed

  // form fields
  const [staffName, setStaffName] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [dob, setDob] = React.useState<string>("");
  const [aadhaarBase64, setAadhaarBase64] = React.useState<string>("");
  const [aadhaarFileType, setAadhaarFileType] = React.useState<
    "image" | "pdf" | null
  >(null);
  const [imageBase64, setImageBase64] = React.useState<string>("");

  // permissions
  const [orderManagement, setOrderManagement] = React.useState<boolean>(false);
  const [staffManagement, setStaffManagement] = React.useState<boolean>(false);
  const [masterDataManagement, setMasterDataManagement] =
    React.useState<boolean>(false);
  const [isPhoneRegistered, setIsPhoneRegistered] =
    React.useState<boolean>(false);
  const [checkingPhone, setCheckingPhone] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [asmId, setAsmId] = React.useState<string>("");
  const [asmName, setAsmName] = React.useState<string>("");

  const currentRoleValue = React.useMemo(() => {
    const selectedDesignation = designations.find(
      (d) => String(d.id) === designationId,
    );
    return selectedDesignation
      ? (selectedDesignation.staffCategoryName || "").toLowerCase()
      : "";
  }, [designations, designationId]);

  const isAsm = currentRoleValue === "asm";

  const resetForm = () => {
    setStep(1);
    setStaffName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setDob("");
    setAadhaarBase64("");
    setAadhaarFileType(null);
    setImageBase64("");
    setStateId(null);
    setDistrictId(null);
    setCity("");
    setDesignationId(null);
    setOrderManagement(false);
    setStaffManagement(false);
    setMasterDataManagement(false);
    setIsPhoneRegistered(false);
  };

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
    if (!f) {
      setAadhaarBase64("");
      setAadhaarFileType(null);
      return;
    }

    if (f.type === "application/pdf") {
      if (f.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Max size is 5MB for PDF",
          variant: "destructive",
        });
        e.target.value = ""; // Clear the input
        setAadhaarBase64("");
        setAadhaarFileType(null);
        return;
      }
      setAadhaarFileType("pdf");
    } else {
      setAadhaarFileType("image");
    }

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

  const handlePhoneChange = async (val: string) => {
    setPhone(val);
    const cleanPhone = val.replace(/^\+91/, "").replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      try {
        setCheckingPhone(true);
        const payload = { phoneNumber: cleanPhone };
        const res: any = await checkUserBeforeLogin(payload);

        // Adjust structural check based on common patterns or what was likely intended
        if (
          res?.data?.data?.length > 0 ||
          res?.data?.length > 0 ||
          res?.length > 0
        ) {
          setIsPhoneRegistered(true);
        } else {
          setIsPhoneRegistered(false);
        }
      } catch (err) {
        console.error("Phone check error:", err);
        setIsPhoneRegistered(false);
      } finally {
        setCheckingPhone(false);
      }
    } else {
      setIsPhoneRegistered(false);
    }
  };

  const handleSubmit = async () => {
    if (isPhoneRegistered) {
      toast({
        title: "Error",
        description: "Cannot create user: phone number already registered.",
        variant: "destructive",
      });
      return;
    }
    const permissions: string[] = [];
    if (!isAsm) {
      if (orderManagement) permissions.push("order_management");
      if (staffManagement) permissions.push("staff_management");
      if (masterDataManagement) permissions.push("master_data_management");
    }

    const payload = {
      email: email || null,
      phoneNumber: phone ? phone.replace(/^\+91/, "").replace(/\D/g, "") : null,
      name: staffName,
      permissions: permissions,
      // allotment_area: districtId,
      dob: (() => {
        if (!dob) return null;
        const date = new Date(dob);
        return isNaN(date.getTime()) ? null : date.toISOString();
      })(),
      aadhaarBase64: aadhaarBase64 || "",
      imageBase64: imageBase64 || "",
      stateId: stateId,
      districtId: districtId ? String(districtId) : null,
      city: city,
      staffCategoryId: designationId,
      role: currentRoleValue,
      asmId: asmId,
      asmName: asmName,
    };

    console.log("CREATE USER PAYLOAD", payload);

    try {
      setIsSubmitting(true);
      const res = await createUserByPhone(payload);
      console.log("User created:", res);
      resetForm();
      setOpen(false);
      toast({
        title: "Success",
        description: "User created successfully!",
      });
      // Refresh table if callback provided
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!authReady || !user) return;

    let mounted = true;
    const loadData = async () => {
      try {
        const [stateRes, districtRes, designationRes] = await Promise.all([
          getState(),
          getDistrict(),
          getDesignation(),
        ]);

        if (!mounted) return;

        setStates(stateRes?.data ?? stateRes ?? []);
        setDistricts(districtRes?.data ?? districtRes ?? []);
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
                      Staff Name *
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
                      Phone No. *
                    </label>
                    <Input
                      placeholder="9405005285"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={10}
                      className={`w-full border-2 transition ${
                        isPhoneRegistered ||
                        (phone.length > 0 &&
                          phone.replace(/^\+91/, "").replace(/\D/g, "")
                            .length !== 10)
                          ? "!border-red-500"
                          : focusedField === "phone"
                            ? "!border-[#F87B1B]"
                            : null
                      }`}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {phone.length > 0 &&
                      phone.replace(/^\+91/, "").replace(/\D/g, "").length !==
                        10 && (
                        <p className="text-[10px] text-red-500 mt-1">
                          Phone number must be exactly 10 digits.
                        </p>
                      )}
                    {isPhoneRegistered && (
                      <p className="text-[10px] text-red-500 mt-1">
                        phone number already register use differ
                      </p>
                    )}
                    {checkingPhone && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Checking phone number...
                      </p>
                    )}
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
                      E-Mail (Optional)
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
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "allotmentArea"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
                      Allotment Area *
                    </label>
                    <Combobox
                      options={districts.map((d) => ({
                        label: d.districtName,
                        value: String(d.id),
                      }))}
                      value={districtId ?? ""}
                      onValueChange={(value) => setDistrictId(value)}
                      placeholder="Select District"
                      searchPlaceholder="Search district..."
                    />
                  </div> */}
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12"
                  disabled={
                    !staffName ||
                    !phone ||
                    phone.replace(/^\+91/, "").replace(/\D/g, "").length !==
                      10 ||
                    isPhoneRegistered ||
                    checkingPhone
                  }
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      className={`text-xs font-semibold block mb-2 transition ${
                        focusedField === "designation"
                          ? "text-[#F87B1B]"
                          : "text-gray-700"
                      }`}
                    >
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
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleAadhaarChange}
                      className={`w-full border-2 transition ${
                        focusedField === "aadhar"
                          ? "border-[#F87B1B]"
                          : "border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("aadhar")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Supported: .PNG, .JPG, .JPEG, .PDF (Max 5MB)
                    </p>
                    {aadhaarBase64 && (
                      <p className="text-[10px] text-green-600 mt-1 font-semibold">
                        ✓ {aadhaarFileType?.toUpperCase()} Uploaded
                      </p>
                    )}
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
                      accept=".png,.jpg,.jpeg"
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
                    <p className="text-[10px] text-gray-400 mt-1">
                      Supported: .PNG, .JPG, .JPEG
                    </p>
                    {imageBase64 && (
                      <p className="text-[10px] text-green-600 mt-1 font-semibold">
                        ✓ Selfie Uploaded
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <label className="text-sm font-semibold text-gray-700 block mb-4">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="orderManagement"
                        checked={orderManagement}
                        onChange={(e) => setOrderManagement(e.target.checked)}
                        disabled={isAsm}
                        className={`w-4 h-4 rounded border-gray-300 text-[#F87B1B] ${isAsm ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      />
                      <label
                        htmlFor="orderManagement"
                        className={`ml-2 text-sm text-gray-700 ${isAsm ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                        disabled={isAsm}
                        className={`w-4 h-4 rounded border-gray-300 text-[#F87B1B] ${isAsm ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      />
                      <label
                        htmlFor="staffManagement"
                        className={`ml-2 text-sm text-gray-700 ${isAsm ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                        disabled={isAsm}
                        className={`w-4 h-4 rounded border-gray-300 text-[#F87B1B] ${isAsm ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      />
                      <label
                        htmlFor="masterDataManagement"
                        className={`ml-2 text-sm text-gray-700 ${isAsm ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        Master Data Management
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between ">
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 px-8"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12"
                  disabled={!designationId}
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
                    <Combobox
                      options={states.map((s) => ({
                        label: s.stateName,
                        value: String(s.id),
                      }))}
                      value={stateId ?? ""}
                      onValueChange={(value) => {
                        setStateId(value);
                        setDistrictId(null);
                        setCity("");
                      }}
                      placeholder="Select State"
                      searchPlaceholder="Search state..."
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
                      District
                    </label>
                    <Combobox
                      options={filteredDistricts.map((d) => ({
                        label: d.districtName,
                        value: String(d.id),
                      }))}
                      value={districtId ?? ""}
                      onValueChange={(value) => {
                        setDistrictId(value);
                        setCity("");
                      }}
                      disabled={!stateId}
                      placeholder="Select District"
                      searchPlaceholder="Search district..."
                    />
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
                    <Input
                      placeholder="Enter city name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full border-2 transition ${
                        focusedField === "city"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("city")}
                      onBlur={() => setFocusedField(null)}
                      disabled={!districtId}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    ASM Name (Current User)
                  </label>
                  <Input
                    value={asmName || "N/A"}
                    disabled
                    className="w-full border-2 bg-gray-50"
                  />
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
                  className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12 flex items-center justify-center"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
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
