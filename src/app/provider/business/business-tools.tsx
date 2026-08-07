"use client"

import Image from "next/image"
import { useEffect, useState, useTransition } from "react"
import { AlertCircle, ArrowDown, ArrowUp, BriefcaseBusiness, Check, Eye, EyeOff, ImageIcon, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadField } from "@/components/auth/upload-field"
import { cn } from "@/lib/utils"
import { addPortfolioImage, addService, movePortfolioImage, removePortfolioImage, removeService, setServiceActive, updatePortfolioCaption, updateService } from "./actions"

type Service = { id: string; name: string; description: string | null; startingPrice: number | null; active: boolean }
type Portfolio = { id: string; imageUrl: string; caption: string | null }
type Result = { ok: true } | { ok: false; message: string }

const inputClass = "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
const areaClass = "w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"

function ErrorNote({ message, className }: { message: string; className?: string }) {
  if (!message) return null
  return <p className={cn("flex gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive", className)}><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />{message}</p>
}

function EmptyNote({ children }: { children: string }) {
  return <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">{children}</p>
}

/**
 * Two-step delete: the first click arms the button, the second confirms. Disarms
 * itself after a few seconds so a stray click never lingers. `className` carries
 * layout (it applies to both states); `idleClassName` styles only the trash icon.
 */
function ConfirmDelete({ label, onConfirm, disabled, className, idleClassName }: { label: string; onConfirm: () => void; disabled?: boolean; className?: string; idleClassName?: string }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(timer)
  }, [armed])
  if (armed) return <button type="button" disabled={disabled} onClick={() => { setArmed(false); onConfirm() }} className={cn("rounded-lg bg-destructive px-2 py-1 text-xs font-bold text-white disabled:opacity-50", className)}>Remove?</button>
  return <button type="button" aria-label={label} disabled={disabled} onClick={() => setArmed(true)} className={cn(idleClassName ?? "text-muted-foreground hover:text-destructive", "disabled:opacity-50", className)}><Trash2 className="h-4 w-4" /></button>
}

export function BusinessTools({ services, portfolio }: { services: Service[]; portfolio: Portfolio[] }) {
  return <>
    <header className="mt-5">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Store content</p>
      <h1 className="mt-1 text-3xl font-extrabold">Services and portfolio</h1>
      <p className="mt-1 text-sm text-muted-foreground">Show customers exactly what you offer and the quality of your work.</p>
    </header>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <ServiceCatalogue services={services} />
      <PortfolioGallery items={portfolio} />
    </div>
  </>
}

function ServiceCatalogue({ services }: { services: Service[] }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function create() {
    setError("")
    startTransition(async () => {
      const result = await addService({ name, description, startingPrice: price ? Number(price) : null })
      if (!result.ok) return setError(result.message)
      setName(""); setDescription(""); setPrice("")
    })
  }

  return <section className="rounded-3xl border border-border bg-card p-6">
    <div className="flex items-center gap-2">
      <BriefcaseBusiness className="h-5 w-5 text-primary" />
      <h2 className="font-extrabold">Service catalogue</h2>
      <span className="ml-auto text-xs text-muted-foreground">{services.filter((service) => service.active).length} live</span>
    </div>
    <div className="mt-5 space-y-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" maxLength={80} className={inputClass} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={300} placeholder="Short description" className={areaClass} />
      <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Starting price in GH₵ (optional)" className={inputClass} />
      <ErrorNote message={error} />
      {/* A disabled button whose only cue is 50% opacity reads as broken on a
          phone, so say what unlocks it rather than leaving it greyed in silence. */}
      {name.trim().length < 2 && <p className="text-xs text-muted-foreground">Enter a service name to add it to your catalogue.</p>}
      <Button className="h-11 w-full rounded-xl" disabled={pending || name.trim().length < 2} onClick={create}>{pending ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}Add service</Button>
    </div>
    <div className="mt-5 space-y-2">
      {services.length === 0
        ? <EmptyNote>No services yet. Customers browsing your store see this list first.</EmptyNote>
        : services.map((service) => <ServiceRow key={service.id} service={service} />)}
    </div>
  </section>
}

