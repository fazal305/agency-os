export const PROJECT_STAGES = [
  "discovery",
  "strategy",
  "planning",
  "production",
  "review",
  "revision",
  "approval",
  "delivered",
];

export const PROJECT_STATUS = {
  discovery: { label: "Discovery", tone: "neutral" },
  strategy: { label: "Strategy", tone: "info" },
  planning: { label: "Planning", tone: "info" },
  production: { label: "Production", tone: "brand" },
  review: { label: "Review", tone: "warning" },
  revision: { label: "Revision", tone: "warning" },
  approval: { label: "Approval", tone: "warning" },
  delivered: { label: "Delivered", tone: "success" },
};

export const MEETING_TYPE_LABEL = {
  kickoff: "Kickoff",
  consultation: "Consultation",
  feedback: "Feedback",
  review: "Review",
  strategy: "Strategy",
  deliverable_review: "Deliverable Review",
  other: "Other",
};
