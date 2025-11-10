import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFavoritePerformances, getUserReviews } from '../api/user';
import Button from '../components/Button';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Profile = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    avatar: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadUserData();
  }, [isAuthenticated, navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Загружаем избранное (уже содержит полные данные спектаклей)
      const favoritePerformances = await getFavoritePerformances();
      setFavorites(favoritePerformances);

      // Загружаем рецензии
      const userReviews = await getUserReviews(user?.id);
      setReviews(userReviews);

      // Заполняем форму данными пользователя
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          bio: user.bio || '',
          avatar: user.avatar || null,
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      setEditing(false);
      loadUserData();
    }
  };

  if (loading) {
    return <div className="page-container"><p>Загрузка...</p></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Профиль пользователя</h1>
          <Button variant="outline" onClick={logout}>
            Выйти
          </Button>
        </div>

        <div className="profile-content">
          {/* Информация о пользователе */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h2>Личная информация</h2>
              {!editing && (
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  Редактировать
                </Button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Фамилия</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>О себе (БИО)</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                  />
                </div>

                <div className="form-actions">
                  <Button type="submit" variant="primary">
                    Сохранить
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="profile-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Аватар" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName?.[0] || user.username?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="profile-details">
                  <h3>{user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username}</h3>
                  <p className="profile-username">@{user.username}</p>
                  {user.bio && (
                    <div className="profile-bio">
                      <MarkdownRenderer content={user.bio} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Избранные спектакли */}
          <div className="profile-section">
            <h2>Избранные спектакли</h2>
            {favorites.length > 0 ? (
              <div className="favorites-grid">
                {favorites.map((performance) => (
                  <Link
                    key={performance.id}
                    to={`/performances/${performance.id}`}
                    className="favorite-item"
                  >
                    {performance.image && (
                      <img src={performance.image} alt={performance.title} />
                    )}
                    <h4>{performance.title}</h4>
                  </Link>
                ))}
              </div>
            ) : (
              <p>У вас пока нет избранных спектаклей</p>
            )}
          </div>

          {/* Рецензии пользователя */}
          <div className="profile-section">
            <h2>Мои рецензии</h2>
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <Link to={`/performances/${review.performance?.id}`}>
                      <h4>{review.performance?.title}</h4>
                    </Link>
                    <h3>{review.title}</h3>
                    <MarkdownRenderer content={review.text} />
                    <div className="review-meta">
                      <span>Лайков: {review.likes?.length || 0}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>У вас пока нет рецензий</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

