import { redirect } from "next/navigation";

export default function AdminStorageRedirectPage() {
  redirect("/admin/dashboard/settings?tab=storage");
}
