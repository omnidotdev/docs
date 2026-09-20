import type { CSSProperties, ReactNode } from "react";
import type realmsData from "../../../realms.json";

/** Footer realm-icon stroke color. */
const ICON_COLOR = "rgba(255, 255, 255, 0.9)";

/**
 * Satori-safe wrapper for a realm footer icon.
 *
 * These icons deliberately do NOT use lucide-react components. lucide v1 icons
 * read a React context via a hook, and Satori renders a component by invoking
 * it directly with no React renderer active, so the hook dispatcher is null and
 * the render throws, 500ing every OG image site-wide. Inlining the raw SVG
 * geometry (mirrored from lucide-react 1.31.0) keeps the render pure.
 */
const RealmIcon = ({ children }: { children: ReactNode }): ReactNode => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke={ICON_COLOR}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** Realm icon mapping (raw inline SVG, mirrors lucide-react 1.31.0). */
const REALM_ICONS: Record<string, ReactNode> = {
  welcome: (
    <RealmIcon>
      <path d="M12 5v16" />
      <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
    </RealmIcon>
  ),
  core: (
    <RealmIcon>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </RealmIcon>
  ),
  kindred: (
    <RealmIcon>
      <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    </RealmIcon>
  ),
  fabric: (
    <RealmIcon>
      <path d="m11 10 3 3" />
      <path d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z" />
      <path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031" />
    </RealmIcon>
  ),
  grid: (
    <RealmIcon>
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </RealmIcon>
  ),
  armory: (
    <RealmIcon>
      <path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9" />
      <path d="m18 15 4-4" />
      <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />
    </RealmIcon>
  ),
  codex: (
    <RealmIcon>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M10 12.5 8 15l2 2.5" />
      <path d="m14 12.5 2 2.5-2 2.5" />
    </RealmIcon>
  ),
  sigil: (
    <RealmIcon>
      <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <circle cx="13.5" cy="6.5" r=".5" fill={ICON_COLOR} />
      <circle cx="17.5" cy="10.5" r=".5" fill={ICON_COLOR} />
      <circle cx="6.5" cy="12.5" r=".5" fill={ICON_COLOR} />
      <circle cx="8.5" cy="7.5" r=".5" fill={ICON_COLOR} />
    </RealmIcon>
  ),
  reality: (
    <RealmIcon>
      <circle cx="6" cy="15" r="4" />
      <circle cx="18" cy="15" r="4" />
      <path d="M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
      <path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2" />
      <path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2" />
    </RealmIcon>
  ),
  worlds: (
    <RealmIcon>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </RealmIcon>
  ),
  community: (
    <RealmIcon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M16 3.128a4 4 0 0 1 0 7.744" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <circle cx="9" cy="7" r="4" />
    </RealmIcon>
  ),
  help: (
    <RealmIcon>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </RealmIcon>
  ),
};

