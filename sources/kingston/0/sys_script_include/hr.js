 /*
 * Holds constants for the HR Core application
 */
var hr = Class.create();

hr.prototype = {
    type: "hr"
};

// Log property
hr.LOG = "sn_hr_core.log";

// HR Core Application
hr.HR_CORE_APPLICATION          = "d4ac3fff5b311200a4656ede91f91af2";

// Tables
hr.TABLE_SERVICE 				= "sn_hr_core_service";
hr.TABLE_SERVICE_OPTION  		= "sn_hr_core_service_option";
hr.TABLE_CASE 					= "sn_hr_core_case";
hr.TABLE_CASE_WORKFORCE 		= "sn_hr_core_case_workforce_admin";
hr.TABLE_CHANGE 				= "sn_hr_core_case";
hr.TABLE_TASK 					= "sn_hr_core_task";
hr.TABLE_PROFILE 				= "sn_hr_core_profile";
hr.TABLE_POSITION 				= "sn_hr_core_position";
hr.TABLE_USER 					= "sys_user";
hr.TABLE_DEPARTMENT 	    	= "cmn_department";
hr.TABLE_CASE_BENEFITS          = "sn_hr_core_case_total_rewards";
hr.TABLE_CASE_RELATIONS         = "sn_hr_core_case_relations";
hr.TABLE_CASE_OPERATIONS        = "sn_hr_core_case_operations";
hr.TABLE_CASE_PAYROLL           = "sn_hr_core_case_payroll";
hr.TABLE_LIFE_CYCLE_EVENTS_CASE = "sn_hr_le_case";
hr.TABLE_LINK                   = "sn_hr_core_link";
hr.TABLE_CRITERIA_LOOKUP        = "sn_hr_core_m2m_condition_criteria";
hr.TABLE_M2M_LINK_TEMPLATE      = "sn_hr_core_m2m_link_template";
hr.TABLE_BENEFICIARY            = "sn_hr_core_beneficiary";
hr.TABLE_LE_TYPE                = "sn_hr_le_type";
hr.TABLE_ACTIVITY        		= "sn_hr_le_activity";
hr.TABLE_ACTIVITY_SET           = "sn_hr_le_activity_set";
hr.TABLE_ACTIVITY_STATUS        = "sn_hr_le_activity_status";
hr.TABLE_HR_TEMPLATE            = "sn_hr_core_template";
hr.TABLE_CASE_EXTENSIONS        = new GlideTableHierarchy(hr.TABLE_CASE).getAllExtensions();
hr.TABLE_TASK_EXTENSIONS        = new GlideTableHierarchy(hr.TABLE_TASK).getAllExtensions();

// Functional roles
hr.ROLE_ADMIN 					= "admin";
hr.ROLE_HR_ANY 			        = "sn_hr_core.";
hr.ROLE_HR_CASE_READER 			= "sn_hr_core.case_reader";
hr.ROLE_HR_CASE_WRITER 			= "sn_hr_core.case_writer";
hr.ROLE_HR_KB_WRITER 			= "sn_hr_core.kb_writer";
hr.ROLE_HR_PROFILE_READER 		= "sn_hr_core.profile_reader";
hr.ROLE_HR_PROFILE_WRITER 		= "sn_hr_core.profile_writer";
hr.ROLE_SECURE_INFO_WRITER 		= "sn_hr_core.secure_info_writer";

// New HR roles
hr.ROLE_HR_ADMIN 				= "sn_hr_core.admin";
hr.ROLE_HR_BASIC 				= "sn_hr_core.basic";

// this is the service that will be used when none are provided. For example, when creating
// a case via inbound email action. The OOB value is the 'general inquiry' service.
hr.GENERAL_SERVICE              = '6628cde49f331200d9011977677fcf0b';

// This section configures default values for "Manage HR Catalog" module.
hr.DEFAULT_SEARCH_CONTEXT		= "ff0370019f22120047a2d126c42e706f"; // Search context: HR Knowledge Base
hr.DEFAULT_VARIABLE_SET			= "d3520512537631003b8fa5f4a11c0899"; // hr_benefit_set
hr.DEFAULT_SEARCH_VARIABLE		= "a22033af53533100c0eca5f4a11c087a"; // Search variable: short description

hr.DEFAULT_WHITELIST = 'state,address,country,middle_name,zip,personal_email,city,home_phone,mobile_phone,work_phone,work_mobile';

hr.DEFAULT_HIGH_PRIORITY = 2;

//Skills
hr.SKILL_PAYROLL = '7f0370019f22120047a2d126c42e706e';

//States
hr.STATE_READY = 10;
hr.STATE_WORK_IN_PROGRESS = 18;
hr.STATE_SUSPENDED = 24;
hr.STATE_CLOSE_COMPLETE = 3;

//service name
hr.Employment_Verification_Letter = "employment_verification_letter";
hr.BULK_PARENT_CASE_SERVICE = "bulk_parent_case";
hr.ONBOARDING_REQUEST_SERVICE = "request_onboarding";

//Workflow
hr.WORKFLOW_ORDERED_TASKS = '299183662f032200a9e7a310c18c95cf';

//HR Portal Content
hr.EMAIL_CONTENT_TYPE = "dac4a34d0b00030036e62c7885673ad5";

// Called from global scope
hr.getOwnerGroups = function() {
	return new sn_hr_le.hr_ActivitySetAJAX().getOwnerGroups();
};
