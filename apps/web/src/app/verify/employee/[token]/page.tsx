import type { Metadata } from "next";
import { EmployeeVerifyClient } from "./client";
import type { PublicEmployeeVerification } from "@/redux/api/hrm-api";

type Props = { params: Promise<{ token: string }> };

type ApiResponse = {
  success?: boolean;
  data?: PublicEmployeeVerification;
  message?: string;
};

async function fetchVerification(token: string): Promise<PublicEmployeeVerification | null> {
  const apiBase =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

  try {
    const res = await fetch(`${apiBase}/public/employee/verify/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse;
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await fetchVerification(token);
  if (!data) {
    return {
      title: "Employee Verification — BornoLand",
      description: "Verify BornoLand official employee identification",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Verified Staff: ${data.employee.fullName} — ${data.store.name}`,
    description: `Official staff identity verification for ${data.employee.fullName} (${data.employee.designation}) at ${data.store.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function EmployeeVerifyPage({ params }: Props) {
  const { token } = await params;
  const data = await fetchVerification(token);

  return <EmployeeVerifyClient data={data} token={token} />;
}
