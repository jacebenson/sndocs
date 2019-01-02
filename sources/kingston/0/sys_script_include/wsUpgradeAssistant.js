/**
 * Class for handling Upgrade logs and Updates.
 * @ignore
 */
var wsUpgradeAssistant = Class.create();

wsUpgradeAssistant.getVersion = function () {
	var gr = new GlideRecord('sys_app');
	gr.addQuery('sys_id', '=', '44f3dc5fdb7c0300f56c711ebf96191d');
	gr.setLimit(1);
	gr.query();
	return gr.next() ? gr.getValue('version') : 'Unknown';
};

wsUpgradeAssistant.setUpgradeHistory = function( history_id ) {
	
	var uh, sp;
	
	if ( !history_id ) {
		// Find the latest 'glide-' upgrade record
		uh = new GlideRecord('sys_upgrade_history');
		uh.addQuery('to_version','STARTSWITH','glide-');
		uh.orderByDesc('upgrade_finished');
		uh.query();
		uh.next();
		history_id = uh.sys_id + '';
	}
	
	// Set the system property to the specified value
	sp = new GlideRecord('sys_properties');
	sp.addQuery('name','ws.ua.upgrade_history');
	sp.query();
	if ( sp.next() ) {
		sp.value = history_id;
		sp.update();
	}
	
	return history_id;
};
	
wsUpgradeAssistant.rebuildRecords = function( disp_list ) {
	
	if (!disp_list) { disp_list = []; }
	var i;
	
	var history_id = gs.getProperty('ws.ua.upgrade_history') || 
	                 wsUpgradeAssistant.setUpgradeHistory();
	
	var ug = new GlideRecord('sys_upgrade_history_log');
	ug.addQuery('upgrade_history',history_id);
	
	var qc = ug.addQuery('disposition','4'); // Skipped
	for ( i=0; i < disp_list.length; i++ ) {
		qc.addOrCondition('disposition',disp_list[i]); // e.g. 9 = Skipped Error
	}
	
	// Null for Jakarta, 'Not Reviewed' for previous versions
	//	ug.addNullQuery('resolution_status')
	//	  .addOrCondition('resolution_status','not_reviewed');
	ug.query();
	
	if ( !ug.hasNext() ) { return; }
	
	gs.print('Rebuilding Upgrade Assistant Logs');
	
	// Remove current records
	var ua = new GlideRecord('u_ws_ua_history_log');
	ua.query();
	ua.deleteMultiple();
	
	// Add new records
	while (ug.next()) {
		ua.newRecord();
		ua.u_upgrade_details = ug.sys_id;
		ua.insert();
	}
	
};
	
