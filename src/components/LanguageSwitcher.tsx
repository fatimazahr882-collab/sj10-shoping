"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ur", name: "اردو (Urdu)", flag: "🇵🇰" },
  ];

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false);
    // Logic to change URL: /explore -> /ur/explore
    const segments = pathname.split("/");
    const isUrdu = segments[1] === "ur";
    
    if (langCode === "ur" && !isUrdu) {
      router.push(`/ur${pathname}`);
    } else if (langCode === "en" && isUrdu) {
      router.push(pathname.replace("/ur", "") || "/");
    }
  };

  return (
    <div className="lang-dropdown">
      <button onClick={() => setIsOpen(!isOpen)} className="lang-trigger">
        🌐 {pathname.startsWith("/ur") ? "اردو" : "English"}
      </button>
      
      {isOpen && (
        <div className="lang-menu">
          {languages.map((lang) => (
            <div key={lang.code} onClick={() => handleLanguageChange(lang.code)} className="lang-item">
              <span>{lang.flag}</span> {lang.name}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .lang-dropdown { position: relative; }
        .lang-trigger { background: none; border: none; color: white; font-size: 12px; cursor: pointer; font-weight: 600; }
        .lang-menu { position: absolute; top: 100%; right: 0; background: white; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 2000; width: 120px; margin-top: 5px; }
        .lang-item { padding: 10px; color: #333; font-size: 13px; cursor: pointer; display: flex; gap: 8px; }
        .lang-item:hover { background: #f0f0f0; color: #f85606; }
      `}</style>
    </div>
  );
}