import { redirect } from "next/navigation";

export default function LegacyCreateStorePage() {
  redirect("/dashboard/stores/create");
}
