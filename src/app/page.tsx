"use client";

import { useSyncExternalStore } from "react";
import { HomeClient } from "@/components/HomeClient";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function Home() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#f3f6f8]" aria-label="Loading ClinicNav AI">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-5 md:px-8">
          <div className="h-2 w-40 overflow-hidden rounded-full bg-[#d8e0e7]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#1f3a5f]" />
          </div>
        </div>
      </main>
    );
  }

  return <HomeClient />;
}
