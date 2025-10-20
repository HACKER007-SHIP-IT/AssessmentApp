/**
 * Trainer Token Layout
 *
 * This layout explicitly ensures no header is shown on trainer token pages.
 * The AppHeader component checks shouldShowHeader() which returns false for /trainer/* routes,
 * but this layout provides additional structure for trainer-specific pages.
 */
export default function TrainerTokenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
