"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Info, MapPin, Phone, Mail } from "lucide-react"

export function TpqInfo() {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          Info TPQ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">TPQ Nur Islam Tarakan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tarakan Timur, Kalimantan Utara</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">081227787685</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">tpqnurislamtarakan@gmail.com</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Jam Belajar:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Senin-Kamis: 14.00-17.00 WITA</div>
              <div>• Jumat: 15.00-17.00 WITA</div>
              <div>• Sabtu-Minggu: Libur</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