/** Omni logo as inline SVG component (Satori-compatible). */
const OmniLogo = (): ReactNode => (
  <div
    style={{
      display: "flex",
      width: 56,
      height: 56,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={40}
      viewBox="0 0 400 400"
      role="img"
      aria-label="Omni"
    >
      <path
        fill="#fff"
        d="m305.55,251.06c-2.25,39.89-22.63,78.45-54.97,102.2-.02,0-.03.02-.05.03-35.35,24.87-81.6,30.43-121.78,16.38-.35-.12-.7-.25-1.04-.37-26.04-9.8-49.08-27.59-64.36-51.03-.35-.54-.7-1.07-1.03-1.61-.36-.56-.7-1.12-1.04-1.68-.84-1.36-1.63-2.74-2.4-4.14-.38-.69-.78-1.4-1.15-2.11,99.71,81.94,249.46-2.53,229.47-130.45,14.13,22.6,19.75,47.95,18.34,72.79Z"
      />
      <path
        fill="#fff"
        d="m350.16,291.36c-13.92,38.42-46.39,68.99-85.59,80.61-13.5,4.1-27.59,5.99-41.62,5.63,120.83-45.38,122.54-217.31,1.77-263.96,90.07-3.14,158.73,93.67,125.44,177.72Z"
      />
      <path
        fill="#fff"
        d="m262.5,264.7c-9.91,16.9-21.83,30.36-35.02,40.65-.02,0-.03.02-.04.02-26.31,19.55-59.7,28.4-92.15,25.76-33.37-3.58-65.28-19.48-87.77-44.61-.03-.02-.05-.05-.08-.09-.53-.65-1.06-1.3-1.59-1.96-18.67-22.2-29.25-50.51-30.41-79.28-.29-11.18.77-22.92,3.39-35.14,3.2-13.74,8.61-26.88,15.94-38.84-21.52,126.87,127.51,214.92,227.72,133.49Z"
      />
      <path
        fill="#fff"
        d="m175.28,286.51c-24.18-.77-45.05-6.12-62.62-14.81-29.99-16.17-53.17-44.03-64.23-76.15,0,0,0-.02,0-.02-9.94-32.31-7.74-68.25,6.53-98.97,13.75-28.49,38.28-51.08,67.17-63.51,0,0,.02,0,.03-.02,15.92-6.35,34.22-10.1,54.90-10.48-120.82,45.36-122.54,217.31-1.77,263.95Z"
      />
      <path
        fill="#fff"
        d="m342.25,91.43c-99.69-81.94-249.46,2.54-229.47,130.46-31.13-49.86-20.92-113.06,14.77-154.66.63-.73,1.26-1.45,1.89-2.16,18.88-21.08,44.46-36.24,74.56-40.69,54.31-10.05,112.48,18.21,138.25,67.05Z"
      />
      <path
        fill="#fff"
        d="m381.15,230.1h0c-3.19,13.74-8.6,26.89-15.94,38.84,21.54-126.89-127.52-214.91-227.71-133.49C214.51,4.1,413.07,81.17,381.15,230.1Z"
      />
    </svg>
  </div>
);

/** Default gradient for non-realm pages. */
const DEFAULT_GRADIENT = {
  from: "#1e293b",
  via: "#111827",
  to: "#0f172a",
};

type Realm = (typeof realmsData.realms)[number] & {
  ogColors?: { from: string; via: string; to: string };
};

interface OgImageProps {
  title: string;
  description?: string;
  realm?: Realm | null;
}

/**
 * OG image component for Satori rendering.
 * Uses inline styles (Satori requirement).
 */
const OgImage = ({ title, description, realm }: OgImageProps): ReactNode => {
  const colors = realm?.ogColors ?? DEFAULT_GRADIENT;
  const realmId = realm?.id ?? "welcome";
  const realmName = realm?.name ?? "DOCS";
  const realmIcon = REALM_ICONS[realmId] ?? null;

  const containerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "60px",
    background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`,
    fontFamily: "Roboto",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const brandTextStyle: CSSProperties = {
    fontSize: "28px",
    color: "#fff",
    opacity: 0.9,
  };

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    flex: 1,
    justifyContent: "center",
  };

  const titleStyle: CSSProperties = {
    fontSize: title.length > 40 ? "52px" : "64px",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.2,
    margin: 0,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: "28px",
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 1.5,
    margin: 0,
    maxWidth: "90%",
  };

  const footerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const realmLabelStyle: CSSProperties = {
    fontSize: "20px",
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "uppercase",
    letterSpacing: "2px",
  };

  const domainStyle: CSSProperties = {
    fontSize: "20px",
    color: "rgba(255, 255, 255, 0.5)",
  };

  const truncatedDescription =
    description && description.length > 120
      ? `${description.slice(0, 120)}...`
      : description;

  return (
    <div style={containerStyle}>
      {/* Header with logo */}
      <div style={headerStyle}>
        <OmniLogo />
        <span style={brandTextStyle}>Omni</span>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        <h1 style={titleStyle}>{title}</h1>
        {truncatedDescription && (
          <p style={descriptionStyle}>{truncatedDescription}</p>
        )}
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {realmIcon}
          <span style={realmLabelStyle}>{realmName}</span>
        </div>
        <span style={domainStyle}>docs.omni.dev</span>
      </div>
    </div>
  );
};

export default OgImage;
