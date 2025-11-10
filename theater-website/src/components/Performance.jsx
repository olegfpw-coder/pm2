import React from 'react';
import Button from './Button';
import MarkdownRenderer from './MarkdownRenderer';
import { formatSessionDateTime } from '../api/quicktickets';
// Стили импортируются в main.css

const Performance = ({
    id,
    image,
    title,
    creators,
    sessions = [],
    isLoadingSessions = false,
    quickTicketsEnabled = false,
}) => {
    const sessionsToShow = Array.isArray(sessions)
        ? sessions.filter((session) => !!session?.timeStart).slice(0, 3)
        : [];

    return (
        <div className="performance-container">
            {/* Левая часть - обложка спектакля */}
            <div className="performance-image">
                <img src={image} alt={`Обложка спектакля ${title}`} />
            </div>

            {/* Правая часть - информация о спектакле */}
            <div className="performance-info">
                <h2 className="performance-title">{title.toUpperCase()}</h2>
                {creators ? (
                    <div className="performance-creators-preview">
                        <h3 className="creators-preview-title">Создатели спектакля:</h3>
                        <MarkdownRenderer 
                            content={creators}
                            className="performance-description"
                        />
                    </div>
                ) : (
                    <p className="performance-description">Информация о создателях недоступна</p>
                )}
                {quickTicketsEnabled && (
                    <div className="performance-sessions-preview">
                        <h3 className="creators-preview-title">Ближайшие показы</h3>
                        {isLoadingSessions ? (
                            <p className="performance-description">Загрузка расписания…</p>
                        ) : sessionsToShow.length > 0 ? (
                            <ul className="performance-sessions-list">
                                {sessionsToShow.map((session) => {
                                    const dateTime = formatSessionDateTime(session.timeStart);
                                    return (
                                        <li key={session.id} className="performance-session-item">
                                            <div className="session-meta">
                                                <span className="session-date">{dateTime.date}</span>
                                                <span className="session-time">{dateTime.time}</span>
                                                {session.minPrice && (
                                                    <span className="session-price">
                                                        от {Math.round(session.minPrice)} ₽
                                                    </span>
                                                )}
                                            </div>
                                            {session.url && (
                                                <a
                                                    href={session.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="session-ticket-link"
                                                >
                                                    <Button variant="secondary" size="sm">
                                                        Купить билет
                                                    </Button>
                                                </a>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="performance-description">
                                Расписание появится, как только QuickTickets опубликует продажи.
                            </p>
                        )}
                    </div>
                )}
                <a href={`/performances/${id}`}>
                    <Button variant="primary" size="md">
                        ПОДРОБНЕЕ
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default Performance;