import React, { useEffect, useState } from 'react';
import { fetchDocumentsList } from '../api/starpi';

const Documents = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docs, setDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchDocumentsList()
      .then((list) => {
        if (!isMounted) return;
        setDocs(list || []);
        // Создаем пагинацию на клиенте
        const totalPages = Math.ceil((list || []).length / itemsPerPage);
        setPagination({
          page: currentPage,
          pageSize: itemsPerPage,
          pageCount: totalPages,
          total: (list || []).length
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Не удалось загрузить документы');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  // Получаем документы для текущей страницы
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocs = docs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="page-container"><p>Загрузка...</p></div>;
  if (error) return <div className="page-container"><p>{error}</p></div>;

  return (
    <div className="news-page">
      <div className="news-container">
        <h1>Документы</h1>
        {docs.length === 0 ? (
          <p>Документы отсутствуют</p>
        ) : (
          <>
            <div className="news-list">
              {currentDocs.map((d) => (
                <div key={d.id} className="news-item">
                  <div className="news-content">
                    <div className="news-header">
                      {d.date && <span className="news-date">{new Date(d.date).toLocaleDateString()}</span>}
                      <h2 className="news-title">{d.title || 'Документ'}</h2>
                    </div>
                    {d.description && <div className="news-description">{d.description}</div>}
                    <div className="news-actions" style={{display:'flex', gap:'12px'}}>
                      <a className="btn btn--primary documents-view-btn" href={d.url} target="_blank" rel="noopener noreferrer">Просмотреть</a>
                      <button className="btn btn--secondary" onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const resp = await fetch(d.url);
                          const blob = await resp.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = (d.title || 'document') + '.pdf';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (_) {
                          window.location.href = d.url; // fallback
                        }
                      }}>Скачать</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {pagination && pagination.pageCount > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Назад
                </button>
                {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page ? 'active' : ''}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pageCount}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Documents;


