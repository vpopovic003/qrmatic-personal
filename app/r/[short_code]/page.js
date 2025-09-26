import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { headers } from "next/headers";

export default async function RedirectPage({ params }) {
  const { short_code } = await params;
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";

  const supabase = createClient();

  // Look up the QR code
  const { data: qrCode, error } = await supabase
    .from("qrcodes")
    .select("id, target_url, type")
    .eq("short_code", short_code)
    .single();

  // If QR code not found or error, show 404
  if (error || !qrCode) {
    notFound();
  }

  // Only handle dynamic QR codes through redirect
  // Static QR codes should point directly to their target URLs
  if (qrCode.type !== "dynamic") {
    notFound();
  }

  // Log the scan asynchronously (don't await to avoid slowing redirect)
  supabase
    .from("scan_logs")
    .insert({
      qrcode_id: qrCode.id,
      scanned_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .then(() => {
      // Scan logged successfully
    })
    .catch((err) => {
      // Log error but don't fail the redirect
      console.error("Failed to log scan:", err);
    });

  // Redirect to target URL
  redirect(qrCode.target_url);
}
