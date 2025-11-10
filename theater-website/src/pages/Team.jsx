import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTeamsData } from '../api/starpi'; // Импортируем функцию для получения данных
// Стили импортируются в main.css

const Teams = () => {
    const [teams, setTeams] = useState([]); // Состояние для хранения артистов
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadTeamsData = async () => {
            try {
                const teamsData = await fetchTeamsData();
                setTeams(teamsData);
            } catch (error) {
                console.error('Не удалось загрузить команду:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            } finally {
                setLoading(false); // Завершаем загрузку
            }
        };
        loadTeamsData();
    }, []);

    return (
        <div className="artists-page">
            <main className="artists-container">
                <h2>Команда театра</h2>

                {loading && <p>Загрузка команды...</p>}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {!loading && !error && teams.length > 0 ? (
                    <div className="artist-grid">
                        {teams.map((team) => (
                            <Link to={`/teams/${team.id}`} key={team.id} className="art">
                                <img src={team.photo} alt={`Фото ${team.name}`} />
                                <h3>{team.name}</h3>
                                <p>{team.title}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    !loading && <p>Нет доступных членов команды.</p>
                )}
            </main>
        </div>
    );
};

export default Teams;