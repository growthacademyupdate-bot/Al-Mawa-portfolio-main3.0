"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import OTPVerification from "./OTPVerification";

interface loginData {
  email: string;
  password: string;
}

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const { register, handleSubmit } = useForm<loginData>();
  const [loginStep, setLoginStep] = useState(1); // 1: Credentials, 2: OTP
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: loginData) => {
    try {
      setLoading(true);
      console.log("🔄 Attempting login...");
      
      const res = await axios.post("/api/admin-login", {
        ...data,
        step: 1,
      });
      
      console.log("📤 Login response:", res.data);
      
      if (res.data.success) {
        if (res.data.step === 3) {
          toast.success("Login Successful!", {
            description: "Welcome to admin panel"
          });
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            window.location.href = "/admin";
          }
        } else {
          console.log("✅ Credentials verified, moving to OTP step");
          toast.success("Credentials Verified!", {
            description: "Enter the OTP sent to your email"
          });
          setAdminEmail(data.email);
          setLoginStep(2);
        }
      } else {
        console.log("❌ Login failed:", res.data.error);
        toast.error(res.data.error || "Invalid credentials", {
          description: "Please check your credentials"
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Something went wrong!", {
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    console.log("✅ OTP verified, redirecting to admin panel");
    toast.success("Login Successful!", {
      description: "Welcome to admin panel"
    });
    
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      window.location.href = "/admin";
    }
  };

  const handleBackToLogin = () => {
    setLoginStep(1);
    setAdminEmail("");
  };

  // Show OTP verification component
  if (loginStep === 2) {
    return (
      <OTPVerification
        email={adminEmail}
        onSuccess={handleOTPSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Show login form
  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-900">
      <form
        onSubmit={handleSubmit(handleLogin)}
        className="bg-white dark:bg-zinc-800 w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Admin Sign In
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Security Badge */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
          <span className="text-lg">🔒</span>
          <p className="text-xs text-green-700 dark:text-green-300">
            Secure admin login area
          </p>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-zinc-700 dark:text-zinc-300">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            required
            placeholder="admin@example.com"
            {...register("email")}
            className="w-full border-zinc-300 dark:border-zinc-600 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-zinc-700 dark:text-zinc-300">
            Password
          </Label>
          <Input
            type="password"
            id="password"
            required
            placeholder="********"
            {...register("password")}
            className="w-full border-zinc-300 dark:border-zinc-600 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-800"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Sign In"}
        </Button>

        {/* Info Footer */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            Ensure your credentials are kept secure at all times.
          </p>
        </div>
      </form>
    </section>
  );
};

export default LoginPage;
