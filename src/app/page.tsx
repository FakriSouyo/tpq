"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, User, Users, GraduationCap, CalendarIcon, AlertCircle, Upload } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { createClient } from '@supabase/supabase-js'

interface FormData {
  // Biodata Santri
  namaLengkap: string
  namaPanggilan: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: Date | undefined
  alamatRumah: string
  anakKe: string
  jumlahSaudara: string
  golonganDarah: string
  penyakitPernah: string
  asalSekolah: string

  // Biodata Ayah
  namaAyah: string
  tempatLahirAyah: string
  tanggalLahirAyah: Date | undefined
  sukuAyah: string
  pendidikanAyah: string
  pekerjaanAyah: string
  alamatAyah: string
  hpAyah: string

  // Biodata Ibu
  namaIbu: string
  tempatLahirIbu: string
  tanggalLahirIbu: Date | undefined
  sukuIbu: string
  pendidikanIbu: string
  pekerjaanIbu: string
  alamatIbu: string
  hpIbu: string

  // Asal Sekolah
  statusMasuk: string
  namaTpqSebelum: string
  tanggalPindah: Date | undefined
  kelompokBelajar: string

  // New fields
  juzAlquran?: number
  fotoAkte?: File
  fotoKK?: File
  foto3x4?: File
  foto2x4?: File
}

interface BiayaItem {
  id: string
  nama_biaya: string
  jumlah: number
}

// Buat client Supabase untuk public access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // Karena ini form publik, tidak perlu persist session
  }
})

