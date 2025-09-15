"use client"

import * as React from "react"
import Image from "next/image"
import { Upload, Eye, RotateCcw, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadPreviewProps {
  file?: File | null
  onFileChange: (file: File | null) => void
  label: string
  description?: string
  className?: string
  accept?: string
}

export function FileUploadPreview({
  file,
  onFileChange,
  label,
  description,
  className,
  accept = "image/*"
}: FileUploadPreviewProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }, [file])

  const handleFileSelect = (selectedFile: File) => {
    onFileChange(selectedFile)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const changeFile = () => {
    fileInputRef.current?.click()
  }

  if (file) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{file.name}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Berhasil diupload
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Lihat
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={changeFile}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Ganti
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeFile}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Preview Modal */}
        {showPreview && preview && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <Image
                src={preview}
                alt="Preview"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <Button
                onClick={() => setShowPreview(false)}
                variant="secondary"
                size="sm"
                className="absolute top-6 right-6"
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div 
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">Klik untuk upload atau drag & drop</p>
          </div>
          <p className="text-xs text-muted-foreground">{description || "JPG, PNG hingga 5MB"}</p>
        </div>
      </div>
    </div>
  )
}
