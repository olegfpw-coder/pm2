// Theater-website/src/components/AccessibilityPanel.jsx
// Компонент боковой панели настроек доступности

import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

const AccessibilityPanel = () => {
  const {
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
    resetSettings
  } = useAccessibility();

  if (!isPanelOpen) return null;

  return (
    // Панель адаптируется под цветовую схему
    <div 
      className="accessibility-mode" // Добавляем класс для адаптации
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '300px',
        height: '100vh',
        // Цвета зависят от режима
        backgroundColor: colorScheme === 'black-white' ? '#000' : '#fff',
        color: colorScheme === 'black-white' ? '#fff' : '#000',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.2)',
        padding: '20px',
        zIndex: 10000,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Заголовок */}
      <h2 style={{ 
        margin: '0 0 20px 0',
        color: colorScheme === 'black-white' ? '#fff' : '#000'
      }}>
        Настройки доступности
      </h2>

      {/* Кнопка закрытия */}
      <button
        onClick={() => setIsPanelOpen(false)}
        style={{
          marginBottom: '20px',
          padding: '8px 12px',
          backgroundColor: colorScheme === 'black-white' ? '#333' : '#ccc',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: colorScheme === 'black-white' ? '#fff' : '#000'
        }}
      >
        Закрыть
      </button>

      {/* Кнопка сброса */}
      <button
        onClick={resetSettings}
        style={{
          marginBottom: '20px',
          padding: '8px 12px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Сбросить настройки
      </button>

      {/* Размер шрифта */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px',
          color: 'inherit'
        }}>
          Размер шрифта:
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setFontSize(Math.max(70, fontSize - 10))}
            style={{
              padding: '5px 10px',
              border: '1px solid #000',
              backgroundColor: colorScheme === 'black-white' ? '#333' : '#eee',
              cursor: 'pointer',
              color: colorScheme === 'black-white' ? '#fff' : '#000'
            }}
          >
            A-
          </button>
          <span style={{ 
            fontSize: `${fontSize}%`,
            color: 'inherit'
          }}>
            {fontSize}%
          </span>
          <button
            onClick={() => setFontSize(Math.min(200, fontSize + 10))}
            style={{
              padding: '5px 10px',
              border: '1px solid #000',
              backgroundColor: colorScheme === 'black-white' ? '#333' : '#eee',
              cursor: 'pointer',
              color: colorScheme === 'black-white' ? '#fff' : '#000'
            }}
          >
            A+
          </button>
        </div>
      </div>

      {/* Цветовая схема */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px',
          color: 'inherit'
        }}>
          Цветовая схема:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button
            onClick={() => setColorScheme('normal')}
            style={{
              padding: '8px',
              border: '1px solid #000',
              backgroundColor: colorScheme === 'normal' ? '#000' : (colorScheme === 'black-white' ? '#333' : '#eee'),
              color: colorScheme === 'normal' || colorScheme === 'black-white' ? '#fff' : '#000',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Нормальная
          </button>
          <button
            onClick={() => setColorScheme('high-contrast')}
            style={{
              padding: '8px',
              border: '1px solid #000',
              backgroundColor: colorScheme === 'high-contrast' ? '#000' : (colorScheme === 'black-white' ? '#333' : '#eee'),
              color: colorScheme === 'high-contrast' || colorScheme === 'black-white' ? '#fff' : '#000',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Высокий контраст
          </button>
          <button
            onClick={() => setColorScheme('black-white')}
            style={{
              padding: '8px',
              border: '1px solid #000',
              backgroundColor: '#000',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Черно-белая
          </button>
        </div>
      </div>

      {/* Изображения */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px',
          color: 'inherit'
        }}>
          Изображения:
        </label>
        <button
          onClick={() => setShowImages(!showImages)}
          style={{
            padding: '8px 12px',
            border: '1px solid #000',
            backgroundColor: showImages ? (colorScheme === 'black-white' ? '#000' : '#000') : (colorScheme === 'black-white' ? '#333' : '#eee'),
            color: showImages || colorScheme === 'black-white' ? '#fff' : '#000',
            cursor: 'pointer'
          }}
        >
          {showImages ? 'Показывать' : 'Скрыть'}
        </button>
      </div>

      {/* Кернинг */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px',
          color: 'inherit'
        }}>
          Кернинг:
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button
            onClick={() => setLetterSpacing('normal')}
            style={{
              padding: '8px',
              border: '1px solid #000',
              backgroundColor: letterSpacing === 'normal' ? '#000' : (colorScheme === 'black-white' ? '#333' : '#eee'),
              color: letterSpacing === 'normal' || colorScheme === 'black-white' ? '#fff' : '#000',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Нормальный
          </button>
          <button
            onClick={() => setLetterSpacing('wide')}
            style={{
              padding: '8px',
              border: '1px solid #000',
              backgroundColor: letterSpacing === 'wide' ? '#000' : (colorScheme === 'black-white' ? '#333' : '#eee'),
              color: letterSpacing === 'wide' || colorScheme === 'black-white' ? '#fff' : '#000',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Широкий
          </button>
          <button
            onClick={() => setLetterSpacing('tight')}
            style={{
              padding: '8px',
              border: '1px solid #000',
              backgroundColor: letterSpacing === 'tight' ? '#000' : (colorScheme === 'black-white' ? '#333' : '#eee'),
              color: letterSpacing === 'tight' || colorScheme === 'black-white' ? '#fff' : '#000',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Узкий
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;