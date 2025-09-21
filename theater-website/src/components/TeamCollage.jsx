import React from 'react';
import './styles.css';
import scene1 from "../img/Peoples/Мурзина.jpg";

const TeamPage = () => {
    return (
        <section className="artist">
            <div className="artist-grid">
                <div className="art">
                    <img src={scene1} alt="Спектакль 1" />
                    <h3>Вася Васечкин</h3>
                    <p>Артист</p>
                </div>
                <div className="art">
                    <img src={scene1} alt="Спектакль 2" />
                    <h3>Вася Васечкин</h3>
                    <p>Артист</p>
                </div>
                <div className="art">
                    <img src={scene1} alt="Спектакль 3" />
                    <h3>Вася Васечкин</h3>
                    <p>Артист</p>
                </div>
            </div>
            <div className="artist-grid">
                <div className="art">
                    <img src={scene1} alt="Спектакль 1" />
                    <h3>Вася Васечкин</h3>
                    <p>Артист</p>
                </div>
                <div className="art">
                    <img src={scene1} alt="Спектакль 2" />
                    <h3>Вася Васечкин</h3>
                    <p>Артист</p>
                </div>
                <div className="art">
                    <img src={scene1} alt="Спектакль 3" />
                    <h3>Вася Васечкин</h3>
                    <p>Артист</p>
                </div>
            </div>
        </section>
    );
};

export default TeamPage;