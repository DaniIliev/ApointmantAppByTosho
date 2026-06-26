"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const CookieBanner = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent-given");
    if (!consent) {
      // Small delay to show banner after page load for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent-given", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent-given", "false");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100]"
        >
          <div className="bg-background/95 backdrop-blur-md border border-border p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{t("Cookie Consent")}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {t("Cookie Banner Text")}{" "}
                  <Link
                    href="/cookies"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("Read More")}
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 rounded-xl"
                onClick={handleDecline}
              >
                {t("Decline")}
              </Button>
              <Button 
                size="sm" 
                className="flex-1 rounded-xl shadow-lg shadow-primary/20"
                onClick={handleAccept}
              >
                {t("Accept All")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
