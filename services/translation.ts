// services/translation.ts

// ============================================
// TRANSLATION SERVICE
// Uses browser built-in Intl APIs + dynamic translation
// ============================================

export interface TranslationMap {
    [key: string]: string
  }
  
  // All UI string keys used in the extension
  export const UI_KEYS = {
    // Header
    "header.subtitle": "Detect. Protect. Secure.",
  
    // Home
    "home.email.title": "Email Analysis",
    "home.email.desc": "Detect phishing attempts and malicious emails",
    "home.url.title": "URL Scanner",
    "home.url.desc": "Check website safety and security threats",
    "home.deepfake.title": "Deepfake AI",
    "home.deepfake.desc": "Verify media authenticity and detect AI manipulation",
    "home.factcheck.title": "Fact Checker",
    "home.factcheck.desc": "Verify news and claims against trusted sources",
    "home.recentScan": "Recent Scan",
    "home.scanning": "Scanning...",
    "home.newScanResult": "New Scan Result",
  
    // Email
    "email.title": "Phishing Email Analysis",
    "email.label": "Paste email content to analyze",
    "email.placeholder": "Paste the suspicious email content here including subject, sender, and body...",
    "email.button": "Analyze Email",
    "email.loading": "Analyzing email...",
  
    // URL
    "url.title": "URL Scanner",
    "url.currentTab": "Current Tab",
    "url.manual": "Manual URL",
    "url.label": "Enter URL to scan",
    "url.placeholder": "https://example.com",
    "url.button": "Scan URL",
    "url.loading": "Scanning URL...",
    "url.currentLabel": "Current tab URL",
  
    // Deepfake
    "deepfake.title": "Deepfake AI Detection",
    "deepfake.text": "Text",
    "deepfake.image": "Image",
    "deepfake.video": "Video",
    "deepfake.audio": "Audio",
    "deepfake.textLabel": "Enter text to analyze",
    "deepfake.textPlaceholder": "Paste text to check for AI-generated content...",
    "deepfake.analyzeText": "Analyze Text",
    "deepfake.uploadImage": "Upload Image",
    "deepfake.uploadVideo": "Upload Video",
    "deepfake.uploadAudio": "Upload Audio",
    "deepfake.clickToSelect": "Click to select file",
    "deepfake.formatsImage": "PNG, JPG, GIF, WebP",
    "deepfake.formatsVideo": "MP4, WebM, MOV",
    "deepfake.formatsAudio": "MP3, WAV, OGG",
  
    // Fact Check
    "factcheck.title": "Fact Checker",
    "factcheck.label": "Enter claim or news to verify",
    "factcheck.placeholder": "Paste news headline, claim, or statement you want to fact-check...",
    "factcheck.button": "Check Facts",
    "factcheck.loading": "Checking facts...",
  
    // Scan
    "scan.title": "Scan Results",
    "scan.noRecent": "No Recent Scans",
    "scan.noRecentDesc": "Select text or hover over an image on any webpage to scan it with TrustShield",
    "scan.analysis": "Analysis",
    "scan.scannedContent": "Scanned Content",
    "scan.clearResults": "Clear Results",
  
    // Results
    "result.risk": "Risk",
    "result.verdict": "Verdict",
    "result.threats": "Detected Threats",
    "result.analysis": "Analysis",
    "result.contentType": "Content Type",
    "result.tryAgain": "Try Again",
  
    // General
    "general.back": "Back",
    "general.analyzing": "Analyzing...",
    "general.serverWaking": "Server is waking up, this may take 15-30 seconds...",
    "general.serverStarting": "Server is starting up...",
    "general.serverUnavailable": "Server may be unavailable. Requests will be retried automatically.",
  
    // Footer
    "footer.text": "Your Security, Our Priority",
  
    // Settings
    "settings.language": "Language",
    "settings.title": "Settings",
    "settings.searchLanguage": "Search languages...",
    "settings.selectLanguage": "Select Language",
    "settings.poweredBy": "Powered by browser translation APIs",
  } as const
  
  export type UIKey = keyof typeof UI_KEYS
  
  // ============================================
  // Get all languages supported by Intl.DisplayNames
  // This dynamically pulls from the browser's built-in data
  // ============================================
  export interface LanguageOption {
    code: string
    name: string        // Name in the target language (native name)
    englishName: string // Name in English
  }
  
  // Use Intl.DisplayNames to get language names dynamically
  const getLanguageDisplayName = (
    langCode: string,
    displayIn: string
  ): string => {
    try {
      const displayNames = new Intl.DisplayNames([displayIn], { type: "language" })
      return displayNames.of(langCode) || langCode
    } catch {
      return langCode
    }
  }
  
  // Common ISO 639-1 codes — the browser's Intl API resolves names for these
  const ISO_LANGUAGE_CODES = [
    "af", "am", "ar", "az", "be", "bg", "bn", "bs", "ca", "cs",
    "cy", "da", "de", "el", "en", "es", "et", "eu", "fa", "fi",
    "fil", "fr", "ga", "gl", "gu", "ha", "he", "hi", "hr", "hu",
    "hy", "id", "ig", "is", "it", "ja", "jv", "ka", "kk", "km",
    "kn", "ko", "ku", "ky", "lo", "lt", "lv", "mg", "mi", "mk",
    "ml", "mn", "mr", "ms", "mt", "my", "ne", "nl", "no", "ny",
    "or", "pa", "pl", "ps", "pt", "ro", "ru", "rw", "sd", "si",
    "sk", "sl", "sm", "sn", "so", "sq", "sr", "st", "su", "sv",
    "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tr", "tt",
    "ug", "uk", "ur", "uz", "vi", "xh", "yo", "zh", "zu"
  ]
  
  // Build language list using Intl.DisplayNames (browser built-in)
  export const getAvailableLanguages = (): LanguageOption[] => {
    const languages: LanguageOption[] = []
  
    for (const code of ISO_LANGUAGE_CODES) {
      const englishName = getLanguageDisplayName(code, "en")
      const nativeName = getLanguageDisplayName(code, code)
  
      // Only include if Intl actually resolved a name (not just the code back)
      if (englishName !== code || nativeName !== code) {
        languages.push({
          code,
          name: nativeName !== code ? nativeName : englishName,
          englishName,
        })
      }
    }
  
    // Sort by English name
    languages.sort((a, b) => a.englishName.localeCompare(b.englishName))
  
    return languages
  }
  
  // ============================================
  // TRANSLATION ENGINE
  // Uses a simple dictionary approach for the built-in UI strings
  // For dynamic content, we use a lightweight translation strategy
  // ============================================
  
  // Built-in translations for core languages
  // Other languages will use the fallback (English) or
  // browser-based translation if available
  const BUILT_IN_TRANSLATIONS: Record<string, Partial<Record<string, string>>> = {
    en: {}, // English is the default, keys map to UI_KEYS values directly
  
    es: {
      "header.subtitle": "Detectar. Proteger. Asegurar.",
      "home.email.title": "Análisis de Correo",
      "home.email.desc": "Detectar intentos de phishing y correos maliciosos",
      "home.url.title": "Escáner de URL",
      "home.url.desc": "Verificar seguridad del sitio web y amenazas",
      "home.deepfake.title": "IA Deepfake",
      "home.deepfake.desc": "Verificar autenticidad de medios y detectar manipulación IA",
      "home.factcheck.title": "Verificador de Hechos",
      "home.factcheck.desc": "Verificar noticias y afirmaciones contra fuentes confiables",
      "home.recentScan": "Escaneo Reciente",
      "home.scanning": "Escaneando...",
      "home.newScanResult": "Nuevo Resultado de Escaneo",
      "email.title": "Análisis de Correo Phishing",
      "email.label": "Pega el contenido del correo para analizar",
      "email.placeholder": "Pega el contenido sospechoso del correo aquí incluyendo asunto, remitente y cuerpo...",
      "email.button": "Analizar Correo",
      "email.loading": "Analizando correo...",
      "url.title": "Escáner de URL",
      "url.currentTab": "Pestaña Actual",
      "url.manual": "URL Manual",
      "url.label": "Ingresa la URL a escanear",
      "url.button": "Escanear URL",
      "url.loading": "Escaneando URL...",
      "deepfake.title": "Detección de Deepfake IA",
      "deepfake.text": "Texto",
      "deepfake.image": "Imagen",
      "deepfake.video": "Video",
      "deepfake.audio": "Audio",
      "deepfake.textLabel": "Ingresa texto para analizar",
      "deepfake.textPlaceholder": "Pega texto para verificar contenido generado por IA...",
      "deepfake.analyzeText": "Analizar Texto",
      "deepfake.uploadImage": "Subir Imagen",
      "deepfake.uploadVideo": "Subir Video",
      "deepfake.uploadAudio": "Subir Audio",
      "deepfake.clickToSelect": "Haz clic para seleccionar archivo",
      "factcheck.title": "Verificador de Hechos",
      "factcheck.label": "Ingresa afirmación o noticia para verificar",
      "factcheck.placeholder": "Pega titular, afirmación o declaración que deseas verificar...",
      "factcheck.button": "Verificar Hechos",
      "factcheck.loading": "Verificando hechos...",
      "scan.title": "Resultados del Escaneo",
      "scan.noRecent": "Sin Escaneos Recientes",
      "scan.noRecentDesc": "Selecciona texto o pasa el cursor sobre una imagen para escanear con TrustShield",
      "scan.analysis": "Análisis",
      "scan.scannedContent": "Contenido Escaneado",
      "scan.clearResults": "Limpiar Resultados",
      "result.risk": "Riesgo",
      "result.verdict": "Veredicto",
      "result.threats": "Amenazas Detectadas",
      "result.analysis": "Análisis",
      "result.contentType": "Tipo de Contenido",
      "result.tryAgain": "Intentar de Nuevo",
      "general.back": "Atrás",
      "general.analyzing": "Analizando...",
      "general.serverWaking": "El servidor se está iniciando, esto puede tomar 15-30 segundos...",
      "general.serverStarting": "El servidor se está iniciando...",
      "general.serverUnavailable": "El servidor puede no estar disponible. Las solicitudes se reintentarán automáticamente.",
      "footer.text": "Tu Seguridad, Nuestra Prioridad",
      "settings.language": "Idioma",
      "settings.title": "Configuración",
      "settings.searchLanguage": "Buscar idiomas...",
      "settings.selectLanguage": "Seleccionar Idioma",
      "settings.poweredBy": "Impulsado por APIs de traducción del navegador",
    },
  
    fr: {
      "header.subtitle": "Détecter. Protéger. Sécuriser.",
      "home.email.title": "Analyse d'E-mail",
      "home.email.desc": "Détecter les tentatives de phishing et les e-mails malveillants",
      "home.url.title": "Scanner d'URL",
      "home.url.desc": "Vérifier la sécurité du site Web et les menaces",
      "home.deepfake.title": "IA Deepfake",
      "home.deepfake.desc": "Vérifier l'authenticité des médias et détecter la manipulation IA",
      "home.factcheck.title": "Vérificateur de Faits",
      "home.factcheck.desc": "Vérifier les nouvelles et les affirmations auprès de sources fiables",
      "home.recentScan": "Analyse Récente",
      "home.scanning": "Analyse en cours...",
      "home.newScanResult": "Nouveau Résultat d'Analyse",
      "email.title": "Analyse d'E-mail de Phishing",
      "email.label": "Collez le contenu de l'e-mail à analyser",
      "email.placeholder": "Collez le contenu suspect de l'e-mail ici, y compris l'objet, l'expéditeur et le corps...",
      "email.button": "Analyser l'E-mail",
      "email.loading": "Analyse de l'e-mail...",
      "url.title": "Scanner d'URL",
      "url.currentTab": "Onglet Actuel",
      "url.manual": "URL Manuelle",
      "url.label": "Entrez l'URL à scanner",
      "url.button": "Scanner l'URL",
      "url.loading": "Scan de l'URL...",
      "deepfake.title": "Détection de Deepfake IA",
      "deepfake.text": "Texte",
      "deepfake.image": "Image",
      "deepfake.video": "Vidéo",
      "deepfake.audio": "Audio",
      "deepfake.textLabel": "Entrez le texte à analyser",
      "deepfake.textPlaceholder": "Collez le texte pour vérifier le contenu généré par IA...",
      "deepfake.analyzeText": "Analyser le Texte",
      "deepfake.uploadImage": "Télécharger une Image",
      "deepfake.uploadVideo": "Télécharger une Vidéo",
      "deepfake.uploadAudio": "Télécharger un Audio",
      "deepfake.clickToSelect": "Cliquez pour sélectionner un fichier",
      "factcheck.title": "Vérificateur de Faits",
      "factcheck.label": "Entrez une affirmation ou une nouvelle à vérifier",
      "factcheck.placeholder": "Collez un titre, une affirmation ou une déclaration que vous souhaitez vérifier...",
      "factcheck.button": "Vérifier les Faits",
      "factcheck.loading": "Vérification des faits...",
      "scan.title": "Résultats de l'Analyse",
      "scan.noRecent": "Aucune Analyse Récente",
      "scan.noRecentDesc": "Sélectionnez du texte ou survolez une image pour scanner avec TrustShield",
      "scan.clearResults": "Effacer les Résultats",
      "result.risk": "Risque",
      "result.verdict": "Verdict",
      "result.threats": "Menaces Détectées",
      "result.analysis": "Analyse",
      "result.tryAgain": "Réessayer",
      "general.back": "Retour",
      "general.analyzing": "Analyse en cours...",
      "general.serverWaking": "Le serveur démarre, cela peut prendre 15-30 secondes...",
      "footer.text": "Votre Sécurité, Notre Priorité",
      "settings.language": "Langue",
      "settings.title": "Paramètres",
      "settings.searchLanguage": "Rechercher des langues...",
      "settings.selectLanguage": "Sélectionner la Langue",
      "settings.poweredBy": "Propulsé par les APIs de traduction du navigateur",
    },
  
    de: {
      "header.subtitle": "Erkennen. Schützen. Sichern.",
      "home.email.title": "E-Mail-Analyse",
      "home.email.desc": "Phishing-Versuche und bösartige E-Mails erkennen",
      "home.url.title": "URL-Scanner",
      "home.url.desc": "Website-Sicherheit und Bedrohungen überprüfen",
      "home.deepfake.title": "Deepfake KI",
      "home.deepfake.desc": "Medienauthentizität überprüfen und KI-Manipulation erkennen",
      "home.factcheck.title": "Faktenprüfer",
      "home.factcheck.desc": "Nachrichten und Behauptungen gegen vertrauenswürdige Quellen überprüfen",
      "email.title": "Phishing-E-Mail-Analyse",
      "email.button": "E-Mail Analysieren",
      "url.title": "URL-Scanner",
      "url.button": "URL Scannen",
      "deepfake.title": "Deepfake KI-Erkennung",
      "factcheck.title": "Faktenprüfer",
      "factcheck.button": "Fakten Überprüfen",
      "general.back": "Zurück",
      "footer.text": "Ihre Sicherheit, Unsere Priorität",
      "settings.language": "Sprache",
      "settings.title": "Einstellungen",
      "settings.searchLanguage": "Sprachen suchen...",
      "settings.selectLanguage": "Sprache Auswählen",
    },
  
    hi: {
      "header.subtitle": "पहचानें। सुरक्षित करें। बचाएं।",
      "home.email.title": "ईमेल विश्लेषण",
      "home.email.desc": "फ़िशिंग प्रयासों और दुर्भावनापूर्ण ईमेल का पता लगाएं",
      "home.url.title": "URL स्कैनर",
      "home.url.desc": "वेबसाइट सुरक्षा और सुरक्षा खतरों की जाँच करें",
      "home.deepfake.title": "डीपफेक AI",
      "home.deepfake.desc": "मीडिया प्रामाणिकता सत्यापित करें और AI हेरफेर का पता लगाएं",
      "home.factcheck.title": "तथ्य जाँचकर्ता",
      "home.factcheck.desc": "विश्वसनीय स्रोतों के विरुद्ध समाचार और दावों को सत्यापित करें",
      "email.title": "फ़िशिंग ईमेल विश्लेषण",
      "email.button": "ईमेल का विश्लेषण करें",
      "url.title": "URL स्कैनर",
      "url.button": "URL स्कैन करें",
      "deepfake.title": "डीपफेक AI पहचान",
      "factcheck.title": "तथ्य जाँचकर्ता",
      "factcheck.button": "तथ्य जाँचें",
      "general.back": "वापस",
      "footer.text": "आपकी सुरक्षा, हमारी प्राथमिकता",
      "settings.language": "भाषा",
      "settings.title": "सेटिंग्स",
      "settings.searchLanguage": "भाषाएँ खोजें...",
      "settings.selectLanguage": "भाषा चुनें",
    },
  
    zh: {
      "header.subtitle": "检测。保护。安全。",
      "home.email.title": "邮件分析",
      "home.email.desc": "检测钓鱼攻击和恶意邮件",
      "home.url.title": "URL扫描器",
      "home.url.desc": "检查网站安全性和安全威胁",
      "home.deepfake.title": "深度伪造AI",
      "home.deepfake.desc": "验证媒体真实性并检测AI操纵",
      "home.factcheck.title": "事实核查",
      "home.factcheck.desc": "针对可信来源验证新闻和声明",
      "email.title": "钓鱼邮件分析",
      "email.button": "分析邮件",
      "url.title": "URL扫描器",
      "url.button": "扫描URL",
      "deepfake.title": "深度伪造AI检测",
      "factcheck.title": "事实核查器",
      "factcheck.button": "核查事实",
      "general.back": "返回",
      "footer.text": "您的安全，我们的使命",
      "settings.language": "语言",
      "settings.title": "设置",
      "settings.searchLanguage": "搜索语言...",
      "settings.selectLanguage": "选择语言",
    },
  
    ja: {
      "header.subtitle": "検出。保護。安全。",
      "home.email.title": "メール分析",
      "home.email.desc": "フィッシング攻撃と悪意のあるメールを検出",
      "home.url.title": "URLスキャナー",
      "home.url.desc": "ウェブサイトの安全性とセキュリティの脅威を確認",
      "home.deepfake.title": "ディープフェイクAI",
      "home.deepfake.desc": "メディアの真正性を検証しAI操作を検出",
      "home.factcheck.title": "ファクトチェッカー",
      "home.factcheck.desc": "信頼できるソースに対してニュースと主張を検証",
      "email.title": "フィッシングメール分析",
      "email.button": "メールを分析",
      "url.title": "URLスキャナー",
      "url.button": "URLをスキャン",
      "general.back": "戻る",
      "footer.text": "あなたの安全が私たちの優先事項です",
      "settings.language": "言語",
      "settings.title": "設定",
      "settings.searchLanguage": "言語を検索...",
      "settings.selectLanguage": "言語を選択",
    },
  
    ko: {
      "header.subtitle": "탐지. 보호. 보안.",
      "home.email.title": "이메일 분석",
      "home.email.desc": "피싱 시도 및 악성 이메일 탐지",
      "home.url.title": "URL 스캐너",
      "home.url.desc": "웹사이트 안전성 및 보안 위협 확인",
      "home.deepfake.title": "딥페이크 AI",
      "home.deepfake.desc": "미디어 진위 확인 및 AI 조작 탐지",
      "home.factcheck.title": "팩트체커",
      "home.factcheck.desc": "신뢰할 수 있는 출처에 대한 뉴스 및 주장 검증",
      "email.title": "피싱 이메일 분석",
      "email.button": "이메일 분석",
      "url.title": "URL 스캐너",
      "url.button": "URL 스캔",
      "general.back": "뒤로",
      "footer.text": "당신의 보안이 우리의 최우선입니다",
      "settings.language": "언어",
      "settings.title": "설정",
      "settings.searchLanguage": "언어 검색...",
      "settings.selectLanguage": "언어 선택",
    },
  
    ar: {
      "header.subtitle": "اكتشف. احمِ. أمِّن.",
      "home.email.title": "تحليل البريد الإلكتروني",
      "home.email.desc": "اكتشاف محاولات التصيد والبريد الإلكتروني الضار",
      "home.url.title": "ماسح URL",
      "home.url.desc": "التحقق من أمان الموقع والتهديدات الأمنية",
      "home.deepfake.title": "تزييف عميق AI",
      "home.deepfake.desc": "التحقق من صحة الوسائط واكتشاف التلاعب بالذكاء الاصطناعي",
      "home.factcheck.title": "التحقق من الحقائق",
      "home.factcheck.desc": "التحقق من الأخبار والادعاءات مقابل مصادر موثوقة",
      "email.title": "تحليل البريد الإلكتروني التصيدي",
      "email.button": "تحليل البريد الإلكتروني",
      "general.back": "رجوع",
      "footer.text": "أمانك، أولويتنا",
      "settings.language": "اللغة",
      "settings.title": "الإعدادات",
      "settings.searchLanguage": "البحث عن لغات...",
      "settings.selectLanguage": "اختر اللغة",
    },
  
    pt: {
      "header.subtitle": "Detectar. Proteger. Seguro.",
      "home.email.title": "Análise de E-mail",
      "home.email.desc": "Detectar tentativas de phishing e e-mails maliciosos",
      "home.url.title": "Scanner de URL",
      "home.url.desc": "Verificar segurança do site e ameaças",
      "home.deepfake.title": "Deepfake IA",
      "home.deepfake.desc": "Verificar autenticidade de mídia e detectar manipulação IA",
      "home.factcheck.title": "Verificador de Fatos",
      "home.factcheck.desc": "Verificar notícias e afirmações contra fontes confiáveis",
      "email.title": "Análise de E-mail de Phishing",
      "email.button": "Analisar E-mail",
      "general.back": "Voltar",
      "footer.text": "Sua Segurança, Nossa Prioridade",
      "settings.language": "Idioma",
      "settings.title": "Configurações",
      "settings.searchLanguage": "Buscar idiomas...",
      "settings.selectLanguage": "Selecionar Idioma",
    },
  
    ru: {
      "header.subtitle": "Обнаружить. Защитить. Обезопасить.",
      "home.email.title": "Анализ Электронной Почты",
      "home.email.desc": "Обнаружение фишинговых атак и вредоносных писем",
      "home.url.title": "Сканер URL",
      "home.url.desc": "Проверка безопасности сайта и угроз",
      "home.deepfake.title": "Дипфейк ИИ",
      "home.deepfake.desc": "Проверка подлинности медиа и обнаружение манипуляций ИИ",
      "home.factcheck.title": "Проверка Фактов",
      "home.factcheck.desc": "Проверка новостей и утверждений по надёжным источникам",
      "email.title": "Анализ Фишинговых Писем",
      "email.button": "Анализировать Письмо",
      "general.back": "Назад",
      "footer.text": "Ваша Безопасность — Наш Приоритет",
      "settings.language": "Язык",
      "settings.title": "Настройки",
      "settings.searchLanguage": "Поиск языков...",
      "settings.selectLanguage": "Выберите Язык",
    },
  
    tr: {
      "header.subtitle": "Tespit Et. Koru. Güvenceye Al.",
      "home.email.title": "E-posta Analizi",
      "home.email.desc": "Oltalama girişimlerini ve kötü amaçlı e-postaları tespit edin",
      "home.url.title": "URL Tarayıcı",
      "home.url.desc": "Web sitesi güvenliğini ve güvenlik tehditlerini kontrol edin",
      "home.deepfake.title": "Deepfake AI",
      "home.deepfake.desc": "Medya özgünlüğünü doğrulayın ve AI manipülasyonunu tespit edin",
      "home.factcheck.title": "Doğruluk Kontrolü",
      "home.factcheck.desc": "Haberleri ve iddiaları güvenilir kaynaklara göre doğrulayın",
      "email.title": "Oltalama E-posta Analizi",
      "email.button": "E-postayı Analiz Et",
      "general.back": "Geri",
      "footer.text": "Güvenliğiniz, Önceliğimiz",
      "settings.language": "Dil",
      "settings.title": "Ayarlar",
      "settings.searchLanguage": "Dil ara...",
      "settings.selectLanguage": "Dil Seçin",
    },
  }
  
  // ============================================
  // TRANSLATION FUNCTION
  // ============================================
  export const translate = (key: string, language: string): string => {
    // Get base language code (e.g., "en-US" -> "en")
    const baseLang = language.split("-")[0].toLowerCase()
  
    // Check built-in translations first
    const langTranslations = BUILT_IN_TRANSLATIONS[baseLang]
    if (langTranslations && langTranslations[key]) {
      return langTranslations[key]!
    }
  
    // Fallback to English (which uses UI_KEYS values directly)
    return UI_KEYS[key as keyof typeof UI_KEYS] || key
  }
  
  // ============================================
  // DETECT BROWSER LANGUAGE
  // ============================================
  export const detectBrowserLanguage = (): string => {
    // Use navigator.language (browser built-in)
    if (typeof navigator !== "undefined") {
      return navigator.language || navigator.languages?.[0] || "en"
    }
    return "en"
  }
  
  // ============================================
  // PERSISTENCE: Save/Load language preference
  // ============================================
  export const saveLanguagePreference = (langCode: string): void => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ trustshieldLanguage: langCode })
      } else {
        localStorage.setItem("trustshieldLanguage", langCode)
      }
    } catch {
      // Silently fail
    }
  }
  
  export const loadLanguagePreference = (): Promise<string> => {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.get(["trustshieldLanguage"], (result) => {
            resolve(result.trustshieldLanguage || detectBrowserLanguage())
          })
        } else {
          const saved = localStorage.getItem("trustshieldLanguage")
          resolve(saved || detectBrowserLanguage())
        }
      } catch {
        resolve(detectBrowserLanguage())
      }
    })
  }
  
  // ============================================
  // CHECK IF LANGUAGE IS RTL
  // ============================================
  export const isRTL = (langCode: string): boolean => {
    const rtlLanguages = ["ar", "he", "fa", "ur", "ps", "sd", "ug", "ku"]
    return rtlLanguages.includes(langCode.split("-")[0].toLowerCase())
  }