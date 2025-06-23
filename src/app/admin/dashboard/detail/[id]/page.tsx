/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, User, Users, GraduationCap, Phone, MapPin, Calendar, CheckCircle, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { PDFDownloadLink } from '@react-pdf/renderer'
import PendaftarPDF from '@/components/PendaftarPDF'

interface BiayaItem {
  id: string
  nama_biaya: string
  jumlah: number
}

interface PembayaranData {
  id: string
  pendaftar_id: string
  total_biaya: number
  status_pembayaran: string
  tanggal_pembayaran?: string
  bukti_pembayaran?: string
  biaya_items: BiayaItem[]
}

interface PendaftarData {
  id: string
  namaLengkap: string
  namaPanggilan: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: string
  alamatRumah: string
  anakKe: string
  jumlahSaudara: string
  golonganDarah: string | null
  penyakitPernah: string | null
  statusMasuk: string
  namaTpqSebelum: string | null
  tanggalPindah: string | null
  kelompokBelajar: string
  juz_alquran?: string | null
  namaAyah: string
  tempatLahirAyah: string
  tanggalLahirAyah: string
  sukuAyah: string
  pendidikanAyah: string
  pekerjaanAyah: string
  alamatAyah: string
  hpAyah: string
  namaIbu: string
  tempatLahirIbu: string
  tanggalLahirIbu: string
  sukuIbu: string
  pendidikanIbu: string
  pekerjaanIbu: string
  alamatIbu: string
  hpIbu: string
  tanggalDaftar: string
  status: string
  is_verified: boolean
  tanggal_verifikasi: string | null
  foto_akte: string | null
  foto_kk: string | null
  foto_3x4: string | null
  foto_2x4: string | null
}

interface DocumentDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  url?: string
}

