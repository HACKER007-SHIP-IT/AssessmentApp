import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppHeader } from "@/components/app-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Focus Assessments",
  description: "Simple, reliable assessments for FAIB providers",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-focus-blue focus:text-white focus:rounded-lg focus:ring-2 focus:ring-focus-blue focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <AppHeader />
        <main id="main-content" className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
