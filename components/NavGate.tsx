"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function NavGate() {
  const pathname = usePathname();

  // Hide navbar on the sign-in page (root path)
  if (pathname === "/") return null;

  return <NavBar />;
}

