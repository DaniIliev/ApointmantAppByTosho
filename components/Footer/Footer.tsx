import { Calendar } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary-foreground pb-2">
      <div className="mt-4 pt-4 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Logo + AppointDI */}
          <div className="flex items-center gap-2">
            <img src="/AppointmantPro.png" alt="logo" className="w-8 h-8" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AppointDI
            </h1>
          </div>

          {/* Center: Copyright text */}
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2025. All rights reserved.
          </p>

          <div className="w-32 hidden sm:block" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
