var TourBuilderDictionary = Class.create();
TourBuilderDictionary.prototype = {
	
	_TOUR_ATTR : {
				'sys_id':'sysId',
				'name':'name',
				'start_url':'startUrl',
				'active':'active',
				'description':'description',
				'default':'default',
				'options':'options',
				'context':'context',
			    'embedded_help_reference':'embeddedHelpReference'
		},
	
	_TOUR_BUILDER_ELEMENTS_ATTR:{
				'sys_id':'sysId',
		        'name':'name',
				'type':'type',
				'table':'table',
				'list_element':'listElement',
				'form_element':'formElement',
				'frameset':'frameSet',
				'form_buttons':'formButtons',
				'field':'field',
				'element_type':'elementType',
				'col':'col',
				'row':'row',
				'record_id':'recordId',
				'related_lists':'relatedLists',
				'form_section':'formSections',
				'related_list_element':'relatedListElements',
				'ui_action':'uiAction',
				'manual_css':'manualCss',
				'x_path':'xPath',
				'reuse_text_field':'reuseTextField',
				'nav_buttons_in_list':'navButtonsInList',
				'filter_form_in_list':'filterFormInList',
		        'embedded_help_reference':'embeddedHelpReference',
				_extractReferenceFields:{'ui_action':'sys_ui_action'}
		},
	
	_UI_ACTION_ATTR: {
				'action_name': 'actionName'
		},
	
	_EMBEDDED_STEP_ATTR: {
		'action':'action',
		'action_event':'actionEvent',
		'action_target':'actionTarget',
		'action_target_ref':'actionTargetRef',
		'active':'active',
		'content':'content',
		'guide':'guide',
		'implicit':'implicit',
		'link':'link',
		'name':'name',
		'options':'options',
		'order':'order',
		'placement':'placement',
		'sys_id':'sysId',
		'target':'target',
		'target_ref':'targetRef',
		'ui_version':'uiVersion',
		'window':'window',
		_extractReferenceFields:{
										 'action_target_ref':'sys_embedded_tour_element',
										 'target_ref':'sys_embedded_tour_element'
										}
	},
	
    initialize: function() {
    },
	
	/* Get columns for this dictionary */
	getColumnsFromDictionary : function (table) {
		if(table == "sys_embedded_tour_guide") {
			return this._TOUR_ATTR;
		} else if(table == "sys_embedded_tour_element") {
			return this._TOUR_BUILDER_ELEMENTS_ATTR;
		} else if( table == "sys_embedded_tour_step"){
			return  this._EMBEDDED_STEP_ATTR;
		} else if(table == "sys_ui_action"){
			return  this._UI_ACTION_ATTR;
		}	
	}, 

    type: 'TourBuilderDictionary'
};