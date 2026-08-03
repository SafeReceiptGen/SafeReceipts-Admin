"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session } from "./auth-client";

export async function getServerSession(): Promise<Session | null> {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");

  if (!cookieHeader) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        method: "GET",
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const sessionData = await response.json();
    return sessionData as Session;
  } catch (error) {
    console.error("Session fetch failed:", error);
    return null;
  }
}

export async function requireAdminSession(): Promise<Session> {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/login?error=unauthorized");
  }

  return session;
}
