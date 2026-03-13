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
// TRANSLATION SYSTEM
// ============================================
const UI_KEYS = {
  "header.subtitle": "Detect. Protect. Secure.",
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
  "home.viewResults": "View",

  "email.title": "Phishing Email Analysis",
  "email.label": "Paste email content to analyze",
  "email.placeholder": "Paste the suspicious email content here including subject, sender, and body...",
  "email.button": "Analyze Email",
  "email.loading": "Analyzing email...",

  "url.title": "URL Scanner",

  "deepfake.title": "Deepfake AI Detection",
  "deepfake.text": "Text",
  "deepfake.image": "Image",
  "deepfake.video": "Video",
  "deepfake.audio": "Audio",
  "deepfake.textLabel": "Enter text to analyze",
  "deepfake.textPlaceholder": "Paste text to check for AI-generated content...",
  "deepfake.analyzeText": "Analyze Text",
  "deepfake.analyze": "Analyze",
  "deepfake.uploadImage": "Upload Image",
  "deepfake.uploadVideo": "Upload Video",
  "deepfake.uploadAudio": "Upload Audio",
  "deepfake.clickToSelect": "Click to select file",
  "deepfake.formatsImage": "PNG, JPG, GIF, WebP",
  "deepfake.formatsVideo": "MP4, WebM, MOV",
  "deepfake.formatsAudio": "MP3, WAV, OGG",
  "deepfake.analyzing": "Analyzing",

  "factcheck.title": "Fact Checker",
  "factcheck.label": "Enter claim or news to verify",
  "factcheck.placeholder": "Paste news headline, claim, or statement you want to fact-check...",
  "factcheck.button": "Check Facts",
  "factcheck.loading": "Checking facts...",

  "scan.title": "Scan Results",
  "scan.noRecent": "No Recent Scans",
  "scan.noRecentDesc": "Select text or hover over an image on any webpage to scan it with TrustShield",
  "scan.analysis": "Analysis",
  "scan.scannedContent": "Scanned Content",
  "scan.clearResults": "Clear Results",
  "scan.analyzing": "Analyzing",

  "result.risk": "Risk",
  "result.unknown": "Unknown",
  "result.verdict": "Verdict",
  "result.threats": "Detected Threats",
  "result.analysis": "Analysis",
  "result.contentType": "Content Type",
  "result.tryAgain": "Try Again",

  "general.back": "Back",
  "general.analyzing": "Analyzing...",
  "general.serverWaking": "Server is waking up, this may take 15-30 seconds...",
  "general.serverStarting": "Server is starting up...",
  "general.serverUnavailable": "Server may be unavailable. Requests will be retried automatically.",
  "general.results": "results",

  "footer.text": "Your Security, Our Priority",
  "settings.language": "Language",
  "settings.title": "Select Language",
  "settings.searchLanguage": "Search languages...",
  "settings.poweredBy": "Powered by browser translation",
} as const

type UIKey = keyof typeof UI_KEYS

