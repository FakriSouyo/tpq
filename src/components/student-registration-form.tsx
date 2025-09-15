"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { StudentBiodataForm } from "@/components/forms/student-biodata-form"
import { ParentInfoForm } from "@/components/forms/parent-info-form"
import { SchoolInfoForm } from "@/components/forms/school-info-form"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  // Student data
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nama_panggilan: z.string().min(1, "Nama panggilan wajib diisi"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin wajib dipilih"),
  tempat_lahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat_rumah: z.string().min(1, "Alamat rumah wajib diisi"),
  anak_ke: z.number().min(1, "Anak ke wajib diisi"),
  jumlah_saudara: z.number().min(0, "Jumlah saudara tidak boleh negatif"),
  golongan_darah: z.string().optional(),
  penyakit_pernah: z.string().optional(),
  
  // Father data
  nama_ayah: z.string().min(1, "Nama ayah wajib diisi"),
  tempat_lahir_ayah: z.string().min(1, "Tempat lahir ayah wajib diisi"),
  tanggal_lahir_ayah: z.string().min(1, "Tanggal lahir ayah wajib diisi"),
  suku_ayah: z.string().min(1, "Suku ayah wajib diisi"),
  pendidikan_ayah: z.string().min(1, "Pendidikan ayah wajib diisi"),
  pekerjaan_ayah: z.string().min(1, "Pekerjaan ayah wajib diisi"),
  alamat_ayah: z.string().min(1, "Alamat ayah wajib diisi"),
  hp_ayah: z.string().min(1, "No HP ayah wajib diisi"),
  
  // Mother data
  nama_ibu: z.string().min(1, "Nama ibu wajib diisi"),
  tempat_lahir_ibu: z.string().min(1, "Tempat lahir ibu wajib diisi"),
  tanggal_lahir_ibu: z.string().min(1, "Tanggal lahir ibu wajib diisi"),
  suku_ibu: z.string().min(1, "Suku ibu wajib diisi"),
  pendidikan_ibu: z.string().min(1, "Pendidikan ibu wajib diisi"),
  pekerjaan_ibu: z.string().min(1, "Pekerjaan ibu wajib diisi"),
  alamat_ibu: z.string().min(1, "Alamat ibu wajib diisi"),
  hp_ibu: z.string().min(1, "No HP ibu wajib diisi"),
  
  // School data
  status_masuk: z.string().min(1, "Status masuk wajib dipilih"),
  nama_tpq_sebelum: z.string().optional(),
  tanggal_pindah: z.string().optional(),
  kelompok_belajar: z.string().min(1, "Kelompok belajar wajib dipilih"),
  tingkat_pembelajaran: z.string().optional(),
  juz_alquran: z.number().optional(),
  
  // File uploads
  foto_akte: z.any().optional(),
  foto_kk: z.any().optional(),
  foto_3x4: z.any().optional(),
  foto_2x4: z.any().optional(),
})

const steps = [
  {
    id: 1,
    title: "Biodata Siswa",
    description: "Data pribadi calon santri",
  },
  {
    id: 2,
    title: "Data Orang Tua",
    description: "Informasi ayah dan ibu",
  },
  {
    id: 3,
    title: "Asal Sekolah",
    description: "Riwayat pendidikan sebelumnya",
  },
]

