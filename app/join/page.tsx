"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [shortCode, setShortCode] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      setShortCode(code.toUpperCase())
    }
  }, [searchParams])

  const handleContinue = () => {
    if (shortCode.trim()) {
      router.push(`/join/confirm?sc=${shortCode}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && shortCode.trim()) {
      handleContinue()
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            Join Assessment
          </CardTitle>
          <CardDescription>
            Enter the short code provided by your trainer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="shortCode" className="text-sm font-medium">
              Short Code
            </label>
            <Input
              id="shortCode"
              type="text"
              placeholder="e.g., FAW-AB3D"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="text-center text-2xl font-mono tracking-wider h-14"
              autoFocus
            />
          </div>
          <Button
            onClick={handleContinue}
            className="w-full h-12 text-lg"
            disabled={shortCode.trim().length === 0}
          >
            Continue
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            The short code is displayed on your trainer's screen or scan the QR code
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
