"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SocietyAccountRow, SocietyRow, SocietyProfileRow } from "@/lib/supabase/types";
import { mockSociety, mockAccount, mockProfile } from "@/lib/mock-data";

interface SocietyAuth {
  user: null;
  account: SocietyAccountRow | null;
  society: SocietyRow | null;
  profile: SocietyProfileRow | null;
  permissions: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSocietyAuth(): SocietyAuth {
  const router = useRouter();

  const signOut = useCallback(async () => {
    router.push("/society");
  }, [router]);

  const refresh = useCallback(async () => {}, []);

  return {
    user: null,
    account: mockAccount,
    society: mockSociety,
    profile: mockProfile,
    permissions: ["event_management", "society_profile", "member_management", "view_analytics"],
    loading: false,
    signOut,
    refresh,
  };
}