const TRANSLATIONS: Record<string, Partial<Record<UIKey, string>>> = {
  es: {
    "header.subtitle": "Detectar. Proteger. Asegurar.",
    "home.email.title": "Análisis de Correo",
    "home.email.desc": "Detectar intentos de phishing y correos maliciosos",
    "home.url.title": "Escáner de URL",
    "home.url.desc": "Verificar seguridad del sitio web y amenazas",
    "home.deepfake.title": "IA Deepfake",
    "home.deepfake.desc": "Verificar autenticidad de medios y manipulación IA",
    "home.factcheck.title": "Verificador de Hechos",
    "home.factcheck.desc": "Verificar noticias contra fuentes confiables",
    "home.recentScan": "Escaneo Reciente",
    "home.scanning": "Escaneando...",
    "home.newScanResult": "Nuevo Resultado",
    "home.viewResults": "Ver",
    "email.title": "Análisis de Correo Phishing",
    "email.label": "Pega el contenido del correo para analizar",
    "email.placeholder": "Pega el contenido sospechoso del correo aquí...",
    "email.button": "Analizar Correo",
    "email.loading": "Analizando correo...",
    "deepfake.title": "Detección de Deepfake IA",
    "deepfake.text": "Texto",
    "deepfake.image": "Imagen",
    "deepfake.video": "Video",
    "deepfake.audio": "Audio",
    "deepfake.textLabel": "Ingresa texto para analizar",
    "deepfake.textPlaceholder": "Pega texto para verificar contenido generado por IA...",
    "deepfake.analyzeText": "Analizar Texto",
    "deepfake.analyze": "Analizar",
    "deepfake.uploadImage": "Subir Imagen",
    "deepfake.uploadVideo": "Subir Video",
    "deepfake.uploadAudio": "Subir Audio",
    "deepfake.clickToSelect": "Haz clic para seleccionar",
    "deepfake.analyzing": "Analizando",
    "factcheck.title": "Verificador de Hechos",
    "factcheck.label": "Ingresa afirmación o noticia",
    "factcheck.placeholder": "Pega titular o declaración que deseas verificar...",
    "factcheck.button": "Verificar Hechos",
    "factcheck.loading": "Verificando hechos...",
    "scan.title": "Resultados del Escaneo",
    "scan.noRecent": "Sin Escaneos Recientes",
    "scan.noRecentDesc": "Selecciona texto o pasa el cursor sobre una imagen para escanear",
    "scan.analysis": "Análisis",
    "scan.scannedContent": "Contenido Escaneado",
    "scan.clearResults": "Limpiar Resultados",
    "scan.analyzing": "Analizando",
    "result.risk": "Riesgo",
    "result.unknown": "Desconocido",
    "result.verdict": "Veredicto",
    "result.threats": "Amenazas Detectadas",
    "result.analysis": "Análisis",
    "result.contentType": "Tipo de Contenido",
    "result.tryAgain": "Intentar de Nuevo",
    "general.back": "Atrás",
    "general.analyzing": "Analizando...",
    "general.serverWaking": "El servidor se está iniciando, 15-30 segundos...",
    "general.serverStarting": "El servidor se está iniciando...",
    "general.serverUnavailable": "Servidor no disponible. Se reintentará automáticamente.",
    "general.results": "resultados",
    "footer.text": "Tu Seguridad, Nuestra Prioridad",
    "settings.searchLanguage": "Buscar idiomas...",
    "settings.poweredBy": "Traducción del navegador",
  },
  fr: {
    "header.subtitle": "Détecter. Protéger. Sécuriser.",
    "home.email.title": "Analyse d'Email",
    "home.email.desc": "Détecter les tentatives de phishing",
    "home.url.title": "Scanner d'URL",
    "home.url.desc": "Vérifier la sécurité du site web",
    "home.deepfake.title": "Détection Deepfake IA",
    "home.deepfake.desc": "Vérifier l'authenticité des médias",
    "home.factcheck.title": "Vérificateur de Faits",
    "home.factcheck.desc": "Vérifier les nouvelles et affirmations",
    "home.recentScan": "Analyse Récente",
    "home.scanning": "Analyse en cours...",
    "home.newScanResult": "Nouveau Résultat",
    "home.viewResults": "Voir",
    "email.title": "Analyse d'Email Phishing",
    "email.label": "Collez le contenu de l'email",
    "email.placeholder": "Collez le contenu suspect ici...",
    "email.button": "Analyser l'Email",
    "email.loading": "Analyse de l'email...",
    "deepfake.title": "Détection Deepfake IA",
    "deepfake.text": "Texte",
    "deepfake.image": "Image",
    "deepfake.video": "Vidéo",
    "deepfake.audio": "Audio",
    "deepfake.textLabel": "Entrez le texte à analyser",
    "deepfake.textPlaceholder": "Collez le texte pour vérifier le contenu IA...",
    "deepfake.analyzeText": "Analyser le Texte",
    "deepfake.analyze": "Analyser",
    "deepfake.uploadImage": "Télécharger Image",
    "deepfake.uploadVideo": "Télécharger Vidéo",
    "deepfake.uploadAudio": "Télécharger Audio",
    "deepfake.clickToSelect": "Cliquez pour sélectionner",
    "deepfake.analyzing": "Analyse",
    "factcheck.title": "Vérificateur de Faits",
    "factcheck.label": "Entrez une affirmation à vérifier",
    "factcheck.placeholder": "Collez un titre ou une déclaration...",
    "factcheck.button": "Vérifier les Faits",
    "factcheck.loading": "Vérification des faits...",
    "scan.title": "Résultats de l'Analyse",
    "scan.noRecent": "Aucune Analyse Récente",
    "scan.noRecentDesc": "Sélectionnez du texte ou survolez une image pour scanner",
    "scan.analysis": "Analyse",
    "scan.scannedContent": "Contenu Analysé",
    "scan.clearResults": "Effacer les Résultats",
    "scan.analyzing": "Analyse",
    "result.risk": "Risque",
    "result.unknown": "Inconnu",
    "result.verdict": "Verdict",
    "result.threats": "Menaces Détectées",
    "result.analysis": "Analyse",
    "result.contentType": "Type de Contenu",
    "result.tryAgain": "Réessayer",
    "general.back": "Retour",
    "general.analyzing": "Analyse en cours...",
    "general.serverWaking": "Le serveur démarre, 15-30 secondes...",
    "general.serverStarting": "Le serveur démarre...",
    "general.serverUnavailable": "Serveur indisponible. Réessai automatique.",
    "general.results": "résultats",
    "footer.text": "Votre Sécurité, Notre Priorité",
    "settings.searchLanguage": "Rechercher des langues...",
    "settings.poweredBy": "Traduction du navigateur",
  },
  de: {
    "header.subtitle": "Erkennen. Schützen. Sichern.",
    "home.email.title": "E-Mail-Analyse",
    "home.email.desc": "Phishing-Versuche erkennen",
    "home.url.title": "URL-Scanner",
    "home.url.desc": "Website-Sicherheit überprüfen",
    "home.deepfake.title": "Deepfake KI",
    "home.deepfake.desc": "Medienauthentizität überprüfen",
    "home.factcheck.title": "Faktenprüfer",
    "home.factcheck.desc": "Nachrichten und Behauptungen überprüfen",
    "home.recentScan": "Letzter Scan",
    "home.scanning": "Scanne...",
    "home.newScanResult": "Neues Ergebnis",
    "home.viewResults": "Ansehen",
    "email.title": "Phishing-E-Mail-Analyse",
    "email.label": "E-Mail-Inhalt einfügen",
    "email.placeholder": "Verdächtigen E-Mail-Inhalt hier einfügen...",
    "email.button": "E-Mail Analysieren",
    "email.loading": "E-Mail wird analysiert...",
    "deepfake.title": "Deepfake KI-Erkennung",
    "deepfake.text": "Text",
    "deepfake.image": "Bild",
    "deepfake.video": "Video",
    "deepfake.audio": "Audio",
    "deepfake.textLabel": "Text eingeben",
    "deepfake.textPlaceholder": "Text einfügen um KI-Inhalte zu prüfen...",
    "deepfake.analyzeText": "Text Analysieren",
    "deepfake.analyze": "Analysieren",
    "deepfake.uploadImage": "Bild Hochladen",
    "deepfake.uploadVideo": "Video Hochladen",
    "deepfake.uploadAudio": "Audio Hochladen",
    "deepfake.clickToSelect": "Klicken zum Auswählen",
    "deepfake.analyzing": "Analyse",
    "factcheck.title": "Faktenprüfer",
    "factcheck.label": "Behauptung oder Nachricht eingeben",
    "factcheck.placeholder": "Schlagzeile oder Behauptung einfügen...",
    "factcheck.button": "Fakten Überprüfen",
    "factcheck.loading": "Fakten werden überprüft...",
    "scan.title": "Scan-Ergebnisse",
    "scan.noRecent": "Keine Scans",
    "scan.noRecentDesc": "Text auswählen oder über ein Bild fahren zum Scannen",
    "scan.analysis": "Analyse",
    "scan.scannedContent": "Gescannter Inhalt",
    "scan.clearResults": "Ergebnisse Löschen",
    "scan.analyzing": "Analyse",
    "result.risk": "Risiko",
    "result.unknown": "Unbekannt",
    "result.verdict": "Urteil",
    "result.threats": "Erkannte Bedrohungen",
    "result.analysis": "Analyse",
    "result.contentType": "Inhaltstyp",
    "result.tryAgain": "Erneut Versuchen",
    "general.back": "Zurück",
    "general.analyzing": "Wird analysiert...",
    "general.serverWaking": "Server startet, 15-30 Sekunden...",
    "general.serverStarting": "Server startet...",
    "general.serverUnavailable": "Server nicht verfügbar. Automatischer Neuversuch.",
    "general.results": "Ergebnisse",
    "footer.text": "Ihre Sicherheit, Unsere Priorität",
    "settings.searchLanguage": "Sprachen suchen...",
    "settings.poweredBy": "Browser-Übersetzung",
  },
  hi: {
    "header.subtitle": "पहचानें। सुरक्षित करें। बचाएं।",
    "home.email.title": "ईमेल विश्लेषण",
    "home.email.desc": "फ़िशिंग प्रयासों का पता लगाएं",
    "home.url.title": "URL स्कैनर",
    "home.url.desc": "वेबसाइट सुरक्षा जाँचें",
    "home.deepfake.title": "डीपफेक AI",
    "home.deepfake.desc": "मीडिया प्रामाणिकता सत्यापित करें",
    "home.factcheck.title": "तथ्य जाँचकर्ता",
    "home.factcheck.desc": "समाचार और दावों को सत्यापित करें",
    "home.recentScan": "हाल का स्कैन",
    "home.scanning": "स्कैन हो रहा है...",
    "home.newScanResult": "नया परिणाम",
    "home.viewResults": "देखें",
    "email.title": "फ़िशिंग ईमेल विश्लेषण",
    "email.label": "ईमेल सामग्री पेस्ट करें",
    "email.placeholder": "संदिग्ध ईमेल सामग्री यहाँ पेस्ट करें...",
    "email.button": "ईमेल का विश्लेषण करें",
    "email.loading": "ईमेल का विश्लेषण हो रहा है...",
    "deepfake.title": "डीपफेक AI पहचान",
    "deepfake.text": "पाठ",
    "deepfake.image": "चित्र",
    "deepfake.video": "वीडियो",
    "deepfake.audio": "ऑडियो",
    "deepfake.textLabel": "विश्लेषण के लिए पाठ दर्ज करें",
    "deepfake.textPlaceholder": "AI-जनित सामग्री की जाँच के लिए पाठ पेस्ट करें...",
    "deepfake.analyzeText": "पाठ का विश्लेषण करें",
    "deepfake.analyze": "विश्लेषण",
    "deepfake.uploadImage": "चित्र अपलोड करें",
    "deepfake.uploadVideo": "वीडियो अपलोड करें",
    "deepfake.uploadAudio": "ऑडियो अपलोड करें",
    "deepfake.clickToSelect": "चुनने के लिए क्लिक करें",
    "deepfake.analyzing": "विश्लेषण",
    "factcheck.title": "तथ्य जाँचकर्ता",
    "factcheck.label": "सत्यापित करने के लिए दावा दर्ज करें",
    "factcheck.placeholder": "समाचार शीर्षक या दावा पेस्ट करें...",
    "factcheck.button": "तथ्य जाँचें",
    "factcheck.loading": "तथ्य जाँचे जा रहे हैं...",
    "scan.title": "स्कैन परिणाम",
    "scan.noRecent": "कोई हालिया स्कैन नहीं",
    "scan.noRecentDesc": "स्कैन करने के लिए किसी वेबपेज पर पाठ चुनें या छवि पर होवर करें",
    "scan.analysis": "विश्लेषण",
    "scan.scannedContent": "स्कैन की गई सामग्री",
    "scan.clearResults": "परिणाम साफ़ करें",
    "scan.analyzing": "विश्लेषण",
    "result.risk": "जोखिम",
    "result.unknown": "अज्ञात",
    "result.verdict": "निर्णय",
    "result.threats": "खतरे पाए गए",
    "result.analysis": "विश्लेषण",
    "result.contentType": "सामग्री प्रकार",
    "result.tryAgain": "पुनः प्रयास करें",
    "general.back": "वापस",
    "general.analyzing": "विश्लेषण हो रहा है...",
    "general.serverWaking": "सर्वर शुरू हो रहा है, 15-30 सेकंड...",
    "general.serverStarting": "सर्वर शुरू हो रहा है...",
    "general.serverUnavailable": "सर्वर अनुपलब्ध। स्वचालित पुनः प्रयास।",
    "general.results": "परिणाम",
    "footer.text": "आपकी सुरक्षा, हमारी प्राथमिकता",
    "settings.searchLanguage": "भाषाएँ खोजें...",
    "settings.poweredBy": "ब्राउज़र अनुवाद द्वारा",
  },
  zh: {
    "header.subtitle": "检测。保护。安全。",
    "home.email.title": "邮件分析",
    "home.email.desc": "检测钓鱼攻击和恶意邮件",
    "home.url.title": "URL扫描器",
    "home.url.desc": "检查网站安全性和威胁",
    "home.deepfake.title": "深度伪造AI",
    "home.deepfake.desc": "验证媒体真实性",
    "home.factcheck.title": "事实核查",
    "home.factcheck.desc": "验证新闻和声明",
    "home.recentScan": "最近扫描",
    "home.scanning": "扫描中...",
    "home.newScanResult": "新结果",
    "home.viewResults": "查看",
    "email.title": "钓鱼邮件分析",
    "email.label": "粘贴邮件内容",
    "email.placeholder": "在此粘贴可疑邮件内容...",
    "email.button": "分析邮件",
    "email.loading": "分析邮件中...",
    "deepfake.title": "深度伪造AI检测",
    "deepfake.text": "文本",
    "deepfake.image": "图片",
    "deepfake.video": "视频",
    "deepfake.audio": "音频",
    "deepfake.textLabel": "输入要分析的文本",
    "deepfake.textPlaceholder": "粘贴文本以检查AI生成的内容...",
    "deepfake.analyzeText": "分析文本",
    "deepfake.analyze": "分析",
    "deepfake.uploadImage": "上传图片",
    "deepfake.uploadVideo": "上传视频",
    "deepfake.uploadAudio": "上传音频",
    "deepfake.clickToSelect": "点击选择文件",
    "deepfake.analyzing": "分析中",
    "factcheck.title": "事实核查器",
    "factcheck.label": "输入要验证的声明",
    "factcheck.placeholder": "粘贴新闻标题或声明...",
    "factcheck.button": "核查事实",
    "factcheck.loading": "核查事实中...",
    "scan.title": "扫描结果",
    "scan.noRecent": "没有最近的扫描",
    "scan.noRecentDesc": "选择文本或将鼠标悬停在图像上进行扫描",
    "scan.analysis": "分析",
    "scan.scannedContent": "扫描内容",
    "scan.clearResults": "清除结果",
    "scan.analyzing": "分析中",
    "result.risk": "风险",
    "result.unknown": "未知",
    "result.verdict": "结论",
    "result.threats": "检测到的威胁",
    "result.analysis": "分析",
    "result.contentType": "内容类型",
    "result.tryAgain": "重试",
    "general.back": "返回",
    "general.analyzing": "分析中...",
    "general.serverWaking": "服务器正在启动，15-30秒...",
    "general.serverStarting": "服务器正在启动...",
    "general.serverUnavailable": "服务器不可用。将自动重试。",
    "general.results": "结果",
    "footer.text": "您的安全，我们的使命",
    "settings.searchLanguage": "搜索语言...",
    "settings.poweredBy": "浏览器翻译",
  },
  ja: {
    "header.subtitle": "検出。保護。安全。",
    "home.email.title": "メール分析",
    "home.email.desc": "フィッシング攻撃を検出",
    "home.url.title": "URLスキャナー",
    "home.url.desc": "ウェブサイトの安全性を確認",
    "home.deepfake.title": "ディープフェイクAI",
    "home.deepfake.desc": "メディアの真正性を検証",
    "home.factcheck.title": "ファクトチェッカー",
    "home.factcheck.desc": "ニュースと主張を検証",
    "home.recentScan": "最近のスキャン",
    "home.scanning": "スキャン中...",
    "home.newScanResult": "新しい結果",
    "home.viewResults": "表示",
    "email.title": "フィッシングメール分析",
    "email.label": "メール内容を貼り付け",
    "email.placeholder": "疑わしいメール内容をここに貼り付け...",
    "email.button": "メールを分析",
    "email.loading": "メールを分析中...",
    "deepfake.title": "ディープフェイクAI検出",
    "deepfake.text": "テキスト",
    "deepfake.image": "画像",
    "deepfake.video": "動画",
    "deepfake.audio": "音声",
    "deepfake.textLabel": "分析するテキストを入力",
    "deepfake.textPlaceholder": "AI生成コンテンツを確認するテキストを貼り付け...",
    "deepfake.analyzeText": "テキストを分析",
    "deepfake.analyze": "分析",
    "deepfake.uploadImage": "画像をアップロード",
    "deepfake.uploadVideo": "動画をアップロード",
    "deepfake.uploadAudio": "音声をアップロード",
    "deepfake.clickToSelect": "クリックして選択",
    "deepfake.analyzing": "分析中",
    "factcheck.title": "ファクトチェッカー",
    "factcheck.label": "検証する主張を入力",
    "factcheck.placeholder": "ニュースの見出しや主張を貼り付け...",
    "factcheck.button": "ファクトチェック",
    "factcheck.loading": "ファクトチェック中...",
    "scan.title": "スキャン結果",
    "scan.noRecent": "最近のスキャンなし",
    "scan.noRecentDesc": "テキストを選択するか画像にカーソルを合わせてスキャン",
    "scan.analysis": "分析",
    "scan.scannedContent": "スキャン内容",
    "scan.clearResults": "結果をクリア",
    "scan.analyzing": "分析中",
    "result.risk": "リスク",
    "result.unknown": "不明",
    "result.verdict": "判定",
    "result.threats": "検出された脅威",
    "result.analysis": "分析",
    "result.contentType": "コンテンツタイプ",
    "result.tryAgain": "再試行",
    "general.back": "戻る",
    "general.analyzing": "分析中...",
    "general.serverWaking": "サーバー起動中、15-30秒...",
    "general.serverStarting": "サーバー起動中...",
    "general.serverUnavailable": "サーバーが利用できません。自動再試行します。",
    "general.results": "結果",
    "footer.text": "あなたの安全が最優先です",
    "settings.searchLanguage": "言語を検索...",
    "settings.poweredBy": "ブラウザ翻訳",
  },
  ko: {
    "header.subtitle": "탐지. 보호. 보안.",
    "home.email.title": "이메일 분석",
    "home.email.desc": "피싱 시도 탐지",
    "home.url.title": "URL 스캐너",
    "home.url.desc": "웹사이트 안전성 확인",
    "home.deepfake.title": "딥페이크 AI",
    "home.deepfake.desc": "미디어 진위 확인",
    "home.factcheck.title": "팩트체커",
    "home.factcheck.desc": "뉴스와 주장 검증",
    "home.recentScan": "최근 스캔",
    "home.scanning": "스캔 중...",
    "home.newScanResult": "새 결과",
    "home.viewResults": "보기",
    "email.title": "피싱 이메일 분석",
    "email.label": "이메일 내용 붙여넣기",
    "email.placeholder": "의심스러운 이메일 내용을 여기에 붙여넣으세요...",
    "email.button": "이메일 분석",
    "email.loading": "이메일 분석 중...",
    "deepfake.title": "딥페이크 AI 탐지",
    "deepfake.text": "텍스트",
    "deepfake.image": "이미지",
    "deepfake.video": "동영상",
    "deepfake.audio": "오디오",
    "deepfake.textLabel": "분석할 텍스트 입력",
    "deepfake.textPlaceholder": "AI 생성 콘텐츠를 확인할 텍스트 붙여넣기...",
    "deepfake.analyzeText": "텍스트 분석",
    "deepfake.analyze": "분석",
    "deepfake.uploadImage": "이미지 업로드",
    "deepfake.uploadVideo": "동영상 업로드",
    "deepfake.uploadAudio": "오디오 업로드",
    "deepfake.clickToSelect": "클릭하여 선택",
    "deepfake.analyzing": "분석 중",
    "factcheck.title": "팩트체커",
    "factcheck.label": "검증할 주장 입력",
    "factcheck.placeholder": "뉴스 헤드라인이나 주장을 붙여넣으세요...",
    "factcheck.button": "팩트체크",
    "factcheck.loading": "팩트체크 중...",
    "scan.title": "스캔 결과",
    "scan.noRecent": "최근 스캔 없음",
    "scan.noRecentDesc": "텍스트를 선택하거나 이미지 위에 마우스를 올려 스캔",
    "scan.analysis": "분석",
    "scan.scannedContent": "스캔된 콘텐츠",
    "scan.clearResults": "결과 삭제",
    "scan.analyzing": "분석 중",
    "result.risk": "위험",
    "result.unknown": "알 수 없음",
    "result.verdict": "판정",
    "result.threats": "탐지된 위협",
    "result.analysis": "분석",
    "result.contentType": "콘텐츠 유형",
    "result.tryAgain": "다시 시도",
    "general.back": "뒤로",
    "general.analyzing": "분석 중...",
    "general.serverWaking": "서버 시작 중, 15-30초...",
    "general.serverStarting": "서버 시작 중...",
    "general.serverUnavailable": "서버 사용 불가. 자동 재시도합니다.",
    "general.results": "결과",
    "footer.text": "당신의 보안이 최우선입니다",
    "settings.searchLanguage": "언어 검색...",
    "settings.poweredBy": "브라우저 번역",
  },
  ar: {
    "header.subtitle": "اكتشف. احمِ. أمِّن.",
    "home.email.title": "تحليل البريد الإلكتروني",
    "home.email.desc": "اكتشاف محاولات التصيد",
    "home.url.title": "ماسح URL",
    "home.url.desc": "التحقق من أمان الموقع",
    "home.deepfake.title": "تزييف عميق AI",
    "home.deepfake.desc": "التحقق من صحة الوسائط",
    "home.factcheck.title": "التحقق من الحقائق",
    "home.factcheck.desc": "التحقق من الأخبار والادعاءات",
    "home.recentScan": "آخر فحص",
    "home.scanning": "جارٍ الفحص...",
    "home.newScanResult": "نتيجة جديدة",
    "home.viewResults": "عرض",
    "email.title": "تحليل البريد التصيدي",
    "email.label": "الصق محتوى البريد الإلكتروني",
    "email.placeholder": "الصق محتوى البريد المشبوه هنا...",
    "email.button": "تحليل البريد",
    "email.loading": "جارٍ تحليل البريد...",
    "deepfake.title": "كشف التزييف العميق",
    "deepfake.text": "نص",
    "deepfake.image": "صورة",
    "deepfake.video": "فيديو",
    "deepfake.audio": "صوت",
    "deepfake.textLabel": "أدخل النص للتحليل",
    "deepfake.textPlaceholder": "الصق النص للتحقق من المحتوى المُنشأ بالذكاء الاصطناعي...",
    "deepfake.analyzeText": "تحليل النص",
    "deepfake.analyze": "تحليل",
    "deepfake.uploadImage": "رفع صورة",
    "deepfake.uploadVideo": "رفع فيديو",
    "deepfake.uploadAudio": "رفع صوت",
    "deepfake.clickToSelect": "انقر للاختيار",
    "deepfake.analyzing": "جارٍ التحليل",
    "factcheck.title": "التحقق من الحقائق",
    "factcheck.label": "أدخل الادعاء للتحقق",
    "factcheck.placeholder": "الصق عنوان الخبر أو الادعاء...",
    "factcheck.button": "تحقق من الحقائق",
    "factcheck.loading": "جارٍ التحقق...",
    "scan.title": "نتائج الفحص",
    "scan.noRecent": "لا توجد عمليات فحص حديثة",
    "scan.noRecentDesc": "حدد نصاً أو مرر فوق صورة للفحص",
    "scan.analysis": "تحليل",
    "scan.scannedContent": "المحتوى الممسوح",
    "scan.clearResults": "مسح النتائج",
    "scan.analyzing": "جارٍ التحليل",
    "result.risk": "المخاطر",
    "result.unknown": "غير معروف",
    "result.verdict": "الحكم",
    "result.threats": "التهديدات المكتشفة",
    "result.analysis": "التحليل",
    "result.contentType": "نوع المحتوى",
    "result.tryAgain": "حاول مرة أخرى",
    "general.back": "رجوع",
    "general.analyzing": "جارٍ التحليل...",
    "general.serverWaking": "الخادم يبدأ، 15-30 ثانية...",
    "general.serverStarting": "الخادم يبدأ...",
    "general.serverUnavailable": "الخادم غير متوفر. إعادة المحاولة تلقائياً.",
    "general.results": "النتائج",
    "footer.text": "أمانك، أولويتنا",
    "settings.searchLanguage": "البحث عن لغات...",
    "settings.poweredBy": "ترجمة المتصفح",
  },
  ru: {
    "header.subtitle": "Обнаружить. Защитить. Обезопасить.",
    "home.email.title": "Анализ Почты",
    "home.email.desc": "Обнаружение фишинговых атак",
    "home.url.title": "Сканер URL",
    "home.url.desc": "Проверка безопасности сайта",
    "home.deepfake.title": "Дипфейк ИИ",
    "home.deepfake.desc": "Проверка подлинности медиа",
    "home.factcheck.title": "Проверка Фактов",
    "home.factcheck.desc": "Проверка новостей и утверждений",
    "home.recentScan": "Последнее Сканирование",
    "home.scanning": "Сканирование...",
    "home.newScanResult": "Новый Результат",
    "home.viewResults": "Смотреть",
    "email.title": "Анализ Фишинговых Писем",
    "email.label": "Вставьте содержимое письма",
    "email.placeholder": "Вставьте подозрительное письмо сюда...",
    "email.button": "Анализировать Письмо",
    "email.loading": "Анализ письма...",
    "deepfake.title": "Обнаружение Дипфейков",
    "deepfake.text": "Текст",
    "deepfake.image": "Изображение",
    "deepfake.video": "Видео",
    "deepfake.audio": "Аудио",
    "deepfake.textLabel": "Введите текст для анализа",
    "deepfake.textPlaceholder": "Вставьте текст для проверки на ИИ-контент...",
    "deepfake.analyzeText": "Анализировать Текст",
    "deepfake.analyze": "Анализировать",
    "deepfake.uploadImage": "Загрузить Изображение",
    "deepfake.uploadVideo": "Загрузить Видео",
    "deepfake.uploadAudio": "Загрузить Аудио",
    "deepfake.clickToSelect": "Нажмите для выбора",
    "deepfake.analyzing": "Анализ",
    "factcheck.title": "Проверка Фактов",
    "factcheck.label": "Введите утверждение для проверки",
    "factcheck.placeholder": "Вставьте заголовок или утверждение...",
    "factcheck.button": "Проверить Факты",
    "factcheck.loading": "Проверка фактов...",
    "scan.title": "Результаты Сканирования",
    "scan.noRecent": "Нет Сканирований",
    "scan.noRecentDesc": "Выделите текст или наведите на изображение для сканирования",
    "scan.analysis": "Анализ",
    "scan.scannedContent": "Сканированный Контент",
    "scan.clearResults": "Очистить Результаты",
    "scan.analyzing": "Анализ",
    "result.risk": "Риск",
    "result.unknown": "Неизвестно",
    "result.verdict": "Вердикт",
    "result.threats": "Обнаруженные Угрозы",
    "result.analysis": "Анализ",
    "result.contentType": "Тип Контента",
    "result.tryAgain": "Попробовать Снова",
    "general.back": "Назад",
    "general.analyzing": "Анализ...",
    "general.serverWaking": "Сервер запускается, 15-30 секунд...",
    "general.serverStarting": "Сервер запускается...",
    "general.serverUnavailable": "Сервер недоступен. Автоматический повтор.",
    "general.results": "результаты",
    "footer.text": "Ваша безопасность — наш приоритет",
    "settings.searchLanguage": "Поиск языков...",
    "settings.poweredBy": "Перевод браузера",
  },
  pt: {
    "header.subtitle": "Detectar. Proteger. Seguro.",
    "home.email.title": "Análise de Email",
    "home.email.desc": "Detectar tentativas de phishing",
    "home.url.title": "Scanner de URL",
    "home.url.desc": "Verificar segurança do site",
    "home.deepfake.title": "Deepfake IA",
    "home.deepfake.desc": "Verificar autenticidade de mídia",
    "home.factcheck.title": "Verificador de Fatos",
    "home.factcheck.desc": "Verificar notícias e afirmações",
    "home.recentScan": "Scan Recente",
    "home.scanning": "Escaneando...",
    "home.newScanResult": "Novo Resultado",
    "home.viewResults": "Ver",
    "email.title": "Análise de Email Phishing",
    "email.label": "Cole o conteúdo do email",
    "email.placeholder": "Cole o conteúdo suspeito do email aqui...",
    "email.button": "Analisar Email",
    "email.loading": "Analisando email...",
    "deepfake.title": "Detecção de Deepfake IA",
    "deepfake.text": "Texto",
    "deepfake.image": "Imagem",
    "deepfake.video": "Vídeo",
    "deepfake.audio": "Áudio",
    "deepfake.textLabel": "Digite o texto para analisar",
    "deepfake.textPlaceholder": "Cole o texto para verificar conteúdo gerado por IA...",
    "deepfake.analyzeText": "Analisar Texto",
    "deepfake.analyze": "Analisar",
    "deepfake.uploadImage": "Enviar Imagem",
    "deepfake.uploadVideo": "Enviar Vídeo",
    "deepfake.uploadAudio": "Enviar Áudio",
    "deepfake.clickToSelect": "Clique para selecionar",
    "deepfake.analyzing": "Analisando",
    "factcheck.title": "Verificador de Fatos",
    "factcheck.label": "Digite afirmação para verificar",
    "factcheck.placeholder": "Cole título ou afirmação...",
    "factcheck.button": "Verificar Fatos",
    "factcheck.loading": "Verificando fatos...",
    "scan.title": "Resultados do Scan",
    "scan.noRecent": "Sem Scans Recentes",
    "scan.noRecentDesc": "Selecione texto ou passe o mouse sobre uma imagem para escanear",
    "scan.clearResults": "Limpar Resultados",
    "result.risk": "Risco",
    "result.unknown": "Desconhecido",
    "result.verdict": "Veredicto",
    "result.threats": "Ameaças Detectadas",
    "result.tryAgain": "Tentar Novamente",
    "general.back": "Voltar",
    "general.analyzing": "Analisando...",
    "footer.text": "Sua Segurança, Nossa Prioridade",
    "settings.searchLanguage": "Buscar idiomas...",
    "settings.poweredBy": "Tradução do navegador",
  },
  tr: {
    "header.subtitle": "Tespit Et. Koru. Güvenceye Al.",
    "home.email.title": "E-posta Analizi",
    "home.email.desc": "Oltalama girişimlerini tespit edin",
    "home.url.title": "URL Tarayıcı",
    "home.url.desc": "Web sitesi güvenliğini kontrol edin",
    "home.deepfake.title": "Deepfake AI",
    "home.deepfake.desc": "Medya özgünlüğünü doğrulayın",
    "home.factcheck.title": "Doğruluk Kontrolü",
    "home.factcheck.desc": "Haberleri ve iddiaları doğrulayın",
    "home.recentScan": "Son Tarama",
    "home.scanning": "Taranıyor...",
    "home.newScanResult": "Yeni Sonuç",
    "home.viewResults": "Görüntüle",
    "email.title": "Oltalama E-posta Analizi",
    "email.label": "E-posta içeriğini yapıştırın",
    "email.placeholder": "Şüpheli e-posta içeriğini buraya yapıştırın...",
    "email.button": "E-postayı Analiz Et",
    "email.loading": "E-posta analiz ediliyor...",
    "deepfake.title": "Deepfake AI Tespiti",
    "deepfake.text": "Metin",
    "deepfake.image": "Görsel",
    "deepfake.video": "Video",
    "deepfake.audio": "Ses",
    "deepfake.textLabel": "Analiz için metin girin",
    "deepfake.textPlaceholder": "AI ile oluşturulan içeriği kontrol etmek için metin yapıştırın...",
    "deepfake.analyzeText": "Metni Analiz Et",
    "deepfake.analyze": "Analiz Et",
    "deepfake.uploadImage": "Görsel Yükle",
    "deepfake.uploadVideo": "Video Yükle",
    "deepfake.uploadAudio": "Ses Yükle",
    "deepfake.clickToSelect": "Seçmek için tıklayın",
    "deepfake.analyzing": "Analiz ediliyor",
    "factcheck.title": "Doğruluk Kontrolü",
    "factcheck.label": "Doğrulanacak iddiayı girin",
    "factcheck.placeholder": "Haber başlığı veya iddia yapıştırın...",
    "factcheck.button": "Doğrula",
    "factcheck.loading": "Doğrulanıyor...",
    "scan.title": "Tarama Sonuçları",
    "scan.noRecent": "Son Tarama Yok",
    "scan.noRecentDesc": "Metin seçin veya bir görselin üzerine gelerek tarayın",
    "scan.clearResults": "Sonuçları Temizle",
    "result.risk": "Risk",
    "result.unknown": "Bilinmiyor",
    "result.verdict": "Karar",
    "result.threats": "Tespit Edilen Tehditler",
    "result.tryAgain": "Tekrar Dene",
    "general.back": "Geri",
    "general.analyzing": "Analiz ediliyor...",
    "general.serverWaking": "Sunucu başlatılıyor, 15-30 saniye...",
    "footer.text": "Güvenliğiniz, Önceliğimizdir",
    "settings.searchLanguage": "Dil ara...",
    "settings.poweredBy": "Tarayıcı çevirisi",
  },
}

