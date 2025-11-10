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
  // Состояния настроек
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // %
  const [colorScheme, setColorScheme] = useState('normal'); // 'normal', 'high-contrast', 'black-white'
  const [showImages, setShowImages] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState('normal'); // 'normal', 'wide', 'tight'

  // Загружаем настройки из localStorage при монтировании
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
        console.error('Ошибка при загрузке настроек доступности:', e);
      }
    }
  }, []);

  // Сохраняем настройки в localStorage при изменении
  useEffect(() => {
    const settings = { fontSize, colorScheme, showImages, letterSpacing };
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [fontSize, colorScheme, showImages, letterSpacing]);

  // Применяем стили к body
  useEffect(() => {
    // Создаем или получаем тег <style>
    let styleSheet = document.getElementById('accessibility-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'accessibility-styles';
      document.head.appendChild(styleSheet);
    }

    // Определяем значения для CSS
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
        // normal - не меняем
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
      .accessibility-mode {
        font-size: ${fontSize}% !important;
        line-height: 1.6 !important;
        background-color: ${bgColor} !important;
        color: ${textColor} !important;
        font-family: Arial, Helvetica, sans-serif !important;
      }

      .accessibility-mode * {
        letter-spacing: ${letterSpacingValue} !important;
        background-image: none !important;
      }

      .accessibility-mode img {
        display: ${showImages ? 'block' : 'none'} !important;
        border: ${showImages && imgBorder ? imgBorder : 'none'} !important;
      }

      .accessibility-mode a {
        color: ${linkColor || 'inherit'} !important;
        text-decoration: ${linkDecoration || 'inherit'} !important;
      }

      .accessibility-mode *:focus {
        outline: 3px solid #000 !important;
        outline-offset: 2px;
      }
    `;

    // Добавляем класс к body
    document.body.classList.add('accessibility-mode');

    // Очистка при размонтировании (не удаляем стили, чтобы сохранить эффект)
    // return () => {
    //   document.body.classList.remove('accessibility-mode');
    // };
  }, [fontSize, colorScheme, showImages, letterSpacing]);

  // Функция сброса настроек
  const resetSettings = () => {
    setFontSize(100);
    setColorScheme('normal');
    setShowImages(true);
    setLetterSpacing('normal');
  };

  // Функция открытия панели через глобальный объект (для футера)
  const openPanelFromFooter = () => {
    setIsPanelOpen(true);
  };

  // Экспонируем функцию в window для доступа из футера
  useEffect(() => {
    window.openAccessibilityPanel = openPanelFromFooter;
    return () => {
      delete window.openAccessibilityPanel;
    };
  }, []);

  // Значения контекста
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