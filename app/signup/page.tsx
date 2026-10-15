import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign up — Meet Attendance" };

export default function SignupPage() {
  return (
    <div className="container">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
