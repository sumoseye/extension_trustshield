// floating.tsx
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useState, useEffect, useRef, useCallback } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    .trustshield-root {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      color: #e2e8f0 !important;
      -webkit-font-smoothing: antialiased !important;
    }

    .trustshield-root * {
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .trustshield-floating {
      position: fixed !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0 !important;
      animation: ts-fadeIn 0.15s ease-out !important;
    }

    @keyframes ts-fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ts-slideIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes ts-spin {
      to { transform: rotate(360deg); }
    }

    @keyframes ts-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @keyframes ts-waveAnim {
      0%, 100% { height: 4px; }
      50% { height: 20px; }
    }

    .trustshield-actions {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      background: #1e293b !important;
      border: 1px solid #334155 !important;
      border-radius: 10px !important;
      padding: 4px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) !important;
    }

    .trustshield-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      padding: 8px 12px !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      font-family: inherit !important;
      transition: all 0.15s ease !important;
      white-space: nowrap !important;
      color: #cbd5e1 !important;
      background: transparent !important;
      line-height: 1 !important;
      min-height: 32px !important;
    }

    .trustshield-btn:hover {
      background: #334155 !important;
      color: #f1f5f9 !important;
    }

    .trustshield-btn-primary {
      background: #2563eb !important;
      color: white !important;
    }

    .trustshield-btn-primary:hover {
      background: #1d4ed8 !important;
      color: white !important;
    }

    .trustshield-btn svg {
      flex-shrink: 0 !important;
    }

    .trustshield-panel {
      background: #1e293b !important;
      border: 1px solid #334155 !important;
      border-radius: 12px !important;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5) !important;
      overflow: hidden !important;
      animation: ts-slideIn 0.2s ease-out !important;
    }

    .trustshield-audio-panel {
      width: 300px !important;
    }

    .trustshield-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 12px 14px !important;
      border-bottom: 1px solid #334155 !important;
      background: #0f172a !important;
    }

    .trustshield-title {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      color: #e2e8f0 !important;
    }

    .trustshield-close {
      background: none !important;
      border: none !important;
      color: #64748b !important;
      cursor: pointer !important;
      font-size: 20px !important;
      line-height: 1 !important;
      padding: 4px !important;
      border-radius: 4px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 28px !important;
      height: 28px !important;
    }

    .trustshield-close:hover {
      color: #e2e8f0 !important;
      background: #334155 !important;
    }

    .trustshield-body {
      padding: 16px !important;
    }

    .trustshield-audio-options {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
    }

    .trustshield-btn-record,
    .trustshield-btn-upload {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 12px 14px !important;
      border: 1px solid #334155 !important;
      border-radius: 10px !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      font-family: inherit !important;
      transition: all 0.15s ease !important;
      background: #0f172a !important;
      color: #e2e8f0 !important;
      width: 100% !important;
      text-align: left !important;
    }

    .trustshield-btn-record:hover {
      border-color: #ef4444 !important;
      background: rgba(239, 68, 68, 0.1) !important;
    }

    .trustshield-btn-upload:hover {
      border-color: #3b82f6 !important;
      background: rgba(59, 130, 246, 0.1) !important;
    }

    .trustshield-btn-icon-wrapper {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      border-radius: 8px !important;
      background: #1e293b !important;
      flex-shrink: 0 !important;
    }

    .trustshield-btn-record .trustshield-btn-icon-wrapper {
      color: #ef4444 !important;
    }

    .trustshield-btn-upload .trustshield-btn-icon-wrapper {
      color: #3b82f6 !important;
    }

    .trustshield-divider {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      color: #475569 !important;
      font-size: 11px !important;
      text-transform: uppercase !important;
      letter-spacing: 1px !important;
    }

    .trustshield-divider::before,
    .trustshield-divider::after {
      content: '' !important;
      flex: 1 !important;
      height: 1px !important;
      background: #334155 !important;
    }

    .trustshield-audio-hint {
      text-align: center !important;
      font-size: 11px !important;
      color: #64748b !important;
    }

    .trustshield-recording {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 14px !important;
      padding: 4px 0 !important;
    }

    .trustshield-recording-visualizer {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 36px !important;
    }

    .trustshield-recording-visualizer.paused .trustshield-wave-bar {
      animation-play-state: paused !important;
    }

    .trustshield-wave-container {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      height: 100% !important;
    }

    .trustshield-wave-bar {
      width: 4px !important;
      height: 4px !important;
      background: #ef4444 !important;
      border-radius: 2px !important;
      animation: ts-waveAnim 0.8s ease-in-out infinite !important;
    }

    .trustshield-recording-timer {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .trustshield-recording-dot {
      width: 8px !important;
      height: 8px !important;
      background: #ef4444 !important;
      border-radius: 50% !important;
      animation: ts-pulse 1s ease-in-out infinite !important;
    }

    .trustshield-recording-dot.paused {
      animation: none !important;
      opacity: 0.5 !important;
    }

    .trustshield-timer-text {
      font-size: 20px !important;
      font-weight: 700 !important;
      font-variant-numeric: tabular-nums !important;
      color: #f1f5f9 !important;
    }

    .trustshield-paused-label {
      font-size: 10px !important;
      font-weight: 600 !important;
      color: #f59e0b !important;
      letter-spacing: 1px !important;
      background: rgba(245, 158, 11, 0.15) !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
    }

    .trustshield-recording-controls {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
    }

    .trustshield-control-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      border: 2px solid #334155 !important;
      background: #0f172a !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      color: #94a3b8 !important;
    }

    .trustshield-control-btn:hover {
      border-color: #64748b !important;
      background: #1e293b !important;
      color: #e2e8f0 !important;
    }

    .trustshield-control-btn.pause:hover,
    .trustshield-control-btn.resume:hover {
      border-color: #3b82f6 !important;
      color: #3b82f6 !important;
    }

    .trustshield-control-btn.stop {
      background: #ef4444 !important;
      border-color: #ef4444 !important;
      color: white !important;
    }

    .trustshield-control-btn.stop:hover {
      background: #dc2626 !important;
      border-color: #dc2626 !important;
      color: white !important;
    }

    .trustshield-control-btn.cancel:hover {
      border-color: #f59e0b !important;
      color: #f59e0b !important;
    }

    .trustshield-recording-hint {
      font-size: 11px !important;
      color: #64748b !important;
      text-align: center !important;
    }

    .trustshield-result-panel {
      position: fixed !important;
      top: 16px !important;
      right: 16px !important;
      width: 360px !important;
      max-height: calc(100vh - 32px) !important;
      background: #0f172a !important;
      border: 1px solid #1e293b !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05) !important;
      z-index: 2147483647 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      animation: ts-slideIn 0.25s ease-out !important;
    }

    .trustshield-result-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 14px 18px !important;
      border-bottom: 1px solid #1e293b !important;
      background: #0a0f1a !important;
    }

    .trustshield-result-logo {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      color: #e2e8f0 !important;
    }

    .trustshield-result-logo svg {
      color: #3b82f6 !important;
    }

    .trustshield-accent {
      color: #3b82f6 !important;
    }

    .trustshield-result-close {
      background: none !important;
      border: none !important;
      color: #64748b !important;
      cursor: pointer !important;
      padding: 4px !important;
      border-radius: 6px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.15s ease !important;
    }

    .trustshield-result-close:hover {
      color: #e2e8f0 !important;
      background: #1e293b !important;
    }

    .trustshield-result-content {
      padding: 18px !important;
      overflow-y: auto !important;
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
    }

    .trustshield-result-content::-webkit-scrollbar {
      width: 4px !important;
    }

    .trustshield-result-content::-webkit-scrollbar-track {
      background: transparent !important;
    }

    .trustshield-result-content::-webkit-scrollbar-thumb {
      background: #334155 !important;
      border-radius: 2px !important;
    }

    .trustshield-mode-badge {
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      padding: 4px 10px !important;
      background: #1e293b !important;
      border: 1px solid #334155 !important;
      border-radius: 20px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      color: #94a3b8 !important;
      align-self: flex-start !important;
    }

    .trustshield-mode-icon {
      font-size: 14px !important;
    }

    .trustshield-result-loading {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 14px !important;
      padding: 30px 0 !important;
    }

    .trustshield-result-spinner {
      width: 36px !important;
      height: 36px !important;
      border: 3px solid #1e293b !important;
      border-top-color: #3b82f6 !important;
      border-radius: 50% !important;
      animation: ts-spin 0.8s linear infinite !important;
    }

    .trustshield-result-loading p {
      font-size: 13px !important;
      color: #94a3b8 !important;
    }

    .trustshield-result-error {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 20px 0 !important;
      text-align: center !important;
    }

    .trustshield-result-error svg {
      color: #ef4444 !important;
    }

    .trustshield-result-error p {
      font-size: 13px !important;
      color: #f87171 !important;
    }

    .trustshield-retry-btn {
      margin-top: 8px !important;
      padding: 8px 16px !important;
      background: #1e293b !important;
      border: 1px solid #334155 !important;
      border-radius: 8px !important;
      color: #94a3b8 !important;
      font-size: 12px !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
    }

    .trustshield-retry-btn:hover {
      background: #334155 !important;
      color: #e2e8f0 !important;
    }

    .trustshield-risk-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 8px 0 !important;
    }

    .trustshield-risk-circle {
      width: 90px !important;
      height: 90px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.3s ease !important;
    }

    .trustshield-risk-value {
      font-size: 26px !important;
      font-weight: 800 !important;
    }

    .trustshield-risk-level {
      font-size: 14px !important;
      font-weight: 600 !important;
      text-transform: capitalize !important;
    }

    .trustshield-section {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
    }

    .trustshield-section h4 {
      font-size: 11px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 1px !important;
      color: #64748b !important;
    }

    .trustshield-section p {
      font-size: 13px !important;
      color: #cbd5e1 !important;
      line-height: 1.6 !important;
    }

    .trustshield-verdict-section p {
      background: #1e293b !important;
      padding: 10px 12px !important;
      border-radius: 8px !important;
      border-left: 3px solid #3b82f6 !important;
    }

    .trustshield-threats {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 6px !important;
    }

    .trustshield-threat-badge {
      padding: 3px 8px !important;
      background: rgba(239, 68, 68, 0.15) !important;
      color: #fca5a5 !important;
      border-radius: 6px !important;
      font-size: 11px !important;
      font-weight: 500 !important;
      border: 1px solid rgba(239, 68, 68, 0.25) !important;
    }

    .trustshield-scanned-content {
      background: #1e293b !important;
      border-radius: 8px !important;
      padding: 10px 12px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 4px !important;
    }

    .trustshield-scanned-label {
      font-size: 10px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      color: #64748b !important;
    }

    .trustshield-scanned-content p {
      font-size: 12px !important;
      color: #94a3b8 !important;
      word-break: break-word !important;
    }

    .trustshield-result-footer {
      padding: 10px 18px !important;
      border-top: 1px solid #1e293b !important;
      text-align: center !important;
      background: #0a0f1a !important;
    }

    .trustshield-result-footer span {
      font-size: 10px !important;
      color: #475569 !important;
    }

    .trustshield-waking-notice {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 8px 12px !important;
      background: rgba(59, 130, 246, 0.1) !important;
      border: 1px solid rgba(59, 130, 246, 0.2) !important;
      border-radius: 8px !important;
      font-size: 11px !important;
      color: #93c5fd !important;
    }
  `
  return style
}

// ============================================
// API Configuration - with wake-up and retry
// ============================================
const API_BASE = "https://broskiiii-test.hf.space"

const API = {
  text: `${API_BASE}/analyze/text`,
  image: `${API_BASE}/analyze/image`,
  audio: `${API_BASE}/analyze/audio`,
  video: `${API_BASE}/analyze/video`,
  file: `${API_BASE}/analyze/file`,
  health: `${API_BASE}/health`,
  email: `${API_BASE}/analyze/email`,
}

// ============================================
// Types
// ============================================
interface AnalysisResult {
  risk_score: number
  risk_level: string
  verdict?: string
  content_type?: string
  threat_types?: string[]
  explanation: string
  simplified_explanation?: string
  tool_outputs?: Record<string, any>
  error?: string
}

interface ScanData {
  mode: "text" | "image" | "audio" | "video" | "url" | "email" | "news"
  content: string
  result: AnalysisResult | null
  loading: boolean
  timestamp: number
  navigateTo: {
    view: "deepfake" | "email" | "url" | "factcheck"
    tab?: "text" | "image" | "video" | "audio"
  }
}

// ============================================
// Helpers
// ============================================
const getNavigationIntent = (mode: string): ScanData["navigateTo"] => {
  switch (mode) {
    case "text": return { view: "deepfake", tab: "text" }
    case "image": return { view: "deepfake", tab: "image" }
    case "audio": return { view: "deepfake", tab: "audio" }
    case "video": return { view: "deepfake", tab: "video" }
    case "url": return { view: "url" }
    case "email": return { view: "email" }
    case "news": return { view: "factcheck" }
    default: return { view: "deepfake", tab: "text" }
  }
}

const saveScanResult = async (data: ScanData) => {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({
        trustshieldScan: data,
        trustshieldTimestamp: Date.now(),
        trustshieldPending: true
      })
      if (chrome.action?.setBadgeText) {
        chrome.action.setBadgeText({ text: "!" })
        chrome.action.setBadgeBackgroundColor({ color: "#3b82f6" })
      }
    }
  } catch (e) {
    console.error("TrustShield: Failed to save scan result:", e)
  }
}

// ============================================
// Smart fetch with wake-up, retry, and timeout
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

      // If we get 503 (service unavailable - space sleeping), retry
      if (response.status === 503 && attempt < retries) {
        console.log(`TrustShield: API sleeping, waking up... (attempt ${attempt + 1})`)
        // Wait longer each retry for HF space to wake
        await new Promise(r => setTimeout(r, 5000 * (attempt + 1)))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      return response
    } catch (err) {
      clearTimeout(timeoutId)
      
      if (err instanceof Error && err.name === "AbortError") {
        if (attempt < retries) {
          console.log(`TrustShield: Request timed out, retrying... (attempt ${attempt + 1})`)
          continue
        }
        throw new Error("Request timed out. The server may be starting up - please try again in 30 seconds.")
      }

      // Network errors - retry
      if (attempt < retries && err instanceof TypeError) {
        console.log(`TrustShield: Network error, retrying... (attempt ${attempt + 1})`)
        await new Promise(r => setTimeout(r, 3000))
        continue
      }

      throw err
    }
  }
  throw new Error("All retry attempts failed")
}

// Wake up the API server
const wakeUpAPI = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(10000)
    })
    return response.ok
  } catch {
    return false
  }
}

// ============================================
// Main Component
// ============================================
const Floating = () => {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<ScanData["mode"]>("text")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [scannedContent, setScannedContent] = useState("")
  const [apiStatus, setApiStatus] = useState<"unknown" | "awake" | "waking" | "error">("unknown")

  const [showResultPanel, setShowResultPanel] = useState(false)
  const [showAudioPanel, setShowAudioPanel] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const floatingRef = useRef<HTMLDivElement>(null)
  const resultPanelRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============================================
  // Wake up API on first load
  // ============================================
  useEffect(() => {
    const wake = async () => {
      setApiStatus("waking")
      const isAwake = await wakeUpAPI()
      setApiStatus(isAwake ? "awake" : "unknown")
    }
    wake()
  }, [])

  // ============================================
  // Detect content type
  // ============================================
  const detectMode = useCallback((str: string): "text" | "url" | "email" => {
    const trimmed = str.trim()
    if (/^(https?:\/\/|www\.)/i.test(trimmed)) {
      return "url"
    }
    if (/^[a-z0-9]+([-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(\/.*)?$/i.test(trimmed) && !trimmed.includes(" ")) {
      return "url"
    }
    if (trimmed.includes("@") && trimmed.includes(".") && !trimmed.includes(" ")) {
      return "email"
    }
    return "text"
  }, [])

  // ============================================
  // Text Selection Handler
  // ============================================
  useEffect(() => {
    const isInsideOurUI = (target: EventTarget | null): boolean => {
      if (!target) return false
      const el = target as HTMLElement
      try {
        if (floatingRef.current?.contains(el)) return true
        if (resultPanelRef.current?.contains(el)) return true
        const plasmoHost = el.closest?.("plasmo-csui")
        if (plasmoHost) return true
      } catch {
        // Ignore
      }
      return false
    }

    const onMouseUp = (e: MouseEvent) => {
      if (isInsideOurUI(e.target)) return

      setTimeout(() => {
        const sel = window.getSelection()
        const selectedText = sel?.toString().trim() || ""

        if (selectedText.length > 3) {
          try {
            const range = sel?.getRangeAt(0)
            const rect = range?.getBoundingClientRect()

            if (rect && rect.width > 0) {
              const x = Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180)
              const y = Math.max(rect.top - 10, 60)

              setPos({ x, y })
              setText(selectedText)
              setImageUrl(null)
              setMode(detectMode(selectedText))
              setVisible(true)
              setResult(null)
              setShowAudioPanel(false)
              setShowResultPanel(false)
            }
          } catch (err) {
            console.debug("TrustShield: Could not get selection range", err)
          }
        }
      }, 50)
    }

    const onMouseDown = (e: MouseEvent) => {
      if (isInsideOurUI(e.target)) return
      if (!showResultPanel && !showAudioPanel && !loading) {
        setVisible(false)
      }
    }

    const onScroll = () => {
      if (!showResultPanel && !showAudioPanel && !loading && !isRecording) {
        setVisible(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll()
    }

    document.addEventListener("mouseup", onMouseUp, true)
    document.addEventListener("mousedown", onMouseDown, true)
    window.addEventListener("scroll", onScroll, true)
    document.addEventListener("keydown", onKeyDown, true)

    return () => {
      document.removeEventListener("mouseup", onMouseUp, true)
      document.removeEventListener("mousedown", onMouseDown, true)
      window.removeEventListener("scroll", onScroll, true)
      document.removeEventListener("keydown", onKeyDown, true)
    }
  }, [showResultPanel, showAudioPanel, loading, isRecording, detectMode])

  // ============================================
  // Image Hover Handler
  // ============================================
  useEffect(() => {
    let currentOverlay: HTMLElement | null = null
    let currentImg: HTMLImageElement | null = null

    const cleanup = () => {
      if (currentOverlay) {
        currentOverlay.remove()
        currentOverlay = null
      }
      if (currentImg) {
        delete currentImg.dataset.tsOverlay
        currentImg = null
      }
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName !== "IMG") return

      const img = target as HTMLImageElement
      if (img.width < 60 || img.height < 60) return
      if (img.src.startsWith("data:")) return
      if (img.dataset.tsOverlay) return

      cleanup()
      img.dataset.tsOverlay = "1"
      currentImg = img
      const rect = img.getBoundingClientRect()

      const btn = document.createElement("button")
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      `
      btn.style.cssText = `
        position: fixed;
        top: ${rect.top + 8}px;
        left: ${rect.right - 40}px;
        z-index: 2147483646;
        width: 32px;
        height: 32px;
        background: rgba(37, 99, 235, 0.9);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: none;
      `
      document.body.appendChild(btn)
      currentOverlay = btn

      const removeOverlay = () => {
        setTimeout(() => {
          if (currentOverlay && !currentOverlay.matches(":hover")) cleanup()
        }, 200)
      }

      img.addEventListener("mouseleave", removeOverlay, { once: true })
      btn.addEventListener("mouseleave", () => cleanup(), { once: true })

      btn.addEventListener("click", (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        setPos({ x: Math.min(rect.right - 20, window.innerWidth - 180), y: rect.top + 50 })
        setImageUrl(img.src)
        setText("")
        setMode("image")
        setVisible(true)
        setResult(null)
        setShowAudioPanel(false)
        setShowResultPanel(false)
        cleanup()
      })
    }

    document.addEventListener("mouseover", onMouseOver, true)
    return () => {
      document.removeEventListener("mouseover", onMouseOver, true)
      cleanup()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
    }
  }, [])

  // ============================================
  // API Functions with smart retry
  // ============================================
  const analyzeText = async (textContent: string): Promise<AnalysisResult> => {
    const response = await smartFetch(API.text, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textContent })
    })
    return response.json()
  }

  const analyzeImage = async (imageSource: string): Promise<AnalysisResult> => {
    // Fetch the image first
    let blob: Blob
    try {
      const imageResponse = await fetch(imageSource)
      blob = await imageResponse.blob()
    } catch {
      throw new Error("Failed to fetch image. The image may be protected or from a different domain.")
    }

    const extension = (blob.type || "image/jpeg").split("/")[1] || "jpg"
    const formData = new FormData()
    formData.append("file", blob, `image.${extension}`)

    const response = await smartFetch(API.image, { method: "POST", body: formData })
    return response.json()
  }

  const analyzeAudio = async (audioBlob: Blob): Promise<AnalysisResult> => {
    const formData = new FormData()
    formData.append("file", audioBlob, "audio.webm")

    const response = await smartFetch(API.audio, { method: "POST", body: formData })
    return response.json()
  }

  const analyzeEmail = async (emailContent: string): Promise<AnalysisResult> => {
    const response = await smartFetch(API.email, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_content: emailContent })
    })
    return response.json()
  }

  // ============================================
  // Main Analyze with wake-up
  // ============================================
  const analyze = async (scanMode?: typeof mode) => {
    const currentMode = scanMode || mode
    const content = currentMode === "image" ? (imageUrl || "") : text
    const navigationIntent = getNavigationIntent(currentMode)

    if (!content) {
      setResult({
        error: "No content to analyze. Please select text or an image.",
        risk_score: 0,
        risk_level: "unknown",
        explanation: ""
      })
      setShowResultPanel(true)
      return
    }

    await saveScanResult({
      mode: currentMode,
      content,
      result: null,
      loading: true,
      timestamp: Date.now(),
      navigateTo: navigationIntent
    })

    setVisible(false)
    setShowAudioPanel(false)
    setLoading(true)
    setResult(null)
    setScannedContent(content)
    setShowResultPanel(true)

    try {
      // Try to wake up API first if status unknown
      if (apiStatus !== "awake") {
        setApiStatus("waking")
        const awake = await wakeUpAPI()
        if (awake) {
          setApiStatus("awake")
        }
        // Continue anyway - the smartFetch will retry
      }

      let data: AnalysisResult

      switch (currentMode) {
        case "text":
        case "url":
        case "news":
          data = await analyzeText(text)
          break
        case "image":
          if (!imageUrl) throw new Error("No image selected")
          data = await analyzeImage(imageUrl)
          break
        case "email":
          data = await analyzeEmail(text)
          break
        case "audio":
          throw new Error("Use audio recording or file upload for audio analysis")
        default:
          data = await analyzeText(text)
      }

      setResult(data)
      setApiStatus("awake")

      await saveScanResult({
        mode: currentMode,
        content,
        result: data,
        loading: false,
        timestamp: Date.now(),
        navigateTo: navigationIntent
      })
    } catch (error) {
      console.error("TrustShield analysis error:", error)
      const errorMsg = error instanceof Error ? error.message : "Analysis failed"
      
      const errorResult: AnalysisResult = {
        error: errorMsg,
        risk_score: 0,
        risk_level: "unknown",
        explanation: ""
      }
      setResult(errorResult)
      
      if (errorMsg.includes("timed out") || errorMsg.includes("503")) {
        setApiStatus("waking")
      }

      await saveScanResult({
        mode: currentMode,
        content,
        result: errorResult,
        loading: false,
        timestamp: Date.now(),
        navigateTo: navigationIntent
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // Audio Recording
  // ============================================
  const openAudioPanel = () => {
    setShowAudioPanel(true)
    setMode("audio")
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : ""

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {}
      const mediaRecorder = new MediaRecorder(stream, options)

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" })
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        processAudio(audioBlob)
      }

      mediaRecorder.start(250)
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (error) {
      console.error("TrustShield recording error:", error)
      setResult({
        error: "Microphone access denied. Please allow microphone access in your browser settings.",
        risk_score: 0,
        risk_level: "unknown",
        explanation: ""
      })
      setShowResultPanel(true)
      setShowAudioPanel(false)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    chunksRef.current = []
    mediaRecorderRef.current = null
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScannedContent(file.name)
      processAudio(file)
    }
    if (e.target) e.target.value = ""
  }

  const processAudio = async (audioBlob: Blob) => {
    const content = scannedContent || `Audio Recording (${formatTime(recordingTime)})`
    const navigationIntent = getNavigationIntent("audio")

    await saveScanResult({
      mode: "audio",
      content,
      result: null,
      loading: true,
      timestamp: Date.now(),
      navigateTo: navigationIntent
    })

    setVisible(false)
    setShowAudioPanel(false)
    setLoading(true)
    setResult(null)
    if (!scannedContent) setScannedContent(content)
    setShowResultPanel(true)
    setRecordingTime(0)

    try {
      if (apiStatus !== "awake") {
        setApiStatus("waking")
        await wakeUpAPI()
      }

      const data = await analyzeAudio(audioBlob)
      setResult(data)
      setApiStatus("awake")
      
      await saveScanResult({
        mode: "audio",
        content,
        result: data,
        loading: false,
        timestamp: Date.now(),
        navigateTo: navigationIntent
      })
    } catch (error) {
      const errorResult: AnalysisResult = {
        error: error instanceof Error ? error.message : "Audio analysis failed",
        risk_score: 0,
        risk_level: "unknown",
        explanation: ""
      }
      setResult(errorResult)
      
      await saveScanResult({
        mode: "audio",
        content,
        result: errorResult,
        loading: false,
        timestamp: Date.now(),
        navigateTo: navigationIntent
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // UI Helpers
  // ============================================
  const closeAll = () => {
    setVisible(false)
    setShowResultPanel(false)
    setShowAudioPanel(false)
    setResult(null)
    setLoading(false)
    if (isRecording) cancelRecording()
  }

  const closeResultPanel = () => {
    setShowResultPanel(false)
    setResult(null)
    setLoading(false)
  }

  const retryAnalysis = () => {
    setResult(null)
    setShowResultPanel(false)
    // Re-show the floating toolbar
    setVisible(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getModeLabel = (m: string) => {
    const labels: Record<string, string> = {
      text: "Text", image: "Image", audio: "Audio",
      video: "Video", url: "URL", email: "Email", news: "News"
    }
    return labels[m] || "Content"
  }

  const getModeEmoji = (m: string) => {
    const emojis: Record<string, string> = {
      text: "", image: "", audio: "",
      video: "", url: "", email: "", news: ""
    }
    return emojis[m] || ""
  }

  const getRiskColor = (score: number) => {
    const s = score > 1 ? score / 100 : score
    if (s < 0.4) return "#22c55e"
    if (s < 0.7) return "#eab308"
    return "#ef4444"
  }

  const getRiskGlow = (score: number) => {
    const s = score > 1 ? score / 100 : score
    if (s < 0.4) return "rgba(34, 197, 94, 0.4)"
    if (s < 0.7) return "rgba(234, 179, 8, 0.4)"
    return "rgba(239, 68, 68, 0.4)"
  }

  const getRiskPercentage = (score: number) => {
    return score > 1 ? Math.round(score) : Math.round(score * 100)
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="trustshield-root">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a,.flac"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* ===== Floating Toolbar ===== */}
      {visible && !showResultPanel && (
        <div
          ref={floatingRef}
          className="trustshield-floating"
          style={{
            left: `${Math.min(Math.max(pos.x - 80, 10), window.innerWidth - 340)}px`,
            top: `${Math.max(pos.y - 50, 10)}px`
          }}
        >
          {!showAudioPanel && (
            <div className="trustshield-actions">
              <button
                className="trustshield-btn trustshield-btn-primary"
                onClick={() => analyze()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Scan {getModeLabel(mode)}
              </button>

              {mode !== "image" && (
                <button
                  className="trustshield-btn"
                  onClick={openAudioPanel}
                  title="Scan Audio"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {showAudioPanel && (
            <div className="trustshield-panel trustshield-audio-panel">
              <div className="trustshield-header">
                <span className="trustshield-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                  Audio Analysis
                </span>
                <button className="trustshield-close" onClick={closeAll}>×</button>
              </div>

              <div className="trustshield-body">
                {isRecording ? (
                  <div className="trustshield-recording">
                    <div className={`trustshield-recording-visualizer ${isPaused ? "paused" : ""}`}>
                      <div className="trustshield-wave-container">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="trustshield-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    </div>

                    <div className="trustshield-recording-timer">
                      <span className={`trustshield-recording-dot ${isPaused ? "paused" : ""}`} />
                      <span className="trustshield-timer-text">{formatTime(recordingTime)}</span>
                      {isPaused && <span className="trustshield-paused-label">PAUSED</span>}
                    </div>

                    <div className="trustshield-recording-controls">
                      <button
                        className={`trustshield-control-btn ${isPaused ? "resume" : "pause"}`}
                        onClick={isPaused ? resumeRecording : pauseRecording}
                        title={isPaused ? "Resume" : "Pause"}
                      >
                        {isPaused ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        )}
                      </button>

                      <button className="trustshield-control-btn stop" onClick={stopRecording} title="Stop & Analyze">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      </button>

                      <button className="trustshield-control-btn cancel" onClick={cancelRecording} title="Cancel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <p className="trustshield-recording-hint">
                      {isPaused ? "Paused. Click play to resume." : "Recording... Click stop when done."}
                    </p>
                  </div>
                ) : (
                  <div className="trustshield-audio-options">
                    <button className="trustshield-btn-record" onClick={startRecording}>
                      <div className="trustshield-btn-icon-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </div>
                      <span>Record Audio</span>
                    </button>

                    <div className="trustshield-divider"><span>or</span></div>

                    <button className="trustshield-btn-upload" onClick={() => fileInputRef.current?.click()}>
                      <div className="trustshield-btn-icon-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <span>Upload Audio File</span>
                    </button>

                    <p className="trustshield-audio-hint">Supports MP3, WAV, OGG, WebM</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Result Panel ===== */}
      {showResultPanel && (
        <div ref={resultPanelRef} className="trustshield-result-panel">
          <div className="trustshield-result-header">
            <div className="trustshield-result-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Trust<span className="trustshield-accent">Shield</span></span>
            </div>
            <button className="trustshield-result-close" onClick={closeResultPanel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="trustshield-result-content">
            <div className="trustshield-mode-badge">
              <span className="trustshield-mode-icon">{getModeEmoji(mode)}</span>
              <span>{getModeLabel(mode)} Analysis</span>
            </div>

            {/* API Waking Notice */}
            {loading && apiStatus === "waking" && (
              <div className="trustshield-waking-notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Server is waking up, this may take 15-30 seconds...</span>
              </div>
            )}

            {loading && (
              <div className="trustshield-result-loading">
                <div className="trustshield-result-spinner" />
                <p>Analyzing {getModeLabel(mode)}...</p>
              </div>
            )}

            {!loading && result?.error && (
              <div className="trustshield-result-error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>{result.error}</p>
                <button className="trustshield-retry-btn" onClick={retryAnalysis}>
                  ↻ Try Again
                </button>
              </div>
            )}

            {!loading && result && !result.error && (
              <>
                <div className="trustshield-risk-container">
                  <div
                    className="trustshield-risk-circle"
                    style={{
                      background: `${getRiskColor(result.risk_score)}20`,
                      border: `3px solid ${getRiskColor(result.risk_score)}`,
                      boxShadow: `0 0 30px ${getRiskGlow(result.risk_score)}`
                    }}
                  >
                    <span className="trustshield-risk-value" style={{ color: getRiskColor(result.risk_score) }}>
                      {getRiskPercentage(result.risk_score)}%
                    </span>
                  </div>
                  <span className="trustshield-risk-level" style={{ color: getRiskColor(result.risk_score) }}>
                    {result.risk_level || "Unknown"} Risk
                  </span>
                </div>

                {result.verdict && (
                  <div className="trustshield-section trustshield-verdict-section">
                    <h4>Verdict</h4>
                    <p>{result.verdict}</p>
                  </div>
                )}

                {result.threat_types && result.threat_types.length > 0 && (
                  <div className="trustshield-section">
                    <h4>Detected Threats</h4>
                    <div className="trustshield-threats">
                      {result.threat_types.map((threat, i) => (
                        <span key={i} className="trustshield-threat-badge">{threat}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(result.simplified_explanation || result.explanation) && (
                  <div className="trustshield-section">
                    <h4>Analysis</h4>
                    <p>{result.simplified_explanation || result.explanation}</p>
                  </div>
                )}

                {scannedContent && (
                  <div className="trustshield-scanned-content">
                    <span className="trustshield-scanned-label">Scanned Content</span>
                    <p>{scannedContent.substring(0, 100)}{scannedContent.length > 100 ? "..." : ""}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="trustshield-result-footer">
            <span>Protected by TrustShield</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Floating