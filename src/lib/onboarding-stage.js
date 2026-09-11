export const ONBOARDING_STEPS = [
  "Contract",
  "Welcome",
  "Invoice",
  "Access",
  "Kickoff",
  "Active",
  "Reporting",
  "Feedback",
];

/**
 * Derives a client's onboarding step from real state (never a stored,
 * separately-maintained field that could drift from reality).
 */
export function deriveOnboardingIndex({
  hasContractSigned,
  welcomeSentAt,
  hasInvoicePaid,
  accessComplete,
  hasKickoffMeeting,
  hasProject,
  hasPublishedReport,
  hasFeedback,
}) {
  if (!hasContractSigned) return 0;
  if (!welcomeSentAt) return 1;
  if (!hasInvoicePaid) return 2;
  if (!accessComplete) return 3;
  if (!hasKickoffMeeting) return 4;
  if (!hasProject) return 5;
  if (!hasPublishedReport) return 6;
  if (!hasFeedback) return 7;
  return 7;
}