export default function PendaftaranPage() {
  const [formData, setFormData] = useState<FormData>({
    namaLengkap: "",
    namaPanggilan: "",
    jenisKelamin: "",
    tempatLahir: "",
    tanggalLahir: undefined,
    alamatRumah: "",
    anakKe: "",
    jumlahSaudara: "",
    golonganDarah: "",
    penyakitPernah: "",
    asalSekolah: "",
    namaAyah: "",
    tempatLahirAyah: "",
    tanggalLahirAyah: undefined,
    sukuAyah: "",
    pendidikanAyah: "",
    pekerjaanAyah: "",
    alamatAyah: "",
    hpAyah: "",
    namaIbu: "",
    tempatLahirIbu: "",
    tanggalLahirIbu: undefined,
    sukuIbu: "",
    pendidikanIbu: "",
    pekerjaanIbu: "",
    alamatIbu: "",
    hpIbu: "",
    statusMasuk: "",
    namaTpqSebelum: "",
    tanggalPindah: undefined,
    kelompokBelajar: "",
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [biayaList, setBiayaList] = useState<BiayaItem[]>([])
  const [totalBiaya, setTotalBiaya] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<{
    akte?: File
    kk?: File
    foto3x4?: File
    foto2x4?: File
  }>({})

  useEffect(() => {
    // Load daftar biaya
    const loadBiaya = async () => {
      const { data, error } = await supabase
        .from('biaya_pendaftaran')
        .select('*')
      
      if (data) {
        setBiayaList(data)
        calculateTotalBiaya(formData.kelompokBelajar, data)
      }
    }

    loadBiaya()
  }, [])

  const calculateTotalBiaya = (kelompokBelajar: string, biayaItems: BiayaItem[]) => {
    let total = 0
    const isAlQuran = kelompokBelajar === 'Al-Quran'

    biayaItems.forEach(item => {
      if (item.nama_biaya === 'Buku Prestasi Iqro' && isAlQuran) {
        return // Skip for Al-Quran
      }
      if (item.nama_biaya === 'Buku Prestasi Al-Quran' && !isAlQuran) {
        return // Skip for Iqro
      }
      if (item.nama_biaya === 'Buku Iqro' && isAlQuran) {
        return // Skip Buku Iqro for Al-Quran
      }
      total += item.jumlah
    })

    setTotalBiaya(total)
  }

  const handleFileUpload = (type: 'akte' | 'kk' | 'foto3x4' | 'foto2x4', file: File | undefined) => {
    if (!file) return
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }))
  }

  const uploadFile = async (file: File, path: string) => {
    try {
      // Create folder if it doesn't exist
      const folderPath = path.split('/')[0]
      try {
        await supabase.storage.from('documents').list(folderPath)
      } catch (error) {
        console.log(`Creating folder: ${folderPath}`)
      }

      // Upload file
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file)
      
      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateSection = (sectionIndex: number): boolean => {
    switch (sectionIndex) {
      case 0: // Biodata Santri
        return !!(
          formData.namaLengkap &&
          formData.namaPanggilan &&
          formData.jenisKelamin &&
          formData.tempatLahir &&
          formData.tanggalLahir &&
          formData.alamatRumah &&
          formData.anakKe &&
          formData.jumlahSaudara &&
          formData.golonganDarah &&
          formData.asalSekolah
        )
      case 1: // Biodata Orangtua
        return !!(
          formData.namaAyah &&
          formData.tempatLahirAyah &&
          formData.tanggalLahirAyah &&
          formData.sukuAyah &&
          formData.pendidikanAyah &&
          formData.pekerjaanAyah &&
          formData.alamatAyah &&
          formData.hpAyah &&
          formData.namaIbu &&
          formData.tempatLahirIbu &&
          formData.tanggalLahirIbu &&
          formData.sukuIbu &&
          formData.pendidikanIbu &&
          formData.pekerjaanIbu &&
          formData.alamatIbu &&
          formData.hpIbu
        )
      case 2: // Asal Sekolah
        const basicFields = !!(formData.statusMasuk && formData.kelompokBelajar)
        if (formData.statusMasuk === "Santri Pindahan") {
          return basicFields && !!(formData.namaTpqSebelum && formData.tanggalPindah)
        }
        return basicFields
      default:
        return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate required dates
      if (!formData.tanggalLahir || !formData.tanggalLahirAyah || !formData.tanggalLahirIbu) {
        throw new Error('Semua tanggal harus diisi')
      }

      // Validate required files
      if (!uploadedFiles.akte || !uploadedFiles.kk || !uploadedFiles.foto3x4 || !uploadedFiles.foto2x4) {
        throw new Error('Semua file harus diupload')
      }

      // Upload files first
      const [akteUrl, kkUrl, foto3x4Url, foto2x4Url] = await Promise.all([
        uploadFile(uploadedFiles.akte, `akte/${Date.now()}-${uploadedFiles.akte.name}`),
        uploadFile(uploadedFiles.kk, `kk/${Date.now()}-${uploadedFiles.kk.name}`),
        uploadFile(uploadedFiles.foto3x4, `foto3x4/${Date.now()}-${uploadedFiles.foto3x4.name}`),
        uploadFile(uploadedFiles.foto2x4, `foto2x4/${Date.now()}-${uploadedFiles.foto2x4.name}`)
      ])

      // Prepare data
      const dataToInsert = {
        // Biodata Santri
        nama_lengkap: formData.namaLengkap,
        nama_panggilan: formData.namaPanggilan,
        jenis_kelamin: formData.jenisKelamin,
        tempat_lahir: formData.tempatLahir,
        tanggal_lahir: formData.tanggalLahir.toISOString().split('T')[0],
        alamat_rumah: formData.alamatRumah,
        anak_ke: parseInt(formData.anakKe),
        jumlah_saudara: parseInt(formData.jumlahSaudara),
        golongan_darah: formData.golonganDarah || null,
        penyakit_pernah: formData.penyakitPernah || null,
        asal_sekolah: formData.asalSekolah,

        // Biodata Ayah
        nama_ayah: formData.namaAyah,
        tempat_lahir_ayah: formData.tempatLahirAyah,
        tanggal_lahir_ayah: formData.tanggalLahirAyah.toISOString().split('T')[0],
        suku_ayah: formData.sukuAyah,
        pendidikan_ayah: formData.pendidikanAyah,
        pekerjaan_ayah: formData.pekerjaanAyah,
        alamat_ayah: formData.alamatAyah,
        hp_ayah: formData.hpAyah,

        // Biodata Ibu
        nama_ibu: formData.namaIbu,
        tempat_lahir_ibu: formData.tempatLahirIbu,
        tanggal_lahir_ibu: formData.tanggalLahirIbu.toISOString().split('T')[0],
        suku_ibu: formData.sukuIbu,
        pendidikan_ibu: formData.pendidikanIbu,
        pekerjaan_ibu: formData.pekerjaanIbu,
        alamat_ibu: formData.alamatIbu,
        hp_ibu: formData.hpIbu,

        // Asal Sekolah
        status_masuk: formData.statusMasuk,
        nama_tpq_sebelum: formData.statusMasuk === "Santri Pindahan" ? formData.namaTpqSebelum : null,
        tanggal_pindah: formData.statusMasuk === "Santri Pindahan" && formData.tanggalPindah 
          ? formData.tanggalPindah.toISOString().split('T')[0] 
          : null,
        kelompok_belajar: formData.kelompokBelajar,

        // New fields
        juz_alquran: formData.kelompokBelajar === 'Al-Quran' ? formData.juzAlquran : null,
        foto_akte: akteUrl,
        foto_kk: kkUrl,
        foto_3x4: foto3x4Url,
        foto_2x4: foto2x4Url
      }

      // Insert pendaftar
      const { data: pendaftarData, error: pendaftarError } = await supabase
        .from('pendaftar_santri')
        .insert(dataToInsert)
        .select()
        .single()

      if (pendaftarError) throw pendaftarError

      // Insert pembayaran
      const detailBiaya = biayaList
        .filter(item => {
          if (item.nama_biaya === 'Buku Prestasi Iqro' && formData.kelompokBelajar === 'Al-Quran') {
            return false
          }
          if (item.nama_biaya === 'Buku Prestasi Al-Quran' && formData.kelompokBelajar !== 'Al-Quran') {
            return false
          }
          if (item.nama_biaya === 'Buku Iqro' && formData.kelompokBelajar === 'Al-Quran') {
            return false
          }
          return true
        })
        .map(item => ({
          nama_biaya: item.nama_biaya,
          jumlah: item.jumlah
        }))

      const { error: pembayaranError } = await supabase
        .from('pembayaran')
        .insert({
          pendaftar_id: pendaftarData.id,
          total_biaya: totalBiaya,
          detail_biaya: detailBiaya
        })

      if (pembayaranError) throw pembayaranError

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setError(null)
    setFormData({
      namaLengkap: "",
      namaPanggilan: "",
      jenisKelamin: "",
      tempatLahir: "",
      tanggalLahir: undefined,
      alamatRumah: "",
      anakKe: "",
      jumlahSaudara: "",
      golonganDarah: "",
      penyakitPernah: "",
      asalSekolah: "",
      namaAyah: "",
      tempatLahirAyah: "",
      tanggalLahirAyah: undefined,
      sukuAyah: "",
      pendidikanAyah: "",
      pekerjaanAyah: "",
      alamatAyah: "",
      hpAyah: "",
      namaIbu: "",
      tempatLahirIbu: "",
      tanggalLahirIbu: undefined,
      sukuIbu: "",
      pendidikanIbu: "",
      pekerjaanIbu: "",
      alamatIbu: "",
      hpIbu: "",
      statusMasuk: "",
      namaTpqSebelum: "",
      tanggalPindah: undefined,
      kelompokBelajar: "",
    })
    setCurrentSection(0)
  }

  const sections = [
    { title: "Biodata Santri", icon: User },
    { title: "Biodata Orangtua/Wali", icon: Users },
    { title: "Asal Sekolah", icon: GraduationCap },
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-700">Pendaftaran Berhasil!</h2>
              <p className="text-gray-600">
                Terima kasih telah mendaftar di TK/TP Al-Qur'an LPPTKA BKPRMI UNIT 004 Nur Islam. Data Anda telah
                berhasil dikirim ke database dan akan segera diproses.
              </p>
              <Button onClick={resetForm} className="w-full">
                Daftar Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Pendaftaran Santri Baru</h1>
          <p className="text-lg text-gray-600">TK/TP Al-Qur'an LPPTKA BKPRMI UNIT 004 Nur Islam</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    index === currentSection
                      ? "bg-green-600 text-white"
                      : index < currentSection
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:block">{section.title}</span>
                  <span className="text-sm font-medium sm:hidden">{index + 1}</span>
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(sections[currentSection].icon, { className: "h-5 w-5" })}
                <span>{sections[currentSection].title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section 1: Biodata Santri */}
              {currentSection === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
                    <Input
                      id="namaLengkap"
                      value={formData.namaLengkap}
                      onChange={(e) => handleInputChange("namaLengkap", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaPanggilan">Nama Panggilan *</Label>
                    <Input
                      id="namaPanggilan"
                      value={formData.namaPanggilan}
                      onChange={(e) => handleInputChange("namaPanggilan", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Kelamin *</Label>
                    <RadioGroup
                      value={formData.jenisKelamin}
                      onValueChange={(value) => handleInputChange("jenisKelamin", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Laki-laki" id="laki" />
                        <Label htmlFor="laki">Laki-laki</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Perempuan" id="perempuan" />
                        <Label htmlFor="perempuan">Perempuan</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempatLahir">Tempat Lahir *</Label>
                    <Input
                      id="tempatLahir"
                      value={formData.tempatLahir}
                      onChange={(e) => handleInputChange("tempatLahir", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Lahir *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !formData.tanggalLahir && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.tanggalLahir ? (
                            format(formData.tanggalLahir, "PPP", { locale: id })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.tanggalLahir}
                          onSelect={(date) => handleInputChange("tanggalLahir", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anakKe">Anak ke- *</Label>
                    <Input
                      id="anakKe"
                      type="number"
                      min="1"
                      value={formData.anakKe}
                      onChange={(e) => handleInputChange("anakKe", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlahSaudara">Jumlah Saudara *</Label>
                    <Input
                      id="jumlahSaudara"
                      type="number"
                      min="0"
                      value={formData.jumlahSaudara}
                      onChange={(e) => handleInputChange("jumlahSaudara", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Golongan Darah *</Label>
                    <Select
                      value={formData.golonganDarah}
                      onValueChange={(value) => handleInputChange("golonganDarah", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih golongan darah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="AB">AB</SelectItem>
                        <SelectItem value="O">O</SelectItem>
                        <SelectItem value="Tidak Tahu">Tidak Tahu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="alamatRumah">Alamat Rumah *</Label>
                    <Textarea
                      id="alamatRumah"
                      value={formData.alamatRumah}
                      onChange={(e) => handleInputChange("alamatRumah", e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="asalSekolah">Asal Sekolah/TK *</Label>
                    <Input
                      id="asalSekolah"
                      value={formData.asalSekolah}
                      onChange={(e) => handleInputChange("asalSekolah", e.target.value)}
                      placeholder="Nama sekolah/TK sebelumnya"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="penyakitPernah">Penyakit yang Pernah Diderita</Label>
                    <Textarea
                      id="penyakitPernah"
                      value={formData.penyakitPernah}
                      onChange={(e) => handleInputChange("penyakitPernah", e.target.value)}
                      placeholder="Kosongkan jika tidak ada"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Section 2: Biodata Orangtua/Wali */}
              {currentSection === 1 && (
                <div className="space-y-8">
                  {/* Data Ayah */}
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-4">Data Ayah</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="namaAyah">Nama Lengkap *</Label>
                        <Input
                          id="namaAyah"
                          value={formData.namaAyah}
                          onChange={(e) => handleInputChange("namaAyah", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tempatLahirAyah">Tempat Lahir *</Label>
                        <Input
                          id="tempatLahirAyah"
                          value={formData.tempatLahirAyah}
                          onChange={(e) => handleInputChange("tempatLahirAyah", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Lahir *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !formData.tanggalLahirAyah && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.tanggalLahirAyah ? (
                                format(formData.tanggalLahirAyah, "PPP", { locale: id })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.tanggalLahirAyah}
                              onSelect={(date) => handleInputChange("tanggalLahirAyah", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sukuAyah">Suku *</Label>
                        <Input
                          id="sukuAyah"
                          value={formData.sukuAyah}
                          onChange={(e) => handleInputChange("sukuAyah", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pendidikan Terakhir *</Label>
                        <Select
                          value={formData.pendidikanAyah}
                          onValueChange={(value) => handleInputChange("pendidikanAyah", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pendidikan terakhir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SD/MI">SD/MI</SelectItem>
                            <SelectItem value="SMP/MTs">SMP/MTs</SelectItem>
                            <SelectItem value="SMA/MA/SMK">SMA/MA/SMK</SelectItem>
                            <SelectItem value="D1">D1</SelectItem>
                            <SelectItem value="D2">D2</SelectItem>
                            <SelectItem value="D3">D3</SelectItem>
                            <SelectItem value="S1">S1</SelectItem>
                            <SelectItem value="S2">S2</SelectItem>
                            <SelectItem value="S3">S3</SelectItem>
                            <SelectItem value="Tidak Sekolah">Tidak Sekolah</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pekerjaanAyah">Pekerjaan *</Label>
                        <Input
                          id="pekerjaanAyah"
                          value={formData.pekerjaanAyah}
                          onChange={(e) => handleInputChange("pekerjaanAyah", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hpAyah">No. HP *</Label>
                        <Input
                          id="hpAyah"
                          type="tel"
                          value={formData.hpAyah}
                          onChange={(e) => handleInputChange("hpAyah", e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="alamatAyah">Alamat Rumah *</Label>
                        <Textarea
                          id="alamatAyah"
                          value={formData.alamatAyah}
                          onChange={(e) => handleInputChange("alamatAyah", e.target.value)}
                          required
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Ibu */}
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-4">Data Ibu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="namaIbu">Nama Lengkap *</Label>
                        <Input
                          id="namaIbu"
                          value={formData.namaIbu}
                          onChange={(e) => handleInputChange("namaIbu", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tempatLahirIbu">Tempat Lahir *</Label>
                        <Input
                          id="tempatLahirIbu"
                          value={formData.tempatLahirIbu}
                          onChange={(e) => handleInputChange("tempatLahirIbu", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Lahir *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !formData.tanggalLahirIbu && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.tanggalLahirIbu ? (
                                format(formData.tanggalLahirIbu, "PPP", { locale: id })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.tanggalLahirIbu}
                              onSelect={(date) => handleInputChange("tanggalLahirIbu", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sukuIbu">Suku *</Label>
                        <Input
                          id="sukuIbu"
                          value={formData.sukuIbu}
                          onChange={(e) => handleInputChange("sukuIbu", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pendidikan Terakhir *</Label>
                        <Select
                          value={formData.pendidikanIbu}
                          onValueChange={(value) => handleInputChange("pendidikanIbu", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pendidikan terakhir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SD/MI">SD/MI</SelectItem>
                            <SelectItem value="SMP/MTs">SMP/MTs</SelectItem>
                            <SelectItem value="SMA/MA/SMK">SMA/MA/SMK</SelectItem>
                            <SelectItem value="D1">D1</SelectItem>
                            <SelectItem value="D2">D2</SelectItem>
                            <SelectItem value="D3">D3</SelectItem>
                            <SelectItem value="S1">S1</SelectItem>
                            <SelectItem value="S2">S2</SelectItem>
                            <SelectItem value="S3">S3</SelectItem>
                            <SelectItem value="Tidak Sekolah">Tidak Sekolah</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pekerjaanIbu">Pekerjaan *</Label>
                        <Input
                          id="pekerjaanIbu"
                          value={formData.pekerjaanIbu}
                          onChange={(e) => handleInputChange("pekerjaanIbu", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hpIbu">No. HP *</Label>
                        <Input
                          id="hpIbu"
                          type="tel"
                          value={formData.hpIbu}
                          onChange={(e) => handleInputChange("hpIbu", e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="alamatIbu">Alamat Rumah *</Label>
                        <Textarea
                          id="alamatIbu"
                          value={formData.alamatIbu}
                          onChange={(e) => handleInputChange("alamatIbu", e.target.value)}
                          required
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Asal Sekolah */}
              {currentSection === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Status Masuk *</Label>
                    <RadioGroup
                      value={formData.statusMasuk}
                      onValueChange={(value) => handleInputChange("statusMasuk", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Santri Baru" id="baru" />
                        <Label htmlFor="baru">Santri Baru</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Santri Pindahan" id="pindahan" />
                        <Label htmlFor="pindahan">Santri Pindahan</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.statusMasuk === "Santri Pindahan" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="namaTpqSebelum">Nama TPQ Sebelumnya *</Label>
                        <Input
                          id="namaTpqSebelum"
                          value={formData.namaTpqSebelum}
                          onChange={(e) => handleInputChange("namaTpqSebelum", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Pindah *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !formData.tanggalPindah && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.tanggalPindah ? (
                                format(formData.tanggalPindah, "PPP", { locale: id })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.tanggalPindah}
                              onSelect={(date) => handleInputChange("tanggalPindah", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Kelompok Belajar *</Label>
                    <Select
                      value={formData.kelompokBelajar}
                      onValueChange={(value) => handleInputChange("kelompokBelajar", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelompok belajar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Iqra 1">Iqra 1</SelectItem>
                        <SelectItem value="Iqra 2">Iqra 2</SelectItem>
                        <SelectItem value="Iqra 3">Iqra 3</SelectItem>
                        <SelectItem value="Iqra 4">Iqra 4</SelectItem>
                        <SelectItem value="Iqra 5">Iqra 5</SelectItem>
                        <SelectItem value="Iqra 6">Iqra 6</SelectItem>
                        <SelectItem value="Al-Quran">Al-Quran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.kelompokBelajar === 'Al-Quran' && (
                    <div className="space-y-2">
                      <Label>Juz Al-Quran *</Label>
                      <Select
                        value={formData.juzAlquran?.toString()}
                        onValueChange={(value) => handleInputChange("juzAlquran", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih juz" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(30)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              Juz {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dokumen yang Diperlukan</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Foto Akte Kelahiran *</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('akte', e.target.files?.[0])}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Foto Kartu Keluarga *</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('kk', e.target.files?.[0])}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Foto 3x4 *</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('foto3x4', e.target.files?.[0])}
                          required
                        />
                        <p className="text-sm text-gray-500">Seragam batik nasional TPA</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Foto 2x4 *</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('foto2x4', e.target.files?.[0])}
                          required
                        />
                        <p className="text-sm text-gray-500">Seragam batik nasional TPA</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informasi Biaya</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {biayaList.map(item => {
                        // Skip if not applicable
                        if (item.nama_biaya === 'Buku Prestasi Iqro' && formData.kelompokBelajar === 'Al-Quran') {
                          return null
                        }
                        if (item.nama_biaya === 'Buku Prestasi Al-Quran' && formData.kelompokBelajar !== 'Al-Quran') {
                          return null
                        }
                        if (item.nama_biaya === 'Buku Iqro' && formData.kelompokBelajar === 'Al-Quran') {
                          return null
                        }

                        return (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.nama_biaya}</span>
                            <span>Rp {item.jumlah.toLocaleString()}</span>
                          </div>
                        )
                      })}
                      <div className="border-t pt-2 font-semibold flex justify-between">
                        <span>Total</span>
                        <span>Rp {totalBiaya.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentSection(currentSection - 1)}
              disabled={currentSection === 0}
            >
              Sebelumnya
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
                disabled={!validateSection(currentSection)}
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!validateSection(currentSection) || isLoading}
              >
                {isLoading ? "Menyimpan..." : "Kirim Pendaftaran"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}