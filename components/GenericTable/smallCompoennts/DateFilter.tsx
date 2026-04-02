import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";

interface DateFilterProps {
  onDateFilterChange: (filter: string) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  onDateFilterChange,
}) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (filter: string) => {
    onDateFilterChange(filter);
    setIsDropdownOpen(false);
  };

  const filterOptions = [
    { key: "all", label: t("All") },
    { key: "today", label: t("Today") },
    { key: "tomorrow", label: t("Tomorrow") },
    { key: "this_week", label: t("This Week") },
    { key: "next_week", label: t("Next Week") },
    { key: "this_month", label: t("This Month") },
    { key: "next_month", label: t("Next Month") },
    { key: "future", label: t("Future") },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 border rounded-lg flex items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Calendar className="h-4 w-4" />
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-lg bg-white dark:bg-gray-800/70 z-50">
          <ul className="py-1">
            {filterOptions.map((option) => (
              <li
                key={option.key}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => handleSelect(option.key)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
