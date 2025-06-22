import React, { useEffect, useState } from 'react';
import { Languages, X } from 'lucide-react';

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);

  const indianLanguages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' }
  ];

  useEffect(() => {
    // Set default language to English
    setCurrentLang('en');

    // Ensure translation hash is English
    if (!window.location.hash.includes('#googtrans')) {
      window.location.hash = '#googtrans(en|en)';
    }

    const loadGoogleTranslate = () => {
      if (document.getElementById('google-translate-script')) return;

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;

      const includedLangs = indianLanguages.map(lang => lang.code).join(',');

      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: includedLangs,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, 'google_translate_element_hidden');

      setIsLoaded(true);

      const hash = window.location.hash;
      if (hash && hash.includes('#googtrans')) {
        const match = hash.match(/#googtrans\(en\|(\w+)\)/);
        if (match && match[1]) {
          setCurrentLang(match[1]);
        }
      } else {
        setCurrentLang('en');
        window.location.hash = '#googtrans(en|en)';
      }
    };

    loadGoogleTranslate();

    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame.skiptranslate,
      .goog-te-ftab,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      .goog-te-menu-frame,
      .goog-te-menu2,
      .goog-te-gadget,
      .goog-te-gadget-simple,
      .goog-te-combo,
      .goog-logo-link,
      .goog-te-gadget-icon,
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf-ti6hGc,
      .skiptranslate iframe,
      .goog-te-spinner-pos,
      div[id*="google_translate"] > div,
      .goog-te-button,
      .goog-te-button > span,
      .goog-te-button > img {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }

      body {
        top: 0px !important;
        position: static !important;
      }

      #google_translate_element_hidden,
      #google_translate_element_hidden * {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        left: -9999px !important;
      }

      iframe[src*="translate.google"],
      iframe[src*="translate.googleapis"] {
        display: none !important;
        visibility: hidden !important;
      }

      .skiptranslate {
        display: none !important;
      }

      body > .skiptranslate {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.className && (
              node.className.includes('goog-te') ||
              node.className.includes('skiptranslate') ||
              node.className.includes('VIpgJd')
            )) {
              node.style.display = 'none';
              node.style.visibility = 'hidden';
            }

            if (node.tagName === 'IFRAME' && node.src && (
              node.src.includes('translate.google') ||
              node.src.includes('translate.googleapis')
            )) {
              node.style.display = 'none';
              node.style.visibility = 'hidden';
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  const triggerTranslation = (langCode) => {
    window.location.hash = `#googtrans(en|${langCode})`;
    setTimeout(() => {
      window.location.reload();
    }, 300);
    return true;
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    triggerTranslation(langCode);
  };

  const getCurrentLanguageName = () => {
    const lang = indianLanguages.find(l => l.code === currentLang);
    return lang ? lang.native : 'English';
  };

  return (
    <>
      <div id="google_translate_element_hidden" className="hidden invisible absolute -left-full w-0 h-0 overflow-hidden"></div>

      <div className="fixed left-5 bottom-5 z-50 font-sans">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full border-0 bg-gradient-to-br from-orange-500 to-yellow-500 text-white cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 text-lg"
          title="Translate to Indian Languages"
        >
          {currentLang === 'en' ? '🌐' : '🇮🇳'}
        </button>

        {isOpen && (
          <div className="absolute left-0 bottom-16 bg-white rounded-xl shadow-2xl p-4 min-w-72 max-h-96 overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 text-center">
              <h3 className="m-0 text-base font-semibold text-gray-800">
                🇮🇳 Languages
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-transparent border-0 cursor-pointer p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors duration-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-gray-50 px-3 py-2 rounded-lg mb-3 text-sm text-gray-700">
              Current: <span className="font-semibold">{getCurrentLanguageName()}</span>
            </div>

            <div className="grid gap-1">
              {indianLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-3 py-2.5 border-0 rounded-lg cursor-pointer text-left text-sm transition-all duration-200 flex justify-between items-center ${
                    currentLang === lang.code 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-transparent text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{lang.native}</span>
                  <span className="text-xs opacity-70 font-normal">
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 text-center">
              Powered by Google Translate
            </div>
          </div>
        )}

        {!isLoaded && (
          <div className="absolute left-0 bottom-16 bg-white px-4 py-2 rounded-full shadow-lg text-xs text-gray-600 whitespace-nowrap">
            Loading translator...
          </div>
        )}
      </div>
    </>
  );
};

export default GoogleTranslate;
