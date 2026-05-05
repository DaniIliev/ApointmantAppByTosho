import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-primary-foreground mt-auto pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AppointDI
              </h1>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t("AppointmentPro is a modern, intuitive appointment management system designed to streamline your business operations and enhance customer experience.")}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-background rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-background rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-background rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">{t("Quick Links")}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">{t("Home")}</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">{t("Pricing")}</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">{t("About us")}</Link></li>
              <li><Link href="/help/contact" className="text-muted-foreground hover:text-primary transition-colors">{t("Contact Us")}</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">{t("Legal")}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">{t("Privacy Policy")}</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">{t("Terms & Conditions")}</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">{t("Cookie Policy")}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-6">{t("Get In Touch")}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">appointmentappdi@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">+359 899 235 444</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">Sofia, Bulgaria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t("Company Name")}. {t("AppointDI. All rights reserved.")}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">{t("Privacy")}</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">{t("Terms")}</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">{t("Cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
