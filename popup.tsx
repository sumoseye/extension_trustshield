// popup.tsx
import { useState, useRef, useEffect } from "react"
import iconImage from "data-base64:~./assets/icon-removebg-preview.png"
import fishing from "data-base64:~/assets/mail.png"
import urlscan from "data-base64:~/assets/link.png"
import news from "data-base64:~/assets/newspaper.png"
import deepfakeai from "data-base64:~/assets/deepfake.png"

import UrlScanner from "./components/urlscanner"

// ============================================
// TYPES & INTERFACES
// ============================================
interface AnalysisResult {
  risk_score?: number
  risk_level?: string
  threat_types?: string[]
  explanation?: string
  simplified_explanation?: string
  error?: string
  is_safe?: boolean
  threats?: string[]
  verdict?: string
  confidence?: number
  sources?: string[]
  content_type?: string
}

interface ScanData {
  mode: "text" | "image" | "audio" | "video" | "url" | "email" | "news"
  content: string
  result: AnalysisResult | null
  loading: boolean
  timestamp: number
}

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE = "https://broskiiii-test.hf.space"

const API_ENDPOINTS = {
  emailAnalysis: `${API_BASE}/analyze/email`,
  urlScan: `${API_BASE}/analyze/url`,
  textAnalysis: `${API_BASE}/analyze/text`,
  imageAnalysis: `${API_BASE}/analyze/image`,
  videoAnalysis: `${API_BASE}/analyze/video`,
  audioAnalysis: `${API_BASE}/analyze/audio`,
  factCheck: `${API_BASE}/analyze/factcheck`,
  news: `${API_BASE}/analyze/news`,
  deepfake: `${API_BASE}/analyze/deepfake`,
  health: `${API_BASE}/health`,
}