wsUpgradeAssistant.prototype = {
	
	/**
	* @classdesc wsUpgradeAssistant implements a class which assists with 
	* analysing and exploring updates which are flagged as skipped during an
	* instance upgrade.
	*
	* @description Initialise this object's properties
	*
	* @constructs wsUpgradeAssistant
	*
	*/
	initialize: function initialize() {
	},
	
	/**
	* Populates an Upgrade Assistant Log record from information gathered from
	* the linked Upgrade History Log record. This method is expected to be 
	* called when the UA Log record is inserted.
	*
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {undefined}
	*/
	populateRecord: function populateRecord(ua) {
		
		var update_name, plugin_name;
		
		var ug = ua.u_upgrade_details.getRefRecord();
		if ( !ug.isValidRecord() ) {
			ua.setAbortAction(true);
			return;
		}
		
		update_name = '' + ug.file_name;
		plugin_name = '' + ug.plugin;
		
		gs.print('populateRecord: ' + update_name);
		
		ua.u_update_name = update_name;
		ua.u_plugin_name = plugin_name;
		
		this.get_package(ua);
		this.get_metadata(ua);
		
		var base_ver = this.get_base_version(ua);
		var curr_ver = this.get_current_version(ua);
		var curr_upd = this.get_current_update(ua);
		
		ua.u_version_status = 'OK';
		if ( !base_ver || !curr_ver ) {
			if ( !base_ver && !curr_ver ) {
				ua.u_version_status = 'both_missing';
			} else if ( !base_ver ) {
				ua.u_version_status = 'baseline_missing';
			} else if ( !curr_ver ) {
				ua.u_version_status = 'current_missing';
			}
		}
		
		// Detect target deletion
		if ( ua.u_target_table == 'sys_metadata_delete' ) {
			ua.u_target_status = 'deleted';
			ua.u_target_updated_on = ua.u_metadata.sys_created_on;
			ua.u_target_updated_by = ua.u_metadata.sys_created_by;
		} else if ( ua.u_metadata_count == 0 && curr_ver && curr_ver.action == 'DELETE' ) {
			ua.u_target_status = 'deleted';
			ua.u_target_updated_on = ua.u_current_version.sys_created_on;
			ua.u_target_updated_by = ua.u_current_version.sys_created_by;
		}
		
		// Additional check on payload content;
		var payload_cv, payload_cu;
		if ( !ua.u_current_version.nil() && !ua.u_current_update.nil() ) {
			payload_cv = '' + curr_ver.payload;
			payload_cu = '' + curr_upd.payload;
			if ( payload_cv != payload_cu ) {
				ua.u_notes = 'Version/Update payload mismatch.';
				ua.u_suggested_action = 'review';
				return;
			}
		}
		
		// Do not progress unless we have payloads to compare
		if ( !this.diff_valid(ua) ) {
			ua.u_diff_status = 'invalid';
			this.apply_rules(ua);
			return;
		}
		
		// Analyse the differences between baseline and current versions
		this.diff = new wsDiffHelper();
		this.diff.createDiff(
			this.get_base_payload(ua),
			this.get_curr_payload(ua)
		);
		
		ua.u_diff_status = this.diff.getStatus();
		ua.u_diff_count  = this.diff.getFieldCount();
		ua.u_diff_xml    = this.diff.getDiffXML();
		ua.u_diff_json   = this.diff.getDiffJSON();
		
		this.apply_rules(ua);
	},
	
	/**
	* A test of whether the Upgrade Assistant Log record has sufficient data 
	* to enable a diff operation to be carried out between the Baseline payload
	* and a payload for the Current record.
	*
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {boolean} - True if we have sufficient information to perform a
	*                     diff operation, false otherwise.
	*/
	diff_valid: function diff_valid(ua) {
		
		var error_message = '';
		if ( ua.u_baseline_version.nil() &&
		     ua.u_upgrade_details.payload.nil()
		   ) {
			error_message = 'Baseline is missing.';
			
		} else if ( ua.u_current_version.nil() && 
			         ua.u_current_update.nil() &&
			         ( ua.u_target_table.nil() || ua.u_target_record.nil() ) 
			   ) {
			error_message = 'Current/target is missing.';
			
		}
		
		if ( error_message ) {
			return false;
		}
		
		return true;
	},
	
	/**
	* Retrieves the Baseline payload for this update. In most cases this is the 
	* payload from an Update Version of type History. If we have not found such
	* a record we return the payload of the Upgrade History Log record.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {string} - The text of the Base payload. 
	*                    Returns an empty string if no payload is found.
	*/
	get_base_payload: function get_base_payload(ua) {
		
		// Return baseline version payload, if present
		if ( !ua.u_baseline_version.nil() ) {
			ua.u_diff_baseline = 'history_version';
			return ua.u_baseline_version.payload;
		}
		
		// Return upgrade payload, if present
		if ( !ua.u_upgrade_details.payload.nil() ) {
			ua.u_diff_baseline = 'upgrade_log';
			return ua.u_upgrade_details.payload;
		}
		
		return '';
	},
	
	/**
	* Retrieves the Current payload for this update. In most cases this is the 
	* payload from an Update Version of type Current. If we have not found such
	* a record we check for the latest Customer Update record and return its
	* payload. If that is absent too, we will attempt to retrieve the target 
	* record and serialise that into payload format.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {string} - The text of the Base payload. 
	*                    Returns an empty string if no payload is found.
	*/
	get_curr_payload: function get_curr_payload(ua) {
		
		// Return current version payload, if present
		if ( !ua.u_current_version.nil() ) {
			ua.u_diff_current = 'current_version';
			return ua.u_current_version.payload;
		}
		
		// Return current update payload, if present
		if ( !ua.u_current_update.nil() ) {
			ua.u_diff_current = 'customer_update';
			return ua.u_current_update.payload;
		}
		
		if ( ua.u_target_table.nil() ) { return ''; }
		
		// Use target record to generate payload
		var gr = new GlideRecord(ua.u_target_table);
		if ( !gr.isValid() ) { return ''; }
		
		gr.addQuery('sys_id',ua.u_target_record);
		gr.query();
		gr._next();
		if ( !gr.isValidRecord() ) { return ''; }
		
		// Serialize Record and return payload
		var serializer = new GlideRecordXMLSerializer();
		var payload = serializer.serialize(gr);

		ua.u_diff_current = 'target_record';
		return payload;
	},
	
	/**
	* Applies a specified action to a set of Upgrade History Log records. The 
	* list of records are supplied as a comma separated string of sys_ids of 
	* the linked Upgrade Assistant Log entries.
	*
	* @param  {string} act - The action to take for each selected entry. This 
	*                        must be either 'retain' or 'revert'.
	* @param  {string} log_data - A comma separated string of sys_ids
	* @return {string} - A message summarising the results of the actions, 
	*                    or an undefined value if there was a failure.
	*/
	updateSelectedLogs: function updateSelectedLogs(act,log_data) {
		
		var info_message;
		
		// Validate parameters
		if ( !log_data ) { return; }
		if ( act == 'retain' ) {
			info_message = ' updates marked as "Reviewed and retained".';
		} else if ( act == 'revert' ) { 
			info_message = ' updates marked as "Reviewed and reverted".';
		} else {
			return; 
		}
		
		// Check we have at least one log sys_id
		var log_list = log_data.split(',');
		if ( !log_list.length ) { return; }
		
		var ua = new GlideRecord('u_ws_ua_history_log');
		var i, uc = 0, ug;
		
		for ( i=0; i < log_list.length; i++ ) {
			ua.get(log_list[i]);
			
			if ( act == 'retain' ) {
				ug = ua.u_upgrade_details.getRefRecord();
				ug.resolution_status = 'reviewed_retained';
				ug.comments          = ua.u_notes;
				if ( ug.update() ) { uc++; }
				
			} else if ( act == 'revert' ) {
				if ( this.revert_update(ua) ) { uc++; }
				
			}
			
		}
		
		return uc + info_message;
	},
	
	/**
	* Revert the update linked to the supplied Upgrade Assistant Log record back
	* to the state stored in the Baseline version. This code is copied from the 
	* standard 'Revert' UI Action on the Upgrade History Log record.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {string} - The sys_id of the Upgrade History Log record if it is 
	*                    successfully reverted, or a false value otherwise.
	*/
	revert_update: function revert_update(ua) {
		
		var update_name = ua.u_update_name;
		var ug = ua.u_upgrade_details.getRefRecord();
		
		var grHead = GlideappUpdateVersion.getHeadVersion(update_name);
		if (grHead.isValidRecord()) {
			ug.payload = grHead.payload;
		}
		
		var grBaselineHead = GlideappUpdateVersion.getVersion( 
			update_name, ug.upgrade_history, 'sys_upgrade_history', null );
		if ( !grBaselineHead.isValidRecord() ) {
			return false;
		}
			
		var guv = new GlideappUpdateVersion();
		if ( !guv.revert(grBaselineHead.sys_id) ) {
			return false;
		}
		
		ug.disposition = '5';
		ug.resolution_status = 'reviewed_reverted';
		ug.comments          = ua.u_notes;
		return ug.update();
	},
	
	/**
	* Applies the Upgrade Assistant Rules to the supplied Update Assistant Log 
	* record. It tries every active rule in ascending order and selects the 
	* first whose condition matches the supplied log entry. It populates the 
	* Suggested action and Notes fields of the log from the matching rule.
	*
	* If no matching rule is found, a default action and note is applied.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {undefined}
	*/
	apply_rules: function apply_rules(ua) {
		
		var rule = new GlideRecord('u_ws_ua_rule');
		rule.addQuery('u_active',true);
		rule.orderBy('u_order');
		rule.query();
		
		var gf;
		while ( rule.next() ) {
			gf = new GlideFilter(rule.u_condition,rule.u_name);
			if ( gf.match(ua, true) ) {
				ua.u_suggested_action = rule.u_suggested_action;
				ua.u_matched_rule     = rule.sys_id;
				ua.u_notes            = rule.u_notes;
				return;
			}
		}
		
		ua.u_suggested_action = 'review';
		ua.u_notes = 'This update does not match any rules and should be manually reviewed.';
	},
	
	/**
	* Collects information from the Package (sys_package) record for 
	* the supplied Update Assistant Log record. It populates the package field
	* of the UA Log.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {undefined}
	*/
	get_package: function get_package(ua) {
		
		if ( ua.u_plugin_name.nil() ) { return; }
		
		var pk = new GlideRecord('sys_package');
		pk.addQuery('source',ua.u_plugin_name);
		pk.query();
		
		if ( !pk._next() ) {
			return;
		}
		
		ua.u_package = pk.sys_id;
		
	},
	
	/**
	* Collects information from the Application File (sys_metadata) record for 
	* the supplied Update Assistant Log record. It populates the metadata and 
	* target fields of the UA Log.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {undefined}
	*/
	get_metadata: function get_metadata(ua) {
		
		var update_name = '' + ua.u_update_name;
		var table_name  = this.infer_table(update_name);
		
		var md = new GlideRecord(table_name);
		md.addQuery('sys_update_name',update_name);
		if ( table_name == 'sys_ui_list' ) {
			md.addNullQuery('sys_user');  // Exclude user preferences
		}
		md.query();
		
		var rc = md.getRowCount();
		
		// Report missing or multiple metadata
		if ( rc != 1 ) {
			ua.u_metadata_count = rc;
			if ( rc == 0 ) {
				ua.u_target_table   = '';
				ua.u_target_status  = 'metadata_missing';
			} else {
				ua.u_target_table   = table_name;
				ua.u_target_status  = 'multiple_metadata';
			}
			return;
		}
		
		// Handle the most expected outcome (one record found)
		md.next();
		
		ua.u_metadata       = md.sys_id;
		ua.u_metadata_count = rc;
		
		ua.u_target_table      = md.sys_class_name;
		ua.u_target_record     = md.sys_id;
		ua.u_target_updated_by = md.sys_updated_by;
		ua.u_target_updated_on = md.sys_updated_on;
		ua.u_target_status     = 'OK';
		
	},
	
	/**
	* Retrieves the Baseline Update Version (sys_update_version) record for the 
	* supplied Update Assistant Log record. 
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {GlideRecord} - The Baseline Version, or null if not found.
	*/
	get_base_version: function get_base_version(ua) {
		
		// Query for updates linked to the requested History Log
		var uv = new GlideRecord('sys_update_version');
		uv.addQuery('name',ua.u_update_name);
		uv.addQuery('source_table','sys_upgrade_history');
		uv.addQuery('source',ua.u_upgrade_details.upgrade_history);
		uv.addQuery('sys_created_on',ua.u_upgrade_details.sys_created_on);
		uv.query();
		
		// The query will find the baseline update in the vast majority of cases
		if ( uv.next() ) { 
			ua.u_baseline_version = uv.sys_id;
			return uv;
		}
		
		var ms = ua.u_upgrade_details.sys_created_on.getGlideObject().getNumericValue();
		var one_second_later = new GlideDateTime();
		one_second_later.setNumericValue(ms + 1000);
		
		// Try the same query, but one second later
		uv = new GlideRecord('sys_update_version');
		uv.addQuery('name',ua.u_update_name);
		uv.addQuery('source_table','sys_upgrade_history');
		uv.addQuery('source',ua.u_upgrade_details.upgrade_history);
		uv.addQuery('sys_created_on',one_second_later);
		uv.query();
		
		// The query will find the baseline update if it is one second later
		if ( uv.next() ) { 
			ua.u_baseline_version = uv.sys_id;
			return uv;
		}
		
		// Get the timespan of the upgrade and search for any history updates
		// within that range
		var ug_started  = ua.u_upgrade_details.upgrade_history.upgrade_started;
		var ug_finished = ua.u_upgrade_details.upgrade_history.upgrade_finished;
		
		// For Store Apps the source is the App rather than the History Log
		// Query for any 'History' entry for this update
		uv = new GlideRecord('sys_update_version');
		uv.addQuery('name',ua.u_update_name);
		uv.addQuery('state','history');
		uv.addQuery('sys_created_on','>=',ug_started);
		uv.addQuery('sys_created_on','<=',ug_finished);
		uv.query();
		
		if ( uv.next() ) { 
			ua.u_baseline_version = uv.sys_id;
			return uv;
		}
		
		return null; 
	},
	
	/**
	* Retrieves the Current Update Version (sys_update_version) record for the 
	* supplied Update Assistant Log record.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {GlideRecord} - The Current Version, or null if not found.
	*/
	get_current_version: function get_current_version(ua) {
		
		var uv = new GlideRecord('sys_update_version');
		uv.addQuery('name',ua.u_update_name);
		uv.addQuery('state','current');
		uv.orderByDesc('sys_created_on');
		uv.query();
		
		if ( !uv.next() ) { return null; }
		
		ua.u_current_version = uv.sys_id;
		return uv;
	},
	
	/**
	* Retrieves the most recent Customer Update (sys_update_xml) record for the 
	* supplied Update Assistant Log record.
	*
	* @private
	* @param  {GlideRecord} ua - The Upgrade Assistant Log record
	* @return {GlideRecord} - The Customer Update, or null if not found.
	*/
	get_current_update: function get_current_update(ua) {
		
		var ux = new GlideRecord('sys_update_xml');
		ux.addQuery('name',ua.u_update_name);
		ux.orderByDesc('sys_updated_on');
		ux.query();
		
		if ( !ux.next() ) { return null; }
		
		ua.u_current_update = ux.sys_id;
		return ux;
	},
	
	/**
	* Parses the update name to check if it appears to be a standard format 
	* made up of a table name followed by a sys_id,and if so it returns the 
	* table name. It then checks for a list and otherwise returns a default
	* value of sys_metadata (the parent of all config records).
	*
	* @private
	* @param  {string} update_name - The internal name of the update
	* @return {string} - The name of the target table for the update.
	*/
	infer_table: function infer_table(update_name) {
		
		var re = /(.*)_[\dabcdef]{32}$/;
		var ma;
		
		// Search for most common update format: <table>_<sys_id>
		if ( re.test(update_name) ) {
			ma = re.exec(update_name);
			return ma[1];
		}
		
		// Check whether it's a list
		if ( update_name.indexOf('sys_ui_list') == 0 ) {
			return 'sys_ui_list';
		}
		
		// Default to the daddy of them all
		return 'sys_metadata';
	},
		
	type: 'wsUpgradeAssistant'
};
