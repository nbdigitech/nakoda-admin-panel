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
  createDealerByPhone,
  checkUserBeforeLogin,
  getState,
  getDistrict,
  getCity,
} from "@/services/masterData";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Combobox } from "@/components/ui/combobox";

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
  cityId: string;
  address: string;
  asmId: string;
  asmName: string;
}

export default function AddDealerModal({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const [step, setStep] = React.useState(1);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isPhoneRegistered, setIsPhoneRegistered] = React.useState(false);
  const [checkingPhone, setCheckingPhone] = React.useState(false);

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
    cityId: "",
    address: "",
    asmId: "",
    asmName: "",
  });

  // Location lists
  const [states, setStates] = React.useState<any[]>([]);
  const [districts, setDistricts] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);

  // Firebase auth
  const { user, authReady } = useFirebaseAuth();

  // Load states on mount
  React.useEffect(() => {
    const fetchStates = async () => {
      try {
        const res: any = await getState();
        const data = res?.data?.data || res?.data || res || [];
        setStates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load states:", err);
      }
    };

    fetchStates();
  }, []);

  // Set ASM id/name from logged-in user when available
  React.useEffect(() => {
    if (authReady && user && typeof user === "object") {
      const asmName =
        (user as any).displayName ||
        (user as any).email ||
        (user as any).phoneNumber ||
        "";
      setFormData((prev) => ({ ...prev, asmId: (user as any).uid, asmName }));
    }
  }, [authReady, user]);

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

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data:image/png;base64, part to get just the base64 string
      const base64Only = base64String.split(",")[1] || base64String;
      setFormData((prev) => ({ ...prev, [field]: base64Only }));
      console.log(`${field} converted to base64`);
    };
    reader.readAsDataURL(file);
  };

  // Validate form data
  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      // Check if all fields are filled and phone is not already registered
      return !!(
        formData.name &&
        formData.phoneNumber &&
        formData.password &&
        formData.dob &&
        !isPhoneRegistered
      );
    }
    if (stepNum === 2) {
      return !!(
        formData.organizationName &&
        formData.logoBase64 &&
        formData.gstBase64 &&
        formData.pancardBase64 &&
        formData.aadhaarBase64
      );
    }
    if (stepNum === 3) {
      return !!(
        formData.stateId &&
        formData.districtId &&
        formData.cityId &&
        formData.address &&
        formData.asmId
      );
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
        districtId: formData.districtId,
        cityId: formData.cityId,
        address: formData.address,
        asmId: formData.asmId,
        asmName: formData.asmName,
      };

      const response = await createDealerByPhone(payload);
      console.log("Dealer created successfully:", response);
      alert("Dealer created successfully!");

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
        cityId: "",
        address: "",
        asmId: "",
        asmName: "",
      });
      setStep(1);
    } catch (error) {
      console.error("Error creating dealer:", error);
      alert("Failed to create dealer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
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
                    className={`w-full border-2 transition ${
                      isPhoneRegistered
                        ? "!border-red-500"
                        : focusedField === "phoneNumber"
                          ? "!border-[#F87B1B]"
                          : "!border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("phoneNumber")}
                    onBlur={() => setFocusedField(null)}
                  />
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
                      focusedField === "password"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Password *
                  </label>
                  <Input
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="••••••••"
                    type="password"
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
                    DOB *
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
                    Organization Name *
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
                    Upload Logo *
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,image/*,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange("logoBase64", e.target.files?.[0])
                    }
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
                    Upload GST *
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange("gstBase64", e.target.files?.[0])
                    }
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
                    Upload Pan Card *
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange("pancardBase64", e.target.files?.[0])
                    }
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
                    Upload Aadhar *
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange("aadhaarBase64", e.target.files?.[0])
                    }
                    placeholder="Choose file"
                    className={`w-full border-2 transition ${
                      focusedField === "aadhaarBase64"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("aadhaarBase64")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {formData.aadhaarBase64 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Aadhar uploaded
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
              <div className="grid grid-cols-3 gap-6">
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
                      // reset downstream
                      handleInputChange("districtId", "");
                      handleInputChange("cityId", "");
                      setDistricts([]);
                      setCities([]);
                      if (val) {
                        try {
                          const res: any = await getDistrict({ stateId: val });
                          const data =
                            res?.data?.data || res?.data || res || [];
                          setDistricts(Array.isArray(data) ? data : []);
                        } catch (err) {
                          console.error("Failed to load districts:", err);
                        }
                      }
                    }}
                    placeholder="Select state"
                    searchPlaceholder="Search state..."
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
                      handleInputChange("cityId", "");
                      setCities([]);
                      if (val) {
                        try {
                          const res: any = await getCity({ districtId: val });
                          const data =
                            res?.data?.data || res?.data || res || [];
                          setCities(Array.isArray(data) ? data : []);
                        } catch (err) {
                          console.error("Failed to load cities:", err);
                        }
                      }
                    }}
                    disabled={!formData.stateId}
                    placeholder={
                      districts.length
                        ? "Select district"
                        : "Select state first"
                    }
                    searchPlaceholder="Search district..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-2 text-gray-700">
                    City *
                  </label>
                  <Combobox
                    options={cities.map((c) => ({
                      label: c.cityName || c.name,
                      value: c.id || c._id,
                    }))}
                    value={formData.cityId}
                    onValueChange={(val) => handleInputChange("cityId", val)}
                    disabled={!formData.districtId}
                    placeholder={
                      cities.length ? "Select city" : "Select district first"
                    }
                    searchPlaceholder="Search city..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "address"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    Address *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter full address"
                    className={`w-full border-2 transition ${
                      focusedField === "address"
                        ? "border-[#F87B1B]"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedField("address")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <div>
                  <label
                    className={`text-xs font-semibold block mb-2 transition ${
                      focusedField === "asmId"
                        ? "text-[#F87B1B]"
                        : "text-gray-700"
                    }`}
                  >
                    ASM ID *
                  </label>
                  <Input
                    value={formData.asmName || formData.asmId}
                    disabled
                    placeholder="ASM (auto-assigned)"
                    className="w-full border-2 bg-gray-50 text-gray-700"
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
                disabled={loading || !validateStep(3)}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
