 /*
 * Holds constants used to configure HR service catalog items
 */
var hr_SCConfig = Class.create();


						/*************  Service Catalog Configuration *************/

//Controls the level of sub-categories.  Must range between 0 and 2
hr_SCConfig.RECURSION_LEVEL              = "0";

hr_SCConfig.BASE_TABLE_NAME              = "sn_hr_core_case";
hr_SCConfig.CAT_SUBTYPE_QUERY_FIELD      = "topic_category";
hr_SCConfig.CAT_TYPE_QUERY_FIELD         = "coe";
hr_SCConfig.PARENT_ASSIGNMENT_GROUP      = "human_resources";
hr_SCConfig.TABLE_CATEGORY               = "sn_hr_core_topic_category";
hr_SCConfig.TABLE_SUBCATEGORY            = "sn_hr_core_topic_detail";
hr_SCConfig.TABLE_SERVICE                = "sn_hr_core_service";
hr_SCConfig.TEMPLATE_MODEL               = "sn_hr_core_template";
hr_SCConfig.USE_SM_TEMPLATE              = false;

						/*************  Record Producer Configuration *************/

//RP Variables
hr_SCConfig.CTX_LIMIT                    = 10;
hr_SCConfig.CTX_RESULTS_PER_PAGE         = 5;

//Scripts
hr_SCConfig.RP_SCRIPT_MAIN               = "new sn_hr_core.hr_ServicesUtil(current, gs).createCaseFromProducer(producer, cat_item.sys_id);";

hr_SCConfig.prototype = {

	initialize: function() {},
	
	createService: function(name, value, detailId, templateId, rpId) {
		var gr = new GlideRecord('sn_hr_core_service');
		gr.initialize();

		gr.setValue('name', name);
		gr.setValue('value', value);
		gr.setValue('producer', rpId);
		gr.setValue("topic_detail", detailId);
		gr.setValue("template", templateId);
		gr.setValue('service_table', this._getServiceTableFromRecordProducer(rpId));
		gr.setValue('sys_scope', this._getScopeForService(detailId));
		
		return !gs.nil(gr.insert());
    },
	
	_getServiceTableFromRecordProducer: function(rpId) {
		var gr = new GlideRecord('sc_cat_item_producer');
		if (gr.get(rpId))
			return gr.table_name;
		return null;
	},
	
	_getScopeForService: function(detailId) {
		var grDetail = new GlideRecord('sn_hr_core_topic_detail');
		if (grDetail.get(detailId) && !gs.nil(grDetail.topic_category)) {
			var tableName = grDetail.topic_category.coe;
			var grCoe = new GlideRecord('sys_db_object');
			if (grCoe.get('name', tableName))
				return grCoe.sys_scope;
		}
		return 'global';
	},
	
	getTemplateFromRP: function(producer) {
		var gr = new GlideRecord('sn_hr_core_service');
		gr.addQuery('producer', producer);
		gr.query();
		
		if (gr.next())
			return gr.template;
		else
			return null;
	},

    type: "hr_SCConfig"
};