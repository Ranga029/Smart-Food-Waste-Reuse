import Link from "next/link";
import React from "react";

export const Navbar: React.FC = () => {
  return (
    <header className="bg-emerald-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
          <span>🥦</span> FoodRescue Platform
        </Link>
        <nav className="flex space-x-6 text-sm font-medium">
          <Link href="/doners" className="hover:text-emerald-200 transition">Donor Portal</Link>
          <Link href="/receiver" className="hover:text-emerald-200 transition">Receiver Portal</Link>
          <Link href="/volunteer" className="hover:text-emerald-200 transition">Volunteer Portal</Link>
          <Link href="/dashboard" className="hover:text-emerald-200 transition">ESG Dashboard</Link>
        </nav>
      </div>
    </header>
  );
};