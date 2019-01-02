angular.module("sn.change_management.cab.core", [])
	.constant('CAB', {
		FOCUS_TO_CHANGE_TAB: 'cab_change_tab:focus',
		AGENDA_ITEM: 'cab_agenda_item',
		DEFINITION: 'cab_definition',
		MEETING: 'cab_meeting',
		ATTENDEE: 'cab_attendee',
		RUNTIME_STATE: 'cab_runtime_state',
		CHANGE_REQUEST: 'change_request',
		AGENDA_SERVICE: '/api/sn_change_cab/cab/agenda/',
		APPROVAL_SERVICE: '/api/sn_change_cab/cab/approval/',
		ATTENDEE_SERVICE: '/api/sn_change_cab/cab/attendee/',
		SERVICE: {
			RUNTIME: '/api/sn_change_cab/cab/runtime_state/',
			AGENDA: '/api/sn_change_cab/cab/agenda/',
			APPROVAL: '/api/sn_change_cab/cab/approval/',
			ATTENDEE: '/api/sn_change_cab/cab/attendee/',
			HOST_MEETING:'/api/sn_change_cab/cab/runtime_state/change_host/',
			MEETING_CALENDAR: '/api/sn_change_cab/cab/meeting/calendar/'
		},
		PORTAL: {'ID': 'cab_workbench', 'SUFFIX': 'cab'},
		PORTAL_PREFIX: 'cab',
		PORTAL_ID: 'cab_workbench',
		WORKBENCH: 'cab_workbench',
		CALENDAR: 'cab_calendar',
		PENDING: 'pending',
		IN_PROGRESS: 'in_progress',
		COMPLETE: 'complete',
		CANCELED: 'canceled',
		PAUSED: 'paused',
		ACTION_PAUSE: 'current_agenda_action_pause',
		ACTION_RESUME: 'current_agenda_action_resume',
		ACTION_NEXT: 'current_agenda_action_next',
		ACTION_FINISH: 'current_agenda_action_finish',
		ACTION_DUMMY: 'dummy',
		ACTION_APPROVE: 'current_agenda_action_approve',
		ACTION_REJECT: 'current_agenda_action_reject',
		ACTION_CURRENT_AGENDA_ITEM: 'current_agenda_item'
	})
	.constant('MTG', {
		AGENDA_ITEM: 'mtg_agenda_item',
		ATTENDEE: 'mtg_attendee',
		DEFINITION: 'mtg_definition',
		MEETING: 'mtg_meeting',
		RUNTIME_STATE: 'mtg_runtime_state'
	});