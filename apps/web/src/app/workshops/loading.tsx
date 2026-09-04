import { Loader2 } from "lucide-react";

export default function WorkshopsLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
        <p className="text-xs font-medium text-zinc-500">Loading workspace...</p>
      </div>
    </div>
  );
}
