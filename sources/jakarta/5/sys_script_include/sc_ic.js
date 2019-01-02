var sc_ic = Class.create();
sc_ic.prototype = {
    initialize: function() {
    },

    type: 'sc_ic'
};

sc_ic.FACTORY_LOG_LEVEL = "com.glide.servicecatalog.item_creator.factory.log";
sc_ic.LOG_LEVEL = "com.glide.servicecatalog.item_creator.log";

// Tables
sc_ic.ITEM_STAGING = "sc_ic_item_staging";
sc_ic.APRVL_TYPE_DEFN_STAGING = "sc_ic_aprvl_type_defn_staging";
sc_ic.APRVL_TYPE_DEFN = "sc_ic_aprvl_type_defn";
sc_ic.APRVL_DEFN_STAGING = "sc_ic_aprvl_defn_staging";
sc_ic.APRVL_DEFN = "sc_ic_aprvl_defn";
sc_ic.APRVL_DEFN_STAGING = "sc_ic_aprvl_defn_staging"
sc_ic.REQ_ITEM_APRVL_DEFN = "sc_ic_req_item_aprvl_defn";
sc_ic.QUESTION = "sc_ic_question";
sc_ic.QUESTION_CHOICE = "sc_ic_question_choice";
sc_ic.QUESTION_TYPE = "sc_ic_question_type";
sc_ic.QUESTION_TYPE_CHOICE = "sc_ic_question_type_choice";
sc_ic.QUESTION_CLASS = "sc_ic_question_class";
sc_ic.SECTION = "sc_ic_section";
sc_ic.COLUMN = "sc_ic_column";

sc_ic.TASK_DEFN_STAGING = "sc_ic_task_defn_staging";
sc_ic.TASK_DEFN = "sc_ic_task_defn";
sc_ic.REQ_ITEM_TASK_DEFN = "sc_ic_req_item_task_defn";
sc_ic.TASK_ASSIGN_DEFN_STAGING = "sc_ic_task_assign_defn_staging";
sc_ic.TASK_ASSIGN_DEFN = "sc_ic_task_assign_defn";

sc_ic.CATEGORY_REQUEST = "sc_ic_category_request";

// Fieldnames
sc_ic.STATE = "state";
sc_ic.TYPE = "type";
sc_ic.USERS = "users";
sc_ic.GROUPS = "groups";
sc_ic.SCRIPT_OUTPUT = "script_output";
sc_ic.APPROVER_SCRIPT = "approver_script";
sc_ic.VERSION = "version";
sc_ic.VAR_DEFN_CHANGED = "var_defn_changed";
sc_ic.VAR_META_CHANGED = "var_meta_changed";
sc_ic.APRVL_DEFN_CHANGED = "aprvl_defn_changed";
sc_ic.TASK_DEFN_CHANGED = "task_defn_changed";
sc_ic.LAYOUT_CHANGED = "layout_changed";
sc_ic.DESKTOP_IMAGE = "desktop_image";
sc_ic.MOBILE_IMAGE = "mobile_image";
sc_ic.DETAIL = "detail";
sc_ic.INDEX = "index";
sc_ic.PRECONFIGURED = "preconfigured";
sc_ic.PRECONFIGURED_ONLY = "preconfigured_only";
sc_ic.BASE_TYPE = "base_type";
sc_ic.ORDER = "order";
sc_ic.QUESTION_TEXT = "question_text";
sc_ic.TEXT = "text";
sc_ic.ITEM_TYPE = "item_type";
sc_ic.MANAGER = "manager";
sc_ic.EDITORS = "editors";
sc_ic.CATALOGS = "sc_catalogs";
sc_ic.CATEGORIES = "sc_categories";
sc_ic.COMMENTS = "comments";

// Roles
sc_ic.CATALOG_ITEM_DESIGNER = "catalog_item_designer";
sc_ic.CATALOG_MANAGER = "catalog_manager";
sc_ic.CATALOG_EDITOR = "catalog_editor";

// states
sc_ic.DRAFT = "draft";
sc_ic.AWAITING_APPROVAL = "awaiting_approval";
sc_ic.READY_TO_PUBLISH = "ready_to_publish";
sc_ic.STAGED = "staged";
sc_ic.PUBLISHED = "published";
sc_ic.EXPIRED = "expired";

sc_ic.REQUESTED = "requested";
sc_ic.CREATED = "created";
sc_ic.REJECTED = "rejected";

sc_ic.CLOSED_INCOMPLETE = 4;
sc_ic.CLOSED_SKIPPED = 7;


// Choice values
sc_ic.USER = "user";
sc_ic.GROUP = "group";
sc_ic.SCRIPT = "script";
sc_ic.PREDEFINED_APPROVAL = "predefined_approval";

sc_ic.DIRECT_ASSIGNMENT = "direct";
sc_ic.SCRIPTED_ASSIGNMENT = "scripted";
sc_ic.CUSTOM_ASSIGNMENT = "custom_assignment";
sc_ic.PREDEFINED_ASSIGNMENT = "predefined_assignment";

// Variable names
sc_ic.WORKFLOW_CURRENT_SEQUENCE = "current_sequence";

// Simple Item workflow sys_id
sc_ic.WORKFLOW_ID = "9f80f730c30311003d2ae219cdba8f7b";
