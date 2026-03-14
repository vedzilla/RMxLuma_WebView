import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/supabase_lib/auth/server";
import { isAdmin } from "@/supabase_lib/users";
import { fetchStatistics } from "@/lib/posthog";

const VALID_PERIODS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse period
  const period = request.nextUrl.searchParams.get("period") ?? "30d";
  const days = VALID_PERIODS[period];
  if (!days) {
    return NextResponse.json(
      { error: "Invalid period. Use 7d, 30d, or 90d." },
      { status: 400 }
    );
  }

  try {
    const data = await fetchStatistics(days);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (err) {
    console.error("[api/admin/statistics] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
