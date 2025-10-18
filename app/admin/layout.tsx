import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Building2, LogOut } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Only show layout for authenticated users (not on sign-in page)
  const showNav = user && !children?.toString().includes('sign-in')

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && (
        <nav className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Focus Assessments
                </Link>
                <div className="hidden md:flex space-x-4">
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/trainers">
                    <Button variant="ghost" size="sm">
                      Trainers
                    </Button>
                  </Link>
                  <Link href="/admin/sittings">
                    <Button variant="ghost" size="sm">
                      Sittings
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <form action="/auth/sign-out" method="post">
                  <Button type="submit" variant="ghost" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
