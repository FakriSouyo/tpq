"use client"

import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { StudentRegistrationFormData } from "@/types/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { DatePicker } from "@/components/ui/date-picker"
import { FileUploadPreview } from "@/components/ui/file-upload-preview"

interface SchoolInfoFormProps {
  form: UseFormReturn<StudentRegistrationFormData>
}

interface BiayaItem {
  id: string
  nama_biaya: string
  jumlah: number
}

export function SchoolInfoForm({ form }: SchoolInfoFormProps) {
  const statusMasuk = form.watch("status_masuk")
  const kelompokBelajar = form.watch("kelompok_belajar")
  const [biayaList, setBiayaList] = useState<BiayaItem[]>([])
  const [totalBiaya, setTotalBiaya] = useState(0)

  // Load biaya data
  useEffect(() => {
    const loadBiaya = async () => {
      const { data } = await supabase
        .from('biaya_pendaftaran')
        .select('*')
      
      if (data) {
        setBiayaList(data)
      }
    }

    loadBiaya()
  }, [])

  // Calculate total biaya based on kelompok belajar
  useEffect(() => {
    if (!kelompokBelajar || biayaList.length === 0) {
      setTotalBiaya(0)
      return
    }

    let total = 0
    const isAlQuran = kelompokBelajar === 'Al-Quran'

    biayaList.forEach(item => {
      // Skip Buku Prestasi Iqro for Al-Quran students
      if (item.nama_biaya === 'Buku Prestasi Iqro' && isAlQuran) {
        return
      }
      // Skip Buku Prestasi Al-Quran for Iqro students
      if (item.nama_biaya === 'Buku Prestasi Al-Quran' && !isAlQuran) {
        return
      }
      // Skip Buku Iqro for Al-Quran students
      if (item.nama_biaya === 'Buku Iqro' && isAlQuran) {
        return
      }
      total += item.jumlah
    })

    setTotalBiaya(total)
  }, [kelompokBelajar, biayaList])

  // Clear fields when kelompok belajar changes
  useEffect(() => {
    if (kelompokBelajar === "Iqro") {
      form.setValue("juz_alquran", 0)
    } else if (kelompokBelajar === "Al-Quran") {
      form.setValue("tingkat_pembelajaran", "")
    }
  }, [kelompokBelajar, form])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="status_masuk"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status Masuk *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status masuk" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Santri Baru">Santri Baru</SelectItem>
                <SelectItem value="Santri Pindahan">Santri Pindahan</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="kelompok_belajar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kelompok Belajar *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelompok belajar" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Iqro">Iqro</SelectItem>
                <SelectItem value="Al-Quran">Al-Quran</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {statusMasuk === "Santri Pindahan" && (
        <>
          <FormField
            control={form.control}
            name="nama_tpq_sebelum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama TPQ Sebelumnya</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama TPQ sebelumnya" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tanggal_pindah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Pindah</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onDateChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    placeholder="Pilih tanggal pindah"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Conditional fields based on kelompok_belajar */}
      {kelompokBelajar === "Iqro" && (
        <FormField
          control={form.control}
          name="tingkat_pembelajaran"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tingkat Pembelajaran *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat Iqro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Iqro 1">Iqro 1</SelectItem>
                  <SelectItem value="Iqro 2">Iqro 2</SelectItem>
                  <SelectItem value="Iqro 3">Iqro 3</SelectItem>
                  <SelectItem value="Iqro 4">Iqro 4</SelectItem>
                  <SelectItem value="Iqro 5">Iqro 5</SelectItem>
                  <SelectItem value="Iqro 6">Iqro 6</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {kelompokBelajar === "Al-Quran" && (
        <FormField
          control={form.control}
          name="juz_alquran"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Juz Al-Quran *</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number.parseInt(value))} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih juz Al-Quran" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                    <SelectItem key={juz} value={juz.toString()}>
                      Juz {juz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="md:col-span-2 space-y-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Dokumen Pendukung</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="foto_akte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto Akte Kelahiran *</FormLabel>
                  <FormControl>
                    <FileUploadPreview
                      file={field.value}
                      onFileChange={field.onChange}
                      label="Upload Foto Akte Kelahiran"
                      description="JPG, PNG hingga 5MB"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foto_kk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto Kartu Keluarga *</FormLabel>
                  <FormControl>
                    <FileUploadPreview
                      file={field.value}
                      onFileChange={field.onChange}
                      label="Upload Foto Kartu Keluarga"
                      description="JPG, PNG hingga 5MB"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foto_3x4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto 3x4 *</FormLabel>
                  <FormControl>
                    <FileUploadPreview
                      file={field.value}
                      onFileChange={field.onChange}
                      label="Upload Foto 3x4"
                      description="Seragam batik TPA, JPG/PNG 5MB"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foto_2x4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto 2x4 *</FormLabel>
                  <FormControl>
                    <FileUploadPreview
                      file={field.value}
                      onFileChange={field.onChange}
                      label="Upload Foto 2x4"
                      description="Seragam batik TPA, JPG/PNG 5MB"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Payment Information */}
        {kelompokBelajar && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Informasi Biaya Pendaftaran</h4>
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              {biayaList
                .filter(item => {
                  const isAlQuran = kelompokBelajar === 'Al-Quran'
                  // Skip items that don't apply to current kelompok
                  if (item.nama_biaya === 'Buku Prestasi Iqro' && isAlQuran) return false
                  if (item.nama_biaya === 'Buku Prestasi Al-Quran' && !isAlQuran) return false
                  if (item.nama_biaya === 'Buku Iqro' && isAlQuran) return false
                  return true
                })
                .map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-sm">{item.nama_biaya}</span>
                    <span className="text-sm font-medium">Rp {item.jumlah.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Biaya</span>
                  <span className="font-bold text-lg text-primary">Rp {totalBiaya.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                * Pembayaran dapat dilakukan setelah pendaftaran diverifikasi
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
