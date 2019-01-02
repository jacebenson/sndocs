var hrIntegrations = Class.create();
hrIntegrations.prototype = {
    initialize: function() {
    },

    type: 'hrIntegrations'
};

hrIntegrations.INTEGRATION_WORKFLOW = "e7f1074c9f6322003be01050a57fcf6e";

hrIntegrations.CHANGE_LEGAL_NAME_OUT_SERVICE_ID = "2441afe59f3832003be01050a57fcfc8";
hrIntegrations.MAINTAIN_CONTACT_INFORMATION_SERVICE_ID = "6248dbf49fc532003be01050a57fcf6d";

hrIntegrations.WORKDAY_SOURCE_NAME = "Workday";
hrIntegrations.SUCCESSFACTOR_SOURCE_NAME = "SuccessFactors";

hrIntegrations.SUCCESSFACTOR_JOB_NAME = "HR Integrations-SuccessFactors Sync";
hrIntegrations.WORKDAY_JOB_NAME = "HR Integrations-Workday Sync";

hrIntegrations.LAST_SYNC_DATE = "last_sync_date";
hrIntegrations.CURRENT_SYNC_DATE = "current_sync_date";
hrIntegrations.CURRENT_EXTERNAL_SERVER_TIME = "current_external_server_time";

hrIntegrations.HR_INT_LOADER_LOG = "sn_hr_integrations_loader";
hrIntegrations.HR_INT_TRANSFORMER_LOG = "sn_hr_integrations_transform";
hrIntegrations.HR_INT_SCHEDULER_LOG = "sn_hr_integrations_scheduler";
hrIntegrations.HR_INT_INBOUND_API_LOG = "sn_hr_integrations_inbound_api";

hrIntegrations.HR_PROFILE_TABLE = "sn_hr_core_profile";
hrIntegrations.SYS_ISET_TABLE = "sys_import_set";
hrIntegrations.SYS_ISET_ROW_TABLE = "sys_import_set_row";
hrIntegrations.SYS_USER_TABLE = "sys_user";
hrIntegrations.LOCATION_TABLE = "cmn_location";
hrIntegrations.DEPARTMENT_TABLE = "cmn_department";
hrIntegrations.JOB_PROFILE_TABLE = "sn_hr_core_job_profile";
hrIntegrations.JOB_TRACKER_TABLE = "sn_hr_integrations_job_tracker";
hrIntegrations.SERVICE_JOB_TRACKER_TABLE = "sn_hr_integrations_service_job_tracker";
hrIntegrations.ADDITIONAL_INPUTS = "sn_hr_integrations_additional_inputs";

hrIntegrations.CORRELATION_ID = "correlation_id";
hrIntegrations.EXT_INT_SERVICE_TYPE = "POST";

hrIntegrations.HR_WORKER_STAGING = "sn_hr_integrations_worker_profile";
hrIntegrations.HR_INT_SOURCE_PROPERTIES ="sn_hr_integrations_source_properties";
hrIntegrations.HR_INT_SOURCE ="sn_hr_integrations_source";
hrIntegrations.HR_INT_OUT_SOURCE ="sn_hr_integrations_outbound_service";
hrIntegrations.HR_INT_SERVICE_MAPPING ='sn_hr_integrations_service_mapping';
hrIntegrations.HR_INT_OUT_SOURCE_TRIGGER ="sn_hr_integrations_outbound_service_trigger";

hrIntegrations.HR_INT_EXTERNAL_INTERFACE ='sn_hr_integrations_external_interface';

hrIntegrations.HR_INT_ENABLE_PUSH = "sn_hr_integrations.enable_push";
hrIntegrations.HR_INT_DRY_RUN = "sn_hr_integrations.dryrun";
hrIntegrations.HR_INT_DEBUG = "sn_hr_integrations.debug";
hrIntegrations.HR_ENABLE_AUTO_UPDATE = "sn_hr_integrations.enable_auto_update";

hrIntegrations.SUCCESS = "Success";
hrIntegrations.FAIL = "Fail";

