// components/LanguageSelector.tsx
import { useState, useEffect, useRef, useCallback } from "react"
import {
  getAvailableLanguages,
  saveLanguagePreference,
  isRTL,
  type LanguageOption
} from "../services/translation"

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (langCode: string) => void
  t: (key: string) => string
  colors: Record<string, string>
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  t,
  colors,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [languages, setLanguages] = useState<LanguageOption[]>([])
  const [visibleCount, setVisibleCount] = useState(30)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load available languages on mount using Intl API
  useEffect(() => {
    const langs = getAvailableLanguages()
    setLanguages(langs)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
        setVisibleCount(30)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Focus search when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Filter languages based on search
  const filteredLanguages = languages.filter((lang) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      lang.englishName.toLowerCase().includes(q) ||
      lang.name.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    )
  })

  // Lazy load: only render visible items
  const displayedLanguages = filteredLanguages.slice(0, visibleCount)

  // Scroll handler for lazy loading more items
  const handleScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    if (scrollTop + clientHeight >= scrollHeight - 40) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredLanguages.length))
    }
  }, [filteredLanguages.length])

  const handleSelect = (langCode: string) => {
    onLanguageChange(langCode)
    saveLanguagePreference(langCode)
    setIsOpen(false)
    setSearchQuery("")
    setVisibleCount(30)
  }

  const getCurrentLanguageName = (): string => {
    const found = languages.find(
      (l) => l.code === currentLanguage || l.code === currentLanguage.split("-")[0]
    )
    return found ? found.name : currentLanguage.toUpperCase()
  }

  const getCurrentLanguageFlag = (): string => {
    // Use Intl regionCode to get a flag emoji if possible
    const base = currentLanguage.split("-")[0].toLowerCase()
    // Map common language codes to region codes for flag emojis
    const langToRegion: Record<string, string> = {
      en: "GB", es: "ES", fr: "FR", de: "DE", hi: "IN", zh: "CN",
      ja: "JP", ko: "KR", ar: "SA", pt: "BR", ru: "RU", tr: "TR",
      it: "IT", nl: "NL", pl: "PL", sv: "SE", da: "DK", fi: "FI",
      no: "NO", cs: "CZ", el: "GR", he: "IL", th: "TH", vi: "VN",
      id: "ID", ms: "MY", tl: "PH", fil: "PH", uk: "UA", ro: "RO",
      hu: "HU", bg: "BG", hr: "HR", sk: "SK", sl: "SI", sr: "RS",
      bs: "BA", mk: "MK", sq: "AL", et: "EE", lv: "LV", lt: "LT",
      mt: "MT", ga: "IE", cy: "GB", is: "IS", af: "ZA", sw: "KE",
      am: "ET", bn: "BD", gu: "IN", kn: "IN", ml: "IN", mr: "IN",
      or: "IN", pa: "IN", ta: "IN", te: "IN", ur: "PK", fa: "IR",
      ps: "AF", ne: "NP", si: "LK", my: "MM", km: "KH", lo: "LA",
      ka: "GE", hy: "AM", az: "AZ", kk: "KZ", ky: "KG", uz: "UZ",
      tk: "TM", tg: "TJ", mn: "MN", yo: "NG", ig: "NG", ha: "NG",
      zu: "ZA", xh: "ZA", st: "ZA", sn: "ZW", rw: "RW", mg: "MG",
      so: "SO", ti: "ER", ny: "MW", sm: "WS", mi: "NZ",
      eu: "ES", gl: "ES", ca: "ES", ku: "IQ", sd: "PK",
      ug: "CN", tt: "RU", jv: "ID", su: "ID",
    }
    const region = langToRegion[base]
    if (region) {
      // Convert region code to flag emoji
      return String.fromCodePoint(
        ...region.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
      )
    }
    return "🌐"
  }

  // ============================================
  // STYLES
  // ============================================
  const sty = {
    settingsButton: {
      background: colors.bgLight,
      border: `1px solid ${colors.border}`,
      borderRadius: "10px",
      padding: "8px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
      color: colors.textSecondary,
      fontSize: "13px",
      position: "relative" as const,
    },
    settingsIcon: {
      fontSize: "16px",
      lineHeight: "1",
    },
    currentLangLabel: {
      fontSize: "11px",
      fontWeight: "600" as const,
      color: colors.textSecondary,
      maxWidth: "60px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
    },
    panel: {
      position: "absolute" as const,
      top: "100%",
      right: "0",
      marginTop: "8px",
      width: "320px",
      maxHeight: "420px",
      background: colors.bgDark,
      border: `1px solid ${colors.border}`,
      borderRadius: "16px",
      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${colors.primaryGlow}`,
      zIndex: 9999,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column" as const,
    },
    panelHeader: {
      padding: "16px 20px 12px",
      borderBottom: `1px solid ${colors.border}`,
    },
    panelTitle: {
      fontSize: "15px",
      fontWeight: "700" as const,
      color: colors.textPrimary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    searchContainer: {
      position: "relative" as const,
    },
    searchIcon: {
      position: "absolute" as const,
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "14px",
      color: colors.textMuted,
      pointerEvents: "none" as const,
    },
    searchInput: {
      width: "100%",
      padding: "10px 14px 10px 36px",
      border: `1px solid ${colors.border}`,
      borderRadius: "10px",
      background: colors.bgMedium,
      color: colors.textPrimary,
      fontSize: "13px",
      outline: "none",
      boxSizing: "border-box" as const,
      fontFamily: "inherit",
      transition: "all 0.2s ease",
    },
    languageList: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "8px",
      maxHeight: "300px",
    },
    languageItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 14px",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.15s ease",
      border: "1px solid transparent",
    },
    languageItemActive: {
      background: `${colors.primary}20`,
      border: `1px solid ${colors.primary}`,
    },
    languageItemHover: {
      background: colors.bgLight,
    },
    langFlag: {
      fontSize: "20px",
      width: "28px",
      textAlign: "center" as const,
      flexShrink: 0,
    },
    langInfo: {
      flex: 1,
      minWidth: 0,
    },
    langNativeName: {
      fontSize: "13px",
      fontWeight: "600" as const,
      color: colors.textPrimary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
    },
    langEnglishName: {
      fontSize: "11px",
      color: colors.textMuted,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
    },
    langCode: {
      fontSize: "10px",
      color: colors.textMuted,
      background: colors.bgMedium,
      padding: "2px 6px",
      borderRadius: "4px",
      fontFamily: "monospace",
      flexShrink: 0,
    },
    checkmark: {
      color: colors.primary,
      fontSize: "16px",
      fontWeight: "700" as const,
      flexShrink: 0,
    },
    noResults: {
      padding: "30px 20px",
      textAlign: "center" as const,
      color: colors.textMuted,
      fontSize: "13px",
    },
    panelFooter: {
      padding: "10px 16px",
      borderTop: `1px solid ${colors.border}`,
      textAlign: "center" as const,
    },
    footerText: {
      fontSize: "10px",
      color: colors.textMuted,
    },
    countBadge: {
      fontSize: "10px",
      color: colors.textMuted,
      background: colors.bgLight,
      padding: "2px 8px",
      borderRadius: "10px",
      marginLeft: "auto",
    },
  }

  const getLangFlag = (code: string): string => {
    const base = code.split("-")[0].toLowerCase()
    const langToRegion: Record<string, string> = {
      en: "GB", es: "ES", fr: "FR", de: "DE", hi: "IN", zh: "CN",
      ja: "JP", ko: "KR", ar: "SA", pt: "BR", ru: "RU", tr: "TR",
      it: "IT", nl: "NL", pl: "PL", sv: "SE", da: "DK", fi: "FI",
      no: "NO", cs: "CZ", el: "GR", he: "IL", th: "TH", vi: "VN",
      id: "ID", ms: "MY", tl: "PH", fil: "PH", uk: "UA", ro: "RO",
      hu: "HU", bg: "BG", hr: "HR", sk: "SK", sl: "SI", sr: "RS",
      bs: "BA", mk: "MK", sq: "AL", et: "EE", lv: "LV", lt: "LT",
      mt: "MT", ga: "IE", cy: "GB", is: "IS", af: "ZA", sw: "KE",
      am: "ET", bn: "BD", gu: "IN", kn: "IN", ml: "IN", mr: "IN",
      or: "IN", pa: "IN", ta: "IN", te: "IN", ur: "PK", fa: "IR",
      ps: "AF", ne: "NP", si: "LK", my: "MM", km: "KH", lo: "LA",
      ka: "GE", hy: "AM", az: "AZ", kk: "KZ", ky: "KG", uz: "UZ",
      tk: "TM", tg: "TJ", mn: "MN", yo: "NG", ig: "NG", ha: "NG",
      zu: "ZA", xh: "ZA", st: "ZA", sn: "ZW", rw: "RW", mg: "MG",
      so: "SO", ti: "ER", ny: "MW", sm: "WS", mi: "NZ",
      eu: "ES", gl: "ES", ca: "ES", ku: "IQ", sd: "PK",
      ug: "CN", tt: "RU", jv: "ID", su: "ID",
    }
    const region = langToRegion[base]
    if (region) {
      return String.fromCodePoint(
        ...region.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
      )
    }
    return "🌐"
  }

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Settings/Language Toggle Button */}
      <button
        style={sty.settingsButton}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.primary
          e.currentTarget.style.background = colors.bgMedium
          e.currentTarget.style.boxShadow = `0 0 15px ${colors.primaryGlow}`
          e.currentTarget.style.color = colors.textPrimary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border
          e.currentTarget.style.background = colors.bgLight
          e.currentTarget.style.boxShadow = "none"
          e.currentTarget.style.color = colors.textSecondary
        }}
        title={t("settings.language")}
      >
        <span style={sty.settingsIcon}>⚙️</span>
        <span style={sty.currentLangLabel}>
          {getCurrentLanguageFlag()} {currentLanguage.split("-")[0].toUpperCase()}
        </span>
      </button>

      {/* Language Selection Panel */}
      {isOpen && (
        <div style={sty.panel}>
          {/* Panel Header with Search */}
          <div style={sty.panelHeader}>
            <div style={sty.panelTitle}>
              <span>🌍</span>
              <span>{t("settings.selectLanguage")}</span>
              <span style={sty.countBadge}>
                {filteredLanguages.length} {filteredLanguages.length === 1 ? "language" : "languages"}
              </span>
            </div>

            <div style={sty.searchContainer}>
              <span style={sty.searchIcon}>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                style={sty.searchInput}
                placeholder={t("settings.searchLanguage")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setVisibleCount(30)
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.secondary
                  e.currentTarget.style.boxShadow = `0 0 15px ${colors.secondaryGlow}`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </div>
          </div>

          {/* Scrollable Language List */}
          <div
            ref={listRef}
            style={sty.languageList}
            onScroll={handleScroll}
          >
            {displayedLanguages.length === 0 ? (
              <div style={sty.noResults}>
                No languages found for "{searchQuery}"
              </div>
            ) : (
              displayedLanguages.map((lang) => {
                const isActive =
                  lang.code === currentLanguage ||
                  lang.code === currentLanguage.split("-")[0]
                const rtl = isRTL(lang.code)

                return (
                  <div
                    key={lang.code}
                    style={{
                      ...sty.languageItem,
                      ...(isActive ? sty.languageItemActive : {}),
                      direction: rtl ? "rtl" : "ltr",
                    }}
                    onClick={() => handleSelect(lang.code)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = colors.bgLight
                        e.currentTarget.style.borderColor = `${colors.border}`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent"
                        e.currentTarget.style.borderColor = "transparent"
                      }
                    }}
                  >
                    <span style={sty.langFlag}>
                      {getLangFlag(lang.code)}
                    </span>
                    <div style={sty.langInfo}>
                      <div style={sty.langNativeName}>{lang.name}</div>
                      {lang.name !== lang.englishName && (
                        <div style={sty.langEnglishName}>{lang.englishName}</div>
                      )}
                    </div>
                    <span style={sty.langCode}>{lang.code}</span>
                    {isActive && <span style={sty.checkmark}>✓</span>}
                  </div>
                )
              })
            )}

            {/* Load more indicator */}
            {displayedLanguages.length < filteredLanguages.length && (
              <div style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "11px",
                color: colors.textMuted,
              }}>
                Scroll for more languages...
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={sty.panelFooter}>
            <span style={sty.footerText}>
              {t("settings.poweredBy")}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector