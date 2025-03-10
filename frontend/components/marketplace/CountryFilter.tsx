"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface CountryFilterProps {
  selectedCountry: string | null;
  onCountrySelect: (country: string | null) => void;
}

// Country data with flags and names
const countries = [
  { code: "TN", name: "Tunisie", flag: "/flags/tunisia.png" },
  { code: "LY", name: "Libye", flag: "/flags/libya.png" },
  { code: "DZ", name: "Algérie", flag: "/flags/algeria.png" },
];

export default function CountryFilter({
  selectedCountry,
  onCountrySelect,
}: CountryFilterProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Parcourir par pays</h2>
      <div className="flex flex-wrap gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card
            className={`cursor-pointer p-3 flex items-center justify-center ${
              selectedCountry === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            onClick={() => onCountrySelect(null)}
          >
            <span className="font-medium">Tous les pays</span>
          </Card>
        </motion.div>

        {countries.map((country) => (
          <motion.div
            key={country.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className={`cursor-pointer p-3 flex items-center gap-2 ${
                selectedCountry === country.code
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => onCountrySelect(country.code)}
            >
              <div className="relative w-8 h-5 overflow-hidden rounded-sm">
                <Image 
                  src={country.flag} 
                  alt={`Drapeau ${country.name}`}
                  fill
                  sizes="32px"
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-medium">{country.name}</span>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 