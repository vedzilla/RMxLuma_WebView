import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  params,
  children,
}: {
  params: Promise<{ societyId: string }>;
  children: React.ReactNode;
}) {
  const { societyId } = await params;

  return <DashboardShell societyId={societyId}>{children}</DashboardShell>;
}
