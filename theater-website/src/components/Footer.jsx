// Theater-website/src/components/Footer.jsx
// Футер сайта с кнопкой доступности

import React from 'react';
import { Link } from 'react-router-dom';
// Стили импортируются в main.css
// Импорты иконок (убедитесь, что пути правильные)
import scene1 from "../img/icons/vk.png";
import scene2 from "../img/icons/telegram.png";
import scene3 from "../img/icons/Odnoklassniki.png";

const Footer = () => {
  // Функция для открытия панели через глобальный объект
  const handleAccessibilityClick = () => {
    if (window.openAccessibilityPanel) {
      window.openAccessibilityPanel();
    } else {
      console.warn('Функция открытия панели доступности не найдена');
    }
  };

  return (
    <footer>
      <div className="footer-content">
        {/* Социальные иконки */}
        <div className="social-icons">
          <a href="https://vk.com/zab.teatr"><img src={scene1} alt="Вконтакте" /></a>
          <a href="https://ok.ru/dramachita"><img src={scene3} alt="Одноклассники" /></a>
          <a href="https://t.me/drama_chita"><img src={scene2} alt="Телеграм" /></a>
        </div>
        
        {/* Текстовая информация о театре */}
        <div className="footer-text">
          <p>Учредитель: Министерство культуры Забайкальского края
          <br/>Полное наименование учреждения: Государственное автономное учреждение
          <br/> культуры "Забайкальский краевой драматический театр им. Н.А. Березина"
          <br/>Сокращенное наименование учреждения: ГАУК "Забайкальский краевой
          <br/> драмтеатр им. Н.А. Березина"
          <br/>Адрес: 672000 Забайкальский край, г.Чита, ул. Профсоюзная, 26, а/я 401 
          <br/>drama_chita@mail.ru 
          <br/>Контактные телефоны: (3022)21-44-08, (3022)21-44-02 </p>
        </div>
        
        {/* Ссылки в футере + кнопка доступности */}
        <div className="footer-links">
          <Link to="/services">Услуги</Link>
          <Link to="/contacts">Контакты</Link>
          <Link to="/touring">Гастролерам</Link>
          <Link to="/documents">Документы</Link>
          {/* Кнопка доступности как элемент списка */}
          <button
            onClick={handleAccessibilityClick}
            aria-label="Настройки доступности"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer',
              display: 'inline',
              textAlign: 'left',
            }}
          >
            Для слабовидящих
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;