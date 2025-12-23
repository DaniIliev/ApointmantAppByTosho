"use client";
import { usePaddingControl } from "@/context/PaddingContext";
// import ContactForm from "./components/contact-form";
import ContactHero from "./components/contact-hero";
import ContactInfo from "./components/contact-info";
import { useEffect } from "react";

export default function ContactPage() {
  const { setRemovePadding } = usePaddingControl();

  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);
  return (
    <div>
      <ContactHero />
      <div className="container mx-auto px-4 py-10 lg:14">
        <ContactInfo />
      </div>
    </div>
  );
}