// ============================================
// SMART FETCH - handles sleeping HF Spaces
// ============================================
const smartFetch = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 120000,
  retries: number = 2
): Promise<Response> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      // 503 = HF Space sleeping, retry after wait
      if (response.status === 503 && attempt < retries) {
        console.log(`TrustShield: API sleeping, waking up... (attempt ${attempt + 1})`)
        await new Promise(r => setTimeout(r, 5000 * (attempt + 1)))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 200)}`)
      }

      return response
    } catch (err) {
      clearTimeout(timeoutId)

      if (err instanceof Error && err.name === "AbortError") {
        if (attempt < retries) {
          console.log(`TrustShield: Timed out, retrying... (attempt ${attempt + 1})`)
          continue
        }
        throw new Error("Request timed out. The server may be starting up — please wait 30 seconds and try again.")
      }

      // Network errors
      if (attempt < retries && err instanceof TypeError) {
        console.log(`TrustShield: Network error, retrying... (attempt ${attempt + 1})`)
        await new Promise(r => setTimeout(r, 3000))
        continue
      }

      throw err
    }
  }
  throw new Error("All retry attempts failed. Please try again later.")
}

// Wake up API
const wakeUpAPI = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(`${API_BASE}/health`, {
      method: "GET",
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

// ============================================
// MAIN COMPONENT
// ============================================
function IndexPopup() {
  // ----------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------
  const [currentView, setCurrentView] = useState<"home" | "email" | "url" | "deepfake" | "factcheck" | "scan">("home")
  const [deepfakeTab, setDeepfakeTab] = useState<"text" | "image" | "video" | "audio">("text")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [apiStatus, setApiStatus] = useState<"unknown" | "awake" | "waking" | "error">("unknown")

  const [emailInput, setEmailInput] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [textInput, setTextInput] = useState("")
  const [newsInput, setNewsInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [urlMode, setUrlMode] = useState<"current" | "manual">("current")
  const [currentTabUrl, setCurrentTabUrl] = useState("")

  const [floatingScan, setFloatingScan] = useState<ScanData | null>(null)
  const [hasNewScan, setHasNewScan] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============================================
  // EFFECT: Wake up API on popup open
  // ============================================
  useEffect(() => {
    const wake = async () => {
      setApiStatus("waking")
      const isAwake = await wakeUpAPI()
      setApiStatus(isAwake ? "awake" : "unknown")
      if (!isAwake) {
        // Try once more after a delay
        setTimeout(async () => {
          const retryAwake = await wakeUpAPI()
          setApiStatus(retryAwake ? "awake" : "error")
        }, 5000)
      }
    }
    wake()
  }, [])

  // ============================================
  // EFFECT: LOAD & LISTEN FOR FLOATING SCAN DATA
  // ============================================
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["trustshieldScan", "trustshieldTimestamp"], (result) => {
        if (result.trustshieldScan) {
          setFloatingScan(result.trustshieldScan)
          const isRecent = Date.now() - (result.trustshieldTimestamp || 0) < 30000
          if (isRecent && result.trustshieldScan.result) {
            setHasNewScan(true)
          }
        }
      })

      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.trustshieldScan?.newValue) {
          setFloatingScan(changes.trustshieldScan.newValue)
          setHasNewScan(true)
          if (changes.trustshieldScan.newValue.loading || changes.trustshieldScan.newValue.result) {
            setCurrentView("scan")
          }
        }
      }

      chrome.storage.local.onChanged.addListener(listener)
      return () => chrome.storage.local.onChanged.removeListener(listener)
    }
  }, [])

  // ============================================
  // EFFECT: TRANSPARENT BACKGROUND
  // ============================================
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      html {
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
        overflow: hidden !important;
      }
      #__plasmo {
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
      }
      * { box-sizing: border-box; }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(styleElement)

    document.documentElement.style.background = "transparent"
    document.documentElement.style.backgroundColor = "transparent"
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"

    document.body.style.background = "transparent"
    document.body.style.backgroundColor = "transparent"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.overflow = "hidden"

    const root = document.getElementById("__plasmo")
    if (root) {
      root.style.background = "transparent"
      root.style.backgroundColor = "transparent"
      root.style.margin = "0"
      root.style.padding = "0"
    }

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // ============================================
  // EFFECT: GET CURRENT TAB URL
  // ============================================
  useEffect(() => {
    if (currentView === "url" && urlMode === "current") {
      chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          setCurrentTabUrl(tabs[0].url)
        }
      })
    }
  }, [currentView, urlMode])

  // ============================================
  // THEME
  // ============================================
  const colors = {
    bgDark: "#020617",
    bgMedium: "#0f172a",
    bgLight: "#1e293b",
    bgCard: "#0c1929",
    primary: "#3b82f6",
    primaryGlow: "rgba(59, 130, 246, 0.4)",
    secondary: "#60a5fa",
    secondaryGlow: "rgba(96, 165, 250, 0.4)",
    accent: "#38bdf8",
    accentGlow: "rgba(56, 189, 248, 0.4)",
    buttonGradientStart: "#2563eb",
    buttonGradientMid: "#3b82f6",
    buttonGradientEnd: "#60a5fa",
    buttonGlow: "rgba(59, 130, 246, 0.5)",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    success: "#22c55e",
    successGlow: "rgba(34, 197, 94, 0.4)",
    warning: "#eab308",
    warningGlow: "rgba(234, 179, 8, 0.4)",
    danger: "#ef4444",
    dangerGlow: "rgba(239, 68, 68, 0.4)",
    border: "#1e3a5f",
    borderGlow: "#3b82f6",
  }

  // ============================================
  // STYLES
  // ============================================
  const styles = {
    container: {
      width: "400px",
      minHeight: "520px",
      background: `linear-gradient(180deg, ${colors.bgDark} 0%, ${colors.bgMedium} 100%)`,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: colors.textPrimary,
      overflow: "hidden",
      border: "none",
      padding: 0,
      margin: 0,
      boxSizing: "border-box" as const,
    },
    header: {
      background: colors.bgDark,
      padding: "20px 24px",
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoIcon: {
      width: "40px",
      height: "40px",
      objectFit: "contain" as const,
      filter: `drop-shadow(0 0 12px ${colors.primaryGlow})`,
    },
    logoTextContainer: {
      display: "flex",
      flexDirection: "column" as const,
    },
    logoText: {
      fontSize: "22px",
      fontWeight: "700",
      letterSpacing: "-0.5px",
      color: colors.textPrimary,
    },
    logoTextAccent: {
      color: colors.secondary,
    },
    subtitle: {
      fontSize: "11px",
      color: colors.textMuted,
      marginTop: "2px",
    },
    backButton: {
      background: colors.bgLight,
      border: `1px solid ${colors.border}`,
      color: colors.textSecondary,
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.2s ease",
    },
    content: {
      padding: "20px",
      maxHeight: "400px",
      overflowY: "auto" as const,
    },
    apiStatusBanner: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      borderRadius: "8px",
      marginBottom: "12px",
      fontSize: "11px",
      fontWeight: "500" as const,
    },
    scanAlertBanner: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      background: `linear-gradient(135deg, ${colors.buttonGradientStart}20 0%, ${colors.buttonGradientEnd}20 100%)`,
      border: `1px solid ${colors.primary}`,
      borderRadius: "12px",
      marginBottom: "16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    scanAlertIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 0 15px ${colors.buttonGlow}`,
    },
    scanAlertContent: {
      flex: 1,
    },
    scanAlertTitle: {
      fontSize: "13px",
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: "2px",
    },
    scanAlertSubtitle: {
      fontSize: "11px",
      color: colors.textSecondary,
    },
    scanAlertArrow: {
      color: colors.secondary,
      fontSize: "18px",
    },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    featureCard: {
      background: colors.bgCard,
      borderRadius: "16px",
      padding: "20px",
      cursor: "pointer",
      border: `1px solid ${colors.border}`,
      transition: "all 0.3s ease",
      textAlign: "left" as const,
    },
    featureIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      marginBottom: "12px",
    },
    featureTitle: {
      fontSize: "14px",
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: "6px",
    },
    featureDesc: {
      fontSize: "11px",
      color: colors.textMuted,
      lineHeight: "1.4",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    sectionIconBox: {
      width: "28px",
      height: "28px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
      boxShadow: `0 0 15px ${colors.buttonGlow}`,
    },
    sectionIconImage: {
      width: "16px",
      height: "16px",
    },
    tabContainer: {
      display: "flex",
      background: colors.bgDark,
      padding: "6px",
      borderRadius: "12px",
      gap: "6px",
      marginBottom: "16px",
      border: `1px solid ${colors.border}`,
    },
    tab: {
      flex: "1",
      padding: "10px 8px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s ease",
    },
    activeTab: {
      background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
      color: colors.textPrimary,
      boxShadow: `0 0 20px ${colors.buttonGlow}`,
    },
    inactiveTab: {
      background: "transparent",
      color: colors.textMuted,
    },
    inputGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "12px",
      fontWeight: "600",
      color: colors.textSecondary,
    },
    textarea: {
      width: "100%",
      minHeight: "120px",
      padding: "14px",
      border: `1px solid ${colors.border}`,
      borderRadius: "12px",
      background: colors.bgDark,
      color: colors.textPrimary,
      fontSize: "13px",
      resize: "vertical" as const,
      outline: "none",
      boxSizing: "border-box" as const,
      transition: "all 0.2s ease",
      boxShadow: `0 0 10px ${colors.primaryGlow}`,
      fontFamily: "inherit",
    },
    input: {
      width: "100%",
      padding: "14px",
      border: `1px solid ${colors.border}`,
      borderRadius: "12px",
      background: colors.bgDark,
      color: colors.textPrimary,
      fontSize: "13px",
      outline: "none",
      boxSizing: "border-box" as const,
      transition: "all 0.2s ease",
      fontFamily: "inherit",
    },
    fileUploadArea: {
      width: "100%",
      padding: "30px 20px",
      borderRadius: "12px",
      background: colors.bgDark,
      border: `2px dashed ${colors.primary}`,
      cursor: "pointer",
      textAlign: "center" as const,
      transition: "all 0.3s ease",
      boxSizing: "border-box" as const,
      boxShadow: `0 0 25px ${colors.primaryGlow}, inset 0 0 30px rgba(59, 130, 246, 0.05)`,
    },
    fileUploadIcon: {
      fontSize: "18px",
      fontWeight: "800",
      fontFamily: "monospace",
      marginBottom: "12px",
      color: colors.accent,
      letterSpacing: "2px",
      textShadow: `0 0 10px ${colors.accentGlow}`,
    },
    fileUploadText: {
      fontSize: "13px",
      color: colors.textSecondary,
      marginBottom: "4px",
    },
    fileUploadSubtext: {
      fontSize: "11px",
      color: colors.textMuted,
    },
    selectedFileName: {
      fontSize: "12px",
      color: colors.secondary,
      marginTop: "12px",
      padding: "8px 14px",
      background: colors.bgLight,
      borderRadius: "8px",
      display: "inline-block",
      boxShadow: `0 0 10px ${colors.secondaryGlow}`,
    },
    button: {
      width: "100%",
      padding: "14px 20px",
      border: "none",
      borderRadius: "12px",
      background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientMid} 50%, ${colors.buttonGradientEnd} 100%)`,
      color: colors.textPrimary,
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: `0 0 25px ${colors.buttonGlow}`,
      fontFamily: "inherit",
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      boxShadow: "none",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      padding: "40px 0",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: `3px solid ${colors.bgLight}`,
      borderTop: `3px solid ${colors.secondary}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      boxShadow: `0 0 15px ${colors.secondaryGlow}`,
    },
    loadingText: {
      marginTop: "16px",
      fontSize: "13px",
      color: colors.textSecondary,
    },
    loadingSubtext: {
      marginTop: "8px",
      fontSize: "11px",
      color: colors.textMuted,
    },
    resultContainer: {
      marginTop: "20px",
      padding: "20px",
      background: colors.bgDark,
      borderRadius: "16px",
      border: `1px solid ${colors.border}`,
      boxShadow: `0 0 20px ${colors.primaryGlow}`,
    },
    riskScoreContainer: {
      textAlign: "center" as const,
      marginBottom: "20px",
    },
    riskScoreCircle: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 12px",
      fontSize: "28px",
      fontWeight: "700",
    },
    riskLevel: {
      fontSize: "14px",
      fontWeight: "700",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
    },
    resultSection: {
      marginTop: "16px",
      padding: "14px",
      background: colors.bgLight,
      borderRadius: "10px",
    },
    resultSectionTitle: {
      margin: "0 0 10px 0",
      fontSize: "11px",
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    threatBadge: {
      display: "inline-block",
      padding: "6px 12px",
      margin: "4px",
      background: colors.danger,
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      color: colors.textPrimary,
      boxShadow: `0 0 10px ${colors.dangerGlow}`,
    },
    explanationText: {
      fontSize: "13px",
      lineHeight: "1.6",
      color: colors.textSecondary,
    },
    errorContainer: {
      textAlign: "center" as const,
      padding: "20px",
    },
    errorText: {
      color: colors.danger,
      fontSize: "13px",
      marginBottom: "12px",
    },
    retryButton: {
      padding: "8px 20px",
      background: colors.bgLight,
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      color: colors.textSecondary,
      fontSize: "12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontFamily: "inherit",
    },
    scanModeIndicator: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "8px 16px",
      background: colors.bgLight,
      borderRadius: "20px",
      marginBottom: "16px",
      fontSize: "12px",
      color: colors.textSecondary,
    },
    scanModeBadge: {
      padding: "4px 10px",
      background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "600",
      color: colors.textPrimary,
      textTransform: "uppercase" as const,
    },
    scannedContentBox: {
      padding: "12px",
      background: colors.bgDark,
      borderRadius: "10px",
      marginTop: "16px",
      border: `1px solid ${colors.border}`,
    },
    scannedContentLabel: {
      fontSize: "10px",
      color: colors.textMuted,
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      marginBottom: "8px",
    },
    scannedContentText: {
      fontSize: "12px",
      color: colors.textSecondary,
      lineHeight: "1.5",
      wordBreak: "break-word" as const,
      maxHeight: "80px",
      overflow: "hidden",
    },
    emptyState: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
      textAlign: "center" as const,
    },
    emptyStateIcon: {
      width: "64px",
      height: "64px",
      borderRadius: "16px",
      background: colors.bgLight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
    },
    emptyStateTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: "8px",
    },
    emptyStateDesc: {
      fontSize: "13px",
      color: colors.textMuted,
      maxWidth: "280px",
      lineHeight: "1.5",
    },
    footer: {
      padding: "16px 20px",
      textAlign: "center" as const,
      borderTop: `1px solid ${colors.border}`,
    },
    footerText: {
      fontSize: "11px",
      color: colors.textMuted,
    },
  }

  // ============================================
  // API FUNCTIONS - Using smartFetch
  // ============================================
  const ensureAwake = async () => {
    if (apiStatus !== "awake") {
      setApiStatus("waking")
      const awake = await wakeUpAPI()
      setApiStatus(awake ? "awake" : "unknown")
    }
  }

  const analyzeEmail = async () => {
    if (!emailInput.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      await ensureAwake()
      const response = await smartFetch(API_ENDPOINTS.emailAnalysis, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_content: emailInput }),
      })
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to analyze email." })
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeUrl = async () => {
    const urlToScan = urlMode === "current" ? currentTabUrl : urlInput
    if (!urlToScan.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      await ensureAwake()
      const response = await smartFetch(API_ENDPOINTS.urlScan, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToScan }),
      })
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to scan URL." })
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeText = async () => {
    if (!textInput.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      await ensureAwake()
      const response = await smartFetch(API_ENDPOINTS.textAnalysis, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      })
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to analyze text." })
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeFile = async (type: "image" | "video" | "audio") => {
    if (!selectedFile) return
    setIsLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      await ensureAwake()
      const endpoint = API_ENDPOINTS[`${type}Analysis` as keyof typeof API_ENDPOINTS]
      const response = await smartFetch(endpoint, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : `Failed to analyze ${type}.` })
    } finally {
      setIsLoading(false)
    }
  }

  const checkFact = async () => {
    if (!newsInput.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      await ensureAwake()
      // Try factcheck endpoint first, fall back to text analysis
      let response: Response
      try {
        response = await smartFetch(API_ENDPOINTS.factCheck, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claim: newsInput }),
        }, 120000, 1)
      } catch {
        // Fallback: use text analysis with fact-check context
        response = await smartFetch(API_ENDPOINTS.textAnalysis, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `Fact check this claim: ${newsInput}` }),
        })
      }
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to check facts." })
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  const getRiskColor = (score: number) => {
    if (score < 0.4) return colors.success
    if (score < 0.7) return colors.warning
    return colors.danger
  }

  const getRiskGlow = (score: number) => {
    if (score < 0.4) return colors.successGlow
    if (score < 0.7) return colors.warningGlow
    return colors.dangerGlow
  }

  const getRiskPercentage = (score: number) => {
    if (score > 1) return Math.round(score)
    return Math.round(score * 100)
  }

  const getFileAccept = () => {
    switch (deepfakeTab) {
      case "image": return "image/*"
      case "video": return "video/*"
      case "audio": return "audio/*"
      default: return "*/*"
    }
  }

  const getModeIcon = (mode: string) => {
    const icons: Record<string, string> = {
      text: "", image: "", audio: "",
      video: "", url: "", email: "", news: ""
    }
    return icons[mode] || ""
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  const goHome = () => {
    setCurrentView("home")
    setResult(null)
    setEmailInput("")
    setUrlInput("")
    setTextInput("")
    setNewsInput("")
    setSelectedFile(null)
    setUrlMode("current")
    setHasNewScan(false)
  }

  const clearFloatingScan = () => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.remove(["trustshieldScan", "trustshieldTimestamp", "trustshieldPending"])
      if (chrome.action?.setBadgeText) {
        chrome.action.setBadgeText({ text: "" })
      }
    }
    setFloatingScan(null)
    setHasNewScan(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderResult = (resultData: AnalysisResult | null = result) => {
    if (!resultData) return null

    if (resultData.error) {
      return (
        <div style={styles.resultContainer}>
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{resultData.error}</p>
            <button
              style={styles.retryButton}
              onClick={() => setResult(null)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgCard
                e.currentTarget.style.color = colors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgLight
                e.currentTarget.style.color = colors.textSecondary
              }}
            >
              ↻ Try Again
            </button>
          </div>
        </div>
      )
    }

    const riskScore = resultData.risk_score || 0
    const riskPercent = getRiskPercentage(riskScore)
    const riskColor = getRiskColor(riskScore)
    const riskGlow = getRiskGlow(riskScore)

    return (
      <div style={styles.resultContainer}>
        <div style={styles.riskScoreContainer}>
          <div
            style={{
              ...styles.riskScoreCircle,
              background: `${riskColor}20`,
              border: `3px solid ${riskColor}`,
              color: riskColor,
              boxShadow: `0 0 30px ${riskGlow}`,
            }}
          >
            {riskPercent}%
          </div>
          <div style={{ ...styles.riskLevel, color: riskColor }}>
            {resultData.risk_level || "Unknown"} Risk
          </div>
        </div>

        {resultData.verdict && (
          <div style={{ ...styles.resultSection, borderLeft: `3px solid ${colors.primary}` }}>
            <h4 style={styles.resultSectionTitle}>Verdict</h4>
            <p style={styles.explanationText}>{resultData.verdict}</p>
          </div>
        )}

        {resultData.threat_types && resultData.threat_types.length > 0 && (
          <div style={styles.resultSection}>
            <h4 style={styles.resultSectionTitle}>Detected Threats</h4>
            <div>
              {resultData.threat_types.map((threat: string, index: number) => (
                <span key={index} style={styles.threatBadge}>{threat}</span>
              ))}
            </div>
          </div>
        )}

        {(resultData.simplified_explanation || resultData.explanation) && (
          <div style={styles.resultSection}>
            <h4 style={styles.resultSectionTitle}>Analysis</h4>
            <p style={styles.explanationText}>
              {resultData.simplified_explanation || resultData.explanation}
            </p>
          </div>
        )}

        {resultData.content_type && (
          <div style={styles.resultSection}>
            <h4 style={styles.resultSectionTitle}>Content Type</h4>
            <p style={styles.explanationText}>{resultData.content_type}</p>
          </div>
        )}
      </div>
    )
  }

  const renderLoading = (text: string = "Analyzing...") => (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>{text}</p>
      {apiStatus === "waking" && (
        <p style={styles.loadingSubtext}>
          ⏳ Server is waking up, this may take 15-30 seconds...
        </p>
      )}
    </div>
  )

  const renderApiStatus = () => {
    if (apiStatus === "awake" || apiStatus === "unknown") return null

    const statusConfig = {
      waking: {
        bg: `${colors.warning}15`,
        border: `${colors.warning}40`,
        color: colors.warning,
        text: "⏳ Server is starting up...",
      },
      error: {
        bg: `${colors.danger}15`,
        border: `${colors.danger}40`,
        color: colors.danger,
        text: "⚠️ Server may be unavailable. Requests will be retried automatically.",
      },
    }

    const config = statusConfig[apiStatus as "waking" | "error"]
    if (!config) return null

    return (
      <div style={{
        ...styles.apiStatusBanner,
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}>
        {config.text}
      </div>
    )
  }

  // ============================================
  // SCAN VIEW
  // ============================================
  const renderScanView = () => {
    if (!floatingScan) {
      return (
        <div style={styles.content}>
          <div style={styles.sectionTitle}>
            <div style={styles.sectionIconBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            Scan Results
          </div>
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div style={styles.emptyStateTitle}>No Recent Scans</div>
            <div style={styles.emptyStateDesc}>
              Select text or hover over an image on any webpage to scan it with TrustShield
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={styles.content}>
        <div style={styles.sectionTitle}>
          <div style={styles.sectionIconBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          Scan Results
        </div>

        <div style={styles.scanModeIndicator}>
          <span>{getModeIcon(floatingScan.mode)}</span>
          <span style={styles.scanModeBadge}>{floatingScan.mode}</span>
          <span>Analysis</span>
        </div>

        {floatingScan.loading && renderLoading(`Analyzing ${floatingScan.mode}...`)}

        {!floatingScan.loading && floatingScan.result && (
          <>
            {renderResult(floatingScan.result)}

            <div style={styles.scannedContentBox}>
              <div style={styles.scannedContentLabel}>Scanned Content</div>
              <div style={styles.scannedContentText}>
                {floatingScan.content.substring(0, 200)}
                {floatingScan.content.length > 200 ? "..." : ""}
              </div>
            </div>

            <button
              style={{
                ...styles.button,
                marginTop: "16px",
                background: colors.bgLight,
                boxShadow: "none",
              }}
              onClick={clearFloatingScan}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.bgCard }}
              onMouseLeave={(e) => { e.currentTarget.style.background = colors.bgLight }}
            >
              Clear Results
            </button>
          </>
        )}
      </div>
    )
  }

  // ============================================
  // HOME VIEW
  // ============================================
  const renderHomeView = () => (
    <div style={styles.content}>
      {renderApiStatus()}

      {hasNewScan && floatingScan && (
        <div
          style={styles.scanAlertBanner}
          onClick={() => { setCurrentView("scan"); setHasNewScan(false) }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 20px ${colors.primaryGlow}`
            e.currentTarget.style.transform = "translateY(-2px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none"
            e.currentTarget.style.transform = "translateY(0)"
          }}
        >
          <div style={styles.scanAlertIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style={styles.scanAlertContent}>
            <div style={styles.scanAlertTitle}>
              {floatingScan.loading ? "Scanning..." : "New Scan Result"}
            </div>
            <div style={styles.scanAlertSubtitle}>
              {floatingScan.mode.charAt(0).toUpperCase() + floatingScan.mode.slice(1)} analysis
              {floatingScan.result?.risk_level ? ` - ${floatingScan.result.risk_level} risk` : ""}
            </div>
          </div>
          <div style={styles.scanAlertArrow}>→</div>
        </div>
      )}

      <div style={styles.featureGrid}>
        {floatingScan && !hasNewScan && (
          <div
            style={{
              ...styles.featureCard,
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px 20px",
            }}
            onClick={() => setCurrentView("scan")}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.secondary
              e.currentTarget.style.boxShadow = `0 0 30px ${colors.secondaryGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <div style={{
              ...styles.featureIcon,
              width: "40px", height: "40px", marginBottom: 0,
              background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
              boxShadow: `0 0 15px ${colors.buttonGlow}`,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.featureTitle, marginBottom: "2px" }}>Recent Scan</div>
              <div style={styles.featureDesc}>
                {floatingScan.mode} • {floatingScan.result?.risk_level || "View"} results
              </div>
            </div>
            <div style={{ color: colors.textMuted, fontSize: "18px" }}>→</div>
          </div>
        )}

        {[
          { key: "email", icon: fishing, title: "Email Analysis", desc: "Detect phishing attempts and malicious emails" },
          { key: "url", icon: urlscan, title: "URL Scanner", desc: "Check website safety and security threats" },
          { key: "deepfake", icon: deepfakeai, title: "Deepfake AI", desc: "Verify media authenticity and detect AI manipulation" },
          { key: "factcheck", icon: news, title: "Fact Checker", desc: "Verify news and claims against trusted sources" },
        ].map(({ key, icon, title, desc }) => (
          <div
            key={key}
            style={styles.featureCard}
            onClick={() => setCurrentView(key as any)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary
              e.currentTarget.style.boxShadow = `0 0 30px ${colors.primaryGlow}`
              e.currentTarget.style.transform = "translateY(-4px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <div style={{
              ...styles.featureIcon,
              background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
              boxShadow: `0 0 20px ${colors.buttonGlow}`,
            }}>
              <img src={icon} alt={title} style={{ width: "24px", height: "24px" }} />
            </div>
            <div style={styles.featureTitle}>{title}</div>
            <div style={styles.featureDesc}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )

  // ============================================
  // EMAIL VIEW
  // ============================================
  const renderEmailView = () => (
    <div style={styles.content}>
      {renderApiStatus()}
      <div style={styles.sectionTitle}>
        <div style={styles.sectionIconBox}>
          <img src={fishing} alt="Email" style={styles.sectionIconImage} />
        </div>
        Phishing Email Analysis
      </div>

      {isLoading ? renderLoading("Analyzing email...") : (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Paste email content to analyze</label>
            <textarea
              style={styles.textarea}
              placeholder="Paste the suspicious email content here including subject, sender, and body..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.secondary
                e.currentTarget.style.boxShadow = `0 0 25px ${colors.secondaryGlow}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.boxShadow = `0 0 10px ${colors.primaryGlow}`
              }}
            />
          </div>

          <button
            style={{ ...styles.button, ...(!emailInput.trim() ? styles.buttonDisabled : {}) }}
            onClick={analyzeEmail}
            disabled={!emailInput.trim()}
            onMouseEnter={(e) => {
              if (emailInput.trim()) e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
            }}
          >
            Analyze Email
          </button>
          {renderResult()}
        </>
      )}
    </div>
  )

  // ============================================
  // URL VIEW
  // ============================================
  const renderUrlView = () => (
    <UrlScanner colors={colors} styles={styles} />
  )

  // ============================================
  // DEEPFAKE VIEW
  // ============================================
  const renderDeepfakeView = () => {
    const fileLabels = {
      image: { title: "Upload Image", formats: "PNG, JPG, GIF, WebP", icon: "[ IMG ]" },
      video: { title: "Upload Video", formats: "MP4, WebM, MOV", icon: "[ VID ]" },
      audio: { title: "Upload Audio", formats: "MP3, WAV, OGG", icon: "[ AUD ]" },
    }

    return (
      <div style={styles.content}>
        {renderApiStatus()}
        <div style={styles.sectionTitle}>
          <div style={styles.sectionIconBox}>
            <img src={deepfakeai} alt="Deepfake" style={styles.sectionIconImage} />
          </div>
          Deepfake AI Detection
        </div>

        <div style={styles.tabContainer}>
          {(["text", "image", "video", "audio"] as const).map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(deepfakeTab === tab ? styles.activeTab : styles.inactiveTab),
              }}
              onClick={() => {
                setDeepfakeTab(tab)
                setResult(null)
                setSelectedFile(null)
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? renderLoading(`Analyzing ${deepfakeTab}...`) : (
          <>
            {deepfakeTab === "text" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Enter text to analyze</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Paste text to check for AI-generated content..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.secondary
                      e.currentTarget.style.boxShadow = `0 0 25px ${colors.secondaryGlow}`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border
                      e.currentTarget.style.boxShadow = `0 0 10px ${colors.primaryGlow}`
                    }}
                  />
                </div>
                <button
                  style={{ ...styles.button, ...(!textInput.trim() ? styles.buttonDisabled : {}) }}
                  onClick={analyzeText}
                  disabled={!textInput.trim()}
                  onMouseEnter={(e) => {
                    if (textInput.trim()) e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
                  }}
                >
                  Analyze Text
                </button>
              </>
            )}

            {deepfakeTab !== "text" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{fileLabels[deepfakeTab].title}</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getFileAccept()}
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                  <div
                    style={styles.fileUploadArea}
                    onClick={triggerFileInput}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.secondary
                      e.currentTarget.style.background = colors.bgLight
                      e.currentTarget.style.boxShadow = `0 0 35px ${colors.secondaryGlow}`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.primary
                      e.currentTarget.style.background = colors.bgDark
                      e.currentTarget.style.boxShadow = `0 0 25px ${colors.primaryGlow}`
                    }}
                  >
                    <div style={styles.fileUploadIcon}>{fileLabels[deepfakeTab].icon}</div>
                    <p style={styles.fileUploadText}>Click to select file</p>
                    <p style={styles.fileUploadSubtext}>{fileLabels[deepfakeTab].formats}</p>
                    {selectedFile && (
                      <div style={styles.selectedFileName}>{selectedFile.name}</div>
                    )}
                  </div>
                </div>
                <button
                  style={{ ...styles.button, ...(!selectedFile ? styles.buttonDisabled : {}) }}
                  onClick={() => analyzeFile(deepfakeTab as "image" | "video" | "audio")}
                  disabled={!selectedFile}
                  onMouseEnter={(e) => {
                    if (selectedFile) e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
                  }}
                >
                  Analyze {deepfakeTab.charAt(0).toUpperCase() + deepfakeTab.slice(1)}
                </button>
              </>
            )}

            {renderResult()}
          </>
        )}
      </div>
    )
  }

  // ============================================
  // FACT CHECK VIEW
  // ============================================
  const renderFactCheckView = () => (
    <div style={styles.content}>
      {renderApiStatus()}
      <div style={styles.sectionTitle}>
        <div style={styles.sectionIconBox}>
          <img src={news} alt="Fact Check" style={styles.sectionIconImage} />
        </div>
        Fact Checker
      </div>

      {isLoading ? renderLoading("Checking facts...") : (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Enter claim or news to verify</label>
            <textarea
              style={styles.textarea}
              placeholder="Paste news headline, claim, or statement you want to fact-check..."
              value={newsInput}
              onChange={(e) => setNewsInput(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.secondary
                e.currentTarget.style.boxShadow = `0 0 25px ${colors.secondaryGlow}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.boxShadow = `0 0 10px ${colors.primaryGlow}`
              }}
            />
          </div>

          <button
            style={{ ...styles.button, ...(!newsInput.trim() ? styles.buttonDisabled : {}) }}
            onClick={checkFact}
            disabled={!newsInput.trim()}
            onMouseEnter={(e) => {
              if (newsInput.trim()) e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
            }}
          >
            Check Facts
          </button>
          {renderResult()}
        </>
      )}
    </div>
  )

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={iconImage} alt="TrustShield" style={styles.logoIcon} />
          <div style={styles.logoTextContainer}>
            <div style={styles.logoText}>
              Trust<span style={styles.logoTextAccent}>Shield</span>
            </div>
            <div style={styles.subtitle}>Detect. Protect. Secure.</div>
          </div>
        </div>

        {currentView !== "home" && (
          <button
            style={styles.backButton}
            onClick={goHome}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgMedium
              e.currentTarget.style.borderColor = colors.primary
              e.currentTarget.style.color = colors.textPrimary
              e.currentTarget.style.boxShadow = `0 0 15px ${colors.primaryGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.bgLight
              e.currentTarget.style.borderColor = colors.border
              e.currentTarget.style.color = colors.textSecondary
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            ← Back
          </button>
        )}
      </div>

      {currentView === "home" && renderHomeView()}
      {currentView === "email" && renderEmailView()}
      {currentView === "url" && renderUrlView()}
      {currentView === "deepfake" && renderDeepfakeView()}
      {currentView === "factcheck" && renderFactCheckView()}
      {currentView === "scan" && renderScanView()}

      <div style={styles.footer}>
        <p style={styles.footerText}>Your Security, Our Priority</p>
      </div>
    </div>
  )
}

export default IndexPopup