"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { UploadCloud, Loader2, Check, X } from "lucide-react"

type UploadFieldProps = {
  label: string
  value: string
  onChange: (url: string) => void
}

/**
 * Signs an upload with our API, then sends the file directly to Cloudinary
 * (the bytes never touch our server). Shows a thumbnail when done.
 */
export function UploadField({ label, value, onChange }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleFile(file: File) {
    setError("")
    setUploading(true)
    try {
      const signRes = await fetch("/api/uploads/sign", { method: "POST" })
      if (!signRes.ok) throw new Error("Could not start upload")
      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json()

      const body = new FormData()
      body.append("file", file)
      body.append("api_key", apiKey)
      body.append("timestamp", String(timestamp))
      body.append("signature", signature)
      body.append("folder", folder)

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body }
      )
      if (!upRes.ok) throw new Error("Upload failed")
      const data = await upRes.json()
      onChange(data.secure_url as string)
    } catch {
      setError("Upload failed. Try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>

      {value ? (
        <div className="relative flex items-center gap-3 rounded-xl border border-primary/40 bg-accent/40 p-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-muted">
            <Image src={value} alt={label} fill sizes="56px" className="object-cover" />
          </div>
          <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Check className="h-4 w-4" /> Uploaded
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove"
            className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-background px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
          {uploading ? "Uploading…" : "Click to upload an image"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}
