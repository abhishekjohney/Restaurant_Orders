import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptons";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/common/DashboardLayoutClient";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  console.log(session, " session in layout");

  if (!session) {
    redirect("/");
  }

  return <DashboardLayoutClient session={session}>{children}</DashboardLayoutClient>;
}
