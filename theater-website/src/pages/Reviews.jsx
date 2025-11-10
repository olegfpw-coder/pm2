import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReviews, toggleReviewLike } from '../api/user';
import { fetchPerformancesData } from '../api/starpi';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Button from '../components/Button';

const Reviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedReviews, setLikedReviews] = useState(new Set());

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем спектакль
      const performances = await fetchPerformancesData();
      const foundPerformance = performances.find(p => p.id === parseInt(id));
      setPerformance(foundPerformance);

      // Загружаем рецензии
      const reviewsData = await getReviews(parseInt(id));
      setReviews(reviewsData);

      // Загружаем информацию о лайках текущего пользователя
      if (isAuthenticated && user) {
        const userLikedReviews = reviewsData
          .filter(review => {
            const likes = review.likes || [];
            return likes.some(like => {
              const likeId = typeof like === 'object' ? like.id : like;
              return likeId === user.id;
            });
          })
          .map(review => review.id);
        setLikedReviews(new Set(userLikedReviews));
      }
    } catch (error) {
      console.error('Ошибка при загрузке рецензий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const result = await toggleReviewLike(reviewId);
      if (result.success) {
        // Обновляем состояние лайков
        const newLikedReviews = new Set(likedReviews);
        if (result.liked) {
          newLikedReviews.add(reviewId);
        } else {
          newLikedReviews.delete(reviewId);
        }
        setLikedReviews(newLikedReviews);

        // Обновляем количество лайков в рецензии
        setReviews(reviews.map(review => {
          if (review.id === reviewId) {
            const currentLikes = review.likes || [];
            return {
              ...review,
              likes: result.liked 
                ? [...currentLikes, { id: user.id }]
                : currentLikes.filter(like => {
                    const likeId = typeof like === 'object' ? like.id : like;
                    return likeId !== user.id;
                  })
            };
          }
          return review;
        }));
      }
    } catch (error) {
      console.error('Ошибка при лайке рецензии:', error);
    }
  };

  if (loading) {
    return <div className="page-container"><p>Загрузка...</p></div>;
  }

  if (!performance) {
    return <div className="page-container"><p>Спектакль не найден</p></div>;
  }

  return (
    <div className="reviews-page">
      <div className="reviews-container">
        <div className="reviews-header">
          <Link to={`/performances/${id}`} className="back-link">
            ← Назад к спектаклю
          </Link>
          <h1>Рецензии на "{performance.title}"</h1>
          <Link to={`/performances/${id}`}>
            <Button variant="primary">Создать рецензию</Button>
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <Link to={`/profile`} className="review-author">
                    <div className="author-avatar">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt={review.user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {review.user?.firstName?.[0] || review.user?.username?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="author-name">
                      {review.user?.firstName && review.user?.lastName
                        ? `${review.user.firstName} ${review.user.lastName}`
                        : review.user?.username || 'Пользователь'}
                    </span>
                  </Link>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <h2 className="review-title">{review.title}</h2>
                
                <div className="review-text">
                  <MarkdownRenderer content={review.text} />
                </div>

                <div className="review-footer">
                  <button
                    className={`like-button ${likedReviews.has(review.id) ? 'liked' : ''}`}
                    onClick={() => handleLike(review.id)}
                    disabled={!isAuthenticated}
                  >
                    ❤️ {review.likes?.length || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <p>Пока нет рецензий на этот спектакль</p>
            <Link to={`/performances/${id}`}>
              <Button variant="primary">Написать первую рецензию</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;

