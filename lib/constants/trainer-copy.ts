/**
 * UK English microcopy for trainer console
 * Consistent terminology and helpful guidance
 */

export const TRAINER_COPY = {
  // Status labels
  statusWaitingRoom: "Waiting room",
  statusWrittenInProgress: "Written in progress",
  statusSittingEnded: "Sitting ended",

  // Guidance messages
  waitingRoom: "Share the QR or short code. Start the written when you're ready.",
  noEnrolled: "No enrolled students yet",
  startingAll: (count: number) => `Starting written for ${count} ${count === 1 ? 'student' : 'students'}...`,

  // Success messages
  extendSuccess: (minutes: number) => `Added ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`,
  lockSuccess: "New students can't enrol now",
  practicalMarked: (status: string) => `Marked as ${status}`,
  undoSuccess: "Practical marking removed",

  // Confirmation dialogs
  endConfirm: "End the sitting now? Students will no longer be able to submit answers.",
  startAllConfirm: (count: number) => `Start written assessment for ${count} ${count === 1 ? 'student' : 'students'}?`,
  lockConfirm: "Lock joins? No more students will be able to enrol after this.",

  // Error messages
  invalidToken: "This trainer link has expired. Please ask the administrator for a new link.",
  alreadyEnrolled: "This student is already enrolled on this sitting.",
  alreadyStarted: "Written already started for this student.",
  timerNotStarted: "Timer has not been started yet",
  sittingEnded: "This sitting has ended",
  cannotModifyClosed: "Cannot modify after sitting has ended",
  undoNotAllowed: "Can't undo practical after written is submitted",

  // Offline messages
  queuedActions: (count: number) => `Queued ${count} ${count === 1 ? 'action' : 'actions'}; will retry when connected`,
  endOffline: "Will end when reconnected",
  offlineWarning: "You're offline — controls may be delayed; we'll sync once reconnected",
  reconnected: "Reconnected — syncing queued actions",

  // Button labels
  startAll: "START ALL WRITTEN",
  startWritten: "Start written",
  markPractical: "Mark practical",
  undoPractical: "Undo practical",
  viewPractical: "View practical checklist",
  viewAnswers: "View written answers",
  copyLink: "Copy written link",
  exportCSV: "Export CSV",
  printSummary: "Print summary",
  printQR: "Print QR Code",
  projectorMode: "Projector mode",
  endSitting: "End sitting",
  lockJoins: "Lock joins",
  extendTime: "+{minutes} mins",

  // List/table headers
  studentName: "Student",
  writtenStatus: "Written",
  practicalStatus: "Practical",
  score: "Score",
  timeInAttempt: "Time",
  overallStatus: "Overall",

  // Status badges
  enrolled: "Enrolled",
  inProgress: "In progress",
  submitted: "Submitted",
  notStarted: "Not started",
  passed: "Passed",
  failed: "Failed",
  passedBoth: "Both passed",
  failedOne: "Failed",
  incomplete: "Incomplete",

  // Summary metrics
  enrolledCount: (count: number) => `Enrolled ${count}`,
  inProgressCount: (count: number) => `In progress ${count}`,
  submittedCount: (count: number) => `Submitted ${count}`,
  passRate: (percentage: number) => `Pass rate (submitted): ${percentage}%`,
  avgScore: (score: number) => `Avg score: ${score}%`,

  // QR Panel
  qrTitle: "Join Information",
  qrDescription: "Students scan or enter code to join",
  studentsVisit: "Students visit:",
  joinUrl: (origin: string) => `${origin}/join`,
  shortCode: "Short Code",
  copyJoinLink: "Copy join link",
  showFullscreen: "Show fullscreen",
  reopenQR: "Reopen QR",

  // How to join steps
  howToJoin: {
    title: "How to join",
    steps: [
      `Visit the URL or scan the QR code`,
      `Enter the short code`,
      `Type your name and enrol`,
    ],
  },

  // Keyboard shortcuts
  keyboardShortcuts: {
    title: "Keyboard Shortcuts",
    startAll: "Start all written",
    extend5: "+5 minutes",
    extend10: "+10 minutes",
    lock: "Lock joins",
    end: "End sitting",
    projector: "Toggle projector mode",
    help: "Show this help",
  },

  // Results panel
  resultsTitle: "Results",
  resultsKPIs: {
    passRate: "Pass Rate",
    avgScore: "Average Score",
    duration: "Duration",
  },

  // Filters
  filterAll: "All students",
  filterEnrolled: "Enrolled only",
  filterInProgress: "In progress only",
  filterSubmitted: "Submitted only",
  searchPlaceholder: "Search students...",

  // Practical statuses
  practicalPass: "Pass",
  practicalFail: "Fail",
  practicalInProgress: "In progress",

  // Time formatting
  minutesAgo: (minutes: number) => `${minutes}m ago`,
  secondsAgo: (seconds: number) => `${seconds}s ago`,
  duration: (minutes: number, seconds: number) => `${minutes}m ${seconds}s`,
} as const

/**
 * Helper to format time remaining
 */
export function formatTimeRemaining(endTime: string | null): string {
  if (!endTime) return '--:--'

  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return '00:00'

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Helper to get timer color class based on time remaining
 */
export function getTimerColorClass(endTime: string | null): string {
  if (!endTime) return 'text-gray-400' // Grey - not started

  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'text-red-600' // Expired
  if (diff <= 2 * 60 * 1000) return 'text-red-600' // ≤ 2 minutes - red
  if (diff <= 5 * 60 * 1000) return 'text-amber-600' // ≤ 5 minutes - amber
  return 'text-green-600' // > 5 minutes - green
}
