"use client";

import type React from "react";
import SignInForm from "./SignInForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center h-full py-2 md:py-6 lg:py-8 justify-center ">
      <SignInForm />
    </div>
  );
}
