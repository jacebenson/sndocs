var sc_ = Class.create();
sc_.prototype = {
    initialize: function() {
    },

    type: 'sc_'
};

sc_.LOG_LEVEL = "com.glide.servicecatalog.log";

// Tables
sc_.CATEGORY = "sc_category";
sc_.CATALOG = "sc_catalog";
sc_.CATALOG_ITEM = "sc_cat_item";
sc_.CATALOG_ITEM_PRODUCER = "sc_cat_item_producer";
sc_.CATALOG_ITEM_PRODUCER_SERVICE = "sc_cat_item_producer_service";
sc_.CATALOG_ITEM_CATEGORY = "sc_cat_item_category";
sc_.REQUESTED_ITEM = "sc_req_item";
sc_.USER = "sys_user";
sc_.GROUP = "sys_user_group";
sc_.ITEM_OPTION = "item_option_new";
sc_.QUESTION_CHOICE = "question_choice";
sc_.SCRIPTABLE_ORDER_GUIDE_FAILURE = "sc_script_order_guide_failure";
sc_.TASK = "sc_task";

// STATES
sc_.REPROCESSING = "reprocessing";

// Fieldnames
//sc_.CAT_ITEM = "cat_item";
sc_.ACTIVE = "active";
sc_.IC_VERSION = "sc_ic_version";
sc_.DESKTOP_IMAGE = "picture";
sc_.MOBILE_IMAGE = "mobile_picture";
sc_.HOMEPAGE_IMAGE = "homepage_image";
sc_.TITLE = "title";
sc_.PARENT = "parent";
sc_.DESCRIPTION = "description";

// Roles
sc_.CATALOG_ADMIN = "catalog_admin";

// Parameters