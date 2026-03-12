// components/utils/uranal.ts

// ============================================
// TYPE DEFINITIONS
// ============================================
export interface UrlAnalysisResult {
  risk_score: number
  risk_level: string
  domain: string
  threat_types: string[]
  checks: {
    https: { passed: boolean; message: string }
    domainAge: { passed: boolean; message: string }
    virusTotal: { passed: boolean; message: string }
    phishing: { passed: boolean; message: string }
    hosting: { passed: boolean; message: string }
  }
}

// ============================================
// API KEY CONFIGURATION
// ============================================
const VIRUSTOTAL_API_KEY = process.env.PLASMO_PUBLIC_VIRUSTOTAL_API_KEY

// ============================================
// MAIN URL ANALYSIS FUNCTION
// ============================================
export async function analyzeUrl(url: string): Promise<UrlAnalysisResult> {
  // Validate API key
  if (!VIRUSTOTAL_API_KEY) {
    throw new Error("VirusTotal API key not configured. Check your .env file.")
  }

  try {
    // Parse URL
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    const isHttps = urlObj.protocol === "https:"

    console.log("🔍 Analyzing URL:", url)

    // ----------------------------------------
    // STEP 1: Submit URL to VirusTotal
    // ----------------------------------------
    const submitResponse = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        "x-apikey": VIRUSTOTAL_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(url)}`,
    })

    if (!submitResponse.ok) {
      throw new Error(`VirusTotal API error: ${submitResponse.status} ${submitResponse.statusText}`)
    }

    const submitData = await submitResponse.json()

    // Check for API errors
    if (submitData.error) {
      throw new Error(submitData.error.message || "VirusTotal returned an error")
    }

    // Get analysis ID
    const analysisId = submitData.data?.id
    if (!analysisId) {
      throw new Error("Failed to get analysis ID from VirusTotal")
    }

    console.log("📋 Analysis ID:", analysisId)

    // ----------------------------------------
    // STEP 2: Wait for analysis to complete
    // ----------------------------------------
    console.log("⏳ Waiting for analysis to complete...")
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // ----------------------------------------
    // STEP 3: Get analysis results
    // ----------------------------------------
    const resultResponse = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
      }
    )

    if (!resultResponse.ok) {
      throw new Error(`Failed to get analysis results: ${resultResponse.status}`)
    }

    const resultData = await resultResponse.json()

    // ----------------------------------------
    // STEP 4: Parse results
    // ----------------------------------------
    const stats = resultData.data?.attributes?.stats || {}
    const malicious = stats.malicious || 0
    const suspicious = stats.suspicious || 0
    const harmless = stats.harmless || 0
    const undetected = stats.undetected || 0

    console.log("📊 VirusTotal Stats:", { malicious, suspicious, harmless, undetected })

    // Calculate risk score (0-1 scale)
    const total = malicious + suspicious + harmless + undetected
    let riskScore = 0

    if (total > 0) {
      // Malicious counts fully, suspicious counts half
      riskScore = (malicious + suspicious * 0.5) / total
    }

    // Determine risk level
    let riskLevel: string
    if (riskScore === 0) {
      riskLevel = "Safe"
    } else if (riskScore < 0.1) {
      riskLevel = "Low"
    } else if (riskScore < 0.3) {
      riskLevel = "Medium"
    } else if (riskScore < 0.6) {
      riskLevel = "High"
    } else {
      riskLevel = "Critical"
    }

    // Identify threat types
    const threatTypes: string[] = []
    if (malicious > 0) {
      threatTypes.push("Malware Detected")
    }
    if (suspicious > 0) {
      threatTypes.push("Suspicious Content")
    }
    if (!isHttps) {
      threatTypes.push("Insecure Connection")
    }

    // ----------------------------------------
    // STEP 5: Build detailed checks
    // ----------------------------------------
    const checks = {
      https: {
        passed: isHttps,
        message: isHttps
          ? "✓ Secure HTTPS connection"
          : "✗ Insecure HTTP - connection not encrypted",
      },
      domainAge: {
        passed: true,
        message: `Domain: ${domain}`,
      },
      virusTotal: {
        passed: malicious === 0,
        message:
          malicious === 0
            ? `✓ Clean - Scanned by ${total} security engines`
            : `✗ ${malicious} security vendor(s) flagged as malicious`,
      },
      phishing: {
        passed: malicious === 0 && suspicious === 0,
        message:
          malicious === 0 && suspicious === 0
            ? "✓ No phishing indicators detected"
            : "✗ Potential phishing or scam detected",
      },
      hosting: {
        passed: true,
        message: `Hosted at: ${domain}`,
      },
    }

    // ----------------------------------------
    // STEP 6: Return complete analysis
    // ----------------------------------------
    const result: UrlAnalysisResult = {
      risk_score: riskScore,
      risk_level: riskLevel,
      domain: domain,
      threat_types: threatTypes,
      checks: checks,
    }

    console.log("✅ Analysis Complete:", result)
    return result

  } catch (error: any) {
    console.error("❌ URL Analysis Error:", error)
    
    // Throw a user-friendly error
    throw new Error(
      error.message || "Failed to analyze URL. Please check your connection and try again."
    )
  }
}

// ============================================
// HELPER: Check if API key is configured
// ============================================
export function checkApiKeyValid(): boolean {
  const isValid = !!VIRUSTOTAL_API_KEY
  
  if (!isValid) {
    console.error("❌ VirusTotal API key is not configured!")
    console.log("💡 Add PLASMO_PUBLIC_VIRUSTOTAL_API_KEY to your .env file")
  } else {
    console.log("✅ VirusTotal API key is configured")
  }
  
  return isValid
}

// ============================================
// HELPER: Get URL report (alternative method)
// ============================================
export async function getUrlReport(url: string): Promise<any> {
  if (!VIRUSTOTAL_API_KEY) {
    throw new Error("VirusTotal API key not configured")
  }

  try {
    // Encode URL to base64 (required by VirusTotal)
    const urlId = btoa(url).replace(/=/g, "")

    const response = await fetch(
      `https://www.virustotal.com/api/v3/urls/${urlId}`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  } catch (error: any) {
    console.error("Get URL Report Error:", error)
    throw new Error(error.message || "Failed to get URL report")
  }
}

// ============================================
// HELPER: Validate URL format
// ============================================
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Check if it has a valid protocol
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

// ============================================
// HELPER: Extract domain from URL
// ============================================
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ""
  }
}

// ============================================
// HELPER: Check if URL is HTTPS
// ============================================
export function isHttps(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "https:"
  } catch {
    return false
  }
}