// Theater-website/src/App.js
// Основной компонент приложения - точка входа

import React from 'react';
// Импортируем необходимые компоненты из react-router-dom для маршрутизации
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Импортируем наш созданный провайдер контекста и компонент панели
import { AccessibilityProvider } from './contexts/AccessibilityContext'; // Провайдер для управления доступностью
import { AuthProvider } from './contexts/AuthContext'; // Провайдер для аутентификации
import AccessibilityPanel from './components/AccessibilityPanel'; // Панель настроек

// Импортируем Layout компонент
import Layout from './components/Layout';

// Импортируем существующие страницы сайта
import Home from './pages/Home'; // Главная страница
import About from './pages/About'; // Страница "О театре"
import Afisha from './pages/Afisha'; // Страница "Афиша"
import Show from './pages/Show'; // Страница "Спектакли"
import Artis from './pages/Artist'; // Страница "Артисты"
import Team from './pages/Team'; // Страница "Команда"
import News from './pages/News'; // Страница "Новости"
import SingleNews from './pages/SingleNews'; // Страница отдельной новости
import SinglePerformance from './pages/SinglePerformance'; // Страница отдельного спектакля
import SingleArtist from './pages/SingleArtist'; // Страница одного артиста
import SingleTeam from './pages/SingleTeam'; // Страница одного участника команды
import NotFound from './pages/NotFound'; // Страница ошибки 404
import Services from './pages/Services';
import Contacts from './pages/Contacts';
import Touring from './pages/Touring';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Reviews from './pages/Reviews';

// Импортируем глобальные стили сайта
import './styles/main.css';

// Основной компонент приложения
function App() {
  return (
    // Оборачиваем всё приложение в провайдеры контекста
    <AccessibilityProvider>
      <AuthProvider>
        {/* Размещаем панель настроек доступности */}
        {/* Она будет появляться справа при клике на кнопку в футере */}
        <AccessibilityPanel />

        {/* Роутер для навигации между страницами */}
        <Router>
        <Layout>
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={<Home />} />

            {/* Страница "О театре" */}
            <Route path="/about" element={<About />} />

            {/* Страница "Афиша" */}
            <Route path="/afisha" element={<Afisha />} />

            {/* Страница "Спектакли" */}
            <Route path="/show" element={<Show />} />

            {/* Страница "Артисты" */}
            <Route path="/artist" element={<Artis />} />

            {/* Страница "Команда" */}
            <Route path="/team" element={<Team />} />

            {/* Страница "Новости" */}
            <Route path="/news" element={<News />} />

            {/* Страница отдельной новости */}
            <Route path="/news/:id" element={<SingleNews />} />

            {/* Страница отдельного спектакля */}
            <Route path="/performances/:id" element={<SinglePerformance />} />

            {/* Страница одного артиста */}
            <Route path="/artists/:id" element={<SingleArtist />} />

            {/* Страница одного участника команды */}
            <Route path="/teams/:id" element={<SingleTeam />} />

            {/* Статические страницы */}
            <Route path="/services" element={<Services />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/touring" element={<Touring />} />
            <Route path="/documents" element={<Documents />} />

            {/* Страницы пользователя */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/performances/:id/reviews" element={<Reviews />} />

            {/* Обработка ошибок 404 - страница не найдена */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;