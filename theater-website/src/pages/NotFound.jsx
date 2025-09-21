// pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Страница не найдена</h1>
            <p>К сожалению, запрашиваемая страница отсутствует.</p>
            <Link to="/">Вернуться на главную</Link>
        </div>
    );
};

export default NotFound;