// content.ts
console.log("Anti-Phishing Extension: Content script loaded")

// Log when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Anti-Phishing Extension: DOM ready")
  console.log("Current URL:", window.location.href)
})

// Example: Log all links on the page
const links = document.querySelectorAll("a")
console.log("Anti-Phishing Extension: Found", links.length, "links on page")

// Example: Scan for suspicious content
const scanPage = () => {
  const bodyText = document.body.innerText
  console.log("Anti-Phishing Extension: Scanning page content...")
  
  const suspiciousWords = ["urgent", "verify", "suspended", "click here"]
  suspiciousWords.forEach(word => {
    if (bodyText.toLowerCase().includes(word)) {
      console.warn("Anti-Phishing Extension: Suspicious word found:", word)
    }
  })
}

scanPage()