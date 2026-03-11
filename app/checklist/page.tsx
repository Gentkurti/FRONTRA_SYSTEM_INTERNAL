import { ChecklistView } from '@/components/ChecklistView'

export default function ChecklistPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Checklista</h1>
      <ChecklistView />
    </div>
  )
}
