import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getServerSession();
  if (session?.user?.role === "admin") {
    redirect("/dashboard");
  }
  // Non-admin sessions (e.g. retailer portal cookie on localhost) go to login
  // with a clear error so the client can sign them out.
  if (session?.user) {
    redirect("/login?error=unauthorized");
  }
  redirect("/login");
}
