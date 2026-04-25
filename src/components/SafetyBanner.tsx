import { AlertTriangle, ShieldCheck } from "lucide-react";
import { safetyDisclaimer } from "@/lib/countryData";
import { EmergencyCallButton } from "./EmergencyCallButton";

export function SafetyBanner({ emergency = false, german = false }: { emergency?: boolean; german?: boolean }) {
  return (
    <div
      className={
        emergency
          ? "rounded-2xl border border-[#e8bea5] bg-[#f7dfcd] p-4 text-[#8f352d] shadow-sm"
          : "rounded-2xl border border-[#c9d7bb] bg-[#e3ead9] p-4 text-[#455d45] shadow-sm"
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {emergency ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />}
          <p className="text-sm leading-6">
            {german
              ? "CareNav AI stellt keine Diagnose und ersetzt keine medizinische Beratung. Es hilft bei der Orientierung im Versorgungssystem. Bei schweren, sich verschlechternden oder lebensbedrohlichen Symptomen sofort den Notruf wählen."
              : safetyDisclaimer}
          </p>
        </div>
        {emergency ? <EmergencyCallButton compact label={german ? "112 anrufen" : "Call 112"} /> : null}
      </div>
    </div>
  );
}
