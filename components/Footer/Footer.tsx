import { Calendar } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className=" border-border bg-primary-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="theme-text-gradient font-semibold font-sans">
                AppintmentPro
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Making appointments simple and efficient for everyone.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-sans">For Clients</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Find Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Mobile App
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-sans">For Business</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="/for-business"
                  className="hover:text-foreground transition-colors"
                >
                  Get Started
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-sans">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 BookEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
