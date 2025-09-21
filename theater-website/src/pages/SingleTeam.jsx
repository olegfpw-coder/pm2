import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTeamsData } from '../api/starpi'; // Импортируем функцию для получения данных
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles.css';

const SingleTeam = () => {
    const { id } = useParams(); // Получаем ID артиста из URL
    const [team, setTeam] = useState(null); // Состояние для хранения артиста
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadTeamData = async () => {
            try {
                const teamsData = await fetchTeamsData();
                const selectedTeam = teamsData.find((item) => item.id === parseInt(id));
                if (selectedTeam) {
                    setTeam(selectedTeam);
                } else {
                    setError('Артист не найден.');
                }
            } catch (error) {
                console.error('Не удалось загрузить артиста:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            } finally {
                setLoading(false); // Завершаем загрузку
            }
        };
        loadTeamData();
    }, [id]);

    return (
        <div className="single-artist-page">
            <Header />
            
            <main className="single-artist-container">
                {loading && <p>Загрузка данных команды...</p>}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {team && (
                    <div>
                        <h2>{team.name}</h2>
                        <p><strong>Звание:</strong> {team.title}</p>
                        <img src={team.photo} alt={`Фото ${team.name}`} />
                        <p>{team.bio}</p>
                        )}
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default SingleTeam;