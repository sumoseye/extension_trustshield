// hooks/useTranslation.ts
import { useState, useEffect, useCallback } from "react"
import {
  translate,
  loadLanguagePreference,
  saveLanguagePreference,
  isRTL,
  detectBrowserLanguage,
} from "../services/translation"

export interface UseTranslationReturn {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
  isRtl: boolean
  ready: boolean
}

export const useTranslation = (): UseTranslationReturn => {
  const [language, setLanguageState] = useState<string>("en")
  const [ready, setReady] = useState(false)

  // Load saved language preference on mount
  useEffect(() => {
    const load = async () => {
      const savedLang = await loadLanguagePreference()
      setLanguageState(savedLang.split("-")[0]) // Normalize to base code
      setReady(true)
    }
    load()
  }, [])

  // Translation function
  const t = useCallback(
    (key: string): string => {
      return translate(key, language)
    },
    [language]
  )

  // Set language and persist
  const setLanguage = useCallback((lang: string) => {
    const baseLang = lang.split("-")[0].toLowerCase()
    setLanguageState(baseLang)
    saveLanguagePreference(baseLang)
  }, [])

  return {
    language,
    setLanguage,
    t,
    isRtl: isRTL(language),
    ready,
  }
}