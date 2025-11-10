/**
 * QuickTickets proxy controller
 */

const BASE_URL = 'https://api2.quicktickets.ru/afisha/v2';

// sha256 helper
const sha256hex = (str: string) => require('crypto').createHash('sha256').update(str, 'utf8').digest('hex');

// Алгоритм подписи из рабочего примера пользователя:
// - берём все параметры (кроме signature), сортируем ключи по алфавиту
// - конкатенируем ИМЕННО ЗНАЧЕНИЯ в порядке ключей через ';' (массив → значения через ',')
// - добавляем в конец ';' + sha256(SALT)
// - берём sha256 от всей строки
const makeSignature = (params: Record<string, any>, salt: string) => {
	const p = { ...params };
	delete (p as any).signature;
	const keys = Object.keys(p).sort((a, b) => a.localeCompare(b, 'en'));
	const values = keys.map((k) => {
		const v = (p as any)[k];
		if (Array.isArray(v)) return v.join(',');
		if (v === null || typeof v === 'undefined') return '';
		return String(v);
	});
	const base = `${values.join(';')};${sha256hex(salt)}`;
	return sha256hex(base);
};

// Сборка querystring как в примере: массивы → key[]=v для каждого значения
const buildQueryString = (params: Record<string, any>) => {
	const qs = new URLSearchParams();
	for (const k of Object.keys(params)) {
		const v = (params as any)[k];
		if (Array.isArray(v)) {
			for (const it of v) qs.append(`${k}[]`, String(it));
		} else {
			qs.append(k, String(v));
		}
	}
	return qs.toString();
};

const callQt = async (resourcePath: string, params: Record<string, any>, token: string, salt: string) => {
	const signature = makeSignature(params, salt);
	const withSig = { ...params, signature };
	const url = `${BASE_URL}${resourcePath}?${buildQueryString(withSig)}`;
	if (process.env.NODE_ENV !== 'production') {
		console.log(`[QT PROXY] URL ${url}`);
	}
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});
	if (!res.ok) {
		const text = await res.text();
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`[QT PROXY] status=${res.status} body=${text}`);
		}
		const err = new Error(`QT ${resourcePath} failed: ${res.status} ${text}`);
		(err as any).status = res.status;
		throw err;
	}
	const ct = res.headers.get('content-type') || '';
	return ct.includes('application/json') ? res.json() : res.text();
};

const applyDefaultOrg = (q: Record<string, any>) => {
	const params = { ...q };
	const hasOrg = params.organisationId || params.organisationAlias;
	if (!hasOrg) {
		const orgEnv = process.env.QUICKTICKETS_ORG_ID;
		if (orgEnv) {
			if (/^\d+$/.test(orgEnv)) {
				(params as any).organisationId = Number(orgEnv);
			} else {
				(params as any).organisationAlias = orgEnv;
			}
		}
	}
	return params;
};

export default () => ({
	async organisationList(ctx) {
		const token = process.env.QUICKTICKETS_API_TOKEN;
		const salt = process.env.QUICKTICKETS_API_SALT;
		if (!token || !salt) {
			ctx.throw(500, 'QuickTickets server credentials are not configured');
		}
		try {
			const params = ctx.request.query || {};
			const data = await callQt('/organisation/list', params as any, token, salt);
			ctx.body = data;
		} catch (e: any) {
			ctx.status = e?.status || 500;
			ctx.body = { error: e?.message || 'QuickTickets proxy error' };
		}
	},

	async eventList(ctx) {
		const token = process.env.QUICKTICKETS_API_TOKEN;
		const salt = process.env.QUICKTICKETS_API_SALT;
		if (!token || !salt) {
			ctx.throw(500, 'QuickTickets server credentials are not configured');
		}
		try {
			const query = ctx.request.query || {};
			const params = applyDefaultOrg(query as any);
			const data = await callQt('/event/list', params as any, token, salt);
			ctx.body = data;
		} catch (e: any) {
			ctx.status = e?.status || 500;
			ctx.body = { error: e?.message || 'QuickTickets proxy error' };
		}
	},

	async sessionList(ctx) {
		const token = process.env.QUICKTICKETS_API_TOKEN;
		const salt = process.env.QUICKTICKETS_API_SALT;
		if (!token || !salt) {
			ctx.throw(500, 'QuickTickets server credentials are not configured');
		}
		try {
			const query = ctx.request.query || {};
			const params = applyDefaultOrg(query as any);
			const data = await callQt('/session/list', params as any, token, salt);
			ctx.body = data;
		} catch (e: any) {
			ctx.status = e?.status || 500;
			ctx.body = { error: e?.message || 'QuickTickets proxy error' };
		}
	},
});


