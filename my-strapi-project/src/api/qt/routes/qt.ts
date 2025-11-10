/**
 * QuickTickets proxy routes
 */

export default {
	routes: [
		{
			method: 'GET',
			path: '/qt/organisation/list',
			handler: 'qt.organisationList',
			config: {
				policies: [],
				auth: false,
			},
		},
		{
			method: 'GET',
			path: '/qt/event/list',
			handler: 'qt.eventList',
			config: {
				policies: [],
				auth: false,
			},
		},
		{
			method: 'GET',
			path: '/qt/session/list',
			handler: 'qt.sessionList',
			config: {
				policies: [],
				auth: false,
			},
		},
	],
};


