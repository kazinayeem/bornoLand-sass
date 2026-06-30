"use client";

import { BuilderEditor } from "@/components/builder/builder-editor";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreBuilderDetailPage() {
  const { store, isLoading } = useStorePage();
  if (isLoading || !store) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }
  return <BuilderEditor store={store} />;
}
