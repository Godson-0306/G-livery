import type { NavIconName } from "@/lib/nav";

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4 w-4 shrink-0",
  "aria-hidden": true,
};

export function NavIcon({ name }: { name: NavIconName }) {
  switch (name) {
    case "home":
      return (
        <svg {...svg}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "browse":
      return (
        <svg {...svg}>
          <path d="M4 11h16M6 11V8l6-4 6 4v3" />
          <path d="M6 11v9h4v-5h4v5h4v-9" />
        </svg>
      );
    case "agents":
      return (
        <svg {...svg}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16.5" cy="9" r="2.2" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M14 19a4.5 4.5 0 0 1 6.5-4" />
        </svg>
      );
    case "orders":
      return (
        <svg {...svg}>
          <path d="M7 4h10a1 1 0 0 1 1 1v16l-3-1.5L12 21l-3-1.5L6 21V5a1 1 0 0 1 1-1z" />
          <path d="M9 9h6M9 13h6" />
        </svg>
      );
    case "profile":
      return (
        <svg {...svg}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19.5a7 7 0 0 1 14 0" />
        </svg>
      );
    case "menu":
      return (
        <svg {...svg}>
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      );
    case "qr":
      return (
        <svg {...svg}>
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
          <path d="M14 14h3v3M20 14v6h-6" />
        </svg>
      );
    case "customers":
      return (
        <svg {...svg}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16.5" cy="9" r="2.2" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M14 19a4.5 4.5 0 0 1 6.5-4" />
        </svg>
      );
    case "plan":
      return (
        <svg {...svg}>
          <rect x="3.5" y="6" width="17" height="12" rx="2" />
          <path d="M3.5 10h17" />
        </svg>
      );
    case "users":
      return (
        <svg {...svg}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    case "overview":
      return (
        <svg {...svg}>
          <rect x="4" y="4" width="7" height="7" rx="1.2" />
          <rect x="13" y="4" width="7" height="7" rx="1.2" />
          <rect x="4" y="13" width="7" height="7" rx="1.2" />
          <rect x="13" y="13" width="7" height="7" rx="1.2" />
        </svg>
      );
    case "kitchens":
      return (
        <svg {...svg}>
          <path d="M4 20V9l8-5 8 5v11" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
  }
}
