"use client";

import { ReactNode, useState } from "react";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";

type Props = {
  children: ReactNode;
};

export default function AdminLayoutShell({ children }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-0">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        {children}
      </div>
    </div>
  );
}
