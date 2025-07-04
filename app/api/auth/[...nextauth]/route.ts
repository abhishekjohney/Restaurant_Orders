import NextAuth, { DefaultSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptons";
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "admin" | "salesman" | "multi-user" | "counter";
      systemDate: string;
      ClientCode: string;
      UserType: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    systemDate: string;
    ClientCode: string;
    UserType: string;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
