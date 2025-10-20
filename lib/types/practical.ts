/**
 * Types for section-level practical assessment marking
 */

export type SectionResult = 'pass' | 'pass_oral' | 'fail' | null

export interface SectionAnnotation {
  loId: string              // UUID of the practical_skill
  loNumber: string          // Display number (e.g., "2.1")
  reason: 'oral' | 'fail'
}

export interface SectionMarkPayload {
  sittingId: string
  studentId: string
  sectionId: string         // practical_scenario_id (UUID)
  result: SectionResult
  annotations: SectionAnnotation[]  // Empty array for plain Pass
  notes?: string
}

export interface SectionMarkState {
  result: SectionResult
  annotations: SectionAnnotation[]
  notes: string
  oralCount: number
  failCount: number
}
