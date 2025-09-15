/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, User, Users, GraduationCap, Phone, MapPin, Calendar, CheckCircle, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ThemeToggle } from "@/components/theme-toggle"
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

function DetailPendaftar() {
  const [pendaftar, setPendaftar] = useState<PendaftarData | null>(null)
  const [pembayaran, setPembayaran] = useState<PembayaranData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
    let mounted = true

    const init = async () => {
      if (!mounted || !params.id) return
      setIsLoading(true)
      const isAuthed = await checkAuth()
      if (isAuthed && mounted) {
        try {
          await Promise.all([
            loadPendaftarDetail(),
            loadPembayaranDetail()
          ])
        } catch (error) {
          console.error('Error loading data:', error)
        }
      }
      if (mounted) {
        setIsLoading(false)
      }
    }
    init()

    return () => {
      mounted = false
    }
  }, [params.id])

  const loadPendaftarDetail = async () => {
    try {
      if (!params.id) {
        console.error('No ID provided')
        return
      }

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
    }
  }

  const loadPembayaranDetail = async () => {
    try {
      if (!params.id) {
        console.error('No ID provided for pembayaran')
        return
      }

      const { data, error } = await supabase
        .from('pembayaran')
        .select('*')
        .eq('pendaftar_id', params.id)
        .maybeSingle()

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
      } else {
        // Set pembayaran to null if no data found
        setPembayaran(null)
      }
    } catch (error) {
      console.error('Error loading pembayaran:', error)
      setPembayaran(null)
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
      case "Diterima":
        return "bg-foreground text-background"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleVerificationClick = () => {
    // Direct verification without phone dialog since we have direct WhatsApp buttons now
    handleVerificationStatusChange()
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
          status_pembayaran: 'Dikonfirmasi'
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

Mohon segera melakukan pembayaran dan mengirimkan bukti pembayaran melalui WhatsApp ke nomor Admin: 081227787685

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
            status_pembayaran: 'Dikonfirmasi'
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

      // Get current user for verification
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update pendaftar status
      const { error: pendaftarError } = await supabase
        .from('pendaftar_santri')
        .update({
          status: 'Diterima',
          is_verified: true,
          tanggal_verifikasi: new Date().toISOString(),
          verifikasi_oleh: user.id
        })
        .eq('id', pendaftar.id)

      if (pendaftarError) throw pendaftarError

      // Check if pembayaran record exists
      const { data: existingPembayaran } = await supabase
        .from('pembayaran')
        .select('id')
        .eq('pendaftar_id', pendaftar.id)
        .maybeSingle()

      if (existingPembayaran) {
        // Update existing pembayaran
        const { error: pembayaranError } = await supabase
          .from('pembayaran')
          .update({
            status_pembayaran: 'Dikonfirmasi',
            updated_at: new Date().toISOString()
          })
          .eq('pendaftar_id', pendaftar.id)

        if (pembayaranError) throw pembayaranError
      } else {
        // Create new pembayaran record - we need total_biaya and detail_biaya
        // Get biaya data first
        const { data: biayaData } = await supabase
          .from('biaya_pendaftaran')
          .select('*')
          .order('nama_biaya')

        const totalBiaya = biayaData?.reduce((sum, item) => sum + item.jumlah, 0) || 0

        const { error: pembayaranError } = await supabase
          .from('pembayaran')
          .insert({
            pendaftar_id: pendaftar.id,
            total_biaya: totalBiaya,
            detail_biaya: biayaData || [],
            status_pembayaran: 'Dikonfirmasi',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (pembayaranError) throw pembayaranError
      }

      // Refresh data
      await loadPendaftarDetail()
      await loadPembayaranDetail()

      toast({
        title: "Verifikasi Berhasil",
        description: "Pendaftaran telah diverifikasi dan status pembayaran diperbarui",
        variant: "success"
      })
    } catch (error) {
      console.error('Error updating status:', error)
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!pendaftar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-muted-foreground">Data pendaftar tidak ditemukan</p>
          <Button onClick={() => router.push("/admin/dashboard")} variant="outline">
            Kembali ke Dashboard
          </Button>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {phoneSelectionDialog}
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Detail Pendaftar</h1>
                <p className="text-muted-foreground text-sm">{pendaftar.namaLengkap}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Badge 
                variant={pendaftar.status === "Diterima" ? "default" : "secondary"}
                className={pendaftar.status === "Diterima" ? "bg-foreground text-background" : ""}
              >
                {pendaftar.status}
              </Badge>
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
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>{loading ? 'PDF...' : 'PDF'}</span>
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
            <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-5 w-5 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Biodata Santri</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                    <p className="text-lg font-semibold text-foreground">{pendaftar.namaLengkap}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nama Panggilan</p>
                    <p className="text-lg text-foreground">{pendaftar.namaPanggilan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Jenis Kelamin</p>
                    <p className="text-lg text-foreground">{pendaftar.jenisKelamin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tempat/Tanggal Lahir</p>
                    <p className="text-lg text-foreground">
                      {pendaftar.tempatLahir}, {formatDate(pendaftar.tanggalLahir)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Anak ke-</p>
                    <p className="text-lg text-foreground">{pendaftar.anakKe}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Jumlah Saudara</p>
                    <p className="text-lg text-foreground">{pendaftar.jumlahSaudara}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Golongan Darah</p>
                    <p className="text-lg text-foreground">{pendaftar.golonganDarah || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alamat Rumah</p>
                  <p className="text-lg text-foreground">{pendaftar.alamatRumah}</p>
                </div>
                {pendaftar.penyakitPernah && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Penyakit yang Pernah Diderita</p>
                    <p className="text-lg text-foreground">{pendaftar.penyakitPernah}</p>
                  </div>
                )}
              </div>
            </div>

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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Data Ayah</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                      <p className="text-lg text-foreground">{pendaftar.namaAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tempat/Tanggal Lahir</p>
                      <p className="text-lg text-foreground">
                        {pendaftar.tempatLahirAyah}, {formatDate(pendaftar.tanggalLahirAyah)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Suku</p>
                      <p className="text-lg text-foreground">{pendaftar.sukuAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendidikan Terakhir</p>
                      <p className="text-lg text-foreground">{pendaftar.pendidikanAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pekerjaan</p>
                      <p className="text-lg text-foreground">{pendaftar.pekerjaanAyah}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>No. HP</span>
                      </p>
                      <p className="text-lg text-foreground">{pendaftar.hpAyah}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Alamat Rumah</span>
                    </p>
                    <p className="text-lg text-foreground">{pendaftar.alamatAyah}</p>
                  </div>
                </div>

                {/* Data Ibu */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Data Ibu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                      <p className="text-lg text-foreground">{pendaftar.namaIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tempat/Tanggal Lahir</p>
                      <p className="text-lg text-foreground">
                        {pendaftar.tempatLahirIbu}, {formatDate(pendaftar.tanggalLahirIbu)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Suku</p>
                      <p className="text-lg text-foreground">{pendaftar.sukuIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendidikan Terakhir</p>
                      <p className="text-lg text-foreground">{pendaftar.pendidikanIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pekerjaan</p>
                      <p className="text-lg text-foreground">{pendaftar.pekerjaanIbu}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>No. HP</span>
                      </p>
                      <p className="text-lg text-foreground">{pendaftar.hpIbu}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Alamat Rumah</span>
                    </p>
                    <p className="text-lg text-foreground">{pendaftar.alamatIbu}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Masuk sebagai</p>
                  <p className="text-lg font-semibold text-foreground">{pendaftar.statusMasuk}</p>
                </div>
                {pendaftar.statusMasuk === "Santri Pindahan" && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nama TPQ Sebelumnya</p>
                      <p className="text-lg text-foreground">{pendaftar.namaTpqSebelum}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tanggal Pindah</p>
                      <p className="text-lg text-foreground">{formatDate(pendaftar.tanggalPindah)}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kelompok Belajar</p>
                  <p className="text-lg font-semibold text-foreground">{pendaftar.kelompokBelajar}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Daftar</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(pendaftar.tanggalDaftar)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status Pendaftaran</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${getStatusColor(pendaftar.status)} text-sm px-3 py-1`}>
                      {pendaftar.status}
                    </Badge>
                    {pendaftar.status !== 'Diterima' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleStatusChange}
                        className="border-foreground/20 hover:bg-foreground hover:text-background"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Terima & Konfirmasi
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Pendaftar</p>
                  <p className="text-sm text-muted-foreground font-mono">{pendaftar.id}</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Kontak Orang tua</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const message = `Assalamu'alaikum Wr. Wb.

Terima kasih telah mendaftarkan putra/putri Anda di TPQ Nur Islam Tarakan.

Detail Pendaftaran:
Nama Santri: ${pendaftar?.namaLengkap}
Kelompok Belajar: ${pendaftar?.kelompokBelajar}
${pendaftar?.kelompokBelajar === 'Al-Quran' ? `Juz: ${pendaftar?.juz_alquran}` : ''}

${pembayaran?.total_biaya ? `Total Biaya: Rp ${pembayaran.total_biaya.toLocaleString()}` : ''}

Silakan melakukan pembayaran ke rekening:
Bank BRI
No. Rek: 123456789
A.n: TPQ Nur Islam Tarakan

Lokasi: Jl. Mulawarman No. 45, Tarakan Timur, Kota Tarakan, Kalimantan Utara

Mohon segera melakukan pembayaran dan mengirimkan bukti pembayaran melalui WhatsApp ke nomor Admin: 081227787685

Jam Belajar:
- Senin-Kamis: 14.00-17.00 WITA  
- Jumat: 15.00-17.00 WITA
- Sabtu-Minggu: Libur

Wassalamu'alaikum Wr. Wb.`
                    
                    const formattedPhone = pendaftar.hpAyah.replace(/\D/g, "").replace(/^0|^8/, "62")
                    const encodedMessage = encodeURIComponent(message)
                    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
                    window.open(whatsappLink, '_blank')
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors text-left"
                >
                  <Phone className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Ayah - {pendaftar.namaAyah}</p>
                    <p className="text-sm text-muted-foreground">{pendaftar.hpAyah}</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    const message = `Assalamu'alaikum Wr. Wb.

Terima kasih telah mendaftarkan putra/putri Anda di TPQ Nur Islam Tarakan.

Detail Pendaftaran:
Nama Santri: ${pendaftar?.namaLengkap}
Kelompok Belajar: ${pendaftar?.kelompokBelajar}
${pendaftar?.kelompokBelajar === 'Al-Quran' ? `Juz: ${pendaftar?.juz_alquran}` : ''}

${pembayaran?.total_biaya ? `Total Biaya: Rp ${pembayaran.total_biaya.toLocaleString()}` : ''}

Silakan melakukan pembayaran ke rekening:
Bank BRI
No. Rek: 123456789
A.n: TPQ Nur Islam Tarakan

Lokasi: Jl. Mulawarman No. 45, Tarakan Timur, Kota Tarakan, Kalimantan Utara

Mohon segera melakukan pembayaran dan mengirimkan bukti pembayaran melalui WhatsApp ke nomor Admin: 081227787685

Jam Belajar:
- Senin-Kamis: 14.00-17.00 WITA  
- Jumat: 15.00-17.00 WITA
- Sabtu-Minggu: Libur

Wassalamu'alaikum Wr. Wb.`
                    
                    const formattedPhone = pendaftar.hpIbu.replace(/\D/g, "").replace(/^0|^8/, "62")
                    const encodedMessage = encodeURIComponent(message)
                    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
                    window.open(whatsappLink, '_blank')
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors text-left"
                >
                  <Phone className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Ibu - {pendaftar.namaIbu}</p>
                    <p className="text-sm text-muted-foreground">{pendaftar.hpIbu}</p>
                  </div>
                </button>
              </div>
            </div>

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
                <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-foreground" />
                    <p className="text-sm text-foreground">
                      Pendaftaran telah diverifikasi {pendaftar.tanggal_verifikasi ? `pada ${formatDate(pendaftar.tanggal_verifikasi)}` : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleVerificationStatusChange}
                  variant="outline"
                  className="w-full border-foreground/20 hover:bg-foreground hover:text-background"
                >
                  Batalkan Verifikasi
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleVerificationClick}
                variant="outline"
                className="w-full border-foreground/20 hover:bg-foreground hover:text-background"
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
                        variant={pembayaran?.status_pembayaran === 'Dikonfirmasi' ? 'success' : 'warning'}
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

export default DetailPendaftar
