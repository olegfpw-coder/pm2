import React, { useEffect, useState } from 'react';
import { fetchServiceData } from '../api/starpi';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Services = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchServiceData()
      .then((data) => {
        if (!isMounted) return;
        setPage(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Не удалось загрузить страницу');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div className="page-container"><p>Загрузка...</p></div>;
  if (error) return <div className="page-container"><p>{error}</p></div>;
  if (!page) return <div className="page-container"><p>Страница не найдена</p></div>;

  return (
    <div className="page-container">
      {page.title && <h1 className="page-title">{page.title}</h1>}
      {page.content ? (
        <div className="richtext">
          <MarkdownRenderer content={page.content} />
        </div>
      ) : (
        <p>Контент отсутствует</p>
      )}
    </div>
  );
};

export default Services;


