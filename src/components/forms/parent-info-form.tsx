"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { StudentRegistrationFormData } from "@/types/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"

interface ParentInfoFormProps {
  form: UseFormReturn<StudentRegistrationFormData>
}

export function ParentInfoForm({ form }: ParentInfoFormProps) {
  return (
    <div className="space-y-8">
      {/* Father Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Ayah</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nama_ayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Ayah *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama ayah" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tempat_lahir_ayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat Lahir Ayah *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan tempat lahir ayah" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tanggal_lahir_ayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Lahir Ayah *</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onDateChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    placeholder="Pilih tanggal lahir ayah"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="suku_ayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suku Ayah *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan suku ayah" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pendidikan_ayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pendidikan Ayah *</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: S1, SMA, dll" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pekerjaan_ayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan Ayah *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan pekerjaan ayah" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hp_ayah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No HP Ayah *</FormLabel>
                <FormControl>
                  <Input placeholder="08xxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamat_ayah"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Alamat Ayah *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Masukkan alamat lengkap ayah" className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Mother Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Ibu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nama_ibu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Ibu *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama ibu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tempat_lahir_ibu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat Lahir Ibu *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan tempat lahir ibu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tanggal_lahir_ibu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Lahir Ibu *</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onDateChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    placeholder="Pilih tanggal lahir ibu"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="suku_ibu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suku Ibu *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan suku ibu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pendidikan_ibu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pendidikan Ibu *</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: S1, SMA, dll" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pekerjaan_ibu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan Ibu *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan pekerjaan ibu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hp_ibu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No HP Ibu *</FormLabel>
                <FormControl>
                  <Input placeholder="08xxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamat_ibu"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Alamat Ibu *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Masukkan alamat lengkap ibu" className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
