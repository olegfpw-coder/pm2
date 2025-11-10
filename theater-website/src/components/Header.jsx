// src/components/Header.jsx
import React, { useState } from 'react'; // Добавлен useState
// Стили импортируются в main.css
import logo from "../img/theatr_photos/b.jpg";
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
    const { isAuthenticated, user } = useAuth();
    // Состояние для открытия/закрытия бургер-меню
    const [isOpen, setIsOpen] = useState(false);

    // Функция для переключения состояния меню
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Функция для закрытия меню (при клике на ссылку)
    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <header>
            <div className="logo">
                <img src={logo} alt="Логотип театра" /> {/* Добавлен alt для доступности */}
            </div>
            
            {/* Контейнер для навигации и бургера */}
            <div className="nav-links-container">
                <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
                    <li><Link to="/about" onClick={closeMenu}>О театре</Link></li>
                    <li><Link to="/afisha" onClick={closeMenu}>Афиша</Link></li>
                    <li><Link to="/show" onClick={closeMenu}>Спектакли</Link></li>
                    <li><Link to="/artist" onClick={closeMenu}>Артисты</Link></li>
                    <li><Link to="/team" onClick={closeMenu}>Команда</Link></li>
                    <li><Link to="/news" onClick={closeMenu}>Новости</Link></li>
                    {isAuthenticated ? (
                        <li><Link to="/profile" onClick={closeMenu}>Профиль</Link></li>
                    ) : (
                        <li><Link to="/login" onClick={closeMenu}>Войти</Link></li>
                    )}
                </ul>
                
                {/* Кнопка бургера */}
                <button 
                    className={`burger ${isOpen ? 'active' : ''}`} 
                    onClick={toggleMenu}
                    aria-label={isOpen ? "Закрыть меню" : "Открыть меню"} // Для доступности
                    aria-expanded={isOpen} // Для доступности
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            
            {/* Overlay для закрытия меню */}
            {isOpen && (
                <div 
                    className="menu-overlay" 
                    onClick={closeMenu}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                />
            )}
        </header>
    );
};

export default Header;