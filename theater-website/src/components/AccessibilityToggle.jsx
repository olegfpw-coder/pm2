// Theater-website/src/components/AccessibilityToggle.jsx

// Импортируем React и наш хук для доступа к контексту
import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

// Компонент кнопки переключения режима
const AccessibilityToggle = () => {
  // Получаем состояние и функцию переключения из контекста
  const { isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();

  return (
    // Кнопка с инлайновыми стилями
    <button
      // Обработчик клика - вызывает функцию переключения
      onClick={toggleAccessibilityMode}
      // Стили для позиционирования кнопки в правом верхнем углу
      style={{
        position: 'fixed', // Фиксированное позиционирование
        top: '20px',       // Отступ сверху
        right: '20px',     // Отступ справа
        zIndex: 10000,     // Высокий z-index, чтобы кнопка была поверх всего
        padding: '12px 16px', // Внутренние отступы
        // Цвет фона зависит от состояния режима
        backgroundColor: isAccessibilityMode ? '#000000' : '#6c757d',
        color: '#ffffff', // Белый цвет текста
        border: '2px solid #000000', // Черная рамка
        borderRadius: '4px', // Скругленные углы
        cursor: 'pointer', // Курсор "указатель"
        fontSize: '14px', // Размер шрифта
        fontWeight: 'bold', // Жирный шрифт
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Тень
        transition: 'all 0.3s ease' // Плавный переход для всех свойств
      }}
      // ARIA-атрибут для доступности, объясняющий назначение кнопки
      aria-label={isAccessibilityMode ? "Переключить на обычную версию" : "Переключить на версию для слабовидящих"}
    >
      {/* Текст кнопки зависит от состояния режима */}
      {isAccessibilityMode ? 'Обычная версия' : 'Для слабовидящих'}
    </button>
  );
};

export default AccessibilityToggle;