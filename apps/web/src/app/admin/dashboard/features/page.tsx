import { redirect } from "next/navigation";

export default function AdminFeaturesRedirectPage() {
  redirect("/admin/dashboard/plans");
}
