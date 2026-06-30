"use client";

import { BuilderEditor } from "@/components/builder/builder-editor";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { Loader2 } from "lucide-react";

export default function StoreBuilderPageEditor() {
  const { store, isLoading } = useStoreFromSlug();

  if (isLoading || !store) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return <BuilderEditor store={store} />;
}
