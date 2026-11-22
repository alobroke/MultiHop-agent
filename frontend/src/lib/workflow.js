import {
  FileText,
  GitBranch,
  Globe,
  Layers,
  PenLine,
  ShieldCheck,
} from "lucide-react";

export const WORKFLOW = [
  { id: "planner", label: "Query Planner", subtitle: "Assess complexity", Icon: GitBranch },
  { id: "documents", label: "Document Search", subtitle: "Local PDF evidence", Icon: FileText },
  { id: "web", label: "Web Search", subtitle: "Tavily fallback", Icon: Globe },
  { id: "generator", label: "Research Agent", subtitle: "Draft findings", Icon: PenLine },
  { id: "synthesis", label: "Synthesis", subtitle: "Combine findings", Icon: Layers },
  { id: "verification", label: "Citation Check", subtitle: "Validate references", Icon: ShieldCheck },
];

export function stageTitle(node) {
  const stage = WORKFLOW.find((s) => s.id === node);
  if (stage) return stage.label;
  if (node === "executor") return "Subquery Executor";
  return node;
}

export function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
