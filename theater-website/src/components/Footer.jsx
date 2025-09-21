import React from 'react';
import './styles.css';
import scene1 from "../img/icons/vk.png";
import scene2 from "../img/icons/telegram.png";
import scene3 from "../img/icons/Odnoklassniki.png";

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="social-icons">
                    <a href="https://vk.com/zab.teatr"><img src={scene1} alt="Вконтакте" /></a>
                    <a href="https://ok.ru/dramachita"><img src={scene3} alt="Одноклассники" /></a>
                    <a href="https://t.me/drama_chita"><img src={scene2} alt="Телеграм" /></a>
                </div>
                
                <div className="footer-text">
                    <p>Учредитель: Министерство культуры Забайкальского края <br/>Полное наименование учреждения: Государственное автономное учреждение<br/> культуры "Забайкальский краевой драматический театр им. Н.А. Березина"<br/>Сокращенное наименование учреждения: ГАУК "Забайкальский краевой<br/> драмтеатр им. Н.А. Березина"<br/>Адрес: 672000 Забайкальский край, г.Чита, ул. Профсоюзная, 26, а/я 401 <br/>drama_chita@mail.ru <br/>Контактные телефоны: (3022)21-44-08, (3022)21-44-02 </p>
                </div>
                <div className="footer-links">
                    <a href="#">Услуги</a>
                    <a href="#">Контакты</a>
                    <a href="#">Гастролерам</a>
                    <a href="#">Документы</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;