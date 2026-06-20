export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <main className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
