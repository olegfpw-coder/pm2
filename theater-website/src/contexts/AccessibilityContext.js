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
  const [fontSize, setFontSize] = useState(100);            // масштаб шрифта в %
  const [colorScheme, setColorScheme] = useState('normal'); // normal | black-white | high-contrast
  const [showImages, setShowImages] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState('normal'); // normal | wide | tight

  // Загружаем настройки из localStorage
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

    // Цветовые настройки
    let bgColor = '';      // фон страницы/карточек
    let textColor = '';    // основной цвет текста
    let imgBorder = '';
    let linkColor = '';
    let linkDecoration = '';

    switch (colorScheme) {
      case 'black-white':
        bgColor = '#000';
        textColor = '#fff';
        break;
      case 'high-contrast':
        bgColor = '#fff';
        textColor = '#000';
        linkColor = '#0000EE';
        linkDecoration = 'underline';
        imgBorder = '2px solid #000';
        break;
      case 'normal':
      default:
        // нормальный режим — не трогаем глобальные цвета
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

    styleSheet.textContent = `
      /* Базовые параметры режима доступности на всём сайте */
      body.accessibility-mode {
        font-size: ${fontSize}% !important;
        line-height: 1.6 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        ${bgColor ? `background-color: ${bgColor} !important;` : ''}
        ${textColor ? `color: ${textColor} !important;` : ''}
      }

      /* Основные структурные контейнеры */
      body.accessibility-mode header,
      body.accessibility-mode main,
      body.accessibility-mode footer,
      body.accessibility-mode nav {
        ${bgColor ? `background-color: ${bgColor} !important;` : ''}
        ${textColor ? `color: ${textColor} !important;` : ''}
      }

      /* КАРТОЧКИ и важные секции */

      /* Общий случай: любые классы, где есть "card" */
      body.accessibility-mode [class*="card"] {
        ${bgColor ? `background-color: ${bgColor} !important;` : ''}
        ${textColor ? `color: ${textColor} !important;` : ''}
      }

      /* Твои конкретные классы */
      body.accessibility-mode .upcoming-shows,
      body.accessibility-mode .show,
      body.accessibility-mode .news-item,
      body.accessibility-mode .session-item,
      body.accessibility-mode .month-card,
      body.accessibility-mode .performance-container,
      body.accessibility-mode .performance-creators,
      body.accessibility-mode .performance-cast,
      body.accessibility-mode .art,
      body.accessibility-mode .news,
      body.accessibility-mode .date-item,
      body.accessibility-mode .slide,
      body.accessibility-mode .month-tab,
      body.accessibility-mode .accessibility-mode,
      body.accessibility-mode .favorites-grid,
      body.accessibility-mode .profile-section {
        ${bgColor ? `background-color: ${bgColor} !important;` : ''}
        ${textColor ? `color: ${textColor} !important;` : ''}
      }

      /* ТЕКСТОВЫЕ ЭЛЕМЕНТЫ — размер шрифта, кернинг, цвет текста */
      body.accessibility-mode p,
      body.accessibility-mode li,
      body.accessibility-mode a,
      body.accessibility-mode span,
      body.accessibility-mode label,
      body.accessibility-mode input,
      body.accessibility-mode textarea,
      body.accessibility-mode select,
      body.accessibility-mode h1,
      body.accessibility-mode h2,
      body.accessibility-mode h3,
      body.accessibility-mode h4,
      body.accessibility-mode h5,
      body.accessibility-mode h6,
      body.accessibility-mode td,
      body.accessibility-mode th {
        font-size: ${fontSize}% !important;
        letter-spacing: ${letterSpacingValue} !important;
        ${textColor ? `color: ${textColor} !important;` : ''}
      }

      /* Ссылки — подчёркивание/контраст в режимах high-contrast / black-white */
      body.accessibility-mode a {
        ${linkColor ? `color: ${linkColor} !important;` : ''}
        ${linkDecoration ? `text-decoration: ${linkDecoration} !important;` : ''}
      }

      /* Управление изображениями */
      body.accessibility-mode img {
        display: ${showImages ? 'inline-block' : 'none'} !important;
        border: ${showImages && imgBorder ? imgBorder : 'none'} !important;
      }

      /* Видимый фокус (в чёрно-белой схеме — светлый контур) */
      body.accessibility-mode *:focus {
        outline: 3px solid ${bgColor === '#000' ? '#fff' : '#000'} !important;
        outline-offset: 2px !important;
      }

      /* Класс-исключение, если что-то нельзя перекрашивать */
      body.accessibility-mode .accessibility-exempt {
        font-size: inherit !important;
        letter-spacing: normal !important;
        color: inherit !important;
        background-color: inherit !important;
      }
    `;

    // Обязательно навешиваем класс на body
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
    openPanelFromFooter,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
