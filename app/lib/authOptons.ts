import CredentialsProvider from "next-auth/providers/credentials";
const login = new LoginApi();
import type { AuthOptions } from "next-auth";
import { LoginApi } from "../utils/api";
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "jsmith",
        },
        password: { label: "Password", type: "password" },
        vehicle: {
          label: "Vehicle",
          type: "text",
          placeholder: "Car, Truck, Bike, etc.",
        },
        route: {
          label: "Route",
          type: "text",
          placeholder: "Car, Truck, Bike, etc.",
        },
        locationData: {
          label: "locationData",
        },
      },
      async authorize(credentials) {
        let role = "customer";
        console.log("\nauthorize\n");
        if (credentials && credentials.username) {
          console.log(credentials, "\n login data\n");
          const user = await login.getUser(credentials);
          console.log({ user }, "\nppppp\n");
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.systemDate = user.systemDate;
        token.ClientCode = user.ClientCode;
        token.UserType = user.UserType;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          systemDate: token.systemDate,
          ClientCode: token.ClientCode,
          UserType: token.UserType,
          selectedUser: token.selectedUser ?? null,
        },
      };
    },
  },
  // pages: {
  //   signIn: "/",
  // },
};