const DocumentDialog = ({ isOpen, onClose, title, url }: DocumentDialogProps) => {
  if (!url) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full" style={{ height: '70vh' }}>
          <iframe
            src={url}
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button onClick={() => window.open(url, '_blank')}>
            <Download className="h-4 w-4 mr-2" />
            Unduh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DetailPendaftar() {
  const [pendaftar, setPendaftar] = useState<PendaftarData | null>(null)
  const [pembayaran, setPembayaran] = useState<PembayaranData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState<string>("")
  const [documentDialog, setDocumentDialog] = useState<{
    isOpen: boolean
    title: string
    url?: string
  }>({
    isOpen: false,
    title: "",
    url: undefined
  })
  const router = useRouter()
  const params = useParams()

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/admin")
        return false
      }

      // Verifikasi role admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (adminError || !adminData) {
        router.push("/admin")
        return false
      }

      return true
    } catch (error) {
      console.error('Auth check error:', error)
      router.push("/admin")
      return false
    }
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const isAuthed = await checkAuth()
      if (isAuthed) {
        await Promise.all([
          loadPendaftarDetail(),
          loadPembayaranDetail()
        ])
      }
      setIsLoading(false)
    }
    init()
  }, [params.id])

  const loadPendaftarDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('pendaftar_santri')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setPendaftar({
          id: data.id,
          namaLengkap: data.nama_lengkap,
          namaPanggilan: data.nama_panggilan,
          jenisKelamin: data.jenis_kelamin,
          tempatLahir: data.tempat_lahir,
          tanggalLahir: data.tanggal_lahir,
          alamatRumah: data.alamat_rumah,
          anakKe: data.anak_ke,
          jumlahSaudara: data.jumlah_saudara,
          golonganDarah: data.golongan_darah,
          penyakitPernah: data.penyakit_pernah,
          namaAyah: data.nama_ayah,
          tempatLahirAyah: data.tempat_lahir_ayah,
          tanggalLahirAyah: data.tanggal_lahir_ayah,
          sukuAyah: data.suku_ayah,
          pendidikanAyah: data.pendidikan_ayah,
          pekerjaanAyah: data.pekerjaan_ayah,
          alamatAyah: data.alamat_ayah,
          hpAyah: data.hp_ayah,
          namaIbu: data.nama_ibu,
          tempatLahirIbu: data.tempat_lahir_ibu,
          tanggalLahirIbu: data.tanggal_lahir_ibu,
          sukuIbu: data.suku_ibu,
          pendidikanIbu: data.pendidikan_ibu,
          pekerjaanIbu: data.pekerjaan_ibu,
          alamatIbu: data.alamat_ibu,
          hpIbu: data.hp_ibu,
          statusMasuk: data.status_masuk,
          namaTpqSebelum: data.nama_tpq_sebelum,
          tanggalPindah: data.tanggal_pindah,
          kelompokBelajar: data.kelompok_belajar,
          tanggalDaftar: data.tanggal_daftar,
          status: data.status,
          is_verified: data.is_verified,
          tanggal_verifikasi: data.tanggal_verifikasi,
          foto_akte: data.foto_akte,
          foto_kk: data.foto_kk,
          foto_3x4: data.foto_3x4,
          foto_2x4: data.foto_2x4
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
    setIsLoading(false)
    }
  }

  const loadPembayaranDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('pembayaran')
        .select('*')
        .eq('pendaftar_id', params.id)
        .single()

      if (error) {
        console.error('Pembayaran error:', error)
        return
      }

      if (data) {
        setPembayaran({
          id: data.id,
          pendaftar_id: data.pendaftar_id,
          total_biaya: data.total_biaya,
          status_pembayaran: data.status_pembayaran,
          tanggal_pembayaran: data.tanggal_pembayaran,
          bukti_pembayaran: data.bukti_pembayaran,
          biaya_items: data.detail_biaya || []
        })
      }
    } catch (error) {
      console.error('Error loading pembayaran:', error)
    }
  }

  const handleDownloadPDF = () => {
    if (!pendaftar) return

    // Membuat konten PDF sederhana
    const printContent = `
      <html>
        <head>
          <title>Data Pendaftar - ${pendaftar.namaLengkap}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { background: #f0f0f0; padding: 10px; margin: 0; }
            .content { padding: 15px; border: 1px solid #ddd; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 200px; }
            .value { flex: 1; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FORMULIR PENDAFTARAN SANTRI</h1>
            <h2>TK/TP Al-Qur'an LPPTKA BKPRMI UNIT 004 Nur Islam</h2>
          </div>
          
          <div class="section">
            <h3>BIODATA SANTRI</h3>
            <div class="content">
              <div class="row"><div class="label">Nama Lengkap:</div><div class="value">${pendaftar.namaLengkap}</div></div>
              <div class="row"><div class="label">Nama Panggilan:</div><div class="value">${pendaftar.namaPanggilan}</div></div>
              <div class="row"><div class="label">Jenis Kelamin:</div><div class="value">${pendaftar.jenisKelamin}</div></div>
              <div class="row"><div class="label">Tempat/Tgl Lahir:</div><div class="value">${pendaftar.tempatLahir}, ${new Date(pendaftar.tanggalLahir).toLocaleDateString("id-ID")}</div></div>
              <div class="row"><div class="label">Alamat Rumah:</div><div class="value">${pendaftar.alamatRumah}</div></div>
              <div class="row"><div class="label">Anak ke-:</div><div class="value">${pendaftar.anakKe}</div></div>
              <div class="row"><div class="label">Jumlah Saudara:</div><div class="value">${pendaftar.jumlahSaudara}</div></div>
              <div class="row"><div class="label">Golongan Darah:</div><div class="value">${pendaftar.golonganDarah || "-"}</div></div>
              <div class="row"><div class="label">Penyakit Pernah Diderita:</div><div class="value">${pendaftar.penyakitPernah || "-"}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>BIODATA AYAH</h3>
            <div class="content">
              <div class="row"><div class="label">Nama:</div><div class="value">${pendaftar.namaAyah}</div></div>
              <div class="row"><div class="label">Tempat/Tgl Lahir:</div><div class="value">${pendaftar.tempatLahirAyah}, ${new Date(pendaftar.tanggalLahirAyah).toLocaleDateString("id-ID")}</div></div>
              <div class="row"><div class="label">Suku:</div><div class="value">${pendaftar.sukuAyah}</div></div>
              <div class="row"><div class="label">Pendidikan Terakhir:</div><div class="value">${pendaftar.pendidikanAyah}</div></div>
              <div class="row"><div class="label">Pekerjaan:</div><div class="value">${pendaftar.pekerjaanAyah}</div></div>
              <div class="row"><div class="label">Alamat Rumah:</div><div class="value">${pendaftar.alamatAyah}</div></div>
              <div class="row"><div class="label">No. HP:</div><div class="value">${pendaftar.hpAyah}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>BIODATA IBU</h3>
            <div class="content">
              <div class="row"><div class="label">Nama:</div><div class="value">${pendaftar.namaIbu}</div></div>
              <div class="row"><div class="label">Tempat/Tgl Lahir:</div><div class="value">${pendaftar.tempatLahirIbu}, ${new Date(pendaftar.tanggalLahirIbu).toLocaleDateString("id-ID")}</div></div>
              <div class="row"><div class="label">Suku:</div><div class="value">${pendaftar.sukuIbu}</div></div>
              <div class="row"><div class="label">Pendidikan Terakhir:</div><div class="value">${pendaftar.pendidikanIbu}</div></div>
              <div class="row"><div class="label">Pekerjaan:</div><div class="value">${pendaftar.pekerjaanIbu}</div></div>
              <div class="row"><div class="label">Alamat Rumah:</div><div class="value">${pendaftar.alamatIbu}</div></div>
              <div class="row"><div class="label">No. HP:</div><div class="value">${pendaftar.hpIbu}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>ASAL SEKOLAH</h3>
            <div class="content">
              <div class="row"><div class="label">Masuk sebagai:</div><div class="value">${pendaftar.statusMasuk}</div></div>
              ${
                pendaftar.statusMasuk === "Santri Pindahan" && pendaftar.tanggalPindah
                  ? `
                <div class="row"><div class="label">Nama TPQ Sebelumnya:</div><div class="value">${pendaftar.namaTpqSebelum}</div></div>
                <div class="row"><div class="label">Tanggal Pindah:</div><div class="value">${formatDate(pendaftar.tanggalPindah)}</div></div>
              `
                  : ""
              }
              <div class="row"><div class="label">Kelompok Belajar:</div><div class="value">${pendaftar.kelompokBelajar}</div></div>
            </div>
          </div>

          <div class="section">
            <h3>INFORMASI PENDAFTARAN</h3>
            <div class="content">
              <div class="row"><div class="label">Tanggal Daftar:</div><div class="value">${new Date(pendaftar.tanggalDaftar).toLocaleDateString("id-ID")}</div></div>
              <div class="row"><div class="label">Status:</div><div class="value">${pendaftar.status}</div></div>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu Verifikasi":
        return "bg-yellow-100 text-yellow-800"
      case "Diterima":
        return "bg-green-100 text-green-800"
      case "Ditolak":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleVerificationClick = () => {
    setShowPhoneDialog(true)
  }

  const formatWhatsAppLink = (phone: string, message: string) => {
    // Format nomor (hapus semua karakter non-angka dan pastikan dimulai dengan 62)
    let formattedPhone = phone.replace(/\D/g, "")
    if (!formattedPhone.startsWith("62")) {
      formattedPhone = formattedPhone.replace(/^0|^8/, "62")
    }
    
    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(message)
    
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  }

  const handleVerification = async () => {
    try {
      if (!selectedPhone) {
        toast({
          title: "Error",
          description: "Silakan pilih nomor telepon yang akan dikirim verifikasi",
          variant: "destructive"
        })
        return
      }

      // Update status pendaftar
      const { error: updateError } = await supabase
        .from('pendaftar_santri')
        .update({
          status: 'Diterima',
          is_verified: true,
          tanggal_verifikasi: new Date().toISOString(),
          verifikasi_oleh: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', pendaftar?.id)

      if (updateError) throw updateError

      // Update status pembayaran
      const { error: pembayaranError } = await supabase
        .from('pembayaran')
        .update({
          status_pembayaran: 'Lunas'
        })
        .eq('pendaftar_id', pendaftar?.id)

      if (pembayaranError) throw pembayaranError

      // Get pembayaran data
      const { data: pembayaranData, error: getPembayaranError } = await supabase
        .from('pembayaran')
        .select('*')
        .eq('pendaftar_id', pendaftar?.id)
        .single()

      if (getPembayaranError) throw getPembayaranError

      // Buat pesan WhatsApp
      const message = `Assalamu'alaikum Wr. Wb.

Terima kasih telah mendaftarkan putra/putri Anda di TK/TP Al-Qur'an LPPTKA BKPRMI UNIT 004 Nur Islam.

Detail Pendaftaran:
Nama Santri: ${pendaftar?.namaLengkap}
Kelompok Belajar: ${pendaftar?.kelompokBelajar}
${pendaftar?.kelompokBelajar === 'Al-Quran' ? `Juz: ${pendaftar?.juz_alquran}` : ''}

Total Biaya: Rp ${pembayaranData.total_biaya.toLocaleString()}

Silakan melakukan pembayaran ke rekening:
Bank BRI
No. Rek: 123456789
A.n: TPQ Nur Islam

Mohon segera melakukan pembayaran dan mengirimkan bukti pembayaran melalui WhatsApp ke nomor Admin: 081234567890

Wassalamu'alaikum Wr. Wb.`

      // Generate WhatsApp link
      const whatsappLink = formatWhatsAppLink(selectedPhone, message)

      // Update notification status
      await supabase
        .from('pendaftar_santri')
        .update({ notifikasi_terkirim: true })
        .eq('id', pendaftar?.id)

      // Close dialog
      setShowPhoneDialog(false)
      setSelectedPhone("")

      // Refresh data
      await loadPendaftarDetail()
      await loadPembayaranDetail()
      
      // Open WhatsApp link directly
      window.open(whatsappLink, '_blank')

      // Show success message
      toast({
        title: "Verifikasi Berhasil",
        description: "Pendaftaran telah diverifikasi dan pesan WhatsApp telah dibuka.",
        variant: "success"
      })
    } catch (error) {
      console.error('Error verifying:', error)
      toast({
        title: "Gagal Memverifikasi",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memverifikasi pendaftaran",
        variant: "destructive"
      })
    }
  }

  // Add function to handle verification status change
  const handleVerificationStatusChange = async () => {
    try {
      const newVerificationStatus = !pendaftar?.is_verified
      
      const { error: updateError } = await supabase
        .from('pendaftar_santri')
        .update({
          is_verified: newVerificationStatus,
          status: newVerificationStatus ? 'Diterima' : 'Menunggu Verifikasi',
          tanggal_verifikasi: newVerificationStatus ? new Date().toISOString() : null,
          verifikasi_oleh: newVerificationStatus ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', pendaftar?.id)

      if (updateError) throw updateError

      // Update pembayaran status if verifying
      if (newVerificationStatus) {
        const { error: pembayaranError } = await supabase
          .from('pembayaran')
          .update({
            status_pembayaran: 'Lunas'
          })
          .eq('pendaftar_id', pendaftar?.id)

        if (pembayaranError) throw pembayaranError
      }

      // Refresh data
      await loadPendaftarDetail()
      await loadPembayaranDetail()
      
      toast({
        title: "Status Verifikasi Diperbarui",
        description: `Pendaftaran telah ${newVerificationStatus ? 'diverifikasi' : 'dibatalkan verifikasinya'}.`,
        variant: "success"
      })
    } catch (error) {
      console.error('Error updating verification status:', error)
      toast({
        title: "Gagal Mengubah Status",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status verifikasi",
        variant: "destructive"
      })
    }
  }

  // Add new function to handle status change
  const handleStatusChange = async () => {
    try {
      if (!pendaftar?.id) return

      const { error } = await supabase
        .rpc('verify_and_update_payment', {
          pendaftar_id_param: pendaftar.id
        })

      if (error) throw error

      // Refresh data
      await loadPendaftarDetail()
      await loadPembayaranDetail()

      toast({
        title: "Success",
        description: "Status pendaftaran dan pembayaran berhasil diubah",
        variant: "success"
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengubah status",
        variant: "destructive"
      })
    }
  }

  const handleOpenDocument = (title: string, url?: string) => {
    setDocumentDialog({
      isOpen: true,
      title,
      url
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!pendaftar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Data pendaftar tidak ditemukan</p>
            <Button onClick={() => router.push("/admin/dashboard")}>Kembali ke Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const phoneSelectionDialog = (
    <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pilih Nomor Telepon</DialogTitle>
          <DialogDescription>
            Pilih nomor telepon yang akan dikirim notifikasi verifikasi
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <RadioGroup value={selectedPhone} onValueChange={setSelectedPhone}>
            <div className="flex items-center space-x-2 space-y-2">
              <RadioGroupItem value={pendaftar?.hpAyah || ""} id="ayah" />
              <Label htmlFor="ayah">
                Ayah ({pendaftar?.namaAyah}) - {pendaftar?.hpAyah}
              </Label>
            </div>
            <div className="flex items-center space-x-2 space-y-2">
              <RadioGroupItem value={pendaftar?.hpIbu || ""} id="ibu" />
              <Label htmlFor="ibu">
                Ibu ({pendaftar?.namaIbu}) - {pendaftar?.hpIbu}
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>
            Batal
          </Button>
          <Button onClick={handleVerification} disabled={!selectedPhone}>
            Kirim Verifikasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {phoneSelectionDialog}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Pendaftar</h1>
                <p className="text-gray-600">{pendaftar.namaLengkap}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(pendaftar.status)}>{pendaftar.status}</Badge>
              <PDFDownloadLink
                document={
                  <PendaftarPDF
                    data={{
                      namaLengkap: pendaftar.namaLengkap,
                      namaPanggilan: pendaftar.namaPanggilan || '',
                      jenisKelamin: pendaftar.jenisKelamin,
                      tempatLahir: pendaftar.tempatLahir,
                      tanggalLahir: pendaftar.tanggalLahir,
                      alamatRumah: pendaftar.alamatRumah,
                      anakKe: parseInt(pendaftar.anakKe),
                      jumlahSaudara: parseInt(pendaftar.jumlahSaudara),
                      golonganDarah: pendaftar.golonganDarah,
                      penyakitPernah: pendaftar.penyakitPernah,
                      statusMasuk: pendaftar.statusMasuk,
                      namaTpqSebelum: pendaftar.namaTpqSebelum,
                      tanggalPindah: pendaftar.tanggalPindah,
                      kelompokBelajar: pendaftar.kelompokBelajar,
                      namaAyah: pendaftar.namaAyah,
                      tempatLahirAyah: pendaftar.tempatLahirAyah,
                      tanggalLahirAyah: pendaftar.tanggalLahirAyah,
                      sukuAyah: pendaftar.sukuAyah,
                      pendidikanAyah: pendaftar.pendidikanAyah,
                      pekerjaanAyah: pendaftar.pekerjaanAyah,
                      alamatAyah: pendaftar.alamatAyah,
                      hpAyah: pendaftar.hpAyah,
                      namaIbu: pendaftar.namaIbu,
                      tempatLahirIbu: pendaftar.tempatLahirIbu,
                      tanggalLahirIbu: pendaftar.tanggalLahirIbu,
                      sukuIbu: pendaftar.sukuIbu,
                      pendidikanIbu: pendaftar.pendidikanIbu,
                      pekerjaanIbu: pendaftar.pekerjaanIbu,
                      alamatIbu: pendaftar.alamatIbu,
                      hpIbu: pendaftar.hpIbu,
                      tanggalDaftar: pendaftar.tanggalDaftar,
                      status: pendaftar.status,
                      is_verified: pendaftar.is_verified,
                      tanggalVerifikasi: pendaftar.tanggal_verifikasi,
                      fotoAkta: pendaftar.foto_akte,
                      fotoKk: pendaftar.foto_kk,
                      foto3x4: pendaftar.foto_3x4,
                      foto2x4: pendaftar.foto_2x4
                    }}
                  />
                }
                fileName={`Data_Pendaftar_${pendaftar.namaLengkap}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    className="flex items-center space-x-2"
                    disabled={loading}
                  >
                    <Download className="h-4 w-4" />
                    <span>{loading ? 'Generating PDF...' : 'Unduh PDF'}</span>
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Biodata Santri */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Biodata Santri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nama Lengkap</p>
                    <p className="text-lg font-semibold">{pendaftar.namaLengkap}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nama Panggilan</p>
                    <p className="text-lg">{pendaftar.namaPanggilan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Jenis Kelamin</p>
                    <p className="text-lg">{pendaftar.jenisKelamin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tempat/Tanggal Lahir</p>
                    <p className="text-lg">
                      {pendaftar.tempatLahir}, {formatDate(pendaftar.tanggalLahir)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Anak ke-</p>
                    <p className="text-lg">{pendaftar.anakKe}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Jumlah Saudara</p>
                    <p className="text-lg">{pendaftar.jumlahSaudara}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Golongan Darah</p>
                    <p className="text-lg">{pendaftar.golonganDarah || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Alamat Rumah</p>
                  <p className="text-lg">{pendaftar.alamatRumah}</p>
                </div>
                {pendaftar.penyakitPernah && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Penyakit yang Pernah Diderita</p>
                    <p className="text-lg">{pendaftar.penyakitPernah}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Biodata Orangtua */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Biodata Orangtua/Wali</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Ayah */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-4">Data Ayah</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nama Lengkap</p>
                      <p className="text-lg">{pendaftar.namaAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tempat/Tanggal Lahir</p>
                      <p className="text-lg">
                        {pendaftar.tempatLahirAyah}, {formatDate(pendaftar.tanggalLahirAyah)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Suku</p>
                      <p className="text-lg">{pendaftar.sukuAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pendidikan Terakhir</p>
                      <p className="text-lg">{pendaftar.pendidikanAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pekerjaan</p>
                      <p className="text-lg">{pendaftar.pekerjaanAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>No. HP</span>
                      </p>
                      <p className="text-lg">{pendaftar.hpAyah}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Alamat Rumah</span>
                    </p>
                    <p className="text-lg">{pendaftar.alamatAyah}</p>
                  </div>
                </div>

                {/* Data Ibu */}
                <div>
                  <h3 className="text-lg font-semibold text-pink-700 mb-4">Data Ibu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nama Lengkap</p>
                      <p className="text-lg">{pendaftar.namaIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tempat/Tanggal Lahir</p>
                      <p className="text-lg">
                        {pendaftar.tempatLahirIbu}, {formatDate(pendaftar.tanggalLahirIbu)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Suku</p>
                      <p className="text-lg">{pendaftar.sukuIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pendidikan Terakhir</p>
                      <p className="text-lg">{pendaftar.pendidikanIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pekerjaan</p>
                      <p className="text-lg">{pendaftar.pekerjaanIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>No. HP</span>
                      </p>
                      <p className="text-lg">{pendaftar.hpIbu}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Alamat Rumah</span>
                    </p>
                    <p className="text-lg">{pendaftar.alamatIbu}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asal Sekolah */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Asal Sekolah</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Masuk sebagai</p>
                  <p className="text-lg font-semibold">{pendaftar.statusMasuk}</p>
                </div>
                {pendaftar.statusMasuk === "Santri Pindahan" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nama TPQ Sebelumnya</p>
                      <p className="text-lg">{pendaftar.namaTpqSebelum}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tanggal Pindah</p>
                      <p className="text-lg">{formatDate(pendaftar.tanggalPindah)}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Kelompok Belajar</p>
                  <p className="text-lg font-semibold text-green-700">{pendaftar.kelompokBelajar}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Informasi Pendaftaran</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tanggal Daftar</p>
                  <p className="text-lg font-semibold">{formatDate(pendaftar.tanggalDaftar)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status Pendaftaran</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${getStatusColor(pendaftar.status)} text-sm px-3 py-1`}>
                      {pendaftar.status}
                    </Badge>
                    {pendaftar.status !== 'Diterima' && (
                      <Button
                        size="sm"
                        onClick={handleStatusChange}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Terima & Lunasi
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ID Pendaftar</p>
                  <p className="text-sm text-gray-500 font-mono">{pendaftar.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontak Orang tua</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Ayah</p>
                    <p className="text-sm text-blue-600">{pendaftar.hpAyah}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                  <Phone className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="text-sm font-medium text-pink-800">Ibu</p>
                    <p className="text-sm text-pink-600">{pendaftar.hpIbu}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replace the photo viewing section with buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Dokumen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={() => handleOpenDocument("Foto 3x4", pendaftar.foto_3x4 || undefined)}
                  disabled={!pendaftar.foto_3x4}
                >
                  <FileText className="h-4 w-4" />
                  <span>Foto 3x4</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={() => handleOpenDocument("Foto 2x4", pendaftar.foto_2x4 || undefined)}
                  disabled={!pendaftar.foto_2x4}
                >
                  <FileText className="h-4 w-4" />
                  <span>Foto 2x4</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={() => handleOpenDocument("Kartu Keluarga", pendaftar.foto_kk || undefined)}
                  disabled={!pendaftar.foto_kk}
                >
                  <FileText className="h-4 w-4" />
                  <span>Kartu Keluarga</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={() => handleOpenDocument("Akta Kelahiran", pendaftar.foto_akte || undefined)}
                  disabled={!pendaftar.foto_akte}
                >
                  <FileText className="h-4 w-4" />
                  <span>Akta Kelahiran</span>
                </Button>
              </CardContent>
            </Card>

            {/* Modify verification button section */}
            {pendaftar?.is_verified ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Pendaftaran telah diverifikasi {pendaftar.tanggal_verifikasi ? `pada ${formatDate(pendaftar.tanggal_verifikasi)}` : ''}
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleVerificationStatusChange}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Batalkan Verifikasi
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleVerificationClick}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={pendaftar.status === 'Diterima'}
              >
                {pendaftar.status === 'Diterima' ? 'Sudah Diverifikasi' : 'Verifikasi Pendaftaran'}
              </Button>
            )}

            {/* Show payment information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jenis Biaya</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(pembayaran?.biaya_items || []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.nama_biaya}</TableCell>
                          <TableCell className="text-right">
                            Rp {item.jumlah.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow key="total" className="font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">
                          Rp {pembayaran?.total_biaya?.toLocaleString() || '0'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Status Pembayaran:</p>
                      <Badge
                        variant={pembayaran?.status_pembayaran === 'Lunas' ? 'success' : 'warning'}
                      >
                        {pembayaran?.status_pembayaran || 'Belum Bayar'}
                      </Badge>
                    </div>
                    {pembayaran?.tanggal_pembayaran && (
                      <div className="text-sm text-gray-500">
                        Tanggal Pembayaran: {formatDate(pembayaran.tanggal_pembayaran)}
                      </div>
                    )}
                  </div>

                  {pembayaran?.bukti_pembayaran && (
                    <div>
                      <p className="text-sm font-medium mb-2">Bukti Pembayaran:</p>
                      <a
                        href={pembayaran.bukti_pembayaran}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Lihat Bukti Pembayaran
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Document Dialog */}
      <DocumentDialog
        isOpen={documentDialog.isOpen}
        onClose={() => setDocumentDialog(prev => ({ ...prev, isOpen: false }))}
        title={documentDialog.title}
        url={documentDialog.url}
      />
    </div>
  )
}
