import React from 'react';
import Header from '../components/Header';
import Slider from '../components/Slider';
import UpcomingShows from '../components/UpcomingShows';
import News from '../components/News';
import Footer from '../components/Footer';
import '../styles.css';
import Home from '../pages/Home'; // Импортируй главную страницу
import About from '../pages/About'; // Импортируй страницу "О театре"

const App = () => {
  return (
    <div className="app">
      <Header />
      <Slider />
      <UpcomingShows />
      <News />
      <Footer />
    </div>
  );
};

export default App;