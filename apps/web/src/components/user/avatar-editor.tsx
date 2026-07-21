"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useRemoveAvatarMutation, useUploadAvatarMutation } from "@/redux/api/profile-api";

export function AvatarEditor({ avatarUrl, name }: { avatarUrl: string; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [fileName, setFileName] = useState("avatar.jpg");
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [upload, { isLoading }] = useUploadAvatarMutation();
  const [remove, { isLoading: removing }] = useRemoveAvatarMutation();

  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);

  const choose = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Choose a JPG, PNG, or WebP image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be smaller than 5 MB"); return; }
    if (source) URL.revokeObjectURL(source);
    setSource(URL.createObjectURL(file)); setFileName(file.name); setZoom(1); setPositionX(50); setPositionY(50);
  };

  const createCrop = async () => {
    if (!source) return;
    const image = new Image(); image.src = source; await image.decode();
    const base = Math.min(image.naturalWidth, image.naturalHeight);
    const cropSize = base / zoom;
    const maxX = image.naturalWidth - cropSize; const maxY = image.naturalHeight - cropSize;
    const sx = maxX * (positionX / 100); const sy = maxY * (positionY / 100);
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 512;
    canvas.getContext("2d")?.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, 512, 512);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .9));
    if (!blob) throw new Error("Crop failed");
    const form = new FormData(); form.append("avatar", blob, fileName.replace(/\.[^.]+$/, "") + ".webp");
    await upload(form).unwrap(); toast.success("Profile photo updated"); setSource(null);
  };

  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
  return <>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-700 to-zinc-950 text-white shadow-lg">
        {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover"/> : <span className="flex h-full w-full items-center justify-center text-2xl font-semibold">{initials}</span>}
        <button type="button" onClick={() => inputRef.current?.click()} className="absolute inset-x-0 bottom-0 flex h-8 items-center justify-center bg-black/55 text-white backdrop-blur-sm" aria-label="Replace photo"><Camera className="h-4 w-4"/></button>
      </div>
      <div><p className="text-sm font-semibold text-apple-ink">Profile photo</p><p className="mt-1 max-w-md text-xs leading-5 text-apple-ink-muted-48">JPG, PNG, or WebP. Up to 5 MB and at least 128 × 128 pixels.</p>
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-xl bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"><Upload className="h-3.5 w-3.5"/>{avatarUrl ? "Replace" : "Upload"}</button>
        {avatarUrl && <button type="button" disabled={removing} onClick={async () => { try { await remove().unwrap(); toast.success("Profile photo removed"); } catch { toast.error("Could not remove photo"); } }} className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50">{removing ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5"/>}Remove</button>}</div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { choose(event.target.files?.[0]); event.currentTarget.value = ""; }}/>
    </div>
    {source && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Crop profile photo"><div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl">
      <div className="flex items-center justify-between"><div><h2 className="font-semibold text-apple-ink">Crop photo</h2><p className="text-xs text-apple-ink-muted-48">Adjust the framing before uploading.</p></div><button type="button" onClick={() => setSource(null)} className="rounded-xl p-2 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"><X className="h-4 w-4"/></button></div>
      <div className="mx-auto mt-5 h-64 w-64 overflow-hidden rounded-full bg-zinc-100 ring-4 ring-zinc-100"><img src={source} alt="Crop preview" className="h-full w-full object-cover" style={{ transform: `scale(${zoom})`, objectPosition: `${positionX}% ${positionY}%` }}/></div>
      <div className="mt-5 space-y-3">{[["Zoom", zoom, 1, 3, .05, setZoom], ["Horizontal", positionX, 0, 100, 1, setPositionX], ["Vertical", positionY, 0, 100, 1, setPositionY]].map(([label, value, min, max, step, setter]) => <label key={String(label)} className="grid grid-cols-[72px_1fr] items-center gap-3 text-xs font-medium text-apple-ink-muted-80"><span>{String(label)}</span><input type="range" value={Number(value)} min={Number(min)} max={Number(max)} step={Number(step)} onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))} className="accent-zinc-900"/></label>)}</div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setSource(null)} className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-apple-ink-muted-80">Cancel</button><button type="button" disabled={isLoading} onClick={async () => { try { await createCrop(); } catch { toast.error("Could not upload photo"); } }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white">{isLoading && <Loader2 className="h-4 w-4 animate-spin"/>}Save photo</button></div>
    </div></div>}
  </>;
}
