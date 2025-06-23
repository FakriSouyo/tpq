import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  photoPage: {
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 12,
  },
  value: {
    width: '70%',
    fontSize: 12,
  },
  photoContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 400,
    height: 500,
    objectFit: 'contain',
    marginBottom: 20,
  },
  photoCaption: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
})

interface PendaftarPDFProps {
  data: {
    namaLengkap: string
    namaPanggilan: string
    jenisKelamin: string
    tempatLahir: string
    tanggalLahir: string
    alamatRumah: string
    anakKe: number
    jumlahSaudara: number
    golonganDarah: string | null
    penyakitPernah: string | null
    statusMasuk: string
    namaTpqSebelum: string | null
    tanggalPindah: string | null
    kelompokBelajar: string
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
    tanggalVerifikasi: string | null
    fotoAkta: string | null
    fotoKk: string | null
    foto3x4: string | null
    foto2x4: string | null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const PendaftarPDF = ({ data }: PendaftarPDFProps) => (
  <Document>
    {/* Data Santri Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.title}>
        <Text>Data Pendaftaran Santri</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Data Pribadi</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <Text style={styles.value}>: {data.namaLengkap}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nama Panggilan</Text>
          <Text style={styles.value}>: {data.namaPanggilan}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Jenis Kelamin</Text>
          <Text style={styles.value}>: {data.jenisKelamin}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tempat Lahir</Text>
          <Text style={styles.value}>: {data.tempatLahir}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal Lahir</Text>
          <Text style={styles.value}>: {formatDate(data.tanggalLahir)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat</Text>
          <Text style={styles.value}>: {data.alamatRumah}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Anak Ke</Text>
          <Text style={styles.value}>: {data.anakKe} dari {data.jumlahSaudara} bersaudara</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Golongan Darah</Text>
          <Text style={styles.value}>: {data.golonganDarah || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Riwayat Penyakit</Text>
          <Text style={styles.value}>: {data.penyakitPernah || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Data Pendaftaran</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Status Masuk</Text>
          <Text style={styles.value}>: {data.statusMasuk}</Text>
        </View>
        {data.statusMasuk === 'Santri Pindahan' && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>TPQ Sebelumnya</Text>
              <Text style={styles.value}>: {data.namaTpqSebelum}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tanggal Pindah</Text>
              <Text style={styles.value}>: {data.tanggalPindah ? formatDate(data.tanggalPindah) : '-'}</Text>
            </View>
          </>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Kelompok Belajar</Text>
          <Text style={styles.value}>: {data.kelompokBelajar || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal Daftar</Text>
          <Text style={styles.value}>: {formatDate(data.tanggalDaftar)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>: {data.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status Verifikasi</Text>
          <Text style={styles.value}>: {data.is_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}</Text>
        </View>
        {data.is_verified && data.tanggalVerifikasi && (
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Verifikasi</Text>
            <Text style={styles.value}>: {formatDate(data.tanggalVerifikasi)}</Text>
          </View>
        )}
      </View>
    </Page>

    {/* Data Orang Tua Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.title}>
        <Text>Data Orang Tua Santri</Text>
        <Text style={{ fontSize: 14, marginTop: 5 }}>{data.namaLengkap}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Data Ayah</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <Text style={styles.value}>: {data.namaAyah}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tempat Lahir</Text>
          <Text style={styles.value}>: {data.tempatLahirAyah}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal Lahir</Text>
          <Text style={styles.value}>: {formatDate(data.tanggalLahirAyah)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Suku</Text>
          <Text style={styles.value}>: {data.sukuAyah}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pendidikan</Text>
          <Text style={styles.value}>: {data.pendidikanAyah}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pekerjaan</Text>
          <Text style={styles.value}>: {data.pekerjaanAyah}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat</Text>
          <Text style={styles.value}>: {data.alamatAyah}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>No. HP</Text>
          <Text style={styles.value}>: {data.hpAyah}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Data Ibu</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <Text style={styles.value}>: {data.namaIbu}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tempat Lahir</Text>
          <Text style={styles.value}>: {data.tempatLahirIbu}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal Lahir</Text>
          <Text style={styles.value}>: {formatDate(data.tanggalLahirIbu)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Suku</Text>
          <Text style={styles.value}>: {data.sukuIbu}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pendidikan</Text>
          <Text style={styles.value}>: {data.pendidikanIbu}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pekerjaan</Text>
          <Text style={styles.value}>: {data.pekerjaanIbu}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat</Text>
          <Text style={styles.value}>: {data.alamatIbu}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>No. HP</Text>
          <Text style={styles.value}>: {data.hpIbu}</Text>
        </View>
      </View>
    </Page>

    {/* Foto 3x4 Page */}
    {data.foto3x4 && (
      <Page size="A4" style={styles.photoPage}>
        <View style={styles.photoContainer}>
          <Image src={data.foto3x4} style={styles.photo} />
        </View>
      </Page>
    )}

    {/* Foto 2x4 Page */}
    {data.foto2x4 && (
      <Page size="A4" style={styles.photoPage}>
        <View style={styles.photoContainer}>
          <Image src={data.foto2x4} style={styles.photo} />
        </View>
      </Page>
    )}

    {/* Foto Kartu Keluarga Page */}
    {data.fotoKk && (
      <Page size="A4" style={styles.photoPage}>
        <View style={styles.photoContainer}>
          <Image src={data.fotoKk} style={styles.photo} />
        </View>
      </Page>
    )}

    {/* Foto Akta Page */}
    {data.fotoAkta && (
      <Page size="A4" style={styles.photoPage}>
        <View style={styles.photoContainer}>
          <Image src={data.fotoAkta} style={styles.photo} />
        </View>
      </Page>
    )}
  </Document>
)

export default PendaftarPDF 