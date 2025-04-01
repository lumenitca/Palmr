---
title: Available languages
---

The project uses i18next for internationalization (i18n) support. The language detection is handled automatically through i18next-browser-languagedetector .

### Available Languages in Palmr.
----

##### 1. 🇺🇸 English (en-US)
##### 2. 🇧🇷 Portuguese (pt-BR)
##### 3. 🇫🇷 French (fr-FR)
##### 4. 🇪🇸 Spanish (es-ES)
##### 5. 🇩🇪 German (de-DE)
##### 6. 🇷🇺 Russian (ru-RU)
##### 7. 🇮🇳 Hindi (hi-IN)
##### 8. 🇸🇦 Arabic (ar-SA)
##### 9. 🇯🇵 Japanese (ja-JP)
##### 10. 🇰🇷 Korean (ko-KR)
##### 11. 🇹🇷 Turkish (tr-TR)
##### 12. 🇨🇳 Chinese (zh-CN)

</br>

### Language Selection
##### The language can be changed in two ways:

#### 1. Automatic Detection
   
   - The application automatically detects the user's browser language
   - Uses the browser's language settings as the initial language

#### 2. Manual Selection

![Palmr Profile Menu](/src/assets/main/language/language-selector.png)
   
   - Users can manually switch languages through the language selector in the UI
   - Language preference is saved in the browser's localStorage

### Default Language
##### English (en-US) is set as the fallback language.
</br>

### Language Detection
The application automatically detects the user's browser language and sets it as the initial language. Users can manually change the language using the language switcher in the interface (globe icon in the navigation bar).

### RTL Support
The application includes special handling for right-to-left (RTL) languages, specifically for Arabic (ar-SA).