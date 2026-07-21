"use client";

import dynamic from "next/dynamic";
import { BuilderLoadingScreen } from "@/components/builder/builder-loading-screen";

const BuilderEditor = dynamic(
  () => import("@/components/builder/builder-editor").then((module) => module.BuilderEditor),
  {
    ssr: false,
    loading: () => <BuilderLoadingScreen message="Loading sections…" />,
  },
);

export default function BuilderEditorPage() {
  return <BuilderEditor />;
}
