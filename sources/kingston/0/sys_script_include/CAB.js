var CAB = Class.create();

// Tables
CAB.DEFINITION = "cab_definition";
CAB.CHANGE = "change_request";
CAB.MEETING = "cab_meeting";
CAB.AGENDA_ITEM = "cab_agenda_item";
CAB.ATTENDEE = "cab_attendee";
CAB.RUNTIME_STATE = "cab_runtime_state";
CAB.AGENDA_DECISION = {
	APPROVED: 'approved',
	REJECTED:'rejected'
};
CAB.AGENDA_STATE = {
	NO_DECISION: 'no_decision'
};

CAB.MEETING_STATE = {
	PENDING: 'pending',
	IN_PROGRESS: 'in_progress',
	COMPLETE: 'complete',
	CANCELED: 'canceled',
};

// Roles
CAB.MANAGER = "sn_change_cab.cab_manager";

// Fields copied between cab definition and meeting
CAB.COPY_FIELDS = ["name",
				   "locations",
				   "manager",
				   "conference_details",
				   "board_members",
				   "board_groups",
				   "delegates",
				   "time_per_agenda_item",
				   "change_condition",
                   "table_name",
				   "notification_lead_time",
				   "complete_preapproved_changes",
				   "auto_add_agenda_decisions"
				  ];

// Choices
//  - CAB Attendee.Reason
CAB.REASON = {CAB_MANAGER: "cab_manager",
			  CAB_BOARD: "cab_board",
			  ATTENDEE: "attendee"};

// Portal
CAB.PORTAL = {"ID": "cab_workbench", "SUFFIX": "cab"};
CAB.WORKBENCH = "cab_workbench";
CAB.CALENDAR = "cab_calendar";

CAB.prototype = Object.extendsObject(CABSNC, {

    type: 'CAB'
});