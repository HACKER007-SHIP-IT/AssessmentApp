"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Circle, X } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "./SectionHeader"
import { AnnotatorPanel } from "./AnnotatorPanel"
import { saveSectionMark } from "@/lib/actions/practicals"
import { cn } from "@/lib/utils"
import type { SectionResult, SectionAnnotation } from "@/lib/types/practical"

type Skill = {
  id: string
  practical_scenario_id: string
  lo_number: string
  skill_description: string
  is_critical: boolean
  display_order: number
  created_at: string
}

type Scenario = {
  id: string
  practical_assessment_id: string
  scenario_number: number
  title: string
  description: string | null
  is_optional: boolean
  display_order: number
  created_at: string
  skills: Skill[]
}

type ScenarioCardProps = {
  scenario: Scenario
  attemptId: string
  disabled?: boolean
  defaultExpanded?: boolean
}

export function ScenarioCard({
  scenario,
  attemptId,
  disabled = false,
  defaultExpanded = false,
}: ScenarioCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [result, setResult] = useState<SectionResult>(null)
  const [annotations, setAnnotations] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'pass_oral' | 'fail'>('pass_oral')
  const [isSaving, setIsSaving] = useState(false)

  // Calculate counts
  const annotationsList = Array.from(annotations).map(loId => {
    const skill = scenario.skills.find(s => s.id === loId)
    return {
      loId,
      loNumber: skill?.lo_number || '',
      reason: result === 'pass_oral' ? 'oral' as const : 'fail' as const,
    }
  })
  const oralCount = result === 'pass_oral' ? annotationsList.length : 0
  const failCount = result === 'fail' ? annotationsList.length : 0

  const handlePass = async () => {
    setIsSaving(true)
    try {
      const saved = await saveSectionMark({
        sittingId: attemptId,
        studentId: '', // Will be handled by server
        sectionId: scenario.id,
        result: 'pass',
        annotations: [],
        notes: '',
      })
      setResult('pass')
      setAnnotations(new Set())
      setNotes('')
    } catch (error) {
      console.error('Error saving pass:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenAnnotator = (mode: 'pass_oral' | 'fail') => {
    setPanelMode(mode)
    setPanelOpen(true)
  }

  const handleToggleLO = (loId: string) => {
    setAnnotations(prev => {
      const next = new Set(prev)
      if (next.has(loId)) {
        next.delete(loId)
      } else {
        next.add(loId)
      }
      return next
    })
  }

  const handleSaveAnnotator = async () => {
    if (annotations.size === 0) {
      alert('Please select at least one LO.')
      return
    }

    setIsSaving(true)
    try {
      const annotationsList: SectionAnnotation[] = Array.from(annotations).map(loId => {
        const skill = scenario.skills.find(s => s.id === loId)
        return {
          loId,
          loNumber: skill?.lo_number || '',
          reason: panelMode === 'pass_oral' ? 'oral' : 'fail',
        }
      })

      const saved = await saveSectionMark({
        sittingId: attemptId,
        studentId: '', // Will be handled by server
        sectionId: scenario.id,
        result: panelMode,
        annotations: annotationsList,
        notes,
      })

      setResult(panelMode)
      setPanelOpen(false)
    } catch (error) {
      console.error('Error saving section mark:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    if (!confirm('Clear this section marking?')) return

    setIsSaving(true)
    try {
      await saveSectionMark({
        sittingId: attemptId,
        studentId: '',
        sectionId: scenario.id,
        result: null,
        annotations: [],
        notes: '',
      })
      setResult(null)
      setAnnotations(new Set())
      setNotes('')
    } catch (error) {
      console.error('Error clearing:', error)
      alert('Failed to clear. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card className={cn(
        "rounded-2xl shadow-lg border-2 transition-all",
        result === 'pass' && "border-green-300 bg-green-50/30",
        result === 'pass_oral' && "border-blue-300 bg-blue-50/30",
        result === 'fail' && "border-red-300 bg-red-50/30",
        !result && "border-gray-200"
      )}>
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0",
                result === 'pass' && "bg-green-100 text-green-700",
                result === 'pass_oral' && "bg-blue-100 text-blue-700",
                result === 'fail' && "bg-red-100 text-red-700",
                !result && "bg-gray-100 text-gray-600"
              )}>
                {scenario.scenario_number}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-semibold">{scenario.title}</h3>
                  {scenario.is_optional && (
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  )}
                </div>
                {scenario.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {scenario.description}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Section-level marking controls */}
            <SectionHeader
              title="Section Result"
              subtitle="Mark the overall section performance"
              result={result}
              oralCount={oralCount}
              failCount={failCount}
              onPass={handlePass}
              onOpenAnnotator={handleOpenAnnotator}
              onClear={handleClear}
              disabled={disabled || isSaving}
            />

            {/* Read-only LO list with annotation chips */}
            <div>
              <h4 className="text-sm font-semibold text-focus-text mb-3">
                Learning Outcomes
              </h4>
              <div className="space-y-2">
                {scenario.skills.map((skill) => {
                  const isAnnotated = annotations.has(skill.id)
                  const annotationType = result === 'pass_oral' ? 'oral' : result === 'fail' ? 'fail' : null

                  return (
                    <div
                      key={skill.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        isAnnotated && result === 'pass_oral' && "bg-blue-50 border-blue-200",
                        isAnnotated && result === 'fail' && "bg-red-50 border-red-200",
                        !isAnnotated && "bg-white border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0",
                        isAnnotated && result === 'pass_oral' && "bg-blue-100 text-blue-700",
                        isAnnotated && result === 'fail' && "bg-red-100 text-red-700",
                        !isAnnotated && "bg-gray-100 text-gray-600"
                      )}>
                        {skill.lo_number}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-focus-text">
                          {skill.skill_description}
                        </p>
                      </div>

                      {isAnnotated && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex-shrink-0",
                            annotationType === 'oral' && "bg-blue-100 text-blue-700 border-blue-300",
                            annotationType === 'fail' && "bg-red-100 text-red-700 border-red-300"
                          )}
                        >
                          {annotationType === 'oral' ? (
                            <>
                              <Circle className="h-3 w-3 mr-1" />
                              Oral
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Failed
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Annotator Panel Dialog */}
      <AnnotatorPanel
        open={panelOpen}
        mode={panelMode}
        loList={scenario.skills}
        selectedLOs={annotations}
        notes={notes}
        onToggleLO={handleToggleLO}
        onNotesChange={setNotes}
        onSave={handleSaveAnnotator}
        onClose={() => setPanelOpen(false)}
        isSaving={isSaving}
      />
    </>
  )
}
