import React, { useEffect, useState } from 'react';
import { fetchPerformancesData, BASE_URL } from '../api/starpi';
import {
  findSessionsByPerformanceTitle,
  formatSessionDateTime,
} from '../api/quicktickets';
import Button from './Button';

// тот же orgId, что и в SinglePerformance
const QUICKTICKETS_ORG_ID = process.env.REACT_APP_QUICKTICKETS_ORG_ID || null;

// флаг, что QuickTickets вообще доступен (прокси или прямые токены)
const QT_PROXY = process.env.REACT_APP_QT_PROXY_URL || null;
const HAS_QT_TOKENS =
  !!process.env.REACT_APP_QUICKTICKETS_API_TOKEN &&
  !!process.env.REACT_APP_QUICKTICKETS_API_SALT;
const CAN_USE_QUICKTICKETS = !!(QT_PROXY || HAS_QT_TOKENS);

const UpcomingShows = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // если QuickTickets недоступен – просто ничего не показываем
        if (!CAN_USE_QUICKTICKETS) {
          setPerformances([]);
          return;
        }

        // 1) забираем спектакли из Strapi
        const strapiPerformances = await fetchPerformancesData();

        // 2) для каждого пытаемся найти сеансы в QuickTickets
        const withSessionsPromises = strapiPerformances.map(async (perf) => {
          const sessions = await findSessionsByPerformanceTitle(
            QUICKTICKETS_ORG_ID,
            perf.title
          );

          if (!sessions || sessions.length === 0) {
            return null; // для этого спектакля нет будущих сеансов
          }

          const upcomingDates = sessions.slice(0, 3).map((s) => {
            const dt = formatSessionDateTime(s.timeStart);
            return {
              date: dt.date,
              time: dt.time,
              ticketLink: s.url,
            };
          });

          return {
            id: perf.id,
            title: perf.title,
            image: perf.image,
            dates: upcomingDates,
            firstTimestamp: sessions[0].timeStart,
          };
        });

        const withSessions = await Promise.all(withSessionsPromises);
        const filtered = withSessions.filter(Boolean);

        if (!filtered.length) {
          setPerformances([]);
          return;
        }

        const sorted = filtered
          .sort((a, b) => a.firstTimestamp - b.firstTimestamp)
          .slice(0, 3);

        setPerformances(sorted);
      } catch (e) {
        console.error('Ошибка при загрузке ближайших спектаклей:', e);
        setError('Не удалось загрузить ближайшие спектакли.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resolveUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img.startsWith('http') ? img : `${BASE_URL}${img}`;
    if (img.url) return img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`;
    const attrUrl = img.data?.attributes?.url;
    if (attrUrl) return attrUrl.startsWith('http') ? attrUrl : `${BASE_URL}${attrUrl}`;
    const fmts = img.data?.attributes?.formats;
    if (fmts) {
      const order = ['large', 'medium', 'small', 'thumbnail'];
      for (const key of order) {
        const u = fmts[key]?.url;
        if (u) return u.startsWith('http') ? u : `${BASE_URL}${u}`;
      }
    }
    return null;
  };

  return (
    <section className="upcoming-shows">
      <h2 className="shows-h2">Ближайшие спектакли театра</h2>

      {loading && <p>Загрузка ближайших спектаклей…</p>}
      {!loading && error && <p style={{ color: '#b22727' }}>{error}</p>}

      {!loading && !error && performances.length === 0 && (
        <p>Сейчас нет ближайших спектаклей.</p>
      )}

      {!loading && !error && performances.length > 0 && (
        <div className="shows-grid">
          {performances.map((performance) => (
            <div key={performance.id} className="show">
              <img src={resolveUrl(performance.image)} alt={performance.title} />
              <h3>{performance.title}</h3>
              <div className="dates-list">
                {performance.dates.map((dateObj, index) => (
                  <div key={index} className="date-item">
                    <p>
                      {dateObj.date} ({dateObj.time})
                    </p>
                    <a
                      href={dateObj.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" size="sm">
                        Купить билет
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UpcomingShows;
