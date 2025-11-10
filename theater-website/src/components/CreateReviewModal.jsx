import React, { useState } from 'react';
import { createReview } from '../api/user';
import Button from './Button';

const CreateReviewModal = ({ performanceId, performanceTitle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    rating: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.text.trim()) {
      setError('Заполните все обязательные поля');
      return;
    }

    setLoading(true);

    try {
      await createReview(performanceId, formData.title, formData.text, formData.rating);
      onSuccess();
    } catch (error) {
      console.error('Ошибка при создании рецензии:', error);
      setError(error.response?.data?.error?.message || 'Ошибка при создании рецензии');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать рецензию на "{performanceTitle}"</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="review-title">Название рецензии *</label>
            <input
              type="text"
              id="review-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Краткое название вашей рецензии"
            />
          </div>

          <div className="form-group">
            <label htmlFor="review-text">Текст рецензии *</label>
            <textarea
              id="review-text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              required
              rows={10}
              placeholder="Опишите ваши впечатления от спектакля..."
            />
            <small>Поддерживается Markdown форматирование</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Создание...' : 'Опубликовать рецензию'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewModal;

