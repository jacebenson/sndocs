var AppExplorerStructure = {

	create : function(appId) {
	
		var api = {
			categoryTree : function() {
				return categoryTree;
			},
			excludedTypes : function() {
				return EXCLUDE_TYPES;
			},
			includedTypes : function() {
				return categorizedTypes;
			}
		};

		var categorizedTypes = [];
	
		
		var NAVIGATION = [
			group('Data Model', [
				"sys_db_object", // Table
				"sys_dictionary",   // Field
				"sys_m2m",		  // Many to Many Definition
				"sys_relationship",	  // Relationship
			//	"sys_dictionary_override",   // Dictionary Override	creates orerrides to fields on base tables for extended tables
				//	"sys_number",	    // Number maintenance	rename from "number". Should not be in the list. Accessable from within the table form.
			//	"sys_db_view",		  // Database View
			//	"sysauto",		  // Scheduled Job	Has an interceptor for scheduled script exec
			//	"cmn_context_help",	     // Help Context
			//	"sys_navigator",	     // Navigation Handler	Maybe should not be in the list v1, it is for legacy support
			//	"sys_filter",	       // List Filter	rename from "filter"
			//	"sys_filter_option_dynamic", // Dynamic Filter	Scripted filters for condition fields
			//	"sys_broadcast_message",     // Broadcast Message	System broadcast messaging
			//	"sys_ui_help",		     // System Help
			//	"sys_ui_title",		     // Document Title
			//	"sys_ui_overview_help",	     // Overview Help Page
			//	"sys_amb_processor",	     // AMB Message Processor	No clue what this is
			//	"ts_group",		     // Text Search Groups	These are the search groups for global search
			//	"sys_auto_flush",	     // Auto Flush	auto delete records from tables
			//	"sys_calendar",		     // Calendar
			//	"sys_semaphore",	     // Semaphore
			]),

			group('Forms & UI', [
				"sys_ui_form",			// Form	should intercept the click and allow you to select a table then show the form designer.
				"sys_ui_list",	// List Layout	Needs to be intercepted and taken to a slush bucket
				"sys_ui_list_control",	// List Control	Maybe should be accessed via a list you have already created
				//"sys_ui_list_control_embedded",	// Embedded List Control	Should be accessed via a list you have already created
				"sys_ui_related_list",	// Related List	Needs to be intercepted and taken to a slush bucket
				"sys_ui_style",			// Style
				"sys_ui_context_menu",		// Context Menu	(how often is this used?) Most people do not know about it, but it is usefull
				"sysrule_view",			// View Rule
			//	"sys_ui_theme",	// Theme
			//	"sys_widgets",			// Homepage Widget	rename from "Widget" Maybe should be created from a report
				"sys_ui_page",	// UI Page
				"cmn_schedule_page",		// Schedule Page
				"cmn_timeline_page",		// Timeline Page
				"cmn_map_page",			// Map Page
				"sys_template",	    // Template
				"sys_ui_macro",	// UI Macro
				"sys_ui_formatter",		// UI Formatter
			//	"sys_ui_section",		// Form section	Should not be in the list, include form above with some interceptor
			]),
			
			group('Server Development', [
				"sys_script", // Business Rule
				"sys_script_include", // Script Include
				"sys_ui_action", // UI Action (Server)
			//	"sys_ui_ng_action", // UI Action (Mobile)
			//	"sys_script_validator", // Validation Script
				"sys_data_policy2",   // Data Policy (Server)
//				"sys_wizard",	      // Interceptor
				"sys_processor",	  // Processor
			//	"syntax_editor_macro",		// Editor Macro	Legay, should not include
				
				"sysauto_script",	  // Scheduled Script Execution	Do not include, accessed through scheduled job
				"sysevent_register",	     // Event Registration
				"sysevent_script_action",	// Script Action
//				"sys_installation_exit",  // Installation Exit	currently excluded, but any authentication app will need this
				
				"sys_script_fix",		// Fix Script

			//	"sysrule_approvals",		// Approval Rules	Legay, should not include
			//	"sysrule_assignment",		// Assignment Rule	Legay, should not include
			]),

			group('Client Development', [
				"sys_script_client",	// Client Script
				"sys_ui_policy",	   // UI Policy
				"sys_ui_script",	   // UI Script
				"dl_u_assignment",	   // Assignment Data Lookup	Data Lookup
				"dl_u_priority",	   // Priority Data Lookup	Data Lookup
				"dl_definition",	   // Data Lookup Definitions	Data Lookup
			]),
			
			group('Access Control', [
				"sys_user_role",	// Role
				"sys_security_acl",	// Access Control
				"sys_public",  // Public Page	Makes a page public, no login required
			//	"sysrule_quota",		// Transaction Quota Rule
			]),
			
			group('Properties', [
				"sys_properties",		// System Property
				"sys_properties_category",	// System Property Category
				"sys_ui_message",   // Message
			]),

			group('Navigation', [
				"sys_app_application", // Application menu
				"sys_app_module",      // Application Module
			//	"sys_app_category",    // Menu Category
				"sys_ui_application",  // Application Menu (Mobile)
				"sys_ui_module",       // Application Module (Mobile)
			]),

			group('Notifications', [
				"sysevent_email_action",	// Email Notification
			//	"sys_script_email",		// Email Script
				"sysevent_email_template",	// Email Template
			//	"sys_email_client_template",	// Email Client Template
			//	"sys_email_canned_message",	// Email Client Canned Messages
				"sysevent_in_email_action",	// Inbound Email Actions
			//	"sysevent_email_style",		// Stationery
			//	"notification_filter",		// Notification Filter
			//	"live_table_notification",	// Live Table Notification
			//	"sys_mailbox",			// Mailboxes
			//	"sysrule_escalate_am",		// Inactivity Monitor
			//	"sysrule_escalate",		// Service Level Agreement
			]),

			group('Content Management', [
				"content_site",	// Site
			//	"content_block",   // Content Block
				"content_link",	   // Content Link
				"content_theme",   // Content Theme
				"content_block_detail",	      // Detailed Content	Do not include, opened from interceptor on content_block
				"content_block_flash",	      // Flash Movie
				"content_block_header",	      // Header
				"content_block_iframe",	      // IFrames
				"content_block_lists",	      // List of Content	Do not include, opened from interceptor on content_block
				"content_block_menu",	      // Navigation Menu	Do not include, opened from interceptor on content_block
				"content_block_programmatic", // Dynamic Content	Do not include, opened from interceptor on content_block
				"content_block_static",	      // Static Content	Do not include, opened from interceptor on content_block
				"content_css",		      // Style Sheet
				"sys_portal_page",		// Portal Page	This is the homepage table
			//	"content_page_rule",	      // Login Rule	Legacy
				"db_image",			// Image
				"db_video",			// Video
				"db_audio",			// Audio

			]),

			group('Service Catalog', [
				"sc_cat_item",	 // Catalog Item
				"sc_cat_item_producer",	    // Record Producer
				"sc_catalog",		    // Catalog
				"sc_category",		    // Category
				"catalog_ui_policy",	    // Catalog UI Policy
			//	"item_option_category",	    // Variable Category
				"item_option_new_set",	    // Variable Set
				"sc_cat_item_content",	    // Content Item
				"sc_cat_item_delivery_plan",   // Execution Plan
				"sc_cat_item_guide",	       // Order guide
				"catalog_script_client",    // Catalog Client Script
			//	"sc_cat_item_wizard",	       // Wizard Launcher
			//	"sc_ordered_item_link",	       // Ordered Item Link
			//	"sc_renderer",		       // Catalog Renderer
			//	"sc_ic_item_staging",	       // Item Designer
			//	"sc_ic_question_type",	       // Question Type
			//	"sc_cat_item_producer_service",	  // Service
			//	"sc_ic_task_assign_defn_staging", // Task Assignment
			]),

			group('Reporting', [
				"sys_report",	// Report
				"metric_definition",	// Metric Definition
				"sysauto_report",	// Scheduled Email of Report
				"sys_report_chart_color",  // Chart Colors
				"sys_report_color",	   // Color Definition
			//	"sys_report_page_hdrftr",  // PDF Page Header Footer Template
				"sys_report_range",	   // Range
			//	"sys_report_source",	   // Report Source
			//	"sys_report_olap",	   // OLAP Cube View
			//	"asmt_bubble_chart",	   // Bubble Chart	?
			//	"sys_gauge",		   // Gauge
			//	"sys_report_mpivot_rule",  // Multilevel Pivot Rule
			]),
			
			group('Integrations', [
				"sys_data_source",	// Inbound - Data Source
				"sys_transform_map",	      // Table Transform Map
				"scheduled_import_set",	// Inbound - Scheduled Data Import
				"sys_rest_message",	   // Outbound - REST Message
				"sys_soap_message",	   // Outbound - SOAP Message
				"sys_ws_definition",	   // Inbound - Scripted REST Service
				"sys_ws_operation",
				"sys_web_service",	// Inbound - Scripted Web Service
				"sys_export_definition", // Export Definition
				"sys_export_target",	   // Outbound - Export Target
				"scheduled_data_export",   // Outbound - Scheduled Data Export
				
//				"ecc_queue_config",	// Configuration	Consider rename
//				"sys_impex_map",	// Import Export Map
//				"sys_ws_operation",	   // Inbound - Scripted REST Operation
//				"ldap_server_config",	   // LDAP Server
//				"sys_export_set",	   // Outbound - Export Set
//				"sys_ws_version",	   // Scripted REST Version
//				"sys_ws_query_parameter_map", // Scripted REST Query Parameter Association
//				"sys_ws_header_map",	      // Scripted REST Header Association
//				"sys_ws_header",	      // Scripted REST Header
//				"sys_ws_query_parameter",     // Scripted REST Query Parameter
			]),
			
			group('Workflow', [
				"wf_workflow",			// Workflow	Workflow
				"wf_workflow_schedule",		// Workflow Schedule	Scheduled Workflows
			]),

			//group('Contract', [
			//	"clm_condition_check",	// Condition Checks
			//]),

			//group('BSM', [
			//	"bsm_action",	// BSM Map Actions
			//	"bsm_related_item",    // BSM Related Item
			//	"map_view",	       // BSM Map View
			//	"ngbsm_related_item",  // NG-BSM Related Item
			//	"bsm_indicator",       // NG-BSM Indicator
			//]),

			//group('Performance Analytics', [
			//	"pa_cubes",  // 1 - Indicator Source	Talked to GM for PA for these
			//	"pa_dimensions",  // 2 - Breakdown Source	Talked to GM for PA for these
			//	"pa_breakdowns",  // 3 - Breakdown Mapping	Talked to GM for PA for these
			//	"$pa_indicator_wizard.do",	   // 4- Indicator Wizard		Talked to GM for PA for these
			//	"pa_aggregates",	// Time series
			//	"pa_bucket_groups",	// Bucket group
			//	"pa_chart_color_schemes",  // Chart color scheme
			//	"pa_tags",		   // Indicator Group
			//	"pa_indicators",	   // Indicator
			//	"pa_filters",		   // Elements Filter
			//	"pa_scripts",		   // Script
			//	"pa_targets",		   // Target
			//	"pa_thresholds",	   // Threshold
			//	"pa_units",		   // Unit
			//	"pa_widgets",		   // Widgets
			//	"sysauto_indicator_notifications",	// Scheduled Email Summary
			//	"sysauto_pa",				// Scheduled Data Collection
			//	"pa_m2m_dashboard_sources",		// Dashboard Breakdown Source
			//	"pa_indicator_aggregate_excl",		// Indicator time series exclusion
			//]),

			group('Schedules', [
				"cmn_schedule",		  // Schedule
				"cmn_schedule_blackout",	// Blackout Schedule
				"cmn_schedule_maintenance",	// Maintenance Schedule
				"risk_conditions",		// Risk Conditions
				"cmn_relative_duration",	// Relative Duration
			]),

//			group('Knowledge', [
//				"kb_navons",	// Knowledge Nav-ons, legacy
//			]),


			//group('Product Catalog', [
			//	"pc_product_cat_item",	// Product Catalog Item
			//	"pc_vendor_cat_item",	// Vendor Catalog Item
			//]),

			//group('Surveys', [
			//	"survey_master",	// Survey
			//	"survey_conditions",	// Survey Conditions
			//	"survey_question_new",	// Survey Question
			//]),

//			group('Service Management', [
//				"contract_sla",	// SLA Definition
//			//	"sla_condition_class", // SLA Conditions
//			]),

			//group('MID Server', [
			//	"ecc_agent_capability",	// MID Server Capability
			//	"ecc_agent_capability_value_test",    // MID Server Capability Value Test
			//	"ecc_agent_ip_range",		      // MID Server IP Range
			//	"ecc_agent_jar",		      // MID Server JAR File
			//	"ecc_agent_mib",		      // MID Server MIB File
			//	"ecc_agent_property",		      // MID Server Property
			//	"ecc_agent_script_file",	      // MID Server Script File
			//	"ecc_agent_script_include",	      // MID Server Script Include
			//]),

			//group('Round Robin', [
			//	"round_robin_graph_set_member",	// Member
			//	"round_robin_graph_set",	// Round Robin Graph Set
			//	"round_robin_graph",		// Round Robin Graph
			//	"round_robin_graph_line",	// Graph Line
			//	"round_robin_archive",		// Round Robin Archive
			//	"round_robin_datasource",	// Round Robin Data Source
			//	"round_robin_definition",	// Round Robin Definition
			//]),
			
			//group('System Wizards', [
			//	"expert_panel",	// Wizard Panel All are deprecated, we don't want people using wizards
			//	"expert_script_client",	  // Wizard Client Script
			//	"expert_ui_policy",	  // Wizard UI Policy
			//	"expert_variable",	  // Wizard Variable
			//]),

			//group('Orchestration', [
			// 	"automation_pipeline",	// Command Pipeline
			//]),

			//group('Configuration Mgmt (CMDB)', [
			//	"cmdb_rel_group_type",	     // CI/Group Relationship Type
			//	"cmdb_rel_type",	     // CI Relationship Type
			//	"cmdb_rel_user_type",	     // CI/User Relationship Type
			//	"cmdb_view",		     // CMDB View
			//])

		];
		
		var fileTypeInfo = getDocumentation();
		renameFileType('sys_ui_module', 'Module (Mobile)', 'Modules (Mobile)');
		renameFileType('sys_ui_application', 'Application Menu (Mobile)', 'Application Menus (Mobile)');
		renameFileType('sys_ui_list', 'List Layout', 'List Layouts');
		renameFileType('sys_dictionary', 'Table Column', 'Table Columns');
		renameFileType('sys_ui_macro', 'UI Macro','UI Macros');
		renameFileType('wf_workflow', 'Workflow', 'Workflows');
		renameFileType('content_block_detail', 'Content Block - Detail', 'Content Blocks - Detail');
		renameFileType('content_block_flash', 'Content Block - Flash', 'Content Blocks - Flash');
		renameFileType('content_block_header', 'Content Block - Header', 'Content Blocks - Header');
		renameFileType('content_block_iframe', 'Content Block - iFrame', 'Content Blocks - iFrame');
		renameFileType('content_block_lists', 'Content Block - List', 'Content Blocks - List');
		renameFileType('content_block_menu', 'Content Block - Menu', 'Content Blocks - Menu');
		renameFileType('content_block_programmatic', 'Content Block - Programmatic', 'Content Blocks - Programmatic');
		renameFileType('content_block_static', 'Content Block - Static', 'Content Blocks - Static');
		renameFileType('sc_cat_item_guide', 'CNS:Order Guide','CNS:Order Guides');

		fileTypeInfo['sys_ui_list'].requiresTableName = true;
		fileTypeInfo['sys_ui_related_list'].requiresTableName = true;
		fileTypeInfo['sys_ui_form'].requiresTableName = true;
		fileTypeInfo['sys_ui_list_control'].requiresTableName = true;
		fileTypeInfo['sys_ui_list_control'].limitTablesToScope = true;
		
		var categoryTree = _.map(NAVIGATION, function(grp) {
			return {
				id : grp.name,
				name : grp.name,
				types : _.chain(grp.types)
					.map(function(type) {
						if (fileTypeInfo[type] && fileTypeInfo[type].canRead)
							return fileTypeInfo[type];
					})
					.compact()
					.value()
			};
		});
			
		function group(name, types) {
			categorizedTypes = categorizedTypes.concat(types);
	
			return {
				id : name,
				name: gs.getMessage(name),
				types: types
			};
		}
	
		function getDocumentation() {
			var fileTypeInfo = {};
			var language = gs.getSession().getLanguage() || 'en';
			var docRecord = new GlideRecord('sys_documentation');
			docRecord.addQuery('name', 'IN', categorizedTypes);
			docRecord.addNullQuery('element');
			docRecord.addQuery('language', 'IN', [language, 'en']);
			docRecord.query();
			while (docRecord.next()) {
				var tableName = docRecord.getValue('name');
				if (fileTypeInfo[tableName] && docRecord.getValue('language') === 'en')
					continue; // We skip English overrides
				
				fileTypeInfo[tableName] = 
					newFileType(tableName,
								tableName, 
								docRecord.getValue('label'), 
								docRecord.getValue('plural'),
								docRecord.getValue('help'),
								false);
			}
	
			return fileTypeInfo;
		}
		
		function renameFileType(fileType, label, plural) {
			if (!fileTypeInfo[fileType])
				return;
			fileTypeInfo[fileType].name = gs.getMessage(label);
			fileTypeInfo[fileType].pluralName = gs.getMessage(plural);
		}
		
		function newFileType(navigationKey, recordType, label, pluralName, helpText, requiresTableName) {
			var gr = new GlideRecord(recordType);
			if (!gr.isValid()) {
				gs.debug("Type " + type + " is not valid in this instance");
				return {};
			}	 
			gr.sys_scope = appId;
			
			return {
				id : navigationKey,
				recordType : recordType,
				navigationKey : navigationKey,
				name : label || recordType,
				pluralName : pluralName || recordType,
				helpText : helpText || '',
				requiresTableName : requiresTableName,
				canCreate : gr.canCreate(),
				canRead : gr.canRead()
			};
		}		
			
		function artifactTypesForUncategorizedTypes() {
			var metadataTypes = new GlideTableHierarchy('sys_metadata').getTableExtensions();
			return _.difference(metadataTypes, categorizedTypes, EXCLUDE_TYPES);
		}
	
		return api;
	}
};