export function StudentRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_lengkap: "",
      nama_panggilan: "",
      jenis_kelamin: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      alamat_rumah: "",
      anak_ke: 1,
      jumlah_saudara: 0,
      golongan_darah: "",
      penyakit_pernah: "",
      nama_ayah: "",
      tempat_lahir_ayah: "",
      tanggal_lahir_ayah: "",
      suku_ayah: "",
      pendidikan_ayah: "",
      pekerjaan_ayah: "",
      alamat_ayah: "",
      hp_ayah: "",
      nama_ibu: "",
      tempat_lahir_ibu: "",
      tanggal_lahir_ibu: "",
      suku_ibu: "",
      pendidikan_ibu: "",
      pekerjaan_ibu: "",
      alamat_ibu: "",
      hp_ibu: "",
      status_masuk: "",
      nama_tpq_sebelum: "",
      tanggal_pindah: "",
      kelompok_belajar: "",
      tingkat_pembelajaran: "",
      juz_alquran: 0,
    },
  })

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  // Watch form values for real-time validation
  const watchedValues = form.watch()

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Validation for each step
  const validateCurrentStep = () => {
    const values = watchedValues
    
    switch (currentStep) {
      case 1: // Biodata Siswa
        return !!(
          values.nama_lengkap &&
          values.nama_panggilan &&
          values.jenis_kelamin &&
          values.tempat_lahir &&
          values.tanggal_lahir &&
          values.anak_ke &&
          values.jumlah_saudara !== undefined &&
          values.alamat_rumah
        )
      case 2: // Data Orang Tua
        return !!(
          values.nama_ayah &&
          values.tempat_lahir_ayah &&
          values.tanggal_lahir_ayah &&
          values.suku_ayah &&
          values.pendidikan_ayah &&
          values.pekerjaan_ayah &&
          values.alamat_ayah &&
          values.hp_ayah &&
          values.nama_ibu &&
          values.tempat_lahir_ibu &&
          values.tanggal_lahir_ibu &&
          values.suku_ibu &&
          values.pendidikan_ibu &&
          values.pekerjaan_ibu &&
          values.alamat_ibu &&
          values.hp_ibu
        )
      case 3: // Asal Sekolah
        const basicValid = !!(values.status_masuk && values.kelompok_belajar)
        if (values.status_masuk === "Santri Pindahan") {
          return basicValid && !!(values.nama_tpq_sebelum && values.tanggal_pindah)
        }
        return basicValid
      default:
        return false
    }
  }

  // File upload helper function
  const uploadFile = async (file: File, path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file)
      
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    try {
      // Upload files first if they exist
      let foto_akte_url = null
      let foto_kk_url = null
      let foto_3x4_url = null
      let foto_2x4_url = null

      if (values.foto_akte) {
        foto_akte_url = await uploadFile(values.foto_akte, `akte/${Date.now()}-${values.foto_akte.name}`)
      }
      if (values.foto_kk) {
        foto_kk_url = await uploadFile(values.foto_kk, `kk/${Date.now()}-${values.foto_kk.name}`)
      }
      if (values.foto_3x4) {
        foto_3x4_url = await uploadFile(values.foto_3x4, `foto3x4/${Date.now()}-${values.foto_3x4.name}`)
      }
      if (values.foto_2x4) {
        foto_2x4_url = await uploadFile(values.foto_2x4, `foto2x4/${Date.now()}-${values.foto_2x4.name}`)
      }

      // Prepare data for database
      const dataToInsert = {
        // Biodata Santri
        nama_lengkap: values.nama_lengkap,
        nama_panggilan: values.nama_panggilan,
        jenis_kelamin: values.jenis_kelamin,
        tempat_lahir: values.tempat_lahir,
        tanggal_lahir: values.tanggal_lahir,
        alamat_rumah: values.alamat_rumah,
        anak_ke: values.anak_ke,
        jumlah_saudara: values.jumlah_saudara,
        golongan_darah: values.golongan_darah || null,
        penyakit_pernah: values.penyakit_pernah || null,

        // Biodata Ayah
        nama_ayah: values.nama_ayah,
        tempat_lahir_ayah: values.tempat_lahir_ayah,
        tanggal_lahir_ayah: values.tanggal_lahir_ayah,
        suku_ayah: values.suku_ayah,
        pendidikan_ayah: values.pendidikan_ayah,
        pekerjaan_ayah: values.pekerjaan_ayah,
        alamat_ayah: values.alamat_ayah,
        hp_ayah: values.hp_ayah,

        // Biodata Ibu
        nama_ibu: values.nama_ibu,
        tempat_lahir_ibu: values.tempat_lahir_ibu,
        tanggal_lahir_ibu: values.tanggal_lahir_ibu,
        suku_ibu: values.suku_ibu,
        pendidikan_ibu: values.pendidikan_ibu,
        pekerjaan_ibu: values.pekerjaan_ibu,
        alamat_ibu: values.alamat_ibu,
        hp_ibu: values.hp_ibu,

        // Asal Sekolah
        status_masuk: values.status_masuk,
        nama_tpq_sebelum: values.status_masuk === "Santri Pindahan" ? values.nama_tpq_sebelum : null,
        tanggal_pindah: values.status_masuk === "Santri Pindahan" ? values.tanggal_pindah : null,
        kelompok_belajar: values.kelompok_belajar,
        tingkat_pembelajaran: values.tingkat_pembelajaran || null,
        juz_alquran: values.kelompok_belajar === 'Al-Quran' ? values.juz_alquran : null,

        // File URLs
        foto_akte: foto_akte_url,
        foto_kk: foto_kk_url,
        foto_3x4: foto_3x4_url,
        foto_2x4: foto_2x4_url
      }

      // Insert to database
      const { error } = await supabase
        .from('pendaftar_santri')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) throw error

      // Show success page
      setIsSubmitted(true)

    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    form.reset()
    setCurrentStep(1)
  }

  const handleWhatsApp = () => {
    const message = "Halo, saya ingin bertanya tentang pendaftaran santri TPQ"
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  // Success Page
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-8">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          
          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              Berhasil! 🎉
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Pendaftaran Anda telah dikirim.<br />
              Kami akan menghubungi via WhatsApp dalam 1x24 jam.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
            >
              💬 Hubungi WhatsApp
            </Button>
            
            <Button 
              onClick={resetForm}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Daftar Lagi
            </Button>
          </div>

          {/* Minimal Contact */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📞 081227787685 • 📧 tpqnurislamtarakan@gmail.com</p>
                  <p>📍 Jl. Mulawarman No. 45, Tarakan Timur, Kalimantan Utara</p>
                </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StudentBiodataForm form={form} />
      case 2:
        return <ParentInfoForm form={form} />
      case 3:
        return <SchoolInfoForm form={form} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Toggle */}
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Langkah {currentStep} dari {steps.length}
          </span>
          <span>{Math.round(progress)}% selesai</span>
        </div>
        <div className="bg-muted/50 rounded-full p-1">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col items-center space-y-2 ${
              step.id <= currentStep ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                step.id < currentStep
                  ? "bg-primary text-primary-foreground border-primary"
                  : step.id === currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border"
              }`}
            >
              {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Sebelumnya
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep === steps.length ? (
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? "Menyimpan..." : "Kirim Pendaftaran"}
                    <Check className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!validateCurrentStep()}
                    className="flex items-center gap-2"
                  >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
