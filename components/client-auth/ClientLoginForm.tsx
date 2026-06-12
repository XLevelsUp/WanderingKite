'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/components/ui/useNotifications";
import { Eye, EyeOff } from "lucide-react";

// Strict validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email address" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Please enter your password" })
    .min(8, { message: "Password must be at least 8 characters long" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function ClientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showLoader } = useNotifications();

  // Get potential redirect message
  const redirectMessage = searchParams.get("message");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Clear errors as user corrects them
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      const response = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403 && data.error === 'deactivated') {
          toast.error(data.message || "Your account has been deactivated. Please contact administration for assistance.", { id: toastId });
        } else if (response.status === 401) {
          toast.error("The email or password you entered is incorrect. Please try again.", { id: toastId });
        } else {
          toast.error("Something went wrong on our end. Please try again in a moment.", { id: toastId });
        }
        setIsLoading(false);
        return;
      }

      toast.success("Successfully signed in!", { id: toastId });
      showLoader("Opening dashboard...");
      router.push("/client/dashboard");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong on our end. Please try again in a moment.", { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-slate-900/40 border-slate-800 backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">Client Login</CardTitle>
        <CardDescription className="text-center text-slate-400">
          Enter your email and password to access your dashboard
        </CardDescription>
        {redirectMessage && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center px-4 py-2.5 rounded-lg text-xs font-medium mt-2">
            {decodeURIComponent(redirectMessage)}
          </div>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="e.g. client@example.com"
              autoComplete="email"
              {...register("email")}
              disabled={isLoading}
              className={errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-slate-800 bg-slate-950/40 text-white"}
            />
            {errors.email && (
              <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="e.g. ••••••••"
                autoComplete="current-password"
                {...register("password")}
                disabled={isLoading}
                className={`w-full bg-slate-950/40 text-white border-slate-800 pr-10 ${
                  errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors z-10"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-xs text-slate-400 text-center">
            Don't have an account?{" "}
            <a href="/client/signup" className="text-amber-500 hover:underline font-medium">
              Sign Up
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