function ServiceRow({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(service.name)
  const [description, setDescription] = useState(service.description ?? "")
  const [price, setPrice] = useState(service.startingPrice?.toString() ?? "")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function run(action: () => Promise<Result>, onDone?: () => void) {
    setError("")
    startTransition(async () => {
      const result = await action()
      if (!result.ok) return setError(result.message)
      onDone?.()
    })
  }
  function cancel() { setName(service.name); setDescription(service.description ?? ""); setPrice(service.startingPrice?.toString() ?? ""); setError(""); setEditing(false) }

  if (editing) return <div className="space-y-2 rounded-2xl border border-primary/40 bg-accent/30 p-4">
    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label="Service name" className={inputClass} />
    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={300} aria-label="Service description" className={areaClass} />
    <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Starting price in GH₵ (optional)" aria-label="Starting price" className={inputClass} />
    <ErrorNote message={error} />
    <div className="flex gap-2">
      <Button size="sm" className="flex-1 rounded-lg" disabled={pending || name.trim().length < 2} onClick={() => run(() => updateService({ id: service.id, name, description, startingPrice: price ? Number(price) : null }), () => setEditing(false))}>{pending ? <Loader2 className="animate-spin" /> : <Check className="h-3.5 w-3.5" />}Save</Button>
      <Button size="sm" variant="outline" className="rounded-lg" disabled={pending} onClick={cancel}><X className="h-3.5 w-3.5" />Cancel</Button>
    </div>
  </div>

  return <div className={`rounded-2xl bg-muted/40 p-4 ${service.active ? "" : "opacity-70"}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-bold">
          <span className="truncate">{service.name}</span>
          {!service.active && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Paused</span>}
        </p>
        {service.description && <p className="mt-1 text-xs text-muted-foreground">{service.description}</p>}
        {service.startingPrice && <p className="mt-2 text-xs font-bold text-primary">From GH₵{service.startingPrice.toLocaleString()}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <button type="button" aria-label={service.active ? `Pause ${service.name}` : `Publish ${service.name}`} title={service.active ? "Hide from customers" : "Show to customers"} disabled={pending} onClick={() => run(() => setServiceActive(service.id, !service.active))} className="text-muted-foreground hover:text-foreground disabled:opacity-50">{service.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
        <button type="button" aria-label={`Edit ${service.name}`} disabled={pending} onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground disabled:opacity-50"><Pencil className="h-4 w-4" /></button>
        <ConfirmDelete label={`Remove ${service.name}`} disabled={pending} onConfirm={() => run(() => removeService(service.id))} />
      </div>
    </div>
    <ErrorNote message={error} className="mt-3" />
  </div>
}

function PortfolioGallery({ items }: { items: Portfolio[] }) {
  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function create() {
    setError("")
    startTransition(async () => {
      const result = await addPortfolioImage({ imageUrl, caption })
      if (!result.ok) return setError(result.message)
      setImageUrl(""); setCaption("")
    })
  }

  return <section className="rounded-3xl border border-border bg-card p-6">
    <div className="flex items-center gap-2">
      <ImageIcon className="h-5 w-5 text-primary" />
      <h2 className="font-extrabold">Work portfolio</h2>
      <span className="ml-auto text-xs text-muted-foreground">{items.length} photo{items.length === 1 ? "" : "s"}</span>
    </div>
    <div className="mt-5">
      <UploadField label="Upload a completed project photo" value={imageUrl} onChange={setImageUrl} />
      <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} placeholder="Caption (optional)" className={`mt-3 ${inputClass}`} />
      <ErrorNote message={error} className="mt-3" />
      {!imageUrl && <p className="mt-3 text-xs text-muted-foreground">Upload a photo to add it to your portfolio.</p>}
      <Button className="mt-3 h-11 w-full rounded-xl" disabled={pending || !imageUrl} onClick={create}>{pending ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}Add to portfolio</Button>
    </div>
    {items.length > 0 && <p className="mt-5 text-xs text-muted-foreground">First photo leads your public gallery — use the arrows to order your best work.</p>}
    <div className="mt-3 grid grid-cols-2 gap-3">
      {items.map((item, index) => <PortfolioTile key={item.id} item={item} isFirst={index === 0} isLast={index === items.length - 1} />)}
    </div>
    {items.length === 0 && <div className="mt-5"><EmptyNote>No photos yet. Completed work is the strongest signal customers look for.</EmptyNote></div>}
  </section>
}

function PortfolioTile({ item, isFirst, isLast }: { item: Portfolio; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false)
  const [caption, setCaption] = useState(item.caption ?? "")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function run(action: () => Promise<Result>, onDone?: () => void) {
    setError("")
    startTransition(async () => {
      const result = await action()
      if (!result.ok) return setError(result.message)
      onDone?.()
    })
  }

  return <div className="overflow-hidden rounded-2xl border border-border">
    <div className="relative aspect-square">
      <Image src={item.imageUrl} alt={item.caption ?? "Portfolio work"} fill sizes="240px" className="object-cover" />
      {pending && <span className="absolute inset-0 flex items-center justify-center bg-black/40"><Loader2 className="h-5 w-5 animate-spin text-white" /></span>}
      <ConfirmDelete label="Remove photo" disabled={pending} onConfirm={() => run(() => removePortfolioImage(item.id))} className="absolute right-2 top-2" idleClassName="rounded-full bg-black/60 p-2 text-white" />
      <div className="absolute left-2 top-2 flex gap-1">
        <button type="button" aria-label="Move photo earlier" disabled={pending || isFirst} onClick={() => run(() => movePortfolioImage(item.id, "up"))} className="rounded-full bg-black/60 p-2 text-white disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
        <button type="button" aria-label="Move photo later" disabled={pending || isLast} onClick={() => run(() => movePortfolioImage(item.id, "down"))} className="rounded-full bg-black/60 p-2 text-white disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
      </div>
    </div>
    <div className="p-2">
      {editing
        ? <div className="space-y-2">
            <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} aria-label="Photo caption" placeholder="Caption" className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary" />
            <div className="flex gap-1">
              <Button size="xs" className="flex-1 rounded-md" disabled={pending} onClick={() => run(() => updatePortfolioCaption({ id: item.id, caption }), () => setEditing(false))}>Save</Button>
              <Button size="xs" variant="outline" className="rounded-md" disabled={pending} onClick={() => { setCaption(item.caption ?? ""); setError(""); setEditing(false) }}>Cancel</Button>
            </div>
          </div>
        : <button type="button" onClick={() => setEditing(true)} className="flex w-full items-center gap-1.5 text-left text-xs text-muted-foreground hover:text-foreground">
            <Pencil className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.caption || "Add a caption"}</span>
          </button>}
      <ErrorNote message={error} className="mt-2" />
    </div>
  </div>
}
