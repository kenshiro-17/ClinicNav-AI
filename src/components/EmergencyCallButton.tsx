import { PhoneCall } from "lucide-react";

export function EmergencyCallButton({ compact = false, label = "Call 112" }: { compact?: boolean; label?: string }) {
  return (
    <a
      href="tel:112"
      className={
        compact
          ? "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#d92d20] px-4 text-sm font-semibold text-white shadow-lg shadow-red-900/15 transition hover:bg-[#b42318] focus:outline-none focus:ring-4 focus:ring-red-200"
          : "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d92d20] px-5 text-sm font-semibold text-white shadow-xl shadow-red-900/18 transition hover:bg-[#b42318] focus:outline-none focus:ring-4 focus:ring-red-200"
      }
      aria-label={label}
      title={label}
    >
      <PhoneCall className="h-4 w-4" />
      {label}
    </a>
  );
}
