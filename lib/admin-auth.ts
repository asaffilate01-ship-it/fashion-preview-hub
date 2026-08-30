import { headers } from "next/headers";
import { chatGPTSignInPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { redirect } from "next/navigation";

export type AdminIdentity = { email: string; displayName: string };

function allowed(email: string) {
  const configured = (process.env.ADMIN_EMAILS || "hello@kalethon.com").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return configured.includes(email.toLowerCase());
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const requestHeaders = await headers();
  const email = requestHeaders.get("cf-access-authenticated-user-email") ?? requestHeaders.get("oai-authenticated-user-email");
  if (!email || !allowed(email)) return null;
  return { email, displayName: email.split("@")[0] || "Administrator" };
}

export async function requireAdminPage(returnTo = "/admin") {
  const platformIdentity = await getAdminIdentity();
  if (platformIdentity) return platformIdentity;

  const user = await requireChatGPTUser(returnTo);
  if (!allowed(user.email)) redirect("/");
  return { email: user.email, displayName: user.displayName };
}

export function adminSignInPath() {
  return chatGPTSignInPath("/admin");
}
