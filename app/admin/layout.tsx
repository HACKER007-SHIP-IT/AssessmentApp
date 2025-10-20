export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Navigation is now handled by AppHeader in root layout
  // This layout just provides the admin-specific wrapper
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
