"use client";

import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
            {t("About AppointmentPro")}
          </h1>

          <div className="space-y-6 text-white/80 leading-relaxed">
            <p className="text-lg">
              {t(
                "AppointmentPro is a modern, intuitive appointment management system designed to streamline your business operations and enhance customer experience."
              )}
            </p>

            <p>
              {t(
                "Our platform combines cutting-edge technology with user-friendly design to provide a comprehensive solution for appointment scheduling, client management, and business analytics."
              )}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-slate-800/30 p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {t("Our Mission")}
                </h3>
                <p>
                  {t(
                    "To empower businesses with efficient appointment management tools that save time and improve customer satisfaction."
                  )}
                </p>
              </div>

              <div className="bg-slate-800/30 p-6 rounded-xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {t("Our Vision")}
                </h3>
                <p>
                  {t(
                    "To become the leading appointment management platform that transforms how businesses connect with their clients."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
