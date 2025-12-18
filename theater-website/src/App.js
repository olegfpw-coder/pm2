// Theater-website/src/App.js
// Основной компонент приложения - точка входа (с ленивой загрузкой страниц)

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AuthProvider } from './contexts/AuthContext';
import AccessibilityPanel from './components/AccessibilityPanel';
import Layout from './components/Layout';
// Глобальные стили
import './styles/main.css';

// Ленивые импорты страниц (code-splitting)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Afisha = lazy(() => import('./pages/Afisha'));
const Show = lazy(() => import('./pages/Show'));
const Artis = lazy(() => import('./pages/Artist'));
const Team = lazy(() => import('./pages/Team'));
const News = lazy(() => import('./pages/News'));
const SingleNews = lazy(() => import('./pages/SingleNews'));
const SinglePerformance = lazy(() => import('./pages/SinglePerformance'));
const SingleArtist = lazy(() => import('./pages/SingleArtist'));
const SingleTeam = lazy(() => import('./pages/SingleTeam'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Services = lazy(() => import('./pages/Services'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Touring = lazy(() => import('./pages/Touring'));
const Documents = lazy(() => import('./pages/Documents'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Reviews = lazy(() => import('./pages/Reviews'));

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AccessibilityPanel />
        <Router>
          <Layout>
            <Suspense
              fallback={
                <div className="page-loader" style={{ padding: '24px', textAlign: 'center' }}>
                  Загрузка...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/afisha" element={<Afisha />} />
                <Route path="/show" element={<Show />} />
                <Route path="/artist" element={<Artis />} />
                <Route path="/team" element={<Team />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<SingleNews />} />
                <Route path="/performances/:id" element={<SinglePerformance />} />
                <Route path="/artists/:id" element={<SingleArtist />} />
                <Route path="/teams/:id" element={<SingleTeam />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/touring" element={<Touring />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/performances/:id/reviews" element={<Reviews />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
