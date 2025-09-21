import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Главная страница
import About from './pages/About'; // Страница "О театре"
import Afisha from './pages/Afisha'; // Страница "Афиша"
import Show from './pages/Show'; // Страница "Спектакли"
import Artis from './pages/Artist'; // Страница "Артисты"
import Team from './pages/Team'; // Страница "Команда"
import News from './pages/News'; // Страница "Новости"
import SingleNews from './pages/SingleNews'; // Страница отдельной новости
import SinglePerformance from './pages/SinglePerformance';
import SingleArtist from './pages/SingleArtist';
import SingleTeam from './pages/SingleTeam';
import NotFound from './pages/NotFound'; // Страница ошибки 404
import './styles.css';

const App = () => {
    return (
        <Router>
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

                {/* Обработка ошибок 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;