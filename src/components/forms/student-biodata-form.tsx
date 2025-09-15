"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { StudentRegistrationFormData } from "@/types/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface StudentBiodataFormProps {
  form: UseFormReturn<StudentRegistrationFormData>
}

export function StudentBiodataForm({ form }: StudentBiodataFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="nama_lengkap"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Lengkap *</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nama lengkap" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nama_panggilan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Panggilan *</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan nama panggilan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="jenis_kelamin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jenis Kelamin *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="anak_ke"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Anak Ke *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                placeholder="1"
                {...field}
                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tempat_lahir"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tempat Lahir *</FormLabel>
            <FormControl>
              <Input placeholder="Masukkan tempat lahir" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tanggal_lahir"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Lahir *</FormLabel>
            <FormControl>
              <DatePicker
                date={field.value ? new Date(field.value) : undefined}
                onDateChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                placeholder="Pilih tanggal lahir"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="jumlah_saudara"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jumlah Saudara *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="golongan_darah"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Golongan Darah</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih golongan darah" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="AB">AB</SelectItem>
                <SelectItem value="O">O</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="alamat_rumah"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Alamat Rumah *</FormLabel>
            <FormControl>
              <Textarea placeholder="Masukkan alamat lengkap" className="min-h-[80px]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="penyakit_pernah"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Riwayat Penyakit</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Sebutkan jika pernah mengalami penyakit serius (opsional)"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
