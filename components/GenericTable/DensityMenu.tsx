import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Rows3, Check } from "lucide-react"; // Импортираме иконките
import { RowDensity } from "./types";

interface DensityMenuProps {
  rowDensity: RowDensity;
  setRowDensity: (density: RowDensity) => void;
}

export const DensityMenu: React.FC<DensityMenuProps> = ({
  rowDensity,
  setRowDensity,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { label: string; value: RowDensity }[] = [
    { label: t("Compact"), value: "compact" },
    { label: t("Normal"), value: "normal" },
    { label: t("Spacious"), value: "spacious" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border rounded-lg flex items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-gray-200 dark:border-gray-700 shadow-sm"
        title={t("Row Density")}
      >
        {/* Използваме Rows3 за стандартна иконка за плътност */}
        <Rows3 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800/95 backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setRowDensity(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                rowDensity === option.value
                  ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
              {rowDensity === option.value && (
                <Check size={16} strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};