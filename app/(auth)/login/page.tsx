import type { Metadata } from "next";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Log in · Text Human" };

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
