"use client"

import { QRCodeSVG } from "qrcode.react"

interface QrProps {
  value: string
  size?: number
}

export function Qr({ value, size = 200 }: QrProps) {
  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg border-2 border-border">
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  )
}
