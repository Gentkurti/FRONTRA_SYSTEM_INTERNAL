import { ChecklistView } from '@/components/ChecklistView'

export default function ChecklistPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-5">
      <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-8">Checklista</h1>
      <ChecklistView />
    </div>
  )
}
