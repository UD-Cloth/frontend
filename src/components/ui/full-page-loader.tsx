import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullPageLoaderProps {
  message?: string;
  isVisible: boolean;
}

export function FullPageLoader({ message = "Processing...", isVisible }: FullPageLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm animate-in fade-in duration-300 dark:bg-black/60">
      <div className="flex flex-col items-center space-y-4 rounded-xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{message}</p>
      </div>
    </div>
  );
}
