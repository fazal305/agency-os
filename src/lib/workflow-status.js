export const CONTRACT_STATUS = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  viewed: { label: "Viewed", tone: "info" },
  signed: { label: "Signed", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
  expired: { label: "Expired", tone: "warning" },
};

export const INVOICE_STATUS = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  viewed: { label: "Viewed", tone: "info" },
  due: { label: "Due", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export const DELIVERABLE_STATUS = {
  draft: { label: "Draft", tone: "neutral" },
  internal_review: { label: "Internal Review", tone: "neutral" },
  client_review: { label: "Client Review", tone: "info" },
  revision_requested: { label: "Revision Requested", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  delivered: { label: "Delivered", tone: "success" },
};

export const PERFORMANCE_STATUS = {
  excellent: { label: "Excellent", tone: "success" },
  on_target: { label: "On Target", tone: "info" },
  needs_attention: { label: "Needs Attention", tone: "warning" },
  below_target: { label: "Below Target", tone: "danger" },
};

export const TESTIMONIAL_STATUS = {
  requested: { label: "Requested", tone: "neutral" },
  opened: { label: "Opened", tone: "info" },
  submitted: { label: "Submitted", tone: "info" },
  approved: { label: "Approved", tone: "success" },
  published: { label: "Published", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
};

export const ACCESS_STATUS = {
  not_requested: { label: "Not requested", tone: "neutral" },
  requested: { label: "Requested", tone: "warning" },
  received: { label: "Received", tone: "info" },
  verified: { label: "Verified", tone: "success" },
  needs_attention: { label: "Needs attention", tone: "danger" },
  complete: { label: "Complete", tone: "success" },
};
