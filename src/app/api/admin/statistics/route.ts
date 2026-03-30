import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/supabase_lib/auth/server";
import { isAdmin } from "@/supabase_lib/users";
import { fetchAdminAnalytics, type TimeRange } from "@/supabase_lib/analytics";

const VALID_PERIODS = new Set<TimeRange>(["7d", "30d", "90d"]);

export async function GET(request: NextRequest) {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = (request.nextUrl.searchParams.get("period") ?? "30d") as TimeRange;
  if (!VALID_PERIODS.has(period)) {
    return NextResponse.json(
      { error: "Invalid period. Use 7d, 30d, or 90d." },
      { status: 400 }
    );
  }

  try {
    const data = await fetchAdminAnalytics(supabase, period);
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
