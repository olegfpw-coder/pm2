import React from 'react';
import './styles.css';
import scene1 from "../img/About_theatre/HistoryTH (1).jpg";
import scene2 from "../img/About_theatre/HistoryTH (2).jpg";
import scene3 from "../img/About_theatre/HistoryTH (3).jpg";
import scene4 from "../img/About_theatre/HistoryTH (4).jpg";
import scene5 from "../img/About_theatre/HistoryTH (5).jpg";
import scene6 from "../img/About_theatre/HistoryTH (6).jpg";

const UpcomingShows = () => {
    return (
        <section className="upcoming-shows">
            <div className="shows-grid">
                <div className="show">
                    <img src={scene1} alt="Спектакль 1" />
                </div>
                <div className="show">
                    <img src={scene2} alt="Спектакль 2" />
                </div>
                <div className="show">
                    <img src={scene3} alt="Спектакль 3" />
                </div>
            </div>
            <div className="shows-grid">
                <div className="show">
                    <img src={scene4} alt="Спектакль 1" />
                </div>
                <div className="show">
                    <img src={scene5} alt="Спектакль 2" />
                </div>
                <div className="show">
                    <img src={scene6} alt="Спектакль 3" />
                </div>
            </div>
        </section>
    );
};

export default UpcomingShows;