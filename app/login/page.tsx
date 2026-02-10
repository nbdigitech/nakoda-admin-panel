"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
} from "firebase/auth";

import { getFirebaseAuth } from "@/firebase"; // ✅ USE SINGLETON AUTH
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { checkUserBeforeLogin, activateUserAfterOtp } from "@/services/user";

export default function LoginPage() {
  const router = useRouter();
  const { user, authReady } = useFirebaseAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (authReady && user) {
      router.push("/dashboard");
    }
  }, [authReady, user, router]);

  // 🔐 reCAPTCHA v2 (required for phone auth)
  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        getFirebaseAuth(),
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formatted = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber.replace(/\D/g, "")}`;

      const appVerifier = (window as any).recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        getFirebaseAuth(),
        formatted,
        appVerifier,
      );

      setConfirmationResult(result);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!confirmationResult) throw new Error("OTP expired");

      await confirmationResult.confirm(otp);

      // Check user status after login
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      console.log("Current User:", currentUser);
      if (currentUser) {
        const phoneNumber = currentUser.phoneNumber?.replace(/^\+91/, "") || "";
        const userData = await checkUserBeforeLogin(phoneNumber);
        if (userData?.data?.data[0]?.status === "pending") {
          await activateUserAfterOtp();
        }
      }

      // ❌ cookie not needed for Firebase auth
      // Firebase auth is already persisted

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/nakoda-20logo-20hindi-20and-20english.svg"
            alt="Logo"
            width={220}
            height={60}
          />
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="tel"
              placeholder="+919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border px-4 py-3 rounded-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="000000"
              className="w-full border px-4 py-3 text-center text-2xl rounded-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* REQUIRED */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
