import type { AppIconName } from "../../components/AppIcon";
import type {
  IncomeStructureNodeKind,
  IncomeStructureSourceNode,
  IncomeStructureSummaryRow,
} from "./profitabilityAnalysis";

export type IncomeFlowNodeKind = IncomeStructureNodeKind;

export interface IncomeFlowSummaryRow extends IncomeStructureSummaryRow {}

export interface IncomeFlowNode {
  amount: number;
  children?: IncomeFlowNode[];
  description?: string;
  icon: AppIconName;
  id: string;
  kind: IncomeFlowNodeKind;
  label: string;
  percentage?: number;
  rootLabel?: string;
  summary?: IncomeFlowSummaryRow[];
}

export interface IncomeFlowViewModel {
  breadcrumb: Array<{ idPath: string[]; label: string }>;
  children: IncomeFlowNode[];
  currentPath: string[];
  focusNode: IncomeFlowNode;
  periodLabel: string;
  selectedNode: IncomeFlowNode;
  subtitle: string;
}

const currency = (value: number) =>
  `¥${value.toLocaleString("zh-CN", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })}`;

export function buildIncomeStructureFlowRoot(source: IncomeStructureSourceNode): IncomeFlowNode {
  return cloneNode(source);
}

export function buildIncomeStructureFlowViewModel(
  root: IncomeFlowNode,
  path: string[],
  selectedNodeId?: string | null,
): IncomeFlowViewModel {
  const focusNode = findNodeByPath(root, path) ?? root;
  const children = (focusNode.children ?? []).filter((node) => node.amount > 0);
  const selectedNode = children.find((node) => node.id === selectedNodeId) ?? focusNode;

  return {
    breadcrumb: buildBreadcrumb(root, path),
    children,
    currentPath: path,
    focusNode,
    periodLabel: "2026年4月",
    selectedNode,
    subtitle: "2026年4月 · IMCFO 个人财务口径",
  };
}

export function findNodeByPath(root: IncomeFlowNode, path: string[]): IncomeFlowNode | null {
  let current: IncomeFlowNode = root;
  for (const id of path) {
    const next = current.children?.find((node) => node.id === id);
    if (!next) return null;
    current = next;
  }
  return current;
}

export function getIncomeFlowNodeTitle(node: IncomeFlowNode): string {
  return node.rootLabel ?? node.label;
}

export function formatIncomeFlowCurrency(value: number): string {
  return currency(value);
}

function cloneNode(node: IncomeStructureSourceNode): IncomeFlowNode {
  return {
    amount: node.amount,
    children: node.children?.filter((child) => child.amount > 0).map(cloneNode),
    description: node.description,
    icon: node.icon,
    id: node.id,
    kind: node.kind,
    label: node.label,
    percentage: node.percentage,
    rootLabel: node.rootLabel,
    summary: node.summary?.map((row) => ({ ...row })),
  };
}

function buildBreadcrumb(root: IncomeFlowNode, path: string[]): Array<{ idPath: string[]; label: string }> {
  const crumbs: Array<{ idPath: string[]; label: string }> = [{ idPath: [], label: "收入结构" }];
  let current: IncomeFlowNode = root;
  const currentPath: string[] = [];

  for (const id of path) {
    const next = current.children?.find((node) => node.id === id);
    if (!next) break;
    currentPath.push(id);
    crumbs.push({ idPath: [...currentPath], label: next.label });
    current = next;
  }

  return crumbs;
}
