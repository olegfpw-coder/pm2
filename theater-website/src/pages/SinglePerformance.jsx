import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPerformancesData } from '../api/starpi'; // Импортируем функцию для получения данных
import { findSessionsByPerformanceTitle, formatSessionDateTime } from '../api/quicktickets';
import { useAuth } from '../contexts/AuthContext';
import { addToFavorites, removeFromFavorites, checkIsFavorite, getReviews } from '../api/user';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ImageModal from '../components/ImageModal';
import Button from '../components/Button';
import CreateReviewModal from '../components/CreateReviewModal';
// Стили импортируются в main.css

    // ID или алиас организации в QuickTickets (можно вынести в .env)
    // Если не указан, будет использоваться поиск по всем организациям
    const QUICKTICKETS_ORGANISATION_ID = process.env.REACT_APP_QUICKTICKETS_ORG_ID || null;
    const QT_PROXY = process.env.REACT_APP_QT_PROXY_URL || null;

const SinglePerformance = () => {
    const { id } = useParams(); // Получаем ID спектакля из URL
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [performance, setPerformance] = useState(null); // Состояние для хранения спектакля
    const [sessions, setSessions] = useState([]); // Состояние для хранения сеансов из QuickTickets
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [loadingSessions, setLoadingSessions] = useState(false); // Загрузка сеансов
    const [error, setError] = useState(null); // Состояние для отслеживания ошибок
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Индекс выбранного изображения
    const [isFavoritePerformance, setIsFavoritePerformance] = useState(false); // Состояние избранного
    const [reviewsCount, setReviewsCount] = useState(0); // Количество рецензий
    const [showCreateReviewModal, setShowCreateReviewModal] = useState(false); // Модальное окно создания рецензии

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadPerformanceData = async () => {
            try {
                const performancesData = await fetchPerformancesData();
                const selectedPerformance = performancesData.find((item) => item.id === parseInt(id));
                if (selectedPerformance) {
                    setPerformance(selectedPerformance);
                    
                    // Проверяем, находится ли спектакль в избранном
                    if (isAuthenticated) {
                        checkFavoriteStatus(selectedPerformance.id);
                        loadReviewsCount(selectedPerformance.id);
                    }
                    
                    // Загружаем сеансы из QuickTickets API
                    // Разрешаем два режима: через прокси (QT_PROXY) или прямой (по токенам)
                    const hasApiTokens = Boolean(process.env.REACT_APP_QUICKTICKETS_API_TOKEN) && 
                                         Boolean(process.env.REACT_APP_QUICKTICKETS_API_SALT);
                    const canUseQuickTickets = Boolean(QT_PROXY) || hasApiTokens;
                    
                    if (canUseQuickTickets && selectedPerformance.title) {
                        setLoadingSessions(true);
                        try {
                            console.log('Загрузка сеансов для спектакля:', selectedPerformance.title);
                            console.log('Organisation ID:', QUICKTICKETS_ORGANISATION_ID || 'не указан (будет поиск по всем)');
                            
                            const sessionsData = await findSessionsByPerformanceTitle(
                                QUICKTICKETS_ORGANISATION_ID || null,
                                selectedPerformance.title
                            );
                            
                            console.log('Найдено сеансов:', sessionsData.length);
                            setSessions(sessionsData);
                            
                            if (sessionsData.length === 0) {
                                console.warn('Сеансы не найдены. Проверьте:');
                                console.warn('1. Название спектакля в Strapi совпадает с названием в QuickTickets');
                                console.warn('2. У мероприятия есть опубликованные сеансы с включенными онлайн продажами');
                            }
                        } catch (sessionsError) {
                            console.error('Ошибка при загрузке сеансов из QuickTickets:', sessionsError);
                            console.error('Детали ошибки:', sessionsError.response?.data || sessionsError.message);
                        } finally {
                            setLoadingSessions(false);
                        }
                    } else if (!canUseQuickTickets) {
                        console.warn('QuickTickets: ни прокси (REACT_APP_QT_PROXY_URL), ни токены не настроены.');
                    }
                } else {
                    setError('Спектакль не найден.');
                }
            } catch (error) {
                console.error('Не удалось загрузить спектакль:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            } finally {
                setLoading(false); // Завершаем загрузку
            }
        };
        loadPerformanceData();
    }, [id]);

    // Функция для открытия модального окна с изображением
    const openImageModal = (index) => {
        setSelectedImageIndex(index);
        setIsModalOpen(true);
    };

    // Функция для закрытия модального окна
    const closeImageModal = () => {
        setIsModalOpen(false);
    };

    // Проверка статуса избранного
    const checkFavoriteStatus = async (performanceId) => {
        try {
            const favorite = await checkIsFavorite(performanceId);
            setIsFavoritePerformance(favorite);
        } catch (error) {
            console.error('Ошибка при проверке избранного:', error);
        }
    };

    // Загрузка количества рецензий
    const loadReviewsCount = async (performanceId) => {
        try {
            const reviews = await getReviews(performanceId);
            setReviewsCount(reviews.length);
        } catch (error) {
            console.error('Ошибка при загрузке количества рецензий:', error);
        }
    };

    // Переключение избранного
    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            if (isFavoritePerformance) {
                await removeFromFavorites(performance.id);
                setIsFavoritePerformance(false);
            } else {
                await addToFavorites(performance.id);
                setIsFavoritePerformance(true);
            }
        } catch (error) {
            console.error('Ошибка при изменении избранного:', error);
        }
    };

    // Обработка создания рецензии
    const handleCreateReview = () => {
        if (!isAuthenticated) {
            alert('Для создания рецензии необходимо войти в систему');
            navigate('/login');
            return;
        }
        setShowCreateReviewModal(true);
    };

    // Обработка успешного создания рецензии
    const handleReviewCreated = () => {
        setShowCreateReviewModal(false);
        loadReviewsCount(performance.id);
    };

    return (
        <div className="single-performance-page">

            {/* Основной контент */}
            <main className="single-performance-container">
                {loading && <p>Загрузка спектакля...</p>}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {performance && (
                    <div>
                        <h2>{performance.title.toUpperCase()}</h2>
                        <img src={performance.image} alt={`Обложка спектакля ${performance.title}`} />
                        <MarkdownRenderer 
                            content={performance.description} 
                            className="performance-description"
                        />

                        {/* Блоки создателей и исполнителей */}
                        {(performance.creators || performance.cast) && (
                            <div className="performance-creators-cast">
                                {performance.creators && (
                                    <div className="performance-creators">
                                        <h3>Создатели спектакля</h3>
                                        <MarkdownRenderer 
                                            content={performance.creators} 
                                            className="creators-content"
                                        />
                                    </div>
                                )}
                                {performance.cast && (
                                    <div className="performance-cast">
                                        <h3>Действующие лица и исполнители</h3>
                                        <MarkdownRenderer 
                                            content={performance.cast} 
                                            className="cast-content"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Блок с датами и кнопками продажи билетов */}
                        {sessions.length > 0 && (
                            <div className="performance-sessions">
                                <h3>Ближайшие показы</h3>
                                <div className="sessions-list">
                                    {sessions.map((session) => {
                                        const dateTime = formatSessionDateTime(session.timeStart);
                                        return (
                                            <div key={session.id} className="session-item">
                                                <div className="session-info">
                                                    <div className="session-date-time">
                                                        <span className="session-date">{dateTime.date}</span>
                                                        <span className="session-time">{dateTime.time}</span>
                                                    </div>
                                                    {session.hall && (
                                                        <div className="session-hall">Зал: {session.hall.name}</div>
                                                    )}
                                                    {session.minPrice && (
                                                        <div className="session-price">
                                                            Цена: {session.minPrice === session.maxPrice 
                                                                ? `${session.minPrice} ₽`
                                                                : `${session.minPrice} - ${session.maxPrice} ₽`
                                                            }
                                                        </div>
                                                    )}
                                                    {session.pushkincard && (
                                                        <div className="session-pushkincard">💳 Пушкинская карта</div>
                                                    )}
                                                </div>
                                                {session.url && (
                                                    <a 
                                                        href={session.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="session-ticket-link"
                                                    >
                                                        <Button variant="primary" size="md">
                                                            Купить билет
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {loadingSessions && (
                            <div className="sessions-loading">
                                <p>Загрузка расписания из QuickTickets...</p>
                            </div>
                        )}


                        {/* Галерея изображений */}
                        {performance.gallery.length > 0 && (
                            <div className="performance-gallery">
                                <h3>Галерея изображений</h3>
                                <div className="mini-gallery-images">
                                    {performance.gallery.map((imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`Изображение ${index + 1}`}
                                            className="mini-gallery-image"
                                            onClick={() => openImageModal(index)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Блок с действиями пользователя */}
                        <div className="performance-actions">
                            <div className="action-buttons">
                                <button
                                    className={`favorite-button ${isFavoritePerformance ? 'active' : ''}`}
                                    onClick={handleToggleFavorite}
                                    title={isFavoritePerformance ? 'Удалить из избранного' : 'Добавить в избранное'}
                                >
                                    {isFavoritePerformance ? '❤️' : '🤍'} {isFavoritePerformance ? 'В избранном' : 'В избранное'}
                                </button>
                                
                                <Button
                                    variant="primary"
                                    onClick={handleCreateReview}
                                >
                                    Создать рецензию
                                </Button>
                                
                                <Link to={`/performances/${id}/reviews`}>
                                    <Button variant="secondary">
                                        Посмотреть рецензии ({reviewsCount})
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно для просмотра изображений */}
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={closeImageModal}
                    images={performance?.gallery || []}
                    currentIndex={selectedImageIndex}
                    title={`Галерея спектакля "${performance?.title || ''}"`}
                />

                {/* Модальное окно создания рецензии */}
                {showCreateReviewModal && performance && (
                    <CreateReviewModal
                        performanceId={performance.id}
                        performanceTitle={performance.title}
                        onClose={() => setShowCreateReviewModal(false)}
                        onSuccess={handleReviewCreated}
                    />
                )}
            </main>

        </div>
    );
};

export default SinglePerformance;