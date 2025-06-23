/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Eye, Users, Calendar, CheckCircle, Trash2, AlertCircle, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx'

interface PendaftarData {
  id: string
  namaLengkap: string
  status_masuk: string
  nama_tpq_sebelum: string | null
  tanggalDaftar: string
  status: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: string
  alamatRumah: string
  is_verified: boolean
}

// Add this type definition after the interfaces
type ExcelDataRow = {
  [key: string]: string | number
}

function AdminDashboard() {
  const [pendaftarList, setPendaftarList] = useState<PendaftarData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    pendaftarId: string | null
    pendaftarName: string
  }>({
    isOpen: false,
    pendaftarId: null,
    pendaftarName: ""
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

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
      if (!mounted) return
      setIsLoading(true)
      const isAuthed = await checkAuth()
      if (isAuthed && mounted) {
        await loadPendaftar()
      }
      if (mounted) {
        setIsLoading(false)
      }
    }
    init()

    return () => {
      mounted = false
    }
  }, [])

  const loadPendaftar = async () => {
    try {
      const { data, error } = await supabase
        .from('pendaftar_santri')
        .select('*')
        .order('tanggal_daftar', { ascending: false })

      if (error) {
        throw error
      }

      setPendaftarList(data.map(item => ({
        id: item.id,
        namaLengkap: item.nama_lengkap,
        status_masuk: item.status_masuk,
        nama_tpq_sebelum: item.nama_tpq_sebelum,
        tanggalDaftar: item.tanggal_daftar,
        status: item.status,
        jenisKelamin: item.jenis_kelamin,
        tempatLahir: item.tempat_lahir,
        tanggalLahir: item.tanggal_lahir,
        alamatRumah: item.alamat_rumah,
        is_verified: item.is_verified
      })))
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data pendaftar",
        variant: "destructive"
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("adminLoggedIn")
    router.push("/admin")
  }

  const handleViewDetail = (id: string) => {
    router.push(`/admin/dashboard/detail/${id}`)
  }

  const formatDate = (dateString: string) => {
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

  const handleDelete = async () => {
    if (!deleteDialog.pendaftarId) return

    try {
      setIsDeleting(true)
      
      // Call the secure delete function
      const { error } = await supabase
        .rpc('delete_pendaftar_data', {
          pendaftar_id_param: deleteDialog.pendaftarId
        })

      if (error) {
        console.error('Error deleting data:', error)
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus data",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Data berhasil dihapus",
        variant: "success"
      })
      
      // Update local state
      setPendaftarList(prev => prev.filter(p => p.id !== deleteDialog.pendaftarId))
    } catch (error) {
      console.error('Error in delete operation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus data",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialog({
        isOpen: false,
        pendaftarId: null,
        pendaftarName: ""
      })
    }
  }

  const handleVerificationChange = async (id: string, currentStatus: boolean) => {
    try {
      // First update pendaftar status
      const { error: pendaftarError } = await supabase
        .from('pendaftar_santri')
        .update({
          is_verified: !currentStatus,
          status: !currentStatus ? 'Diterima' : 'Menunggu Verifikasi',
          tanggal_verifikasi: !currentStatus ? new Date().toISOString() : null,
          verifikasi_oleh: !currentStatus ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', id)

      if (pendaftarError) throw pendaftarError

      // Then update pembayaran status if verifying
      if (!currentStatus) {
        const { error: pembayaranError } = await supabase
          .from('pembayaran')
          .update({
            status_pembayaran: 'Lunas'
          })
          .eq('pendaftar_id', id)

        if (pembayaranError) throw pembayaranError
      }

      // Update local state
      setPendaftarList(prev =>
        prev.map(p =>
          p.id === id
            ? { 
                ...p, 
                is_verified: !currentStatus,
                status: !currentStatus ? 'Diterima' : 'Menunggu Verifikasi'
              }
            : p
        )
      )

      toast({
        title: "Success",
        description: `Status verifikasi berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
        variant: "success"
      })
    } catch (error) {
      console.error('Error updating verification status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengubah status verifikasi",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (id: string) => {
    try {
      const { error } = await supabase
        .rpc('verify_and_update_payment', {
          pendaftar_id_param: id
        })

      if (error) throw error

      // Update local state
      setPendaftarList(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, status: 'Diterima', is_verified: true }
            : p
        )
      )

      toast({
        title: "Success",
        description: "Status pendaftaran dan pembayaran berhasil diubah",
        variant: "success"
      })

      // Reload data to ensure we have the latest state
      loadPendaftar()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengubah status",
        variant: "destructive"
      })
    }
  }

  const handleExportExcel = async () => {
    try {
      // Fetch complete data including payment status
      const { data: pendaftarData, error: pendaftarError } = await supabase
        .from('pendaftar_santri')
        .select(`
          *,
          pembayaran (
            status_pembayaran
          )
        `)
        .order('tanggal_daftar', { ascending: false })

      if (pendaftarError) throw pendaftarError

      // Transform data for Excel with capitalized headers
      const excelData: ExcelDataRow[] = pendaftarData.map(item => ({
        'NAMA LENGKAP': item.nama_lengkap,
        'NAMA PANGGILAN': item.nama_panggilan,
        'JENIS KELAMIN': item.jenis_kelamin,
        'TEMPAT LAHIR': item.tempat_lahir,
        'TANGGAL LAHIR': new Date(item.tanggal_lahir).toLocaleDateString('id-ID'),
        'ALAMAT RUMAH': item.alamat_rumah,
        'ANAK KE': item.anak_ke,
        'JUMLAH SAUDARA': item.jumlah_saudara,
        'GOLONGAN DARAH': item.golongan_darah || '-',
        'PENYAKIT YANG PERNAH DIDERITA': item.penyakit_pernah || '-',
        'STATUS MASUK': item.status_masuk,
        'NAMA TPQ SEBELUMNYA': item.status_masuk === 'Santri Pindahan' ? (item.nama_tpq_sebelum || '-') : '-',
        'TANGGAL PINDAH': item.status_masuk === 'Santri Pindahan' && item.tanggal_pindah ? new Date(item.tanggal_pindah).toLocaleDateString('id-ID') : '-',
        'KELOMPOK BELAJAR': item.kelompok_belajar || 'Belum Ditentukan',
        'TINGKAT PEMBELAJARAN': item.tingkat_pembelajaran || 'Belum Ditentukan',
        'NAMA AYAH': item.nama_ayah,
        'TEMPAT LAHIR AYAH': item.tempat_lahir_ayah,
        'TANGGAL LAHIR AYAH': new Date(item.tanggal_lahir_ayah).toLocaleDateString('id-ID'),
        'SUKU AYAH': item.suku_ayah,
        'PENDIDIKAN AYAH': item.pendidikan_ayah,
        'PEKERJAAN AYAH': item.pekerjaan_ayah,
        'ALAMAT AYAH': item.alamat_ayah,
        'NO. HP AYAH': item.hp_ayah,
        'NAMA IBU': item.nama_ibu,
        'TEMPAT LAHIR IBU': item.tempat_lahir_ibu,
        'TANGGAL LAHIR IBU': new Date(item.tanggal_lahir_ibu).toLocaleDateString('id-ID'),
        'SUKU IBU': item.suku_ibu,
        'PENDIDIKAN IBU': item.pendidikan_ibu,
        'PEKERJAAN IBU': item.pekerjaan_ibu,
        'ALAMAT IBU': item.alamat_ibu,
        'NO. HP IBU': item.hp_ibu,
        'TANGGAL DAFTAR': new Date(item.tanggal_daftar).toLocaleDateString('id-ID'),
        'STATUS PENDAFTARAN': item.status,
        'STATUS VERIFIKASI': item.is_verified ? 'Terverifikasi' : 'Belum Terverifikasi',
        'TANGGAL VERIFIKASI': item.tanggal_verifikasi ? new Date(item.tanggal_verifikasi).toLocaleDateString('id-ID') : '-',
        'STATUS PEMBAYARAN': item.pembayaran?.status_pembayaran || 'Belum Ada Data'
      }))

      // Create workbook and worksheet
      const worksheet = xlsxUtils.json_to_sheet(excelData, {
        header: Object.keys(excelData[0] || {}),
        skipHeader: false
      })
      const workbook = xlsxUtils.book_new()
      xlsxUtils.book_append_sheet(workbook, worksheet, 'Data Pendaftar')

      // Style configuration
      const headerStyle = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "CCCCCC" } },
        alignment: { horizontal: "center", vertical: "center" }
      }

      // Apply styles to header row
      const range = xlsxUtils.decode_range(worksheet['!ref'] || 'A1')
      for (let col = range.s.c; col <= range.e.c; col++) {
        const headerCell = xlsxUtils.encode_cell({ r: 0, c: col })
        if (!worksheet[headerCell]) continue
        worksheet[headerCell].s = headerStyle
      }

      // Auto-size columns with padding
      const maxWidth = 50
      const colWidths = Object.keys(excelData[0] || {}).map(key => {
        const width = Math.min(
          maxWidth,
          Math.max(
            key.length + 2, // Add padding for header
            ...excelData.map(row => String(row[key]).length + 2) // Add padding for content
          )
        )
        return { wch: width }
      })
      worksheet['!cols'] = colWidths

      // Set row heights
      worksheet['!rows'] = [{ hpt: 30 }] // Header row height

      // Generate Excel file
      xlsxWriteFile(
        workbook,
        `Data_Pendaftar_TPQ_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`
      )

      toast({
        title: "Success",
        description: "Data berhasil diexport ke Excel",
        variant: "success"
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: "Error",
        description: "Gagal mengexport data ke Excel",
        variant: "destructive"
      })
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">TK/TP Al-Quran LPPTKA BKPRMI UNIT 004 Nur Islam</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Excel</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pendaftar</p>
                  <p className="text-2xl font-bold text-gray-900">{pendaftarList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Menunggu Verifikasi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendaftarList.filter((p) => p.status === "Menunggu Verifikasi").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Diterima</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendaftarList.filter((p) => p.status === "Diterima").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pendaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Nama Lengkap</th>
                    <th className="py-3 px-4 text-left">Asal Sekolah</th>
                    <th className="py-3 px-4 text-left">Tanggal Daftar</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Verifikasi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendaftarList.map((pendaftar) => (
                    <tr key={pendaftar.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{pendaftar.namaLengkap}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <span className="font-medium">{pendaftar.status_masuk}</span>
                          {pendaftar.status_masuk === "Santri Pindahan" && pendaftar.nama_tpq_sebelum && (
                            <div className="text-gray-600">
                              TPQ: {pendaftar.nama_tpq_sebelum}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatDate(pendaftar.tanggalDaftar)}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(pendaftar.status)}>
                          {pendaftar.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={pendaftar.is_verified}
                          onChange={() => handleVerificationChange(pendaftar.id, pendaftar.is_verified)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(pendaftar.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusChange(pendaftar.id)}
                            disabled={pendaftar.status === 'Diterima'}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteDialog({
                              isOpen: true,
                              pendaftarId: pendaftar.id,
                              pendaftarName: pendaftar.namaLengkap
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => 
        setDeleteDialog(prev => ({ ...prev, isOpen }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Konfirmasi Hapus Data
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pendaftar <strong>{deleteDialog.pendaftarName}</strong>? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait termasuk pembayaran.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({
                isOpen: false,
                pendaftarId: null,
                pendaftarName: ""
              })}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard
