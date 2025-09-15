import { StudentRegistrationForm } from "@/components/student-registration-form"
import { TpqInfo } from "@/components/tpq-info"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Pendaftaran Santri Baru</h1>
              <h2 className="text-xl font-semibold text-foreground">TPQ Nur Islam Tarakan</h2>
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-muted-foreground">Silakan lengkapi formulir pendaftaran dengan data yang benar</p>
              <TpqInfo />
            </div>
          </div>
          <StudentRegistrationForm />
        </div>
      </div>
    </div>
  )
}