import { WorkCalendar } from '@/components/WorkCalendar'

export default function KalenderPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Arbetstidslogg (svensk tid)
      </h1>
      <p className="text-slate-600 mb-6">
        Klicka på en dag för att logga hur många timmar du arbetat och vad du gjort.
      </p>
      <WorkCalendar />
    </div>
  )
}
