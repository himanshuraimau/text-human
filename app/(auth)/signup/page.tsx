import type { Metadata } from "next";
import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign up · Text Human" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
