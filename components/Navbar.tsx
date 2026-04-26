"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, Zap } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Zap },
  { href: "/idea-generator", label: "Idea Generator", icon: Lightbulb },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2A2D3E] bg-[#0F1117]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#53A9EF] flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-[#F0F2F8] text-sm">
              YesCity <span className="text-[#53A9EF]">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#53A9EF]/10 text-[#53A9EF]"
                      : "text-[#8B90A7] hover:text-[#F0F2F8] hover:bg-[#1A1D27]"
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1D27] border border-[#2A2D3E]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-[#8B90A7]">MVP</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
