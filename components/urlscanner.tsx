// components/UrlScanner.tsx
import { useState, useEffect } from "react"
import { analyzeUrl, type UrlAnalysisResult } from "./utils/uranal"
import urlscanIcon from "data-base64:~/assets/link.png"

interface UrlScannerProps {
  colors: any
  styles: any
}

export function UrlScanner({ colors, styles }: UrlScannerProps) {
  const [urlMode, setUrlMode] = useState<"current" | "manual">("current")
  const [currentTabUrl, setCurrentTabUrl] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<UrlAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get current tab URL
  useEffect(() => {
    if (urlMode === "current") {
      chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          setCurrentTabUrl(tabs[0].url)
        } else {
          setCurrentTabUrl("")
        }
      })
    }
  }, [urlMode])

  // Scan URL
  const handleScan = async () => {
    const urlToScan = urlMode === "current" ? currentTabUrl : urlInput

    if (!urlToScan.trim()) {
      setError("Please enter a URL to scan")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const analysisResult = await analyzeUrl(urlToScan)
      setResult(analysisResult)
    } catch (err: any) {
      setError(err.message || "Failed to analyze URL")
    } finally {
      setIsLoading(false)
    }
  }

  // Get color based on risk level
  const getRiskColor = (level: string) => {
    switch (level) {
      case "Safe":
        return colors.success
      case "Low":
        return "#22d3ee"
      case "Medium":
        return colors.warning
      case "High":
        return "#f97316"
      case "Critical":
        return colors.danger
      default:
        return colors.textMuted
    }
  }

  // Render check item
  const renderCheckItem = (label: string, check: { passed: boolean; message: string }) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "10px",
        background: colors.bgDark,
        borderRadius: "8px",
        marginBottom: "8px",
        border: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: check.passed ? colors.success : colors.danger,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "12px",
          color: "#fff",
          fontWeight: "bold",
          boxShadow: check.passed
            ? "0 0 10px rgba(34, 197, 94, 0.4)"
            : "0 0 10px rgba(239, 68, 68, 0.4)",
        }}
      >
        {check.passed ? "✓" : "!"}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: colors.textMuted,
            textTransform: "uppercase" as const,
            marginBottom: "4px",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "12px", color: colors.textSecondary }}>
          {check.message}
        </div>
      </div>
    </div>
  )

  // Render results
  const renderResult = () => {
    if (!result) return null

    const riskColor = getRiskColor(result.risk_level)
    const riskPercent = Math.round(result.risk_score * 100)

    return (
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          background: colors.bgDark,
          borderRadius: "16px",
          border: `1px solid ${colors.border}`,
          boxShadow: `0 0 20px ${colors.primaryGlow}`,
        }}
      >
        {/* Risk Score Circle */}
        <div style={{ textAlign: "center" as const, marginBottom: "20px" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `${riskColor}20`,
              border: `3px solid ${riskColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "28px",
              fontWeight: "700",
              color: riskColor,
              boxShadow: `0 0 30px ${riskColor}40`,
            }}
          >
            {riskPercent}%
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "700",
              textTransform: "uppercase" as const,
              letterSpacing: "1px",
              color: riskColor,
            }}
          >
            {result.risk_level} Risk
          </div>
        </div>

        {/* Domain info */}
        <div
          style={{
            padding: "12px",
            background: colors.bgLight,
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "12px",
            color: colors.textSecondary,
            wordBreak: "break-all" as const,
          }}
        >
          <span style={{ color: colors.textMuted }}>Domain: </span>
          {result.domain}
        </div>

        {/* Threat badges */}
        {result.threat_types.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: colors.textMuted,
                textTransform: "uppercase" as const,
                marginBottom: "8px",
              }}
            >
              Threats Detected
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
              {result.threat_types.map((threat, i) => (
                <span
                  key={i}
                  style={{
                    padding: "6px 12px",
                    background: colors.danger,
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#fff",
                    boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {threat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed checks */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: colors.textMuted,
              textTransform: "uppercase" as const,
              marginBottom: "12px",
            }}
          >
            Security Checks
          </div>
          {renderCheckItem("HTTPS", result.checks.https)}
          {renderCheckItem("Domain Age", result.checks.domainAge)}
          {renderCheckItem("VirusTotal", result.checks.virusTotal)}
          {renderCheckItem("Phishing Detection", result.checks.phishing)}
          {renderCheckItem("Hosting", result.checks.hosting)}
        </div>
      </div>
    )
  }

  // Loading spinner
  const renderLoading = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: `3px solid ${colors.bgLight}`,
          borderTop: `3px solid ${colors.secondary}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          boxShadow: `0 0 15px ${colors.secondaryGlow}`,
        }}
      />
      <p style={{ marginTop: "16px", fontSize: "13px", color: colors.textSecondary }}>
        Scanning URL...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )

  return (
    <div style={{ padding: "20px" }}>
      {/* Section Title */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: colors.textPrimary,
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
            boxShadow: `0 0 15px ${colors.buttonGlow}`,
          }}
        >
          <img src={urlscanIcon} alt="URL" style={{ width: "16px", height: "16px" }} />
        </div>
        URL Scanner
      </div>

      {isLoading ? (
        renderLoading()
      ) : (
        <>
          {/* URL Mode Toggle */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s ease",
                border: urlMode === "current" ? "none" : `1px solid ${colors.border}`,
                background:
                  urlMode === "current"
                    ? `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`
                    : colors.bgDark,
                color: urlMode === "current" ? colors.textPrimary : colors.textMuted,
                boxShadow: urlMode === "current" ? `0 0 20px ${colors.buttonGlow}` : "none",
              }}
              onClick={() => setUrlMode("current")}
            >
              Current Tab
            </button>
            <button
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s ease",
                border: urlMode === "manual" ? "none" : `1px solid ${colors.border}`,
                background:
                  urlMode === "manual"
                    ? `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`
                    : colors.bgDark,
                color: urlMode === "manual" ? colors.textPrimary : colors.textMuted,
                boxShadow: urlMode === "manual" ? `0 0 20px ${colors.buttonGlow}` : "none",
              }}
              onClick={() => setUrlMode("manual")}
            >
              Enter URL
            </button>
          </div>

          {/* Current Tab URL Display */}
          {urlMode === "current" && (
            <div
              style={{
                padding: "14px",
                background: colors.bgDark,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                marginBottom: "16px",
                boxShadow: `0 0 10px ${colors.primaryGlow}`,
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: colors.textMuted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                Current Tab URL
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: colors.textSecondary,
                  wordBreak: "break-all" as const,
                }}
              >
                {currentTabUrl || "Unable to get current tab URL"}
              </div>
            </div>
          )}

          {/* Manual URL Input */}
          {urlMode === "manual" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                Enter URL to scan
              </label>
              <input
                type="url"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  background: colors.bgDark,
                  color: colors.textPrimary,
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box" as const,
                  boxShadow: `0 0 10px ${colors.primaryGlow}`,
                }}
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
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
          )}

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: "12px",
                background: `${colors.danger}20`,
                border: `1px solid ${colors.danger}`,
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "12px",
                color: colors.danger,
              }}
            >
              {error}
            </div>
          )}

          {/* Scan Button */}
          <button
            style={{
              width: "100%",
              padding: "14px 20px",
              border: "none",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
              color: colors.textPrimary,
              fontSize: "14px",
              fontWeight: "600",
              cursor:
                (urlMode === "current" && !currentTabUrl) || (urlMode === "manual" && !urlInput.trim())
                  ? "not-allowed"
                  : "pointer",
              opacity:
                (urlMode === "current" && !currentTabUrl) || (urlMode === "manual" && !urlInput.trim())
                  ? 0.5
                  : 1,
              boxShadow:
                (urlMode === "current" && !currentTabUrl) || (urlMode === "manual" && !urlInput.trim())
                  ? "none"
                  : `0 0 25px ${colors.buttonGlow}`,
              transition: "all 0.2s ease",
            }}
            onClick={handleScan}
            disabled={
              (urlMode === "current" && !currentTabUrl) || (urlMode === "manual" && !urlInput.trim())
            }
            onMouseEnter={(e) => {
              if ((urlMode === "current" && currentTabUrl) || (urlMode === "manual" && urlInput.trim())) {
                e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
              }
            }}
            onMouseLeave={(e) => {
              if ((urlMode === "current" && currentTabUrl) || (urlMode === "manual" && urlInput.trim())) {
                e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
              }
            }}
          >
            Scan URL
          </button>

          {/* Results */}
          {renderResult()}
        </>
      )}
    </div>
  )
}

export default UrlScanner