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
import {
  checkUserBeforeLogin,
  getState,
  getDistrict,
  getCity,
} from "@/services/masterData";
import { createDealer } from "@/services/dealer";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { getUsers } from "@/services/user";
import { addNotification } from "@/services/notifications";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { toast as toastifyToast } from "react-toastify";

interface FormState {
  // Step 1 - Personal Info
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  dob: string;

  // Step 2 - Organization
  organizationName: string;
  logoBase64: string;
  gstBase64: string;
  pancardBase64: string;
  aadhaarBase64: string;

  // Step 3 - Address
  stateId: string;
  districtId: string;
  city: string;
  pincode: string;
  asmId: string;
  asmName: string;
}

export default function AddDealerModal({
  trigger,
  onSuccess,
}: {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingPincode, setLoadingPincode] = React.useState(false);
  const [isPhoneRegistered, setIsPhoneRegistered] = React.useState(false);
  const [checkingPhone, setCheckingPhone] = React.useState(false);
  const [aadhaarFileType, setAadhaarFileType] = React.useState<
    "image" | "pdf" | null
  >(null);
  const { toast } = useToast();

  const [formData, setFormData] = React.useState<FormState>({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    dob: "",
    organizationName: "",
    logoBase64: "",
    gstBase64: "",
    pancardBase64: "",
    aadhaarBase64: "",
    stateId: "",
    districtId: "",
    city: "",
    pincode: "",
    asmId: "",
    asmName: "",
  });

  // Location lists
  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);
  const [asms, setAsms] = React.useState<any[]>([]);

  // Firebase auth
  const { user, userData, authReady } = useFirebaseAuth();

  // Load ASMs when modal opens
  React.useEffect(() => {
    if (!open) return;

    const fetchAsms = async () => {
      try {
        const res: any = await getUsers();
        const data = res?.data?.data || res?.data || res || [];
        setAsms(
          Array.isArray(data) ? data.filter((u: any) => u.role === "asm") : [],
        );
      } catch (err) {
        console.error("Failed to load ASMs:", err);
      }
    };
    fetchAsms();
  }, [open]);

  // Set ASM id/name from logged-in user when available (if not already set)
  React.useEffect(() => {
    if (authReady && user && typeof user === "object" && !formData.asmId) {
      const asmName =
        (userData as any)?.name ||
        (userData as any)?.organizationName ||
        (user as any).displayName ||
        (user as any).name ||
        (user as any).email ||
        (user as any).phoneNumber ||
        "";
      const asmId =
        (user as any).id || (user as any).uid || (user as any)._id || "";
      setFormData((prev) => ({ ...prev, asmId, asmName }));
    }
  }, [authReady, user, userData]);

  // Handle text input changes
  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle phone number input with real-time validation
  const handlePhoneChange = async (val: string) => {
    handleInputChange("phoneNumber", val);

    // Clean phone number: remove +91 prefix and non-digits
    const cleanPhone = val.replace(/^\+91/, "").replace(/\D/g, "");

    if (cleanPhone.length === 10) {
      try {
        setCheckingPhone(true);
        setIsPhoneRegistered(false);
        const payload = { phoneNumber: cleanPhone };
        const res: any = await checkUserBeforeLogin(payload);

        console.log("Phone validation response:", res);

        // Check if user already exists (adjust based on actual response structure)
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

  // Convert file to base64
  const handleFileChange = (field: keyof FormState, file: File | undefined) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastifyToast.error(
        "File size exceeds 5MB limit. Please upload a smaller file.",
        {
          position: "bottom-right",
        },
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, [field]: base64String }));
      console.log(`${field} converted to base64`);
    };
    reader.readAsDataURL(file);
  };

  const handleAadhaarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const f = e.target.files?.[0];
    if (!f) {
      handleInputChange("aadhaarBase64", "");
      setAadhaarFileType(null);
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      toastifyToast.error(
        "File size exceeds 5MB limit for Aadhaar. Please upload a smaller file.",
        {
          position: "bottom-right",
        },
      );
      e.target.value = ""; // Clear the input
      handleInputChange("aadhaarBase64", "");
      setAadhaarFileType(null);
      return;
    }

    if (f.type === "application/pdf") {
      toastifyToast.error(
        "PDF files are not allowed for Aadhaar. Please upload an image.",
        {
          position: "bottom-right",
        },
      );
      e.target.value = ""; // Clear the input
      handleInputChange("aadhaarBase64", "");
      setAadhaarFileType(null);
      return;
    }

    setAadhaarFileType("image");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleInputChange("aadhaarBase64", base64String);
    };
    reader.readAsDataURL(f);
  };

  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/\D/g, "").slice(0, 6);
    handleInputChange("pincode", cleanPin);

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

          handleInputChange("stateId", apiStateName);
          handleInputChange("districtId", apiDistrictName);

          const cityNames = Array.from(
            new Set(postOffices.map((po: any) => po.Name).filter(Boolean)),
          ) as string[];

          setCities(cityNames);
          if (cityNames.length > 0) {
            handleInputChange("city", cityNames[0]);
          }

          toastifyToast.success(
            `Location found: ${apiDistrictName}, ${apiStateName}`,
          );
        } else {
          toastifyToast.error("Location details not found for this PIN code");
        }
      } catch (err) {
        console.error("Error fetching pincode info:", err);
        toastifyToast.error("Failed to fetch location by PIN code");
      } finally {
        setLoadingPincode(false);
      }
    }
  };

  // Validate form data
  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      const cleanPhone = formData.phoneNumber
        .replace(/^\+91/, "")
        .replace(/\D/g, "");
      return !!(
        formData.name &&
        cleanPhone.length === 10 &&
        !isPhoneRegistered &&
        !checkingPhone
      );
    }
    if (stepNum === 2) {
      return true;
    }
    if (stepNum === 3) {
      return true;
    }
    return false;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting dealer data:", formData);

      const payload = {
        email: formData.email || null,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        dob: formData.dob,
        organizationName: formData.organizationName,
        aadhaarBase64: formData.aadhaarBase64,
        logoBase64: formData.logoBase64,
        gstBase64: formData.gstBase64,
        pancardBase64: formData.pancardBase64,
        stateId: formData.stateId,
        stateName: formData.stateId,
        districtId: formData.districtId,
        districtName: formData.districtId,
        city: formData.city,
        pincode: formData.pincode,
        asmId: formData.asmId,
        asmName: formData.asmName,
      };

      const response = await createDealer(payload);
      console.log("Dealer created successfully:", response);

      await addNotification(
        "New Dealer Created",
        `Dealer ${formData.name} was just registered successfully.`,
        "dealer",
      );

      toast({
        title: "Success",
        description: "Dealer created successfully!",
      });

      // Reset form
      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        password: "",
        dob: "",
        organizationName: "",
        logoBase64: "",
        gstBase64: "",
        pancardBase64: "",
        aadhaarBase64: "",
        stateId: "",
        districtId: "",
        city: "",
        pincode: "",
        asmId: formData.asmId,
        asmName: formData.asmName,
      });
      setStep(1);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating dealer:", error);
      toast({
        title: "Error",
        description: "Failed to create dealer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-3xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add Dealer
          </DialogTitle>
        </DialogHeader>

        {/* ===== Step Indicator ===== */}
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
                      focusedField === "name"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Dealer Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter dealer name"
                    className={`w-full border-2 transition ${
                      focusedField === "name"
                        ? "!border-[#F87B1B]"
                        : "!border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "phoneNumber"
                        ? "text-[#F87B1B]"
                        : isPhoneRegistered
                          ? "text-red-600"
                          : "text-gray-700"
                    }`}
                  >
                    Phone No. *
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="9405005285"
                    maxLength={10}
                    className={`w-full border-2 transition ${
                      isPhoneRegistered ||
                      (formData.phoneNumber.length > 0 &&
                        formData.phoneNumber
                          .replace(/^\+91/, "")
                          .replace(/\D/g, "").length !== 10)
                        ? "!border-red-500"
                        : focusedField === "phoneNumber"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("phoneNumber")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.phoneNumber.length > 0 &&
                    formData.phoneNumber.replace(/^\+91/, "").replace(/\D/g, "")
                      .length !== 10 && (
                      <p className="text-[10px] text-red-500 mt-1">
                        Phone number must be exactly 10 digits.
                      </p>
                    )}
                  {checkingPhone && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Checking phone number...
                    </p>
                  )}
                  {isPhoneRegistered && !checkingPhone && (
                    <p className="text-[10px] text-red-500 mt-1">
                      ⚠ Phone number already registered. Please use a different
                      phone number.
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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="dealer@gmail.com"
                    type="email"
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
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    placeholder="DD/MM/YYYY"
                    type="date"
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
            </div>

            <div className="flex justify-center pt-6">
              <Button
                className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12"
                onClick={() => validateStep(1) && setStep(2)}
                disabled={!validateStep(1)}
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
                      focusedField === "organizationName"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Organization Name
                  </label>
                  <Input
                    value={formData.organizationName}
                    onChange={(e) =>
                      handleInputChange("organizationName", e.target.value)
                    }
                    placeholder="Rahul Traders"
                    className={`w-full border-2 transition ${
                      focusedField === "organizationName"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("organizationName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "logoBase64"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Upload Logo
                  </label>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) {
                        handleFileChange("logoBase64", undefined);
                        return;
                      }
                      if (f.type === "application/pdf") {
                        toastifyToast.error(
                          "PDF files are not allowed for Logo. Please upload an image.",
                          {
                            position: "bottom-right",
                          },
                        );
                        e.target.value = "";
                        handleFileChange("logoBase64", undefined);
                        return;
                      }
                      handleFileChange("logoBase64", f);
                    }}
                    className={`w-full border-2 transition ${
                      focusedField === "logoBase64"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("logoBase64")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.logoBase64 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Logo uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "gstBase64"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Upload GST
                  </label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) {
                        handleFileChange("gstBase64", undefined);
                        return;
                      }
                      if (f.type !== "application/pdf") {
                        toastifyToast.error(
                          "Only PDF files are allowed for GST",
                          {
                            position: "bottom-right",
                          },
                        );
                        e.target.value = "";
                        handleFileChange("gstBase64", undefined);
                        return;
                      }
                      if (f.size > 5 * 1024 * 1024) {
                        toastifyToast.error(
                          "GST file size exceeds 5MB limit. Please upload a smaller file.",
                          {
                            position: "bottom-right",
                          },
                        );
                        e.target.value = "";
                        handleFileChange("gstBase64", undefined);
                        return;
                      }
                      handleFileChange("gstBase64", f);
                    }}
                    placeholder="Choose file"
                    className={`w-full border-2 transition ${
                      focusedField === "gstBase64"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("gstBase64")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.gstBase64 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ GST uploaded
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "pancardBase64"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Upload Pan Card
                  </label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) {
                        handleFileChange("pancardBase64", undefined);
                        return;
                      }
                      if (f.type === "application/pdf") {
                        toastifyToast.error(
                          "PDF files are not allowed for PAN Card. Please upload an image.",
                          {
                            position: "bottom-right",
                          },
                        );
                        e.target.value = "";
                        handleFileChange("pancardBase64", undefined);
                        return;
                      }
                      handleFileChange("pancardBase64", f);
                    }}
                    placeholder="Choose file"
                    className={`w-full border-2 transition ${
                      focusedField === "pancardBase64"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("pancardBase64")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.pancardBase64 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ PAN Card uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "aadhaarBase64"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Upload Aadhar
                  </label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleAadhaarChange}
                    placeholder="Choose file"
                    className={`w-full border-2 transition ${
                      focusedField === "aadhaarBase64"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("aadhaarBase64")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Supported: PNG, JPG (Max 5MB)
                  </p>
                  {formData.aadhaarBase64 && (
                    <p className="text-[10px] text-green-600 mt-1 font-semibold">
                      ✓ {aadhaarFileType?.toUpperCase() || "AADHAAR"} Uploaded
                    </p>
                  )}
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
                onClick={() => validateStep(2) && setStep(3)}
                disabled={!validateStep(2)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-700">
              Address Details
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  className={`text-xs font-semibold block mb-2 transition ${
                    focusedField === "pincode"
                      ? "text-[#F87B1B]"
                      : "text-gray-700"
                  }`}
                >
                  PIN Code
                </label>
                <div className="relative">
                  <Input
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter 6-digit PIN code (e.g. 493118)"
                    maxLength={6}
                    className={`w-full border-2 transition ${
                      focusedField === "pincode"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
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
                      focusedField === "stateId"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    State
                  </label>
                  <Input
                    value={formData.stateId}
                    onChange={(e) =>
                      handleInputChange("stateId", e.target.value)
                    }
                    placeholder="State (auto-filled by PIN code)"
                    className={`w-full border-2 transition ${
                      focusedField === "stateId"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("stateId")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "districtId"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    District
                  </label>
                  <Input
                    value={formData.districtId}
                    onChange={(e) =>
                      handleInputChange("districtId", e.target.value)
                    }
                    placeholder="District (auto-filled by PIN code)"
                    className={`w-full border-2 transition ${
                      focusedField === "districtId"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("districtId")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    City / Area
                  </label>
                  {cities.length > 0 ? (
                    <Combobox
                      options={cities.map((c: any) => ({
                        label: typeof c === "string" ? c : c.cityName || c.name,
                        value: typeof c === "string" ? c : c.cityName || c.name,
                      }))}
                      value={formData.city}
                      onValueChange={(val) => handleInputChange("city", val)}
                      placeholder="Select City / Area"
                      searchPlaceholder="Search city..."
                    />
                  ) : (
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="Enter city / area"
                      className={`w-full border-2 transition ${
                        focusedField === "city"
                          ? "border-[#F87B1B]"
                          : "border-gray-300"
                      }`}
                      onFocus={() => setFocusedField("city")}
                      onBlur={() => setFocusedField(null)}
                    />
                  )}
                </div>
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "asmId"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    ASM Name
                  </label>
                  <Combobox
                    options={asms.map((a) => ({
                      label: a.name || a.displayName || a.email || "N/A",
                      value: String(a.id || a.uid || a._id),
                    }))}
                    value={formData.asmId}
                    onValueChange={(val) => {
                      const selected = asms.find(
                        (a) => String(a.id || a.uid || a._id) === val,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        asmId: val,
                        asmName: selected?.name || selected?.displayName || "",
                      }));
                    }}
                    placeholder="Select ASM"
                    searchPlaceholder="Search ASM..."
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
                className="bg-[#F87B1B] hover:bg-[#e86f12] text-white px-12 flex items-center justify-center"
                onClick={handleSubmit}
                disabled={loading || !validateStep(3)}
              >
                {loading ? (
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
  );
}
