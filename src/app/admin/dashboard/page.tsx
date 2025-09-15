/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Eye, Users, Calendar, CheckCircle, Trash2, AlertCircle, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ThemeToggle } from "@/components/theme-toggle"
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
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

  const loadPendaftar = async (page = 1) => {
    try {
      // Get total count first
      const { count, error: countError } = await supabase
        .from('pendaftar_santri')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      // Calculate pagination
      const totalCount = count || 0
      const totalPagesCalc = Math.ceil(totalCount / itemsPerPage)
      setTotalPages(totalPagesCalc)

      // Get paginated data
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, error } = await supabase
        .from('pendaftar_santri')
        .select('*')
        .order('tanggal_daftar', { ascending: false })
        .range(from, to)

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

      setCurrentPage(page)
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

  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setIsLoading(true)
      await loadPendaftar(newPage)
      setIsLoading(false)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
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
      
      // Reload data to update pagination
      await loadPendaftar(currentPage)
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


  const handleStatusChange = async (id: string) => {
    try {
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
        .eq('id', id)

      if (pendaftarError) throw pendaftarError

      // Check if pembayaran record exists
      const { data: existingPembayaran } = await supabase
        .from('pembayaran')
        .select('id')
        .eq('pendaftar_id', id)
        .maybeSingle()

      if (existingPembayaran) {
        // Update existing pembayaran
        const { error: pembayaranError } = await supabase
          .from('pembayaran')
          .update({
            status_pembayaran: 'Dikonfirmasi',
            updated_at: new Date().toISOString()
          })
          .eq('pendaftar_id', id)

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
            pendaftar_id: id,
            total_biaya: totalBiaya,
            detail_biaya: biayaData || [],
            status_pembayaran: 'Dikonfirmasi',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (pembayaranError) throw pembayaranError
      }

      // Update local state
      setPendaftarList(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, status: 'Diterima', is_verified: true }
            : p
        )
      )

      toast({
        title: "Verifikasi Berhasil",
        description: "Pendaftaran telah diverifikasi dan status pembayaran diperbarui",
        variant: "success"
      })

      // Reload data to ensure we have the latest state
      loadPendaftar(currentPage)
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
              <p className="text-muted-foreground text-sm">TPQ Nur Islam Tarakan • Admin Panel</p>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button
                onClick={handleExportExcel}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-6 hover:bg-background/80 transition-colors">
            <div className="flex items-center">
              <div className="p-3 bg-foreground/10 rounded-full">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Pendaftar</p>
                <p className="text-2xl font-bold text-foreground">{pendaftarList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-6 hover:bg-background/80 transition-colors">
            <div className="flex items-center">
              <div className="p-3 bg-foreground/10 rounded-full">
                <Calendar className="h-5 w-5 text-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Menunggu Verifikasi</p>
                <p className="text-2xl font-bold text-foreground">
                  {pendaftarList.filter((p) => p.status === "Menunggu Verifikasi").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-6 hover:bg-background/80 transition-colors">
            <div className="flex items-center">
              <div className="p-3 bg-foreground/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Diterima</p>
                <p className="text-2xl font-bold text-foreground">
                  {pendaftarList.filter((p) => p.status === "Diterima").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="text-lg font-semibold text-foreground">Daftar Pendaftar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Nama Lengkap</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Asal Sekolah</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Tanggal Daftar</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendaftarList.map((pendaftar) => (
                  <tr key={pendaftar.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{pendaftar.namaLengkap}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{pendaftar.status_masuk}</span>
                        {pendaftar.status_masuk === "Santri Pindahan" && pendaftar.nama_tpq_sebelum && (
                          <div className="text-muted-foreground text-xs">
                            TPQ: {pendaftar.nama_tpq_sebelum}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(pendaftar.tanggalDaftar)}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={pendaftar.status === "Diterima" ? "default" : "secondary"}
                        className={pendaftar.status === "Diterima" ? "bg-foreground text-background" : ""}
                      >
                        {pendaftar.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(pendaftar.id)}
                          className="h-8 w-8 p-0 hover:bg-muted/50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {pendaftar.status !== 'Diterima' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(pendaftar.id)}
                            className="border-foreground/20 hover:bg-foreground hover:text-background text-xs px-2"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verifikasi
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({
                            isOpen: true,
                            pendaftarId: pendaftar.id,
                            pendaftarName: pendaftar.namaLengkap
                          })}
                          className="h-8 w-8 p-0 hover:bg-muted/50 text-destructive hover:text-destructive"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages} • Menampilkan {pendaftarList.length} data
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="border-foreground/20 hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum 
                            ? "bg-foreground text-background" 
                            : "border-foreground/20 hover:bg-foreground hover:text-background"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="border-foreground/20 hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
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

