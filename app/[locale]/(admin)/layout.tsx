import { ReactNode } from "react";
import { Sidebar } from "./dashboard/components/Sidebar";
import { cn } from "@/lib/utils";
import { Arimo } from "next/font/google";
import { Toaster } from "sonner";

const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arimo",
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className={cn("flex", arimo.className)} dir="ltr">
        <Toaster dir="ltr" />
        <Sidebar />
        <div className="py-2 pe-2 flex-1 ml-2">{children}</div>
      </div>
    </>
  );
}
