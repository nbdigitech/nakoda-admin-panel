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
  getState,
  getDistrict,
  getCity,
  getInfluencerCategory,
} from "@/services/masterData";
import { getUsers } from "@/services/user";
import { updateSubDealer } from "@/services/sub-dealer";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { toast as toastifyToast } from "react-toastify";

interface FormState {
  // Step 1 - Personal Info
  name: string;
  phoneNumber: string;
  email: string;
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
  address: string;
  asmId: string;
  asmName: string;

  // New fields from table
  categoryId: string;
  categoryName: string;
  distributorId: string;
  distributorName: string;
}

export default function EditSubDealerModal({
  trigger,
  onSuccess,
  dealer,
}: {
  trigger: React.ReactNode;
  onSuccess?: () => void;
  dealer: any;
}) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const parseDOB = (dobValue: any) => {
    if (!dobValue) return "";
    try {
      const date = dobValue?.toDate ? dobValue.toDate() : new Date(dobValue);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch (e) {
      console.error("Error parsing DOB:", e);
      return "";
    }
  };

  const getUrl = (val: any) =>
    typeof val === "string" && val.startsWith("http") ? val : "";

  const [formData, setFormData] = React.useState<FormState>({
    name: dealer?.name || "",
    phoneNumber: dealer?.phoneNumber || "",
    email: dealer?.email || "",
    dob: parseDOB(dealer?.dob),
    organizationName: dealer?.organizationName || "",
    logoBase64: getUrl(dealer?.logoUrl),
    gstBase64: getUrl(dealer?.gstUrl),
    pancardBase64: getUrl(dealer?.pancardUrl),
    aadhaarBase64: getUrl(dealer?.aadhaarPath) || getUrl(dealer?.aadhaar),
    stateId: dealer?.stateId || "",
    districtId: dealer?.districtId || "",
    city: dealer?.city || "",
    address: dealer?.address || "",
    asmId: dealer?.asmId || "",
    asmName: dealer?.asmName || "",
    categoryId: dealer?.categoryId || "",
    categoryName: dealer?.categoryName || "",
    distributorId: dealer?.distributorId || "",
    distributorName: dealer?.distributorName || "",
  });

  // Re-initialize when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: dealer?.name || "",
        phoneNumber: dealer?.phoneNumber || "",
        email: dealer?.email || "",
        dob: parseDOB(dealer?.dob),
        organizationName: dealer?.organizationName || "",
        logoBase64: getUrl(dealer?.logoUrl),
        gstBase64: getUrl(dealer?.gstUrl),
        pancardBase64: getUrl(dealer?.pancardUrl),
        aadhaarBase64: getUrl(dealer?.aadhaarPath) || getUrl(dealer?.aadhaar),
        stateId: dealer?.stateId || "",
        districtId: dealer?.districtId || "",
        city: dealer?.city || "",
        address: dealer?.address || "",
        asmId: dealer?.asmId || "",
        asmName: dealer?.asmName || "",
        categoryId: dealer?.categoryId || "",
        categoryName: dealer?.categoryName || "",
        distributorId: dealer?.distributorId || "",
        distributorName: dealer?.distributorName || "",
      });
      setStep(1);
    }
  }, [open, dealer]);

  // Location lists
  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [distributors, setDistributors] = React.useState<any[]>([]);
  const [asms, setAsms] = React.useState<any[]>([]);

  // Load static auxiliary data when modal opens
  React.useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const [stateRes, catRes, distRes]: any = await Promise.all([
          getState(),
          getInfluencerCategory(),
          getUsers(),
        ]);

        const sData = stateRes?.data?.data || stateRes?.data || stateRes || [];
        setStates(Array.isArray(sData) ? sData : []);

        const cData = catRes?.data?.data || catRes?.data || catRes || [];
        setCategories(Array.isArray(cData) ? cData : []);

        const uData = distRes?.data?.data || distRes?.data || distRes || [];
        const distList = Array.isArray(uData)
          ? uData.filter((u: any) => u.role === "distributor")
          : [];
        setDistributors(distList);
        const asmList = Array.isArray(uData)
          ? uData.filter((u: any) => u.role === "asm")
          : [];
        setAsms(asmList);
      } catch (err) {
        console.error("Failed to load generic data:", err);
      }
    };

    fetchData();
  }, [open]);

  // Fetch districts when stateId changes (e.g. on modal open or manual selection)
  React.useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.stateId) {
        try {
          const res: any = await getDistrict({ stateId: formData.stateId });
          const data = res?.data?.data || res?.data || res || [];
          setDistricts(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load districts:", err);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [formData.stateId]);

  // Firebase auth
  const { user, authReady } = useFirebaseAuth();

  // Set ASM id/name from logged-in user when available (if not already set)
  React.useEffect(() => {
    if (authReady && user && typeof user === "object" && !formData.asmId) {
      const asmName =
        (user as any).displayName ||
        (user as any).name ||
        (user as any).email ||
        (user as any).phoneNumber ||
        "";
      const asmId =
        (user as any).uid || (user as any).id || (user as any)._id || "";
      setFormData((prev) => ({ ...prev, asmId, asmName }));
    }
  }, [authReady, user]);

  // Handle text input changes
  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = async (val: string) => {
    handleInputChange("phoneNumber", val);
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

  // Validate form data
  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      const cleanPhone = formData.phoneNumber
        .replace(/^\+91/, "")
        .replace(/\D/g, "");
      return !!(formData.name && cleanPhone.length === 10);
    }
    if (stepNum === 2) {
      return !!formData.categoryId;
    }
    if (stepNum === 3) {
      return !!(formData.stateId && formData.districtId && formData.city);
    }
    return false;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting sub-dealer data:", formData);

      const payload = {
        email: formData.email || null,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        dob: (() => {
          if (!formData.dob) return null;
          const date = new Date(formData.dob);
          return isNaN(date.getTime()) ? null : date.toISOString();
        })(),
        organizationName: formData.organizationName,
        logoBase64: formData.logoBase64,
        gstBase64: formData.gstBase64,
        pancardBase64: formData.pancardBase64,
        aadhaarBase64: formData.aadhaarBase64,
        stateId: formData.stateId,
        districtId: formData.districtId,
        city: formData.city,
        address: formData.address,
        asmId: formData.asmId,
        asmName: formData.asmName,
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        distributorId: formData.distributorId,
        distributorName: formData.distributorName,
      };

      await updateSubDealer(dealer.id, payload);
      alert("Sub-Dealer updated successfully!");

      // Reset form and close
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating sub-dealer:", error);
      alert("Failed to update sub-dealer. Please try again.");
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
            Edit Sub Dealer
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
                    Sub Dealer Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter sub dealer name"
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
                    className={`text-xs font-semibold block mb-2 text-gray-700`}
                  >
                    Phone No. *
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    disabled
                    placeholder="9405005285"
                    className={`w-full border-2 bg-gray-50 text-gray-500 cursor-not-allowed`}
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
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    Influencer Category *
                  </label>
                  <Combobox
                    options={categories.map((c: any) => ({
                      label: c.categoryName || c.name,
                      value: String(c.id || c._id),
                    }))}
                    value={formData.categoryId}
                    onValueChange={(val) => {
                      const selected = categories.find(
                        (c: any) => String(c.id || c._id) === val,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: val,
                        categoryName:
                          selected?.categoryName || selected?.name || "",
                      }));
                    }}
                    placeholder="Select category"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    Distributor Name
                  </label>
                  <Input
                    value={formData.distributorName}
                    disabled
                    className="w-full border-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

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
                        toast({
                          title: "Invalid file",
                          description:
                            "PDF files are not allowed for Logo. Please upload an image (.jpg, .jpeg, .png).",
                          variant: "destructive",
                        });
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
                        setFormData((prev) => ({ ...prev, gstBase64: "" }));
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
                        setFormData((prev) => ({ ...prev, gstBase64: "" }));
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
                          "PDF files are not allowed for PAN Card. Please upload an image (.jpg, .jpeg, .png).",
                          { position: "bottom-right" },
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
                      ✓ PAN uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "aadhaar"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Aadhaar Image
                  </label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) {
                        setFormData((prev) => ({ ...prev, aadhaarBase64: "" }));
                        return;
                      }
                      if (f.type === "application/pdf") {
                        toastifyToast.error(
                          "PDF files are not allowed for Aadhaar. Please upload an image.",
                          { position: "bottom-right" },
                        );
                        e.target.value = "";
                        setFormData((prev) => ({ ...prev, aadhaarBase64: "" }));
                        return;
                      }
                      handleFileChange("aadhaarBase64", f);
                    }}
                    placeholder="Choose file"
                    className={`w-full border-2 transition ${
                      focusedField === "aadhaar"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("aadhaar")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.aadhaarBase64 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Aadhaar uploaded
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
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    State *
                  </label>
                  <Combobox
                    options={states.map((s) => ({
                      label: s.stateName || s.name,
                      value: s.id || s.stateId || s._id,
                    }))}
                    value={formData.stateId}
                    onValueChange={async (val) => {
                      handleInputChange("stateId", val);
                      handleInputChange("districtId", "");
                      handleInputChange("city", "");
                      setDistricts([]);
                      setCities([]);
                    }}
                    placeholder="Select state"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    District *
                  </label>
                  <Combobox
                    options={districts.map((d) => ({
                      label: d.districtName || d.name,
                      value: d.id || d._id,
                    }))}
                    value={formData.districtId}
                    onValueChange={async (val) => {
                      handleInputChange("districtId", val);
                      handleInputChange("city", "");
                      setCities([]);
                    }}
                    disabled={!formData.stateId}
                    placeholder="Select district"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    City *
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                    className="w-full border-2 border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    Full Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter full address"
                    className="w-full border-2 border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
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
