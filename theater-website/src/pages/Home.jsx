import React from 'react';
import Slider from '../components/Slider';
import UpcomingShows from '../components/UpcomingShows';
import News from '../components/News';

const Home = () => {
  return (
    <>
      <Slider />
      <UpcomingShows />
      <News />
    </>
  );
};

export default Home;