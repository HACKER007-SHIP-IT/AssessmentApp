import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, CheckCircle2, XCircle, Shield } from "lucide-react"

interface AccountCardProps {
  email: string
  role: 'owner' | 'admin'
  createdAt: string
  emailVerified?: boolean
}

/**
 * AccountCard Component
 *
 * Read-only display of user account information:
 * - Email address
 * - Role badge (Owner/Admin)
 * - Account creation date
 * - Email verification status
 */
export function AccountCard({ email, role, createdAt, emailVerified = true }: AccountCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getRoleBadge = () => {
    if (role === 'owner') {
      return (
        <Badge className="bg-focus-blue text-white">
          <Shield className="h-3 w-3 mr-1" />
          Owner
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-focus-blue text-focus-blue">
        Admin
      </Badge>
    )
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription className="mt-1">
              Your personal account details
            </CardDescription>
          </div>
          {getRoleBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Email */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Email Address</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium">{email}</p>
            {emailVerified ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <XCircle className="h-4 w-4" />
                <span className="text-xs">Unverified</span>
              </div>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Role</p>
          <p className="text-lg font-medium capitalize">{role}</p>
          {role === 'owner' && (
            <p className="text-xs text-muted-foreground mt-1">
              You have full access to manage this organization
            </p>
          )}
          {role === 'admin' && (
            <p className="text-xs text-muted-foreground mt-1">
              You can manage trainers and sittings, but cannot modify organization settings
            </p>
          )}
        </div>

        {/* Account Created */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground mb-1">Account Created</p>
          <p className="text-lg font-medium">{formatDate(createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
