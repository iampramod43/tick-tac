/**
 * Clerk Appearance Configuration
 * Matches the tickTac design system with glassmorphism effects
 * Supports both dark and light themes
 */
export const clerkAppearance = {
  elements: {
    // Root container
    rootBox: "mx-auto",

    // Main card container - glassmorphism with proper background
    card: "glass-1 border border-(--color-glass-outline) rounded-(--radius-md) shadow-[var(--shadow-level-2)] backdrop-blur-[var(--blur-glass-1)] bg-(--color-surface-1)",

    // Header
    headerTitle: "text-(--color-text-primary) font-semibold text-2xl",
    headerSubtitle: "text-(--color-text-secondary) text-sm",

    // Social buttons - adapts to theme
    socialButtonsBlockButton:
      "border border-(--color-glass-outline) bg-(--color-input) hover:bg-(--color-accent) rounded-(--radius-md) transition-all duration-120 h-11 text-(--color-text-primary) relative",
    socialButtonsBlockButtonText: "!text-(--color-text-primary) font-medium",
    socialButtonsBlockButtonArrow: "!text-(--color-text-muted)",
    socialButtonsBlockButtonIcon: "!text-(--color-text-primary) opacity-90",

    // Divider
    dividerLine: "bg-(--color-glass-outline)",
    dividerText: "text-(--color-text-muted) text-xs",

    // Form fields
    formFieldLabel: "text-(--color-text-primary) text-sm font-medium",
    formFieldInput:
      "bg-(--color-input) border border-(--color-glass-outline) text-(--color-text-primary) placeholder:text-(--color-text-muted) rounded-(--radius-md) h-11 px-4 focus:border-(--color-accent-mint)/30 focus:ring-4 focus:ring-(--color-accent-mint)/10 transition-all",
    formFieldInputShowPasswordButton:
      "text-(--color-text-muted) hover:text-(--color-text-primary)",
    formFieldInputShowPasswordIcon: "text-(--color-text-muted)",

    // Buttons - primary button with mint green
    formButtonPrimary:
      "bg-(--color-accent-mint) text-black hover:opacity-90 rounded-(--radius-pill) h-11 px-6 font-medium shadow-[0_8px_30px_rgba(94,247,166,0.2)] hover:shadow-[0_12px_40px_rgba(94,247,166,0.3)] transition-all duration-120",
    formButtonReset:
      "bg-transparent border border-(--color-glass-outline) text-(--color-text-primary) hover:bg-(--color-accent) rounded-(--radius-md) h-11 px-6 transition-all duration-120",

    // Links - mint green accent
    footerActionLink:
      "text-(--color-accent-mint) hover:text-(--color-accent-teal) transition-colors",
    formFieldAction:
      "text-(--color-accent-mint) hover:text-(--color-accent-teal)",

    // Footer
    footer: "border-t border-(--color-glass-outline)",
    footerAction: "text-(--color-text-muted)",
    footerActionText: "text-(--color-text-muted)",
    footerActionLink__signUp: "text-(--color-accent-mint)",
    footerActionLink__signIn: "text-(--color-accent-mint)",

    // Error messages
    formFieldErrorText: "text-(--color-danger) text-sm",
    alertText: "text-(--color-text-primary)",
    alertTextDanger: "text-(--color-danger)",

    // Identity preview
    identityPreview:
      "bg-(--color-input) border border-(--color-glass-outline) rounded-(--radius-md) p-3",
    identityPreviewText: "text-(--color-text-primary) font-medium",
    identityPreviewEditButton:
      "text-(--color-accent-mint) hover:text-(--color-accent-teal) transition-colors font-medium",
    identityPreviewEditButtonIcon: "text-(--color-accent-mint)",

    // OTP input
    otpCodeFieldInput:
      "bg-(--color-input) border border-(--color-glass-outline) text-(--color-text-primary) rounded-(--radius-md) focus:border-(--color-accent-mint)/30 focus:ring-4 focus:ring-(--color-accent-mint)/10",

    // Phone input
    phoneInputBox:
      "bg-(--color-input) border border-(--color-glass-outline) rounded-(--radius-md)",
    phoneInputInput:
      "bg-transparent text-(--color-text-primary) placeholder:text-(--color-text-muted)",

    // Select
    selectButton:
      "bg-(--color-input) border border-(--color-glass-outline) text-(--color-text-primary) rounded-(--radius-md) hover:bg-(--color-accent) h-11 px-4",
    selectOption: "text-(--color-text-primary) hover:bg-(--color-accent) bg-(--color-surface-1)",
    selectOptionsContainer: "bg-(--color-surface-1) border border-(--color-glass-outline) shadow-[var(--shadow-level-2)]",

    // Avatar
    avatarBox: "border-2 border-(--color-glass-outline)",

    // Loading spinner
    spinner: "text-(--color-accent-mint)",

    // Form resend link
    formResendCodeLink:
      "text-(--color-accent-mint) hover:text-(--color-accent-teal)",

    // Breadcrumbs
    breadcrumbsItem: "text-(--color-text-muted) hover:text-(--color-text-primary)",
    breadcrumbsItemActive: "text-(--color-text-primary) font-medium",
    breadcrumbsItemDivider: "text-(--color-text-muted)",

    // Modal
    modalContent:
      "glass-1 border border-(--color-glass-outline) rounded-(--radius-md) shadow-[var(--shadow-level-2)] bg-(--color-surface-1)",
    modalContentTitle: "text-(--color-text-primary) font-semibold",
    modalContentDescription: "text-(--color-text-secondary)",
    modalCloseButton: "text-(--color-text-muted) hover:text-(--color-text-primary)",

    // Tabs
    tabsList: "border-b border-(--color-glass-outline)",
    tabsTrigger:
      "text-(--color-text-muted) hover:text-(--color-text-primary) data-[active=true]:text-(--color-accent-mint)",
    tabsTriggerActive:
      "text-(--color-accent-mint) border-b-2 border-(--color-accent-mint)",

    // Alert
    alert:
      "bg-(--color-input) border border-(--color-glass-outline) rounded-(--radius-md) p-3",
    alertIcon: "text-(--color-text-primary)",

    // Badge
    badge:
      "bg-(--color-accent-mint)/10 text-(--color-accent-mint) border border-(--color-accent-mint)/30 rounded-(--radius-sm) px-2 py-0.5",

    // Card content
    cardContent: "p-6",

    // Menu items and dropdowns
    menuButton: "text-(--color-text-primary) hover:bg-(--color-accent) font-medium",
    menuItem: "text-(--color-text-primary) hover:bg-(--color-accent)",
    menuItemIcon: "text-(--color-text-muted)",

    // Verification code
    verificationCodeInput: "bg-(--color-input) border border-(--color-glass-outline) text-(--color-text-primary)",

    // Form actions
    formActions: "mt-6",

    // Section
    section: "space-y-4",
    sectionHeader: "mb-4",
    sectionHeaderTitle: "text-(--color-text-primary) font-semibold",
    sectionHeaderSubtitle: "text-(--color-text-muted) text-sm",

    // Alternative methods
    alternativeMethods: "mt-6",
    alternativeMethodsBlockButton:
      "border border-(--color-glass-outline) bg-(--color-input) hover:bg-(--color-accent) text-(--color-text-primary) rounded-(--radius-md) h-11 font-medium",
    alternativeMethodsBlockButtonText: "!text-(--color-text-primary)",

    // User button
    userButtonPopoverCard:
      "glass-1 border border-(--color-glass-outline) shadow-[var(--shadow-level-2)] rounded-(--radius-md) bg-(--color-surface-1)",
    userButtonPopoverActionButton:
      "text-(--color-text-primary) hover:bg-(--color-accent) font-medium",
    userButtonPopoverActionButtonText: "text-(--color-text-primary) font-medium",
    userButtonPopoverActionButtonIcon: "text-(--color-text-muted)",
    userButtonPopoverFooter: "border-t border-(--color-glass-outline)",

    // Clerk branding
    footerPages: "text-(--color-text-muted) text-xs",
    footerPagesLink: "text-(--color-text-muted) hover:text-(--color-text-primary) text-xs",

    // Additional form elements
    formFieldSuccessText: "text-(--color-success) text-sm",
    formFieldWarningText: "text-(--color-warning) text-sm",
    formFieldHintText: "text-(--color-text-muted) text-sm",

    // Input group
    inputGroup: "bg-(--color-input) border border-(--color-glass-outline) rounded-(--radius-md)",
    inputGroupAddon: "text-(--color-text-muted) bg-(--color-accent)",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    showOptionalFields: false,
  },
  variables: {
    // These work for both light and dark - CSS variables adapt
    colorPrimary: "var(--color-accent-mint)",
    colorText: "var(--color-text-primary)",
    colorTextSecondary: "var(--color-text-secondary)",
    colorTextOnPrimaryBackground: "var(--color-black)",
    colorBackground: "transparent",
    colorInputBackground: "var(--color-input)",
    colorInputText: "var(--color-text-primary)",
    colorDanger: "var(--color-danger)",
    colorSuccess: "var(--color-success)",
    borderRadius: "12px",
    fontFamily: "var(--font-primary)",
    fontSize: "14px",
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
  },
};
