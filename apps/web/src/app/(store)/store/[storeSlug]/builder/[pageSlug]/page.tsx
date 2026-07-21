import dynamic from "next/dynamic";

const BuilderEditor = dynamic(
  () => import("@/components/builder/builder-editor").then((module) => module.BuilderEditor),
  {
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-apple-canvas-parchment">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    ),
  },
);

export default function StoreBuilderPageEditor() {
  return <BuilderEditor />;
}
