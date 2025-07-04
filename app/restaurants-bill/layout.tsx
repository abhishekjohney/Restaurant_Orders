import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptons";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/common/DashboardLayoutClient";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  console.log(session, " session in layout");

  // COMMENTED OUT: Session check and redirect to allow unauthenticated access to item ordering page.
  /*
  if (!session) {
    redirect("/");
  }
  */
  // If session is null, provide a default guest session so the layout renders for unauthenticated users
  const guestSession = {
    user: {
      id: "guest",
      role: "salesman", // must be one of: 'salesman', 'admin', 'multi-user', 'counter'
      systemDate: new Date().toISOString().split("T")[0],
      ClientCode: "GUEST",
      UserType: "guest",
      name: "Guest",
      email: null,
      image: null,
    },
  } as {
    user: {
      id: string;
      role: "admin" | "salesman" | "multi-user" | "counter";
      systemDate: string;
      ClientCode: string;
      UserType: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
  return <DashboardLayoutClient session={session || guestSession}>{children}</DashboardLayoutClient>;
}
