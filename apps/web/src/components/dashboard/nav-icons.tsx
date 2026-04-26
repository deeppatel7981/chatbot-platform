/**
 * Sidebar nav icons — consistent stroke SVGs ([Laws of UX](https://lawsofux.com): Jakob’s Law, aesthetic–usability)
 * instead of Unicode glyphs, which vary by font and OS.
 */
import type { FC, SVGProps } from "react";

const stroke = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

export function NavIconOverview(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

export function NavIconConversations(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M21 12a8 8 0 0 1-8 8H7l-5 3 2-4.5A8 8 0 1 1 21 12z" />
    </svg>
  );
}

export function NavIconLeads(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

export function NavIconTasks(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M9 11 12 14 22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export function NavIconContacts(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function NavIconProjects(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
    </svg>
  );
}

export function NavIconKnowledge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function NavIconWidget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <rect {...stroke} x={2} y={3} width={20} height={14} rx={2} />
      <path {...stroke} d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function NavIconAutomations(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function NavIconIntegrations(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <circle {...stroke} cx={12} cy={12} r={3} />
      <path {...stroke} d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
    </svg>
  );
}

export function NavIconAnalytics(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M3 3v18h18M7 16l4-4 4 4 6-6" />
    </svg>
  );
}

export function NavIconTeam(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path {...stroke} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function NavIconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <path
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 21h6m5 0h6M9 3H3m5 0h6m5 0h6"
      />
    </svg>
  );
}

export function NavIconPayments(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <rect {...stroke} x={2} y={5} width={20} height={14} rx={2} />
      <path {...stroke} d="M2 10h20" />
    </svg>
  );
}

export function NavIconHelp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden {...props}>
      <circle {...stroke} cx={12} cy={12} r={10} />
      <path {...stroke} d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  );
}

export type NavIconId =
  | "overview"
  | "conversations"
  | "leads"
  | "tasks"
  | "contacts"
  | "projects"
  | "knowledge"
  | "widget"
  | "automations"
  | "integrations"
  | "analytics"
  | "team"
  | "settings"
  | "payments"
  | "help";

const ICONS: Record<NavIconId, FC<SVGProps<SVGSVGElement>>> = {
  overview: NavIconOverview,
  conversations: NavIconConversations,
  leads: NavIconLeads,
  tasks: NavIconTasks,
  contacts: NavIconContacts,
  projects: NavIconProjects,
  knowledge: NavIconKnowledge,
  widget: NavIconWidget,
  automations: NavIconAutomations,
  integrations: NavIconIntegrations,
  analytics: NavIconAnalytics,
  team: NavIconTeam,
  settings: NavIconSettings,
  payments: NavIconPayments,
  help: NavIconHelp,
};

export function NavSidebarIcon({ id, className }: { id: NavIconId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className} />;
}
