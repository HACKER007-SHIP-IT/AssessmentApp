// QA: Polished join page with better UX and helper text
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, Info } from "lucide-react"

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [shortCode, setShortCode] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      // QA: Trim whitespace and uppercase
      setShortCode(code.toUpperCase().trim())
    }
  }, [searchParams])

  const handleContinue = () => {
    // QA: Trim whitespace before navigation
    const cleanCode = shortCode.trim()
    if (cleanCode) {
      router.push(`/join/confirm?sc=${cleanCode}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && shortCode.trim()) {
      handleContinue()
    }
  }

  // QA: Handle input change with auto-trim and uppercase
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().trim()
    setShortCode(value)
  }

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LogIn className="h-6 w-6 text-focus-blue" />
            Join Assessment
          </CardTitle>
          <CardDescription className="text-base">
            Enter the short code provided by your trainer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QA: Helper alert with friendly instructions */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-focus-blue" />
            <AlertDescription className="text-sm">
              You can enter the code with or without the course prefix<br />
              <span className="font-mono text-xs mt-1 block">e.g., "AB3D" or "FAW-AB3D"</span>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="shortCode" className="text-sm font-medium">
              Assessment Code
            </label>
            <Input
              id="shortCode"
              type="text"
              placeholder="AB3D"
              value={shortCode}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="text-center text-2xl font-mono tracking-wider h-14"
              autoFocus
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground text-center">
              Code automatically converts to UPPERCASE
            </p>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full h-12 text-lg"
            disabled={shortCode.length === 0}
          >
            Continue
          </Button>

          {/* QA: Helpful hint for where to find code */}
          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground">
              💡 The short code is displayed on your trainer's screen,<br />or you can scan the QR code if available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
