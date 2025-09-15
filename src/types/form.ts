// Shared form types for the student registration form

export interface StudentRegistrationFormData {
  // Student data
  nama_lengkap: string
  nama_panggilan: string
  jenis_kelamin: string
  tempat_lahir: string
  tanggal_lahir: string
  alamat_rumah: string
  anak_ke: number
  jumlah_saudara: number
  golongan_darah?: string
  penyakit_pernah?: string
  
  // Father data
  nama_ayah: string
  tempat_lahir_ayah: string
  tanggal_lahir_ayah: string
  suku_ayah: string
  pendidikan_ayah: string
  pekerjaan_ayah: string
  alamat_ayah: string
  hp_ayah: string
  
  // Mother data
  nama_ibu: string
  tempat_lahir_ibu: string
  tanggal_lahir_ibu: string
  suku_ibu: string
  pendidikan_ibu: string
  pekerjaan_ibu: string
  alamat_ibu: string
  hp_ibu: string
  
  // School data
  status_masuk: string
  nama_tpq_sebelum?: string
  tanggal_pindah?: string
  kelompok_belajar: string
  tingkat_pembelajaran?: string
  juz_alquran?: number
  
  // File uploads - File objects or null
  foto_akte?: File | null
  foto_kk?: File | null
  foto_3x4?: File | null
  foto_2x4?: File | null
}
