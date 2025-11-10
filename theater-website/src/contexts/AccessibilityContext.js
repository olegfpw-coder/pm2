// Theater-website/src/contexts/AccessibilityContext.js
// Контекст для управления настройками доступности по ГОСТ

import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст
const AccessibilityContext = createContext();

// Хук для удобного использования контекста
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Провайдер контекста
export const AccessibilityProvider = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [colorScheme, setColorScheme] = useState('normal');
  const [showImages, setShowImages] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState('normal');

  // Загружаем настройки
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setFontSize(settings.fontSize ?? 100);
        setColorScheme(settings.colorScheme ?? 'normal');
        setShowImages(settings.showImages ?? true);
        setLetterSpacing(settings.letterSpacing ?? 'normal');
      } catch (e) {
        console.error('Ошибка при загрузке настроек:', e);
      }
    }
  }, []);

  // Сохраняем настройки
  useEffect(() => {
    const settings = { fontSize, colorScheme, showImages, letterSpacing };
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [fontSize, colorScheme, showImages, letterSpacing]);

  // Применяем стили
  useEffect(() => {
    let styleSheet = document.getElementById('accessibility-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'accessibility-styles';
      document.head.appendChild(styleSheet);
    }

    // Определяем значения
    let bgColor = '#fff';
    let textColor = '#000';
    let imgBorder = '';
    let linkColor = '';
    let linkDecoration = '';

    switch (colorScheme) {
      case 'black-white':
        bgColor = '#000';
        textColor = '#fff';
        break;
      case 'high-contrast':
        linkColor = '#0000EE';
        linkDecoration = 'underline';
        imgBorder = '2px solid #000';
        break;
      default:
        break;
    }

    let letterSpacingValue = 'normal';
    switch (letterSpacing) {
      case 'wide':
        letterSpacingValue = '0.1em';
        break;
      case 'tight':
        letterSpacingValue = '-0.05em';
        break;
      default:
        break;
    }

    // Формируем CSS
    styleSheet.textContent = `
      /* Основной класс для режима доступности */
      .accessibility-mode {
        font-size: ${fontSize}% !important;
        line-height: 1.6 !important;
        background-color: ${bgColor} !important;
        color: ${textColor} !important;
        font-family: Arial, Helvetica, sans-serif !important;
      }

      /* Применяем кернинг */
      .accessibility-mode * {
        letter-spacing: ${letterSpacingValue} !important;
        background-image: none !important;
      }

      /* Управление изображениями */
      .accessibility-mode img {
        display: ${showImages ? 'block' : 'none'} !important;
        border: ${showImages && imgBorder ? imgBorder : 'none'} !important;
      }

      /* Стили для ссылок */
      .accessibility-mode a {
        color: ${linkColor || 'inherit'} !important;
        text-decoration: ${linkDecoration || 'inherit'} !important;
      }

      /* Стили фокуса */
      .accessibility-mode *:focus {
        outline: 3px solid #000 !important;
        outline-offset: 2px;
      }

      /* ИСПРАВЛЕНИЕ: Для особых случаев - белый текст на белом фоне */
      /* Если элемент имеет белый фон и черный текст по умолчанию, 
         но в режиме "нормальный" становится белым текстом на белом фоне */
      .accessibility-mode .text-on-white-bg {
        background-color: #000 !important;
        color: #fff !important;
      }
    `;

    document.body.classList.add('accessibility-mode');

  }, [fontSize, colorScheme, showImages, letterSpacing]);

  // Функция сброса
  const resetSettings = () => {
    setFontSize(100);
    setColorScheme('normal');
    setShowImages(true);
    setLetterSpacing('normal');
  };

  // Функция открытия панели
  const openPanelFromFooter = () => {
    setIsPanelOpen(true);
  };

  // Экспонируем функцию в window
  useEffect(() => {
    window.openAccessibilityPanel = openPanelFromFooter;
    return () => {
      delete window.openAccessibilityPanel;
    };
  }, []);

  const value = {
    isPanelOpen,
    setIsPanelOpen,
    fontSize,
    setFontSize,
    colorScheme,
    setColorScheme,
    showImages,
    setShowImages,
    letterSpacing,
    setLetterSpacing,
    resetSettings,
    openPanelFromFooter
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};