import { MalView } from '@/components/MalView'

export default function MalPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
        Mål
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Gemensamt månadsmål 2026. Fakturera case och följ progressen.
      </p>
      <MalView />
    </div>
  )
}
