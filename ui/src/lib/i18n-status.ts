import { useTranslation } from "react-i18next";
import { t } from "i18next";

const ISSUE_STATUS_KEYS: Record<string, string> = {
  backlog: "issues.status.backlog",
  todo: "issues.status.todo",
  in_progress: "issues.status.inProgress",
  in_review: "issues.status.inReview",
  done: "issues.status.done",
  blocked: "issues.status.blocked",
  cancelled: "issues.status.cancelled",
};

const RUN_STATUS_KEYS: Record<string, string> = {
  queued: "runs.status.queued",
  running: "runs.status.running",
  succeeded: "runs.status.succeeded",
  failed: "runs.status.failed",
  cancelled: "runs.status.cancelled",
  timed_out: "runs.status.timedOut",
  pending: "runs.status.queued",
  received: "routines.runStatus.received",
  coalesced: "routines.runStatus.coalesced",
  skipped: "routines.runStatus.skipped",
  issue_created: "routines.runStatus.issueCreated",
  completed: "routines.runStatus.completed",
};

const AGENT_STATUS_KEYS: Record<string, string> = {
  active: "agents.status.active",
  paused: "agents.status.paused",
  idle: "agents.status.idle",
  running: "agents.status.running",
  error: "agents.status.error",
  pending_approval: "agents.status.pendingApproval",
  terminated: "agents.status.terminated",
};

function fallbackLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function useIssueStatusLabel(status: string): string {
  const { t } = useTranslation();
  const key = ISSUE_STATUS_KEYS[status];
  return key ? t(key) : fallbackLabel(status);
}

export function useRunStatusLabel(status: string): string {
  const { t } = useTranslation();
  const key = RUN_STATUS_KEYS[status];
  return key ? t(key) : fallbackLabel(status);
}

export function useAgentStatusLabel(status: string): string {
  const { t } = useTranslation();
  const key = AGENT_STATUS_KEYS[status];
  return key ? t(key) : fallbackLabel(status);
}

export function getIssueStatusLabel(status: string): string {
  const key = ISSUE_STATUS_KEYS[status];
  return key ? t(key) : fallbackLabel(status);
}

export function getRunStatusLabel(status: string): string {
  const key = RUN_STATUS_KEYS[status];
  return key ? t(key) : fallbackLabel(status);
}

export { ISSUE_STATUS_KEYS, RUN_STATUS_KEYS, AGENT_STATUS_KEYS };
