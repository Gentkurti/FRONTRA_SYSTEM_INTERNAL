import { EventsCalendar } from '@/components/EventsCalendar'

export default function SchemaPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Schema / Möten
      </h1>
      <p className="text-slate-600 mb-6">
        Lägg till möten och händelser. Klicka på en dag eller &quot;Lägg till möte/händelse&quot; för att skapa en ny.
      </p>
      <EventsCalendar />
    </div>
  )
}
