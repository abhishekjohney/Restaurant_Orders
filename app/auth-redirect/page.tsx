import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/authOptons";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log("SESSION\n", session);

  if (!session) {
    redirect("/");
  } else if (session.user.role === "admin" || session?.user?.role === "counter") {
    redirect("/dashboard");
  } else if (session.user.role === "salesman" || session.user?.role === "multi-user") {
    redirect("/userorderdashboard");
  } else {
    redirect("/");
  }
}