const getBrowserLanguage = (): string => {
  if (typeof navigator !== "undefined") {
    return (navigator.language || "en").split("-")[0]
  }
  return "en"
}

const isRTL = (lang: string): boolean => {
  return ["ar", "he", "fa", "ur"].includes(lang.split("-")[0])
}

// ============================================
// LANGUAGE SELECTOR COMPONENT
// ============================================
const LanguageSelector = ({
  currentLang,
  onChange,
  colors,
  tFn,
}: {
  currentLang: string
  onChange: (lang: string) => void
  colors: any
  tFn: (key: UIKey) => string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const languages = [
    { code: "en", name: "English", native: "English", flag: "" },
    { code: "es", name: "Spanish", native: "Español", flag: "" },
    { code: "fr", name: "French", native: "Français", flag: "" },
    { code: "de", name: "German", native: "Deutsch", flag: "" },
    { code: "hi", name: "Hindi", native: "हिन्दी", flag: "" },
    { code: "zh", name: "Chinese", native: "中文", flag: "" },
    { code: "ja", name: "Japanese", native: "日本語", flag: "" },
    { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
    { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
    { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
    { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
    { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  ]

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen])

  // Auto-focus search
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [isOpen])

  const filtered = languages.filter((l) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      l.name.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    )
  })

  const currentFlag =
    languages.find((l) => l.code === currentLang)?.flag || "🌐"

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={tFn("settings.language")}
        style={{
          background: colors.bgLight,
          border: `1px solid ${colors.border}`,
          borderRadius: "10px",
          padding: "8px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: colors.textSecondary,
          fontSize: "12px",
          fontWeight: "600",
          transition: "all 0.2s ease",
          fontFamily: "inherit",
        }}
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
      >
        <span style={{ fontSize: "14px" }}>⚙️</span>
        <span>
          {currentFlag} {currentLang.toUpperCase()}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "8px",
            width: "300px",
            maxHeight: "420px",
            background: colors.bgDark,
            border: `1px solid ${colors.border}`,
            borderRadius: "16px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${colors.primaryGlow}`,
            zIndex: 10000,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column" as const,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: colors.textPrimary,
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🌍</span>
              <span>{tFn("settings.title")}</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "10px",
                  color: colors.textMuted,
                  background: colors.bgLight,
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                {filtered.length}
              </span>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "13px",
                  color: colors.textMuted,
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                ref={searchRef}
                type="text"
                placeholder={tFn("settings.searchLanguage")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
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

          {/* Language List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto" as const,
              padding: "8px",
              maxHeight: "280px",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "30px 20px",
                  textAlign: "center",
                  color: colors.textMuted,
                  fontSize: "13px",
                }}
              >
                No languages found for "{search}"
              </div>
            ) : (
              filtered.map((lang) => {
                const isActive = lang.code === currentLang
                const rtl = isRTL(lang.code)

                return (
                  <div
                    key={lang.code}
                    onClick={() => {
                      onChange(lang.code)
                      setIsOpen(false)
                      setSearch("")
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      border: isActive
                        ? `1px solid ${colors.primary}`
                        : "1px solid transparent",
                      background: isActive
                        ? `${colors.primary}20`
                        : "transparent",
                      direction: rtl ? ("rtl" as const) : ("ltr" as const),
                      marginBottom: "2px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = colors.bgLight
                        e.currentTarget.style.borderColor = colors.border
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent"
                        e.currentTarget.style.borderColor = "transparent"
                      }
                    }}
                  >
                    <span
                      style={{
                        fontSize: "20px",
                        width: "28px",
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      {lang.flag}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: colors.textPrimary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {lang.native}
                      </div>
                      {lang.native !== lang.name && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: colors.textMuted,
                          }}
                        >
                          {lang.name}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        color: colors.textMuted,
                        background: colors.bgMedium,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        flexShrink: 0,
                      }}
                    >
                      {lang.code}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          color: colors.primary,
                          fontSize: "16px",
                          fontWeight: "700",
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: `1px solid ${colors.border}`,
              textAlign: "center" as const,
            }}
          >
            <span style={{ fontSize: "10px", color: colors.textMuted }}>
              {tFn("settings.poweredBy")}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE = "https://broskiiii-test.hf.space"
const API_KEY = "tsk_abc123secure456key789"

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
// SMART FETCH
// ============================================
const smartFetch = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 120000,
  retries: number = 2,
  useApiKey: boolean = false
): Promise<Response> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const headers: Record<string, string> = {}
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            headers[key] = value
          })
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            headers[key] = value
          })
        } else {
          Object.assign(headers, options.headers)
        }
      }
      if (useApiKey && API_KEY) {
        headers["Authorization"] = `Bearer ${API_KEY}`
        headers["X-API-Key"] = API_KEY
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.status === 503 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)))
        continue
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication failed. Please check your API key.")
      }
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(
          `Server error (${response.status}): ${errorText.substring(0, 200)}`
        )
      }
      return response
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === "AbortError") {
        if (attempt < retries) continue
        throw new Error(
          "Request timed out. The server may be starting up — please wait 30 seconds and try again."
        )
      }
      if (attempt < retries && err instanceof TypeError) {
        await new Promise((r) => setTimeout(r, 3000))
        continue
      }
      throw err
    }
  }
  throw new Error("All retry attempts failed. Please try again later.")
}

const wakeUpAPI = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(`${API_BASE}/health`, {
      method: "GET",
      signal: controller.signal,
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
  // STATE
  // ----------------------------------------
  const [currentLang, setCurrentLang] = useState<string>("en")
  const [currentView, setCurrentView] = useState<
    "home" | "email" | "url" | "deepfake" | "factcheck" | "scan"
  >("home")
  const [deepfakeTab, setDeepfakeTab] = useState<
    "text" | "image" | "video" | "audio"
  >("text")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [apiStatus, setApiStatus] = useState<
    "unknown" | "awake" | "waking" | "error"
  >("unknown")

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

  const isRtlLang = isRTL(currentLang)

  // Translation helper bound to current language
  const tl = (key: UIKey): string => {
    const baseLang = currentLang.split("-")[0]
    return TRANSLATIONS[baseLang]?.[key] || UI_KEYS[key] || key
  }

  // ============================================
  // EFFECTS
  // ============================================

  // Load saved language
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["trustshieldLanguage"], (res) => {
        if (res.trustshieldLanguage) setCurrentLang(res.trustshieldLanguage)
        else setCurrentLang(getBrowserLanguage())
      })
    } else {
      setCurrentLang(getBrowserLanguage())
    }
  }, [])

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang)
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ trustshieldLanguage: lang })
    }
  }

  // Wake up API
  useEffect(() => {
    const wake = async () => {
      setApiStatus("waking")
      const isAwake = await wakeUpAPI()
      setApiStatus(isAwake ? "awake" : "unknown")
      if (!isAwake) {
        setTimeout(async () => {
          const retryAwake = await wakeUpAPI()
          setApiStatus(retryAwake ? "awake" : "error")
        }, 5000)
      }
    }
    wake()
  }, [])

  // Floating scan listener
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(
        ["trustshieldScan", "trustshieldTimestamp"],
        (res) => {
          if (res.trustshieldScan) {
            setFloatingScan(res.trustshieldScan)
            const isRecent =
              Date.now() - (res.trustshieldTimestamp || 0) < 30000
            if (isRecent && res.trustshieldScan.result) {
              setHasNewScan(true)
            }
          }
        }
      )

      const listener = (changes: {
        [key: string]: chrome.storage.StorageChange
      }) => {
        if (changes.trustshieldScan?.newValue) {
          setFloatingScan(changes.trustshieldScan.newValue)
          setHasNewScan(true)
          if (
            changes.trustshieldScan.newValue.loading ||
            changes.trustshieldScan.newValue.result
          ) {
            setCurrentView("scan")
          }
        }
      }

      chrome.storage.local.onChanged.addListener(listener)
      return () => chrome.storage.local.onChanged.removeListener(listener)
    }
  }, [])

  // Transparent background
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

  // Get current tab URL
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
      direction: isRtlLang ? ("rtl" as const) : ("ltr" as const),
    },
    header: {
      background: colors.bgDark,
      padding: "20px 24px",
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative" as const,
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
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
      fontFamily: "inherit",
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
      fontFamily: "inherit",
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
  // API FUNCTIONS
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
      const response = await smartFetch(
        API_ENDPOINTS.emailAnalysis,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_content: emailInput }),
        },
        120000,
        2,
        true
      )
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({
        error:
          error instanceof Error ? error.message : "Failed to analyze email.",
      })
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
      const response = await smartFetch(
        API_ENDPOINTS.urlScan,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToScan }),
        },
        120000,
        2,
        true
      )
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({
        error:
          error instanceof Error ? error.message : "Failed to scan URL.",
      })
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
      const response = await smartFetch(
        API_ENDPOINTS.textAnalysis,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput }),
        },
        120000,
        2,
        true
      )
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({
        error:
          error instanceof Error ? error.message : "Failed to analyze text.",
      })
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
      const endpoint =
        API_ENDPOINTS[`${type}Analysis` as keyof typeof API_ENDPOINTS]
      const response = await smartFetch(
        endpoint,
        { method: "POST", body: formData },
        120000,
        2,
        true
      )
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({
        error:
          error instanceof Error
            ? error.message
            : `Failed to analyze ${type}.`,
      })
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
      let response: Response
      try {
        response = await smartFetch(
          API_ENDPOINTS.factCheck,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim: newsInput }),
          },
          120000,
          1,
          true
        )
      } catch {
        response = await smartFetch(
          API_ENDPOINTS.textAnalysis,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `Fact check this claim: ${newsInput}`,
            }),
          },
          120000,
          2,
          true
        )
      }
      const data = await response.json()
      setResult(data)
      setApiStatus("awake")
    } catch (error) {
      setResult({
        error:
          error instanceof Error ? error.message : "Failed to check facts.",
      })
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
      case "image":
        return "image/*"
      case "video":
        return "video/*"
      case "audio":
        return "audio/*"
      default:
        return "*/*"
    }
  }

  const getModeIcon = (mode: string) => {
    const icons: Record<string, string> = {
      text: "📝",
      image: "🖼️",
      audio: "🎵",
      video: "🎬",
      url: "🔗",
      email: "📧",
      news: "📰",
    }
    return icons[mode] || "📄"
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null)
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
      chrome.storage.local.remove([
        "trustshieldScan",
        "trustshieldTimestamp",
        "trustshieldPending",
      ])
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
  // RENDER: RESULT
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
              ↻ {tl("result.tryAgain")}
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
            {resultData.risk_level || tl("result.unknown")} {tl("result.risk")}
          </div>
        </div>

        {resultData.verdict && (
          <div
            style={{
              ...styles.resultSection,
              borderLeft: `3px solid ${colors.primary}`,
            }}
          >
            <h4 style={styles.resultSectionTitle}>{tl("result.verdict")}</h4>
            <p style={styles.explanationText}>{resultData.verdict}</p>
          </div>
        )}

        {resultData.threat_types && resultData.threat_types.length > 0 && (
          <div style={styles.resultSection}>
            <h4 style={styles.resultSectionTitle}>{tl("result.threats")}</h4>
            <div>
              {resultData.threat_types.map((threat: string, index: number) => (
                <span key={index} style={styles.threatBadge}>
                  {threat}
                </span>
              ))}
            </div>
          </div>
        )}

        {(resultData.simplified_explanation || resultData.explanation) && (
          <div style={styles.resultSection}>
            <h4 style={styles.resultSectionTitle}>{tl("result.analysis")}</h4>
            <p style={styles.explanationText}>
              {resultData.simplified_explanation || resultData.explanation}
            </p>
          </div>
        )}

        {resultData.content_type && (
          <div style={styles.resultSection}>
            <h4 style={styles.resultSectionTitle}>
              {tl("result.contentType")}
            </h4>
            <p style={styles.explanationText}>{resultData.content_type}</p>
          </div>
        )}
      </div>
    )
  }

  // ============================================
  // RENDER: LOADING
  // ============================================
  const renderLoading = (text: string = tl("general.analyzing")) => (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>{text}</p>
      {apiStatus === "waking" && (
        <p style={styles.loadingSubtext}>⏳ {tl("general.serverWaking")}</p>
      )}
    </div>
  )

  // ============================================
  // RENDER: API STATUS
  // ============================================
  const renderApiStatus = () => {
    if (apiStatus === "awake" || apiStatus === "unknown") return null

    const statusConfig = {
      waking: {
        bg: `${colors.warning}15`,
        border: `${colors.warning}40`,
        color: colors.warning,
        text: `⏳ ${tl("general.serverStarting")}`,
      },
      error: {
        bg: `${colors.danger}15`,
        border: `${colors.danger}40`,
        color: colors.danger,
        text: `⚠️ ${tl("general.serverUnavailable")}`,
      },
    }

    const config = statusConfig[apiStatus as "waking" | "error"]
    if (!config) return null

    return (
      <div
        style={{
          ...styles.apiStatusBanner,
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
        }}
      >
        {config.text}
      </div>
    )
  }

  // ============================================
  // RENDER: SCAN VIEW
  // ============================================
  const renderScanView = () => {
    if (!floatingScan) {
      return (
        <div style={styles.content}>
          <div style={styles.sectionTitle}>
            <div style={styles.sectionIconBox}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            {tl("scan.title")}
          </div>
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.textMuted}
                strokeWidth="1.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div style={styles.emptyStateTitle}>{tl("scan.noRecent")}</div>
            <div style={styles.emptyStateDesc}>{tl("scan.noRecentDesc")}</div>
          </div>
        </div>
      )
    }

    return (
      <div style={styles.content}>
        <div style={styles.sectionTitle}>
          <div style={styles.sectionIconBox}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          {tl("scan.title")}
        </div>

        <div style={styles.scanModeIndicator}>
          <span>{getModeIcon(floatingScan.mode)}</span>
          <span style={styles.scanModeBadge}>{floatingScan.mode}</span>
          <span>{tl("scan.analysis")}</span>
        </div>

        {floatingScan.loading &&
          renderLoading(`${tl("scan.analyzing")} ${floatingScan.mode}...`)}

        {!floatingScan.loading && floatingScan.result && (
          <>
            {renderResult(floatingScan.result)}

            <div style={styles.scannedContentBox}>
              <div style={styles.scannedContentLabel}>
                {tl("scan.scannedContent")}
              </div>
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgCard
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgLight
              }}
            >
              {tl("scan.clearResults")}
            </button>
          </>
        )}
      </div>
    )
  }

  // ============================================
  // RENDER: HOME VIEW
  // ============================================
  const renderHomeView = () => (
    <div style={styles.content}>
      {renderApiStatus()}

      {hasNewScan && floatingScan && (
        <div
          style={styles.scanAlertBanner}
          onClick={() => {
            setCurrentView("scan")
            setHasNewScan(false)
          }}
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
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={styles.scanAlertContent}>
            <div style={styles.scanAlertTitle}>
              {floatingScan.loading
                ? tl("home.scanning")
                : tl("home.newScanResult")}
            </div>
            <div style={styles.scanAlertSubtitle}>
              {floatingScan.mode.charAt(0).toUpperCase() +
                floatingScan.mode.slice(1)}{" "}
              {tl("scan.analysis").toLowerCase()}
              {floatingScan.result?.risk_level
                ? ` - ${floatingScan.result.risk_level} ${tl("result.risk").toLowerCase()}`
                : ""}
            </div>
          </div>
          <div style={styles.scanAlertArrow}>{isRtlLang ? "←" : "→"}</div>
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
            <div
              style={{
                ...styles.featureIcon,
                width: "40px",
                height: "40px",
                marginBottom: 0,
                background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
                boxShadow: `0 0 15px ${colors.buttonGlow}`,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.featureTitle, marginBottom: "2px" }}>
                {tl("home.recentScan")}
              </div>
              <div style={styles.featureDesc}>
                {floatingScan.mode} •{" "}
                {floatingScan.result?.risk_level || tl("home.viewResults")}{" "}
                {tl("general.results")}
              </div>
            </div>
            <div style={{ color: colors.textMuted, fontSize: "18px" }}>
              {isRtlLang ? "←" : "→"}
            </div>
          </div>
        )}

        {[
          {
            key: "email",
            icon: fishing,
            titleKey: "home.email.title" as UIKey,
            descKey: "home.email.desc" as UIKey,
          },
          {
            key: "url",
            icon: urlscan,
            titleKey: "home.url.title" as UIKey,
            descKey: "home.url.desc" as UIKey,
          },
          {
            key: "deepfake",
            icon: deepfakeai,
            titleKey: "home.deepfake.title" as UIKey,
            descKey: "home.deepfake.desc" as UIKey,
          },
          {
            key: "factcheck",
            icon: news,
            titleKey: "home.factcheck.title" as UIKey,
            descKey: "home.factcheck.desc" as UIKey,
          },
        ].map(({ key, icon, titleKey, descKey }) => (
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
            <div
              style={{
                ...styles.featureIcon,
                background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
                boxShadow: `0 0 20px ${colors.buttonGlow}`,
              }}
            >
              <img
                src={icon}
                alt={tl(titleKey)}
                style={{ width: "24px", height: "24px" }}
              />
            </div>
            <div style={styles.featureTitle}>{tl(titleKey)}</div>
            <div style={styles.featureDesc}>{tl(descKey)}</div>
          </div>
        ))}
      </div>
    </div>
  )

  // ============================================
  // RENDER: EMAIL VIEW
  // ============================================
  const renderEmailView = () => (
    <div style={styles.content}>
      {renderApiStatus()}
      <div style={styles.sectionTitle}>
        <div style={styles.sectionIconBox}>
          <img src={fishing} alt="Email" style={styles.sectionIconImage} />
        </div>
        {tl("email.title")}
      </div>

      {isLoading ? (
        renderLoading(tl("email.loading"))
      ) : (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{tl("email.label")}</label>
            <textarea
              style={styles.textarea}
              placeholder={tl("email.placeholder")}
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
            style={{
              ...styles.button,
              ...(!emailInput.trim() ? styles.buttonDisabled : {}),
            }}
            onClick={analyzeEmail}
            disabled={!emailInput.trim()}
            onMouseEnter={(e) => {
              if (emailInput.trim())
                e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
            }}
          >
            {tl("email.button")}
          </button>
          {renderResult()}
        </>
      )}
    </div>
  )

  // ============================================
  // RENDER: URL VIEW
  // ============================================
  const renderUrlView = () => <UrlScanner colors={colors} styles={styles} />

  // ============================================
  // RENDER: DEEPFAKE VIEW
  // ============================================
  const renderDeepfakeView = () => {
    const fileConfig: Record<
      string,
      { titleKey: UIKey; formatsKey: UIKey; icon: string }
    > = {
      image: {
        titleKey: "deepfake.uploadImage",
        formatsKey: "deepfake.formatsImage",
        icon: "[ IMG ]",
      },
      video: {
        titleKey: "deepfake.uploadVideo",
        formatsKey: "deepfake.formatsVideo",
        icon: "[ VID ]",
      },
      audio: {
        titleKey: "deepfake.uploadAudio",
        formatsKey: "deepfake.formatsAudio",
        icon: "[ AUD ]",
      },
    }

    return (
      <div style={styles.content}>
        {renderApiStatus()}
        <div style={styles.sectionTitle}>
          <div style={styles.sectionIconBox}>
            <img
              src={deepfakeai}
              alt="Deepfake"
              style={styles.sectionIconImage}
            />
          </div>
          {tl("deepfake.title")}
        </div>

        <div style={styles.tabContainer}>
          {(["text", "image", "video", "audio"] as const).map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(deepfakeTab === tab
                  ? styles.activeTab
                  : styles.inactiveTab),
              }}
              onClick={() => {
                setDeepfakeTab(tab)
                setResult(null)
                setSelectedFile(null)
              }}
            >
              {tl(`deepfake.${tab}` as UIKey)}
            </button>
          ))}
        </div>

        {isLoading ? (
          renderLoading(
            `${tl("deepfake.analyzing")} ${tl(`deepfake.${deepfakeTab}` as UIKey).toLowerCase()}...`
          )
        ) : (
          <>
            {deepfakeTab === "text" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{tl("deepfake.textLabel")}</label>
                  <textarea
                    style={styles.textarea}
                    placeholder={tl("deepfake.textPlaceholder")}
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
                  style={{
                    ...styles.button,
                    ...(!textInput.trim() ? styles.buttonDisabled : {}),
                  }}
                  onClick={analyzeText}
                  disabled={!textInput.trim()}
                  onMouseEnter={(e) => {
                    if (textInput.trim())
                      e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
                  }}
                >
                  {tl("deepfake.analyzeText")}
                </button>
              </>
            )}

            {deepfakeTab !== "text" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    {tl(fileConfig[deepfakeTab].titleKey)}
                  </label>
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
                    <div style={styles.fileUploadIcon}>
                      {fileConfig[deepfakeTab].icon}
                    </div>
                    <p style={styles.fileUploadText}>
                      {tl("deepfake.clickToSelect")}
                    </p>
                    <p style={styles.fileUploadSubtext}>
                      {tl(fileConfig[deepfakeTab].formatsKey)}
                    </p>
                    {selectedFile && (
                      <div style={styles.selectedFileName}>
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  style={{
                    ...styles.button,
                    ...(!selectedFile ? styles.buttonDisabled : {}),
                  }}
                  onClick={() =>
                    analyzeFile(
                      deepfakeTab as "image" | "video" | "audio"
                    )
                  }
                  disabled={!selectedFile}
                  onMouseEnter={(e) => {
                    if (selectedFile)
                      e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
                  }}
                >
                  {tl("deepfake.analyze")}{" "}
                  {tl(`deepfake.${deepfakeTab}` as UIKey)}
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
  // RENDER: FACT CHECK VIEW
  // ============================================
  const renderFactCheckView = () => (
    <div style={styles.content}>
      {renderApiStatus()}
      <div style={styles.sectionTitle}>
        <div style={styles.sectionIconBox}>
          <img src={news} alt="Fact Check" style={styles.sectionIconImage} />
        </div>
        {tl("factcheck.title")}
      </div>

      {isLoading ? (
        renderLoading(tl("factcheck.loading"))
      ) : (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{tl("factcheck.label")}</label>
            <textarea
              style={styles.textarea}
              placeholder={tl("factcheck.placeholder")}
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
            style={{
              ...styles.button,
              ...(!newsInput.trim() ? styles.buttonDisabled : {}),
            }}
            onClick={checkFact}
            disabled={!newsInput.trim()}
            onMouseEnter={(e) => {
              if (newsInput.trim())
                e.currentTarget.style.boxShadow = `0 0 35px ${colors.buttonGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 25px ${colors.buttonGlow}`
            }}
          >
            {tl("factcheck.button")}
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
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={iconImage} alt="TrustShield" style={styles.logoIcon} />
          <div style={styles.logoTextContainer}>
            <div style={styles.logoText}>
              Trust<span style={styles.logoTextAccent}>Shield</span>
            </div>
            <div style={styles.subtitle}>{tl("header.subtitle")}</div>
          </div>
        </div>

        <div style={styles.headerRight}>
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
              {isRtlLang ? "→" : "←"} {tl("general.back")}
            </button>
          )}

          <LanguageSelector
            currentLang={currentLang}
            onChange={changeLanguage}
            colors={colors}
            tFn={tl}
          />
        </div>
      </div>

      {/* VIEWS */}
      {currentView === "home" && renderHomeView()}
      {currentView === "email" && renderEmailView()}
      {currentView === "url" && renderUrlView()}
      {currentView === "deepfake" && renderDeepfakeView()}
      {currentView === "factcheck" && renderFactCheckView()}
      {currentView === "scan" && renderScanView()}

      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerText}>{tl("footer.text")}</p>
      </div>
    </div>
  )
}

export default IndexPopup