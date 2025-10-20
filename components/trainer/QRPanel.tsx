"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Qr } from "@/components/qr/Qr"
import { Copy, Maximize } from "lucide-react"
import { TRAINER_COPY } from "@/lib/constants/trainer-copy"

type QRPanelProps = {
  shortCode: string
  joinUrl: string
  origin: string
}

export function QRPanel({ shortCode, joinUrl, origin }: QRPanelProps) {
  const handleCopyJoinLink = async () => {
    await navigator.clipboard.writeText(joinUrl)
    // TODO: Show toast notification
  }

  const handleShowFullscreen = () => {
    // TODO: Open fullscreen QR modal
    console.log('Show fullscreen QR')
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {TRAINER_COPY.qrTitle}
        </CardTitle>
        <CardDescription>{TRAINER_COPY.qrDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <Qr value={joinUrl} size={200} />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">{TRAINER_COPY.shortCode}</p>
            <p className="text-3xl font-bold tracking-wider mt-1">{shortCode}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-muted p-3 text-center text-sm">
          <p className="text-muted-foreground">{TRAINER_COPY.studentsVisit}</p>
          <p className="font-mono text-xs mt-1">{origin}/join</p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleCopyJoinLink}
            variant="outline"
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            {TRAINER_COPY.copyJoinLink}
          </Button>
          <Button
            onClick={handleShowFullscreen}
            variant="outline"
            className="w-full"
          >
            <Maximize className="h-4 w-4 mr-2" />
            {TRAINER_COPY.showFullscreen}
          </Button>
        </div>

        {/* How to join */}
        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-2">{TRAINER_COPY.howToJoin.title}</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            {TRAINER_COPY.howToJoin.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
