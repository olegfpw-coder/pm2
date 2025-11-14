require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE;
const TOKEN = process.env.TOKEN;
const SALT = process.env.SALT;

// helper: sha256 hex
function sha256hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * Формирование signature по документации:
 * - Берём все параметры запроса (кроме signature), сортируем имена по алфавиту
 * - Конкатенируем их **значения** в порядке этих имен через ';'
 *   Если значение — массив, объединяем его значения через ','
 * - Добавляем в конец sha256(SALT)
 * - Берём sha256(получившейся строки)
 */
function makeSignature(params = {}) {
  // clone and remove signature if present
  const p = {...params};
  delete p.signature;

  // sort keys alphabetically
  const keys = Object.keys(p).sort((a,b) => a.localeCompare(b, 'en'));
  const values = keys.map(k => {
    const v = p[k];
    if (Array.isArray(v)) return v.join(',');
    if (v === null || v === undefined) return '';
    return String(v);
  });
  const base = values.join(';') + ';' + sha256hex(SALT);
  return sha256hex(base);
}

/**
 * Прокси-эндпоинт: принимает JSON { path: "event/list", params: { organisationId: 123, ... } }
 * Формирует подпись (если требуется) и делает GET или POST к API партнёра.
 */
app.post('/api/proxy', async (req, res) => {
  try {
    const { path, params = {}, method = 'GET' } = req.body;
    if (!path) return res.status(400).json({ error: 'missing path' });

    // добавляем signature (если salt есть) — можно сделать условие, но безопасно всегда формировать
    const signature = makeSignature(params);
    const paramsWithSig = { ...params, signature };

    // build querystring for GET
    let url = `${API_BASE}/${path}`;
    let fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    };

    if (fetchOptions.method === 'GET') {
      const qs = new URLSearchParams();
      for (const k of Object.keys(paramsWithSig)) {
        const v = paramsWithSig[k];
        if (Array.isArray(v)) {
          for (const it of v) qs.append(k+'[]', String(it));
        } else {
          qs.append(k, String(v));
        }
      }
      url = `${url}?${qs.toString()}`;
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(paramsWithSig);
    }

    const r = await fetch(url, fetchOptions);
    const text = await r.text();
    // пробуем распарсить JSON
    try { 
      const json = JSON.parse(text);
      res.status(r.status).json(json);
    } catch(e) {
      res.status(r.status).send(text);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
});
