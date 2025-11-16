/**
 * Design System Theme Tokens
 * Mapped from design.json for type-safe access to design tokens
 */

export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    pill: 9999,
  },

  elevation: {
    "level-1": "0 1px 2px rgba(0,0,0,0.35)",
    "level-2": "0 8px 24px rgba(7,10,18,0.55)",
    "level-3": "inset 0 1px 0 rgba(255,255,255,0.02), 0 24px 60px rgba(6,8,12,0.65)",
  },

  blur: {
    "glass-1": "6px",
    "glass-2": "14px",
  },

  colors: {
    background: {
      "bg-0": "#080B10",
      "bg-1": "#0E1624",
      "bg-2": "#111823",
      gradient: ["#071226", "#0E2F67"],
    },
    surface: {
      "surface-1": "rgba(18,24,34,0.86)",
      "surface-2": "rgba(24,34,48,0.78)",
      "glass-outline": "rgba(255,255,255,0.06)",
    },
    accent: {
      mint: "#5EF7A6",
      teal: "#54A388",
      purple: "#43256E",
      magenta: "#C064FF",
    },
    neutral: {
      "text-primary": "#E6EEF8",
      "text-secondary": "rgba(230,238,248,0.72)",
      muted: "rgba(230,238,248,0.45)",
      white: "#FFFFFF",
      black: "#0A0A0A",
    },
    functional: {
      success: "#5EF7A6",
      warning: "#E6A23C",
      danger: "#E24A6A",
    },
  },

  typography: {
    fontFamily: {
      primary: "Neue Montreal, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    },
    weights: {
      display: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    scale: {
      "display-1": { size: 64, lineHeight: 72, tracking: -0.02 },
      headline: { size: 20, lineHeight: 28, tracking: -0.01 },
      "body-lg": { size: 16, lineHeight: 24 },
      body: { size: 14, lineHeight: 20 },
      caption: { size: 12, lineHeight: 16 },
    },
  },

  interactions: {
    motion: {
      "duration-short": "120ms",
      "duration-medium": "240ms",
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },

  components: {
    button: {
      primary: {
        shape: "pill",
        height: 44,
        bgGradient: ["#3FE8C3", "#2BD6A0"],
        shadow: "0 8px 30px rgba(46,220,152,0.14)",
      },
      secondary: {
        bg: "transparent",
        border: "1px solid rgba(255,255,255,0.06)",
      },
      ghost: {
        bg: "rgba(255,255,255,0.02)",
      },
    },
    card: {
      background: "rgba(24,34,48,0.78)",
      border: "1px solid rgba(255,255,255,0.04)",
      radius: 12,
      padding: 16,
      shadow: "0 8px 24px rgba(7,10,18,0.55)",
      glassEffect: {
        backdropBlur: "6px",
        translucency: 0.12,
      },
    },
    input: {
      height: 44,
      bg: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.04)",
      radius: 9999,
      focus: "0 0 0 4px rgba(94,247,166,0.08)",
    },
  },
} as const;

export type Theme = typeof theme;

