import React from 'react';
import './Button.css';

/**
 * Универсальный компонент кнопки
 * @param {string} variant - Вариант кнопки: 'primary', 'secondary', 'outline', 'ghost', 'success', 'info', 'warning', 'danger'
 * @param {string} size - Размер кнопки: 'sm', 'md', 'lg'
 * @param {boolean} disabled - Отключена ли кнопка
 * @param {boolean} elevated - Добавить эффект тени
 * @param {string} className - Дополнительные CSS классы
 * @param {React.ReactNode} children - Содержимое кнопки
 * @param {Object} props - Остальные пропсы
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  elevated = false,
  className = '',
  children,
  ...props
}) => {
  // Формируем классы кнопки
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    elevated ? 'btn--elevated' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;


