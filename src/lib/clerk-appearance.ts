/**
 * Clerk Appearance Configuration
 * Matches the tickTac design system with glassmorphism effects
 */
export const clerkAppearance = {
  elements: {
    // Root container
    rootBox: "mx-auto",
    
    // Main card container - glassmorphism with proper background
    card: "glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] shadow-[var(--shadow-level-2)] backdrop-blur-[var(--blur-glass-1)] bg-[var(--color-surface-1)]",
    
    // Header
    headerTitle: "text-[var(--color-text-primary)] font-semibold text-2xl",
    headerSubtitle: "text-[var(--color-text-secondary)] text-sm",
    
    // Social buttons - dark with light border
    socialButtonsBlockButton:
      "border border-[var(--color-glass-outline)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] rounded-[var(--radius-md)] transition-all duration-120 h-11 text-[#E6EEF8]",
    socialButtonsBlockButtonText: "!text-[#E6EEF8] font-medium",
    socialButtonsBlockButtonArrow: "!text-[rgba(230,238,248,0.45)]",
    socialButtonsBlockButtonIcon: "!text-[#E6EEF8]",
    
    // Divider
    dividerLine: "bg-[var(--color-glass-outline)]",
    dividerText: "text-[var(--color-text-muted)] text-xs",
    
    // Form fields
    formFieldLabel: "text-[var(--color-text-primary)] text-sm font-medium",
    formFieldInput:
      "bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-outline)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-[var(--radius-md)] h-11 px-4 focus:border-[var(--color-accent-mint)]/30 focus:shadow-[0_0_0_4px_rgba(94,247,166,0.08)] transition-all",
    formFieldInputShowPasswordButton: "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
    formFieldInputShowPasswordIcon: "text-[var(--color-text-muted)]",
    
    // Buttons - primary button with mint green
    formButtonPrimary:
      "bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90 rounded-[var(--radius-pill)] h-11 px-6 font-medium shadow-[0_8px_30px_rgba(46,220,152,0.14)] transition-all duration-120",
    formButtonReset:
      "bg-transparent border border-[var(--color-glass-outline)] text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] rounded-[var(--radius-md)] h-11 px-6 transition-all duration-120",
    
    // Links - mint green accent
    footerActionLink: "text-[var(--color-accent-mint)] hover:text-[var(--color-accent-teal)] transition-colors",
    identityPreviewEditButton: "text-[var(--color-accent-mint)] hover:text-[var(--color-accent-teal)]",
    formFieldAction: "text-[var(--color-accent-mint)] hover:text-[var(--color-accent-teal)]",
    
    // Footer
    footer: "border-t border-[var(--color-glass-outline)]",
    footerAction: "text-[var(--color-text-muted)]",
    footerActionText: "text-[var(--color-text-muted)]",
    footerActionLink__signUp: "text-[var(--color-accent-mint)]",
    footerActionLink__signIn: "text-[var(--color-accent-mint)]",
    
    // Error messages
    formFieldErrorText: "text-[var(--color-danger)] text-sm",
    alertText: "text-[var(--color-text-primary)]",
    alertTextDanger: "text-[var(--color-danger)]",
    
    // Identity preview
    identityPreview: "bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-outline)] rounded-[var(--radius-md)]",
    identityPreviewText: "text-[var(--color-text-primary)]",
    identityPreviewEditButton: "text-[var(--color-accent-mint)]",
    
    // OTP input
    otpCodeFieldInput:
      "bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-outline)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] focus:border-[var(--color-accent-mint)]/30 focus:shadow-[0_0_0_4px_rgba(94,247,166,0.08)]",
    
    // Phone input
    phoneInputBox: "bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-outline)] rounded-[var(--radius-md)]",
    phoneInputInput:
      "bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
    
    // Select
    selectButton:
      "bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-outline)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] hover:bg-[rgba(255,255,255,0.04)]",
    selectOption: "text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]",
    
    // Avatar
    avatarBox: "border-2 border-[var(--color-glass-outline)]",
    
    // Loading spinner
    spinner: "text-[var(--color-accent-mint)]",
    
    // Form resend link
    formResendCodeLink: "text-[var(--color-accent-mint)] hover:text-[var(--color-accent-teal)]",
    
    // Breadcrumbs
    breadcrumbsItem: "text-[var(--color-text-muted)]",
    breadcrumbsItemActive: "text-[var(--color-text-primary)]",
    
    // Modal
    modalContent: "glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] shadow-[var(--shadow-level-2)] bg-[var(--color-surface-1)]",
    modalContentTitle: "text-[var(--color-text-primary)]",
    modalContentDescription: "text-[var(--color-text-muted)]",
    
    // Tabs
    tabsList: "border-b border-[var(--color-glass-outline)]",
    tabsTrigger: "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] data-[active=true]:text-[var(--color-accent-mint)]",
    tabsTriggerActive: "text-[var(--color-accent-mint)] border-b-2 border-[var(--color-accent-mint)]",
    
    // Alert
    alert: "bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-outline)] rounded-[var(--radius-md)]",
    alertText: "text-[var(--color-text-primary)]",
    
    // Badge
    badge: "bg-[rgba(94,247,166,0.1)] text-[var(--color-accent-mint)] border border-[var(--color-accent-mint)]/20 rounded-[var(--radius-sm)]",
    
    // Card content
    cardContent: "p-6",
    
    // Form actions
    formActions: "mt-6",
    
    // Section
    section: "space-y-4",
    sectionHeader: "mb-4",
    sectionHeaderTitle: "text-[var(--color-text-primary)] font-semibold",
    sectionHeaderSubtitle: "text-[var(--color-text-muted)] text-sm",
    
    // Alternative methods
    alternativeMethods: "mt-6",
    alternativeMethodsBlockButton:
      "border border-[var(--color-glass-outline)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] text-[var(--color-text-primary)] rounded-[var(--radius-md)]",
    
    // User button
    userButtonPopoverCard: "glass-1 border border-[var(--color-glass-outline)] shadow-[var(--shadow-level-2)] rounded-[var(--radius-md)] bg-[var(--color-surface-1)]",
    userButtonPopoverActionButton: "text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]",
    userButtonPopoverActionButtonText: "text-[var(--color-text-primary)]",
    userButtonPopoverFooter: "border-t border-[var(--color-glass-outline)]",
    
    // Clerk branding
    footerPages: "text-[var(--color-text-muted)]",
    footerPagesLink: "text-[var(--color-text-muted)]",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "#5EF7A6", // Direct mint green color
    colorText: "#E6EEF8", // Direct primary text color
    colorTextSecondary: "rgba(230, 238, 248, 0.72)", // Direct secondary text color
    colorTextOnPrimaryBackground: "#0A0A0A", // Black text on mint background
    colorBackground: "transparent",
    colorInputBackground: "rgba(255,255,255,0.02)",
    colorInputText: "#E6EEF8",
    colorDanger: "#E24A6A",
    colorSuccess: "#5EF7A6",
    borderRadius: "12px",
    fontFamily: "var(--font-primary)",
    fontSize: "14px",
    fontWeight: "400",
    // Social button specific colors
    colorSocialButtonText: "#E6EEF8",
    colorSocialButtonIcon: "#E6EEF8",
  },
};

