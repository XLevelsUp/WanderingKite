'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceSelectionCard } from "./ServiceSelectionCard";
import { useNotifications } from "@/components/ui/useNotifications";
import { Eye, EyeOff } from "lucide-react";

// Service options
const serviceOptions = [
  {
    value: "PHOTOGRAPHY",
    label: "Photography",
    description: "Book creative shoots, portfolios, and events.",
  },
  {
    value: "RENTALS",
    label: "Rentals",
    description: "Rent professional cameras, lenses, and production gear.",
  },
  {
    value: "STUDIO_SPACE",
    label: "Studio Space",
    description: "Reserve our state-of-the-art studio space.",
  },
];

// Strict validation schema
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { message: "First name is required" })
      .regex(/^[a-zA-Z\s]+$/, { message: "First name must contain letters only" }),
    lastName: z
      .string()
      .min(1, { message: "Last name is required" })
      .regex(/^[a-zA-Z\s]+$/, { message: "Last name must contain letters only" }),
    dateOfBirth: z
      .string()
      .min(1, { message: "Date of birth is required" })
      .refine((val) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        return date <= eighteenYearsAgo;
      }, { message: "You must be at least 18 years old to sign up" }),
    phoneNumber: z
      .string()
      .min(1, { message: "Phone number is required" })
      .regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit phone number" }),
    address: z.string().min(1, { message: "Address is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    gender: z.enum(["Male", "Female", "Other"], {
      message: "Please select your gender",
    }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    services: z
      .array(z.enum(["PHOTOGRAPHY", "RENTALS", "STUDIO_SPACE"]))
      .min(1, { message: "Please select at least one service" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function ClientSignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showModal, showLoader } = useNotifications();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      services: [],
    },
  });

  const selectedServices = watch("services") || [];

  const handleServiceToggle = (val: "PHOTOGRAPHY" | "RENTALS" | "STUDIO_SPACE") => {
    const updatedServices = selectedServices.includes(val)
      ? selectedServices.filter((s) => s !== val)
      : [...selectedServices, val];

    setValue("services", updatedServices);
    // Validate only the services field to clear potential service selection errors
    // without triggering validation on other fields like password
    trigger("services");
  };

  const onSubmit = async (values: SignupValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const response = await fetch("/api/client/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "duplicate_email") {
          toast.error("An account with this email already exists. Try logging in instead.", { id: toastId });
        } else {
          toast.error("Something went wrong on our end. Please try again in a moment.", { id: toastId });
        }
        setIsLoading(false);
        return;
      }

      toast.success("Successfully registered!", { id: toastId });

      // Show the global confirmation modal on successful signup
      showModal({
        title: "Account Created Successfully!",
        description: "Welcome to WanderingKite Studio! Your client account has been created. You can now log in to access your dashboard.",
        confirmText: "Log In",
        isBlocking: true,
        onConfirm: () => {
          showLoader("Loading login screen...");
          router.push("/client/login");
        },
      });
    } catch (err) {
      toast.error("Something went wrong on our end. Please try again in a moment.", { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-slate-900/40 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">Client Signup</CardTitle>
        <CardDescription className="text-center text-slate-400">
          Create an account to manage your bookings and rentals
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
              1. Personal Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="e.g. John"
                  {...register("firstName")}
                  disabled={isLoading}
                  className={`bg-slate-950/40 text-white border-slate-800 ${
                    errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs font-medium">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Doe"
                  {...register("lastName")}
                  disabled={isLoading}
                  className={`bg-slate-950/40 text-white border-slate-800 ${
                    errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs font-medium">{errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-slate-300">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  disabled={isLoading}
                  className={`bg-slate-950/40 text-white border-slate-800 ${
                    errors.dateOfBirth ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs font-medium">{errors.dateOfBirth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-slate-300">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="e.g. 9876543210"
                  {...register("phoneNumber")}
                  disabled={isLoading}
                  className={`bg-slate-950/40 text-white border-slate-800 ${
                    errors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs font-medium">{errors.phoneNumber.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-slate-300">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Main St, Coimbatore"
                  {...register("address")}
                  disabled={isLoading}
                  className={`bg-slate-950/40 text-white border-slate-800 ${
                    errors.address ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs font-medium">{errors.address.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. client@example.com"
                  {...register("email")}
                  disabled={isLoading}
                  className={`bg-slate-950/40 text-white border-slate-800 ${
                    errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-slate-300">Gender</Label>
                <select
                  id="gender"
                  {...register("gender")}
                  disabled={isLoading}
                  className={errors.gender
                    ? "flex h-9 w-full rounded-md border border-red-500 bg-slate-950/40 px-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                    : "flex h-9 w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  }
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select Gender...</option>
                  <option value="Male" className="bg-slate-900 text-white">Male</option>
                  <option value="Female" className="bg-slate-900 text-white">Female</option>
                  <option value="Other" className="bg-slate-900 text-white">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs font-medium">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Password Setting */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
              2. Credentials
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 chars, uppercase, digit..."
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                    className={`w-full bg-slate-950/40 text-white border-slate-800 pr-10 ${
                      errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors z-10"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Service Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
              3. Service Selection
            </h3>
            <p className="text-xs text-slate-400">
              Select one or more services you are interested in.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {serviceOptions.map((svc) => (
                <ServiceSelectionCard
                  key={svc.value}
                  label={svc.label}
                  description={svc.description}
                  selected={selectedServices.includes(svc.value as any)}
                  onClick={() => handleServiceToggle(svc.value as any)}
                />
              ))}
            </div>
            {errors.services && (
              <p className="text-red-500 text-xs font-medium">{errors.services.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2.5" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          <p className="text-xs text-slate-400 text-center">
            Already have an account?{" "}
            <a href="/client/login" className="text-amber-500 hover:underline font-medium">
              Sign In
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
