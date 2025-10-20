import { redirect } from 'next/navigation'

type PageProps = {
  params: { token: string; studentId: string }
}

export default function PracticalStudentRedirect({ params }: PageProps) {
  // Immediate redirect to canonical query form
  redirect(`/trainer/${params.token}/practical?student=${params.studentId}`)
}
