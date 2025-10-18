import Link from "next/link"
import { Focus, PlusCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "./sign-out-button"
import { Button } from "./ui/button"

export async function AppHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Focus className="h-6 w-6" />
            <span className="hidden sm:inline">Focus Assessments</span>
            <span className="sm:hidden">FA</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
                <Button asChild size="sm" className="h-9">
                  <Link href="/admin/sittings/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">New Sitting</span>
                    <span className="sm:hidden">New</span>
                  </Link>
                </Button>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/admin/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            )}
            <Link
              href="/join"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Join
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
