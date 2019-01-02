var GuidedSetupUtilSNC = Class.create();
GuidedSetupUtilSNC.prototype = {
	TABLE_CONTENT: 'gsw_content',
	TABLE_CONTENT_GROUP: 'gsw_content_group',
	TABLE_CONTENT_INFORMATION: 'gsw_content_information',
	TABLE_CHANGE_LOG: 'gsw_change_log',
	TABLE_STATUS_OF_CONTENT: 'gsw_status_of_content',
	TABLE_PLUGINS: 'v_plugin',
	ATTR_CONTENT_GROUP: 'content_group',
	ATTR_RELATED_LOG_ENTRY: 'related_log_entry',
	ATTR_RELATED_CHANGE_LOG_ENTRY: 'related_change_log_entry',
	ATTR_ACTIVE: 'active',
	ATTR_CONTENT: 'content',
	ATTR_PARENT: 'parent',
	ATTR_PARENTS: 'parents',
	ATTR_TITLE: 'title',
	ATTR_NAME: 'name',
	ATTR_DESCRIPTION: 'description',
	ATTR_ORDER: 'order',
	ATTR_ICON: 'icon',
	ATTR_SYS_ID: 'sys_id',
	ATTR_CHANGE_DATE: 'change_date',
	ATTR_CHANGED_BY: 'changed_by',
	ATTR_SYS_CLASS_NAME: 'sys_class_name',
	ATTR_TYPE: 'type',
	ATTR_TABLE: 'table',
	ATTR_FIELD: 'field',
	ATTR_STATUS: 'status',
	ATTR_PROGRESS: 'progress',
	ATTR_WEIGHT: 'weight',
	ATTR_EFFECTIVE_WEIGHT: 'effective_weight',
	ATTR_SUPPORTS_CHILD_CONTENT: 'supports_child_content',
	ATTR_DEPENDENT_ON_CONTENTS: 'dependent_on_contents',
	ATTR_DEPENDENT_ON_PLUGINS: 'dependent_on_plugins',
	ATTR_IMPLICIT_DEPENDENT_ON: 'implicit_dependent_on',
	ATTR_IMPLICIT_PLUGINS_DEPENDENCIES: 'implicit_plugin_dependencies',
	ATTR_IS_ROOT_CONTENT: 'is_root_content',
	ATTR_CHILDREN_LAYOUT: 'children_layout',
	ATTR_ARTICLE: 'article',
	ATTR_QUICK_STARTABLE: 'quick_startable',
	ATTR_SKIPPABLE: 'skippable',
	ATTR_IS_ACCESSIBLE: 'is_accessible',
	ATTR_END_POINT: 'end_point',
	ATTR_END_POINT_TYPE: 'end_point_type',
	ATTR_END_POINT_OPEN_MODE: 'end_point_open_mode',
	ATTR_DISPLAY_CHILD_MAX_NUM: 'display_child_max_num',
	ATTR_PARENT_CONTENTS: 'parent_contents',
	ATTR_CONFIGURE_TYPE: 'configure_type',
	ATTR_ROOT_INTRO_FRAME_LINK: 'root_intro_frame_link',
	ATTR_ROOT_PARENT: 'root_parent',
	ATTR_SYS_CREATED_BY: 'sys_created_by',
	ATTR_QUALIFIER: 'embedded_help_qualifier',
	ERR_CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',
	ERR_TABLE_NOT_VALID: 'TABLE_NOT_VALID',
	ERR_CONTENT_TYPE_INVALID: 'CONTENT_TYPE_INVALID',
	ERR_REST_SECURITY: 'ERR_REST_SECURITY',
	GUIDED_SETUP_STACK_NAME: 'SNC_GUIDED_SETUP',
	EXTERNAL_URL_HANDLER: '$guided_setup_external_url_handler.do',
	EXTERNAL_PLUGIN_HANDLER: '$guided_setup_plugin_handler.do',
	SYS_PLUGIN: 'v_plugin.do',
	SYS_PLUGINS_LIST: 'v_plugin_list.do',
	LOG_TYPE: {
		VISITED: 1,
		COMPLETED: 2,
		UNCOMPLETED: 3,
		INITIATED: 4,
		DEACTIVATED: 5,
		REACTIVATED: 6,
		CONFIGURED: 7
	},
	STATUS_TYPE: {
		NOT_STARTED: 0,
		IN_PROGRESS: 1,
		COMPLETED: 2,
		INACTIVE: 3
	},
	END_POINT_TYPE: {
		CUSTOM: 1,
		CONFIGURE_CHOICES: 2,
		CONFIGURE_LABEL: 3,
		ASSIGNMENT_RULE: 4,
		FORM_LAYOUT: 5,
		CONFIGURE_TABLE: 6
	},
	END_POINTS: {
		CONFIGURE_CHOICE_SLUSHBUCKET: '/slushbucket_choice.do',
		FORM_LAYOUT_SLUSHBUCKET: '/slushbucket.do',
		SYS_DOCUMENTATION: '/sys_documentation.do',
		SYSRULE_ASSIGNMENT_LIST: '/sysrule_assignment_list.do',
		SYS_DOCUMENTATION_TABLE: 'sys_documentation',
		SYS_UI_SECTION_TABLE: 'sys_ui_section'
	},
	END_POINT_OPEN_MODE_TYPE: {
		MODAL: 1,
		TAB: 2,
		INLINE: 3
	},
	CACHE_ROOT_MAP_CATALOG: 'com.snc.guided_setup',
	CACHE_ROOT_MAP_KEY: 'com.snc.guided_setup.root_map',
	WEIGHT_MIN_VAL: 0.00,
	WEIGHT_MAX_VAL: 10.00,
	BLACKLISTED_FIELDS: ['sys_mod_count', 'sys_created_on', 'sys_created_by',
						 'sys_updated_on', 'sys_updated_by'],
	CURRENT_URL_TOKEN: '@@currentUrl@@',
	DEPENDENCY_MATRIX_INDEX: {TILE: 0, TABLIST: 1, TRAIN: 2, INFORMATION: 3},
	/*
	 *  Row: 	parent
	 *  Column: current
	 *  see:	validateRelationship (parent, current)
	 */
	DEPENDENCY_MATRIX: [
							//Tile  //Tablist   //Train //Information
		/*Tile*/          [	false,	true,		false,	false	],
		/*Tablist*/       [	false,	false,		true,	true	],
		/*Train*/         [	false,	false,		false,	true	],
		/*Information*/   [	false,	false,		false,	false	]
	],
								//Tile	//Tablist	//Train	//Information
	ROOT_DEPENDENCY_MATRIX: [	true,	false,		false,	false	],
	API_URL_EMBEDDED_HELP_ACTIONS: '/api/now/guided_setup/embedded_help/actions/',
	EMBEDDED_HELP_ACTION_NAMES: {
		COMPLETE: 'guided_setup:complete',
		SKIP: 'guided_setup:skip',
		INCOMPLETE: 'guided_setup:incomplete'
	},

	initialize: function() {
		this.arrayUtil = new global.ArrayUtil();
		this.END_POINTS.RETURN_URL = this.EXTERNAL_URL_HANDLER + '?sysparm_stack=no';
		this.MODAL_LAUNCHER_URL_GS_STACK = this.EXTERNAL_URL_HANDLER + '?sysparm_clear_stack=true&sysparm_nameofstack=' + this.GUIDED_SETUP_STACK_NAME;
		this.INLINE_LAUNCHER_URL = this._makeUrl(this.EXTERNAL_URL_HANDLER,
												 {sysparm_gsw_back_url: this.CURRENT_URL_TOKEN});
	},

	_hasParam: function (p, params) {
		if (!params || Object.keys(params).length === 0)
			return false;
		return p in params;
	},

	_removeParam: function (p, params) {
		params[p] = undefined;
	},

	_getParamVal: function (p, params, defaultValue) {
		if (typeof defaultValue == 'undefined')
			defaultValue = null;
		if (!params)
			return defaultValue;
		var val = params[p];
		if (!val || val.length === 0)
			return defaultValue;
		return val[0];
	},

	_getBoolParamVal: function (p, params, defaultValue) {
		var val = this._getParamVal(p, params, defaultValue);
		if (val)
			return val == 'true';
		else
			return val;
	},

	_getIntParamVal: function (p, params, defaultValue) {
		var val = this._getParamVal(p, params, defaultValue);
		if (val)
			return val * 1;
		else
			return val;
	},

	_addOrderBy: function (gr, params) {
		var orderBy = this._getParamVal('order_by', params);
		if (orderBy)
			gr.orderBy(orderBy);
	},

	_getIntValue: function (gr, field) {
		var val = gr.getValue(field);
		if (val)
			return val * 1;
		else
			return null;
	},

	_getBoolValue: function (gr, field, defaultValue) {
		var val = this._getIntValue(gr, field);
		if (typeof val == 'number')
			return val == 1;
		if (typeof defaultValue != 'undefined')
			return defaultValue;
		else
			return null;
	},

    _isGlobalScope: function() {
        return gs.getCurrentScopeName() === 'rhino.global';    
    },

	_urlEncode: function (url) {
        if (this._isGlobalScope())
            return encodeURIComponent(url);
        else
            return gs.urlEncode(url);    
	},

    isUIBlocked : function() {
        if (this._isGlobalScope())
            return new GlideCollaborationCompatibility().isIncompatible();
        else
            return new GlideUICompatibility(gs.getCurrentScopeName()).isBlocked();
    },
    
	_makeUrl: function (path, params) {
		var first = path.indexOf('?') > -1 ? false : true;
		for (var k in params) {
			if (first) {
				path = path + '?';
				first = false;
			} else
				path = path + '&';
			path = path + this._urlEncode(k) + '=' + this._urlEncode(params[k]);
		}
		return path;
	},

	_getExternalHandlerRedirectedUrl: function (url, forModal) {
		var params = {};
		params.sysparm_gsw_goto_url = url;
		var launcherUrl = forModal ? this.MODAL_LAUNCHER_URL_GS_STACK : this.INLINE_LAUNCHER_URL;
		return this._makeUrl(launcherUrl, params);
	},

	restErrorHandler: function (e, response) {
		if (!e.error_code)
			throw e;
		var res = {
			status: "failure",
			error: {
				message: e.message,
				error_code: e.error_code,
				is_user_message: e.is_user_message
			}
		};
		if (e.status)
			response.setStatus(e.status);
		else
			response.setStatus(400);
		response.setContentType('application/json');
		response.getStreamWriter().writeString(global.JSON.stringify(res));
		return;
	},

	getContentDetails: function (contentId, params) {
		var res = {};
		var con = new GlideRecord(this.TABLE_CONTENT);
		if (contentId && con.get(contentId)) {
			res = this._prepareContentDetails(con, params, 1);
		} else {
			throw {
				message: gs.getMessage('Content was not found'),
				error_code: this.ERR_CONTENT_NOT_FOUND,
				is_user_message: true,
				status: 404
			};
		}
		return res;
	},

	_getRootPreferences: function(contentId /*content for which to discover root and fetch root preferences*/) {
		var params = {
			max_levels : 1
		};
		var rootContent = this.getRootContentDetails(contentId, params);
		var rootPreferences = {};
		rootPreferences.display_child_max_num = rootContent.display_child_max_num;
		return rootPreferences;
	},

	/**
	  * Fetches the GlideRecord object which can be iterated to fetch the dependents
	  * @table  can be gsw_content or v_plugin
	*/
	_getDependentRecords: function(otherContents, table) {
		if (otherContents) {
			uniqueDependencies = this.arrayUtil.unique(otherContents.split());
			var conGr2 = new GlideRecord(table);
			conGr2.addQuery(this.ATTR_SYS_ID, 'IN', uniqueDependencies.join());
			conGr2.query();
			return conGr2;
		}
		return null;
	},

	/*
	* Fetches GlideRecord of dependent plugin from v_plugin table
	*/
	_getDependentPluginRecord: function(pluginSysId, pluginTable) {
		var conGr2 = new GlideRecord(pluginTable);
		conGr2.addQuery(this.ATTR_SYS_ID, pluginSysId);
		conGr2.query();
		return conGr2;
	},

	/**
	 * @returns GlideRecord object or null based on fetchImplicitDependency bool for there respective field values
	 * @private
	 */
	_getDependentGrContents: function (/*GlideRecord*/ contentGr, /*boolean*/ fetchImplicitDependency) {
		var otherContents = '';
		if (contentGr.getValue(this.ATTR_DEPENDENT_ON_CONTENTS)) {
			otherContents = contentGr.getValue(this.ATTR_DEPENDENT_ON_CONTENTS) + '';
		}
		if (fetchImplicitDependency && contentGr.getValue(this.ATTR_IMPLICIT_DEPENDENT_ON)) {
			otherContents = otherContents + ',' + contentGr.getValue(this.ATTR_IMPLICIT_DEPENDENT_ON);
		}
		var dependentRecords = this._getDependentRecords(otherContents, this.TABLE_CONTENT);
		return dependentRecords;
	},

	/**
 	* @returns pluginsListWithAccessibilityInfo array of objects (pluginRecord) with pluginInfo and it's accessibility info
	* @params pluginRecord is object with keys: pluginInfo - 'GlideRecord' for accessible plugins and 'PluginTitle' for non-accessible plugins, is_accessible - bool
 	* @private
 	*/
	_getDependentPluginsInfo: function (/*GlideRecord*/ contentGr) {
		var otherContents = '', pluginsListWithAccessibilityInfo = [], pluginRecord = {};
		if (contentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS)) {
			otherContents = contentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS);
			var dependentPluginsList = otherContents.split(',');
			for (var i = 0 ; i < dependentPluginsList.length; i++) {
				pluginRecord = {};
				var dependentPluginRecord = this._getDependentPluginRecord(dependentPluginsList[i], this.TABLE_PLUGINS);
				if (dependentPluginRecord && dependentPluginRecord.next()) {
					if (dependentPluginRecord.getValue(this.ATTR_ACTIVE) == 'inactive') {
						pluginRecord.pluginInfo = dependentPluginRecord;
						pluginRecord[this.ATTR_IS_ACCESSIBLE] = true;
					}
				} else {
					// This is a fallback for the case where defined plugin state != published
					pluginRecord.pluginInfo = dependentPluginsList[i];
					pluginRecord[this.ATTR_IS_ACCESSIBLE] = false;
				}
				if (pluginRecord.pluginInfo)
					pluginsListWithAccessibilityInfo.push(pluginRecord);
			}
		}
		return pluginsListWithAccessibilityInfo;
	},

	_getDependentGrContentsForImplicitPluginDependency: function(/*GlideRecord*/ contentGr) {
		var otherContents = '';
		if (contentGr.getValue(this.ATTR_IMPLICIT_PLUGINS_DEPENDENCIES)) {
			otherContents = contentGr.getValue(this.ATTR_IMPLICIT_PLUGINS_DEPENDENCIES) + '';
		}
		var dependentRecords = this._getDependentRecords(otherContents, this.TABLE_CONTENT);
		return dependentRecords;
	},

	/**
	 * Updates the locked_due_to.contents and locked_due_to.contents_with_plugin_dependencies array's depending on the value of locked parameter
	 * @locked_content locked_due_to.contents OR locked_due_to.contents_with_plugin_dependencies array
	 * @param dependentGr	The GlideRecord object of the dependent item
	 * @private
	 */
	_updateLockStatusForContents: function (/*GlideRecord*/ dependentGr, /*Array*/ lockedContents) {
		var lockedContent = {};
		lockedContent[this.ATTR_SYS_ID] = dependentGr.getUniqueValue();
		lockedContent[this.ATTR_TITLE] = dependentGr.getValue(this.ATTR_TITLE);
		lockedContents.push(lockedContent);
	},

	/**
	 * Updates the locked_due_to.plugins array depending on the value of locked parameter
	 * @param dependentGr	The GlideRecord object of the dependent item
	 * @private
	 */
	_updateLockStatusForPlugin: function(/*GlideRecord*/ dependentGr, /*Array*/ lockedPlugins) {
		var lockedPlugin = {};
		lockedPlugin[this.ATTR_TITLE] = dependentGr.getValue(this.ATTR_NAME);
		lockedPlugin[this.ATTR_SYS_ID] = dependentGr.getUniqueValue();
		lockedPlugin[this.ATTR_IS_ACCESSIBLE] = true;
		lockedPlugins.push(lockedPlugin);
	},

	/**
 	* Updates the locked_due_to.plugins array depending on the plugin accessibility
 	* @param pluginTitle - SysId / Id of plugin
 	* @private
 	*/
	_updateStatusForNonAccessiblePlugins: function(pluginTitle, plugins) {
		var nonAccessiblePlugin = {};
		nonAccessiblePlugin[this.ATTR_TITLE] = pluginTitle;
		nonAccessiblePlugin[this.ATTR_IS_ACCESSIBLE] = false;
		plugins.push(nonAccessiblePlugin);
	},

	/**
	 * Populates the locked_due_to.contents Array for use on the UI
	 * @private
	 */
	_getLockedStatusDueToContents: function(/*GlideRecord*/ contentGr,  /*boolean*/ fetchImplicits) {
		var contents = [];
		var dependentGr = this._getDependentGrContents(contentGr, fetchImplicits);
		while (dependentGr && dependentGr.next()) {
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			if (statusGr.get(this.ATTR_CONTENT, dependentGr.getUniqueValue())) {
				var isComplete = this.STATUS_TYPE.COMPLETED == this._getIntValue(statusGr, this.ATTR_STATUS);
				if (!isComplete) {
					this._updateLockStatusForContents(dependentGr, contents);
				}
			} else {
				this._updateLockStatusForContents(dependentGr, contents);
			}
		}
		return contents;
	},

	/**
	 * Populates the locked_due_to.plugins Array for use on the UI
	 * plugins array is union of both accessible and non-accessible plugins
	 * @private
	 */
	_getLockedStatusDueToPlugins: function(/*GlideRecord*/ contentGr) {
		var plugins = [];
		var pluginsListWithAccessibilityInfo = this._getDependentPluginsInfo(contentGr);
		for (var i = 0; i < pluginsListWithAccessibilityInfo.length; i++) {
			if (pluginsListWithAccessibilityInfo[i][this.ATTR_IS_ACCESSIBLE]) {
				this._updateLockStatusForPlugin(pluginsListWithAccessibilityInfo[i].pluginInfo, plugins);
			} else {
				this._updateStatusForNonAccessiblePlugins(pluginsListWithAccessibilityInfo[i].pluginInfo, plugins);
			}
		}
		return plugins;
	},

	/**
	 * Populates the locked_due_to.contents_with_plugin_dependencies Array for use on the UI
	 * Implicit lock should be provided for this case: If content X is dependent on Y and Y has some plugin dependency, if any one of plugin is inactive OR not accessible
	 * @private
	 */
	_getLockedStatusDueToImplicitPluginDependency: function(/*GlideRecord*/ contentGr) {
		var contentsWithPluginDependencies = [];
		var dependentGr = this._getDependentGrContentsForImplicitPluginDependency(contentGr);
		while (dependentGr && dependentGr.next()) {
			var pluginsListWithAccessibilityInfo = this._getDependentPluginsInfo(dependentGr);
			for (var i = 0; i < pluginsListWithAccessibilityInfo.length; i++) {
				if ((pluginsListWithAccessibilityInfo[i][this.ATTR_IS_ACCESSIBLE] && !GlidePluginManager.isActive(pluginsListWithAccessibilityInfo[i].pluginInfo)) || !pluginsListWithAccessibilityInfo[i][this.ATTR_IS_ACCESSIBLE]) {
					this._updateLockStatusForContents(dependentGr, contentsWithPluginDependencies);
					break;
				}
			}
		}
		return contentsWithPluginDependencies;
	},

	/**
 	*  @returns Url of dependent and inactive plugins list to load in modal's iframe on UI
	*  @params accessiblePluginsUrl - Url of accessible plugins to load in iframe
	*  @params nonAccessiblePluginsList - comma separated list of non accessible plugins
	*  This data is provided to UI page $plugin_handler.xml on client side
 	*/
	_getPluginsListUrl: function(plugins) {
		var accessiblePluginsUrl = '', nonAccessiblePluginsList = '', pluginHandlerUiPageUrl = '';
		if (plugins && plugins.length) {
			var lockedPluginsLength = plugins.length, numberOfAccessiblePlugins = 0;
			for (var i = 0 ; i < lockedPluginsLength; i++) {
				if (!plugins[i][this.ATTR_IS_ACCESSIBLE]) {
					if (nonAccessiblePluginsList) {
						nonAccessiblePluginsList = nonAccessiblePluginsList + ',' + plugins[i][this.ATTR_TITLE];
					} else {
						nonAccessiblePluginsList = plugins[i][this.ATTR_TITLE];
					}
					continue;
				}
				if (numberOfAccessiblePlugins > 0) {
					accessiblePluginsUrl = accessiblePluginsUrl + '^OR';
				}
				numberOfAccessiblePlugins++;
				accessiblePluginsUrl = accessiblePluginsUrl + 'sys_id=' + plugins[i].sys_id;
			}
			var pluginUrlParams = {};
			if (accessiblePluginsUrl) {
				if (numberOfAccessiblePlugins > 1) {
					pluginUrlParams.sysparm_query = accessiblePluginsUrl;
					accessiblePluginsUrl = this._makeUrl(this.SYS_PLUGINS_LIST, pluginUrlParams);
				} else {
					accessiblePluginsUrl = this.SYS_PLUGIN + '?' + accessiblePluginsUrl;
				}
				pluginUrlParams = {};
			}
			pluginUrlParams.sysparm_accessible_plugins = accessiblePluginsUrl;
			pluginUrlParams.sysparm_non_accessible_plugins = nonAccessiblePluginsList;
			var gotoUrl = this._makeUrl(this.EXTERNAL_PLUGIN_HANDLER, pluginUrlParams);
			pluginHandlerUiPageUrl = this._getExternalHandlerRedirectedUrl(gotoUrl, true);
		}
		return pluginHandlerUiPageUrl;
	},

	/**
	 * Populates the locked_status for use on the UI
	 * @param contentGr	The GlideRecord object of gsw_content table
	 * @param params	The GlideRequest parameter map
	 * @param lockedStatus	The locked status object to update
	 * @returns {is_locked: boolean, locked_due_to.contents / locked_due_to.contents_with_plugin_dependencies: Array of gsw_content objects,
				 locked_due_to.plugins: Array of v_plugins, plugin_url: url of dependent and inactive plugins}
	 * @private
	 */
	_getLockedStatus: function (/*GlideRecord*/ contentGr, /*boolean*/ fetchImplicits) {
		var lockedStatus = {
			is_locked: false,
			locked_due_to: {
				contents: [],
				plugins: [],
				contents_with_plugin_dependencies: []
			},
			plugin_url: ''
		};
		lockedStatus.locked_due_to.contents = this._getLockedStatusDueToContents(contentGr, fetchImplicits);
		lockedStatus.locked_due_to.contents_with_plugin_dependencies = this._getLockedStatusDueToImplicitPluginDependency(contentGr);
		// If parent content is locked there is no need to show plugin dependency.
		if (!(lockedStatus.locked_due_to.contents.length || lockedStatus.locked_due_to.contents_with_plugin_dependencies.length)) {
			lockedStatus.locked_due_to.plugins = this._getLockedStatusDueToPlugins(contentGr);
			if (lockedStatus.locked_due_to.plugins.length) {
				this._updateLockStatusForContents(contentGr, lockedStatus.locked_due_to.contents_with_plugin_dependencies);
				lockedStatus.plugin_url = this._getPluginsListUrl(lockedStatus.locked_due_to.plugins);
			}
		}

		if (lockedStatus.locked_due_to.contents.length || lockedStatus.locked_due_to.plugins.length || lockedStatus.locked_due_to.contents_with_plugin_dependencies.length) {
			lockedStatus.is_locked = true;
		}
		return lockedStatus;
	},

	_prepareParentContents: function (contentGr, params, level) {
		var parentContents = [];
		var cats = [];
		this._getParentContentDetails(cats, contentGr, params, level);
		var pLevel = 1;
		for (var i = cats.length - 1; i >= 0; i--) {
			var c = cats[i];
			c.level = pLevel++;
			parentContents.push(c);
		}
		return parentContents;
	},

	_prepareContentDetails: function (contentGr, params, level) {
		if (typeof level == 'undefined')
			level = 1;
		var wantedLevels = this._getIntParamVal('max_levels', params, 2);
		var content = {};
		content.sys_id = contentGr.getUniqueValue();
		content.title = contentGr.getDisplayValue(this.ATTR_TITLE);
		content.order = this._getIntValue(contentGr, this.ATTR_ORDER);
		content.sys_class_name = contentGr.getValue(this.ATTR_SYS_CLASS_NAME);
		content.parent = contentGr.getValue(this.ATTR_PARENT);
		content.description = contentGr.getDisplayValue(this.ATTR_DESCRIPTION);
		content.supports_child_content = this._getBoolValue(contentGr,
															this.ATTR_SUPPORTS_CHILD_CONTENT, false);
		content.weight = this._getIntValue(contentGr, this.ATTR_WEIGHT);
		content.skippable = this._getBoolValue(contentGr, this.ATTR_SKIPPABLE, false);

		if (this._getParamVal('locked_status', params) == 'explicit') {
			content.locked_status = this._getLockedStatus(contentGr, false);
		} else if (this._getParamVal('locked_status', params, 'explicit-implicit') == 'explicit-implicit') {
			content.locked_status = this._getLockedStatus(contentGr, true);
			params.locked_status = ['explicit'];
		}

		var pc = this._getParamVal('parent_contents', params);
		if (pc == 'full' || pc == 'yes') {
			// Currently there are no usecases where this param is needed recursively.
			this._removeParam('parent_contents', params);
			content.parent_contents = this._prepareParentContents(contentGr, params, level);
		}

		if (this._getBoolParamVal('audit_info', params, false)) {
			content.audit = {
				last_change_date: null,
				progress: null,
				last_changed_by :null,
				status: null
			};

			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			statusGr.addQuery(this.ATTR_CONTENT, content.sys_id);
			statusGr.query();
			if (statusGr.next()) {
				var logGr = statusGr[this.ATTR_RELATED_LOG_ENTRY].getRefRecord();
				content.audit.last_change_date = logGr.getValue(this.ATTR_CHANGE_DATE);
				content.audit.last_changed_by = statusGr.getDisplayValue(this.ATTR_RELATED_LOG_ENTRY + '.' + this.ATTR_CHANGED_BY);
				if (!content.audit.last_changed_by) {
					// In case of maint access the userid saved in log could be invalid.
					// Also we do not want to get name always from sys column since the
					// above logic allows us to get the updated user name.
					content.audit.last_changed_by = statusGr.getDisplayValue(this.ATTR_RELATED_LOG_ENTRY + '.' + this.ATTR_SYS_CREATED_BY);
				}
				content.audit.progress = statusGr.progress * 1.00;
				content.audit.status = statusGr.status * 1;

				if (logGr.getValue(this.ATTR_RELATED_CHANGE_LOG_ENTRY)) {
					var relatedLogGr = logGr[this.ATTR_RELATED_CHANGE_LOG_ENTRY].getRefRecord();
					if (relatedLogGr) {
						var logContentGr = relatedLogGr[this.ATTR_CONTENT].getRefRecord();
						content.audit.auto_action_for = {
							title: logContentGr.getDisplayValue(this.ATTR_TITLE) + '',
							sys_id: logContentGr.getUniqueValue()
						};
					}
				}

			} else {
				content.audit.progress = 0.00;
				content.audit.status = this.STATUS_TYPE.NOT_STARTED;
			}

			if (this._getParamVal('parent_skip_info', params, 'yes') == 'yes') {
				content.audit.parent_skip_info = this._getParentSkipInfo(contentGr);
				params.parent_skip_info = ['no'];
			}
		}

		if (content.sys_class_name == this.TABLE_CONTENT_INFORMATION) {
			var contentInfoGr = new GlideRecord(this.TABLE_CONTENT_INFORMATION);
			if (contentInfoGr.get(content.sys_id)) {
				content.article = contentInfoGr.getDisplayValue(this.ATTR_ARTICLE);
				content.quick_startable = this._getBoolValue(contentInfoGr, this.ATTR_QUICK_STARTABLE, false);
				content.end_point_open_mode = this._getIntValue(contentInfoGr, this.ATTR_END_POINT_OPEN_MODE);
				content.end_point = this._getEndUrlForEndPointTypes(contentInfoGr);
				if (content.end_point_open_mode == this.END_POINT_OPEN_MODE_TYPE.INLINE)
					content.end_point_modal_fallback =
						this._getEndUrlForEndPointTypes(contentInfoGr,
														this.END_POINT_OPEN_MODE_TYPE.MODAL);
				content.qualifier = contentInfoGr.getValue(this.ATTR_QUALIFIER) + '';
			}
		} else if (content.sys_class_name == this.TABLE_CONTENT_GROUP) {
			var contentGroupGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			if (contentGroupGr.get(content.sys_id)) {
				content.group_contents = [];
				content.icon = contentGroupGr.getDisplayValue(this.ATTR_ICON);
				content.children_layout = this._getIntValue(contentGroupGr, this.ATTR_CHILDREN_LAYOUT);
				content.is_root_content = this._getBoolValue(contentGroupGr, this.ATTR_IS_ROOT_CONTENT, false);

				if (content.is_root_content) {
					content.display_child_max_num = this._getIntValue(contentGroupGr, this.ATTR_DISPLAY_CHILD_MAX_NUM);
					content.root_intro_frame_link = contentGroupGr.getValue(this.ATTR_ROOT_INTRO_FRAME_LINK);
				}

				if (level + 1 <= wantedLevels) {
					var contentWithinGr = new GlideRecord(this.TABLE_CONTENT);
					contentWithinGr.addActiveQuery();
					contentWithinGr.addQuery(this.ATTR_PARENT, contentGr.getUniqueValue());
					this._addOrderBy(contentWithinGr, params);
					contentWithinGr.query();
					while(contentWithinGr.next()) {
						content.group_contents.push(
							this._prepareContentDetails(contentWithinGr, params, level + 1));
					}
				} else {
					content.group_contents_not_fetched = true;
				}
			}
		}
		return content;
	},

	_getParentSkipInfo: function (contentGr) {
		var parentSkipInfo = {
			is_skipped: false,
			title: null,
			sys_id: null
		}
		var parents = this._getAllParentIds(contentGr).join();
		if (parents) {
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			statusGr.addQuery(this.ATTR_CONTENT, 'IN', parents);
			statusGr.addQuery(this.ATTR_STATUS, this.STATUS_TYPE.INACTIVE);
			statusGr.query();

			if (statusGr.next()) { //Only one record in hierarchy can be inactive.
				parentSkipInfo.is_skipped = true;
				var contentGr = statusGr[this.ATTR_CONTENT].getRefRecord();
				parentSkipInfo.title = contentGr.getDisplayValue(this.ATTR_STATUS);
				parentSkipInfo.sys_id = contentGr.getUniqueValue();
			}
		}
		return parentSkipInfo;
	},

	_getEndUrlForEndPointTypes: function (contentInfoGr, forcedOpenMode) {
		var table = contentInfoGr.getValue(this.ATTR_TABLE);
		var field = contentInfoGr.getValue(this.ATTR_FIELD);
		var endPointType = this._getIntValue(contentInfoGr, this.ATTR_END_POINT_TYPE);
		var endPointOpenMode = forcedOpenMode ? forcedOpenMode : this._getIntValue(contentInfoGr, this.ATTR_END_POINT_OPEN_MODE);
		var fieldSysId = '';
		if (endPointType === this.END_POINT_TYPE.CUSTOM) {
			var endPointUrl = contentInfoGr.getValue(this.ATTR_END_POINT) + '';
			if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.MODAL) {
				//PRB654270 is open for cases where links break on clicking on 'i' in lists
				return this._getExternalHandlerRedirectedUrl(endPointUrl, true);
			} else if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.INLINE) {
				return this._getExternalHandlerRedirectedUrl(endPointUrl, false);
			} else {
				return endPointUrl;
			}
		} else if (endPointType === this.END_POINT_TYPE.CONFIGURE_CHOICES) {
			endPointUrlParams = {};
			endPointUrlParams.sysparm_form = 'sys_choice';
			endPointUrlParams.sysparm_ref = table + '.' + field;
			this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_referring_url');
			this._setStackParam(endPointUrlParams, endPointOpenMode);
			endPointUrlParams.sysparm_dependent = 'null';
			return this._makeUrl(this.END_POINTS.CONFIGURE_CHOICE_SLUSHBUCKET, endPointUrlParams);
		} else if (endPointType === this.END_POINT_TYPE.CONFIGURE_LABEL) {
			var hierarchyTableNames = new GlideTableHierarchy(table).getTables();
			for (var i = 0 ; i < hierarchyTableNames.length; i++) {
				var parentTable = hierarchyTableNames[i];
				var gr = new GlideRecord(this.END_POINTS.SYS_DOCUMENTATION_TABLE);
				gr.addQuery('name', parentTable);
				gr.addQuery('element', field);
				gr.query();
				if (gr.next()) {
					fieldSysId = gr.getUniqueValue();
				}
				if (fieldSysId)
					break;
			}
			endPointUrlParams = {};
			this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_goto_url');
			this._setStackParam(endPointUrlParams, endPointOpenMode);
			endPointUrlParams.sys_id = fieldSysId;
			return this._makeUrl(this.END_POINTS.SYS_DOCUMENTATION, endPointUrlParams);
		}  else if (endPointType === this.END_POINT_TYPE.ASSIGNMENT_RULE) {
			endPointUrlParams = {};
			endPointUrlParams.sysparm_query = 'table=' + table;
			return this._makeUrl(this.END_POINTS.SYSRULE_ASSIGNMENT_LIST, endPointUrlParams);
		} else if (endPointType === this.END_POINT_TYPE.FORM_LAYOUT) {
			var formGr = new GlideRecord(this.END_POINTS.SYS_UI_SECTION_TABLE);
			formGr.addQuery('name', table);
			formGr.query();
			if (formGr.next()) {
				endPointUrlParams = {};
				endPointUrlParams.sysparm_list = formGr.getUniqueValue();
				endPointUrlParams.sysparm_form = 'section';
				this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_referring_url');
				this._setStackParam(endPointUrlParams, endPointOpenMode);
				return this._makeUrl(this.END_POINTS.FORM_LAYOUT_SLUSHBUCKET, endPointUrlParams);
			}
		}  else if (endPointType === this.END_POINT_TYPE.CONFIGURE_TABLE) {
			endPointUrlParams = {};
			this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_goto_url');
			this._setStackParam(endPointUrlParams, endPointOpenMode);
			return this._makeUrl('/' + table + '.do', endPointUrlParams);
		}
	},

	_setStackParam: function (endPointUrlParams, endPointOpenMode) {
		if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.TAB) {
			endPointUrlParams.sysparm_clear_stack = 'true';
			endPointUrlParams.sysparm_nameofstack = this.GUIDED_SETUP_STACK_NAME;
		} else if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.MODAL
		   || endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.INLINE) {
			endPointUrlParams.sysparm_stack = 'no';
		}
	},

	_setReferringUrlParam: function (endPointUrlParams, endPointOpenMode, paramName) {
		if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.INLINE) {
			endPointUrlParams[paramName] = this.CURRENT_URL_TOKEN;
		} else {
			endPointUrlParams[paramName] = this.END_POINTS.RETURN_URL;
		}
	},

	_getParentContentDetails: function (parentDetailsArr, contentGr, params, level) {
		var isFullDetails = this._getParamVal('parent_contents', params) == 'full';
		var parentSysid = contentGr.getValue(this.ATTR_PARENT);
		if (parentSysid) {
			var d = {};
			var parentContentGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			if (parentContentGr.get(parentSysid)) {
				if (isFullDetails) {
					d = this._prepareContentDetails(parentContentGr, params, level);
				} else {
					d = {
						sys_id: parentSysid,
						title: parentContentGr.getDisplayValue(this.ATTR_TITLE)
					};
				}
				parentDetailsArr.push(d);
				this._getParentContentDetails(parentDetailsArr, parentContentGr, params);
			}
		}
	},

	getChildrenContentDetails: function (contentTable, parentId, params) {
		// This will return all children of parentId, given some criteria
		// which matches the given match_query.
		var contents = [];

		var contentsGr = new GlideRecord(contentTable);
		contentsGr.addActiveQuery();
		contentsGr.addQuery(this.ATTR_PARENT, parentId);
		this._addOrderBy(contentsGr, params);
		var q = this._getParamVal('match_query', params);
		if (q)
			contentsGr.addEncodedQuery(q);
		contentsGr.query();
		while (contentsGr.next()) {
			contents.push(this._prepareContentDetails(contentsGr, params, 1));
		}

		var grpGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
		grpGr.addActiveQuery();
		grpGr.addQuery(this.ATTR_PARENT, parentId);
		this._addOrderBy(grpGr, params);
		grpGr.query();
		while (grpGr.next()) {
			contents = contents.concat(
				this.getChildrenContentDetails(contentTable, grpGr.getUniqueValue(), params));
		}
		return contents;
	},

	getRootContentDetails: function (contentId /*content for which to discover root*/, params) {
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		if (!contentGr.get(contentId)) {
			throw {
				message: gs.getMessage('Content was not found'),
				error_code: this.ERR_CONTENT_NOT_FOUND,
				is_user_message: true,
				status: 404
			};
		}

		var rootContentId = this._quicklyFindRootContentIdForContent(contentGr);
		if (!rootContentId) {
			// If root is not yet stamped, then fallback to slower approach.
			rootContentId = this._findRootContentIdForContentGr(contentGr);
		}
		return this.getContentDetails(rootContentId, params);
	},

	_quicklyFindRootContentIdForContent: function (contentGr) {
		var rootContentId = contentGr.getValue(this.ATTR_ROOT_PARENT);
		if (!rootContentId && !contentGr.getValue(this.ATTR_PARENT))
			rootContentId = contentGr.getUniqueValue();
		return rootContentId;
	},

	_findRootContentIdForContent: function (contentId) {
		var gr = new GlideRecord(this.TABLE_CONTENT);
		if (gr.get(contentId)) {
			return this._findRootContentIdForContentGr(gr);
		} else {
			throw {
				message: gs.getMessage('Content was not found'),
				error_code: this.ERR_CONTENT_NOT_FOUND,
				is_user_message: true,
				status: 404
			};
		}
	},

	_findRootContentIdForContentGr: function (contentGr) {
		if (!contentGr.getValue(this.ATTR_PARENT))
			return contentGr.getUniqueValue();
		var parentDetailsArr = [];
		this._getParentContentDetails(parentDetailsArr, contentGr, {}, 0);
		if (parentDetailsArr.length > 0)
			return parentDetailsArr[parentDetailsArr.length - 1].sys_id;
	},

	stampParentsInContent: function(contentGr) {
		contentGr.setValue(this.ATTR_PARENTS, this._getParentsForContent(contentGr, []).join());
		return contentGr.update();
	},

	_getParentsForContent: function(contentGr, parents) {
		if (!parents) {
			parents = [];
		}
		if (contentGr.getValue(this.ATTR_PARENT)) {
			parents.push(contentGr.getValue(this.ATTR_PARENT));
			this._getParentsForContent(contentGr[this.ATTR_PARENT].getRefRecord(), parents);
		}
		return parents;
	},

	stampRootParentInContent: function (contentGr) {
		if (contentGr.getValue(this.ATTR_PARENT)) {
			var rootContentId = this._findRootContentIdForContent(contentGr.getUniqueValue());
			contentGr.setValue(this.ATTR_ROOT_PARENT, rootContentId);
		} else
			contentGr.setValue(this.ATTR_ROOT_PARENT, 'NULL');
		return contentGr.update();
	},

	stampRootParentOnChildren: function (parentContentGr) {
		var newRootContentId = parentContentGr.getValue(this.ATTR_ROOT_PARENT);
		if (!newRootContentId)
			newRootContentId = parentContentGr.getUniqueValue();
		var children = this._getAllChildrenIds(parentContentGr);
		if (children.length > 0) {
			var childrenGr = new GlideRecord(this.TABLE_CONTENT);
			childrenGr.addQuery(this.ATTR_SYS_ID, 'IN', children.join());
			childrenGr.setValue(this.ATTR_ROOT_PARENT, newRootContentId);
			childrenGr.updateMultiple();
		}
	},

	getNonDependentIds: function (contentGr) {
		var combinedIds = this.arrayUtil.concat(this._getAllParentIds(contentGr), this._getAllChildrenIds(contentGr));
		combinedIds.push(contentGr.getUniqueValue());
		var qry = '';
		var arr = [];
		var i = 0;
		while (i < combinedIds.length) {
			qry = qry + 'sys_idNOT IN';
			if (i + 999 < combinedIds.length) {
				arr = combinedIds.slice(i, i + 999);
			} else {
				arr = combinedIds.slice(i, combinedIds.length);
			}
			qry = qry + arr.join(',');
			i = i + 999;
			if (i < combinedIds.length) {
				qry = qry + '^OR';
			}
		}
		return qry;
	},

	_getAllParentIds: function (contentGr, arr) {
		if (!arr) {
			arr = [];
		}
		if(contentGr) {
			if (contentGr.getValue(this.ATTR_PARENTS)) { //get list of parents
				this.arrayUtil.concat(arr, contentGr.getValue(this.ATTR_PARENTS).split(','));
			} else if (contentGr.getElement(this.ATTR_PARENT)) { //try fall back method if parents is not populated but parent is populated.
				var parentEl = contentGr.getElement(this.ATTR_PARENT);
				var parent = parentEl.getRefRecord();
				arr.push(parent.getUniqueValue());
				this._getAllParentIds(parent, arr);
			}
		}
		return arr;
	},

	//ToDo - As this is used during definition time and we do not have a fall back detection mechanism,
	//not using ATTR_PARENTS here. After all metadata verification, including express will change this to always
	//use ATTR_PARENTS
	_getAllChildrenIds: function (contentGr, arr) {
		if (!arr) {
			arr = [];
		}
		var childGr = new GlideRecord(this.TABLE_CONTENT);
		childGr.addQuery(this.ATTR_PARENT, contentGr.getUniqueValue());
		childGr.query();
		while (childGr.next()) {
			arr.push(childGr.getUniqueValue());
			this._getAllChildrenIds(childGr, arr);
		}
		return arr;
	},

	processNavAction: function (action, data, params) {
		var url;
		if (action == 'saveToGlideStack') {
			url = data.url;
			var name = data.stack_name;
			if (!name)
				name = 'default'; // Needed else REST fwk sets stack to api by default.
			//if (url) Commented until we get this API - PRB654821
			//	gs.getSession().getStack(name).push(url);
		}
	},

	getTableFields: function (table, onlyChoices) {
		var tableRecord = new GlideRecord(table);
		if (!tableRecord.isValid())
			throw {
				message: gs.getMessage('Table not valid'),
				error_code: this.ERR_TABLE_NOT_VALID,
				is_user_message: true,
				status: 400
			};
		var res = [];
		var els = tableRecord.getElements();
		for (var i = 0; i < els.length; i++) {
			var ed = els[i].getED();
			if (onlyChoices && !ed.isChoiceTable())
				continue;
			if (this.arrayUtil.contains(this.BLACKLISTED_FIELDS, ed.getName()))
				continue;
			res.push(ed.getName());
		}
		return res;
	},

	restSecurityWrapper: function (securityCheckResult) {
		if (!securityCheckResult) {
			throw {
				message: gs.getMessage('Security constraints prevent accessing the service'),
				error_code: this.ERR_REST_SECURITY,
				is_user_message: true,
				status: 400
			};
		} else {
			return true;
		}
	},

	isAuditCreateDeleteAllowed: function () {
		// CREATE and DELETE are allowed on audit for maint role
		// for demo usage by internal users and debugging.
		// WRITE is not checked as all audit fields are read-only
		return gs.hasRole('maint');
	},

	isAuditReadAllowed: function () {
		return gs.hasRole('admin');
	},

	isMetaAccessAllowed: function () {
		//Used by services which should be provided access to when meta read is allowed.
		return this.isMetaReadAllowed();
	},

	isMetaReadAllowed: function () {
		return gs.hasRole('admin');
	},

	isMetaUpdateAllowed: function () {
		return gs.hasRole('maint');
	},

	_updateChangeLog: function(contentId, action, relatedEntry) {
		action = action * 1;
		var gr = new GlideRecord(this.TABLE_CHANGE_LOG);
		gr.initialize();
		if (action == this.LOG_TYPE.INITIATED) {
			gr.setWorkflow(false);
		} else if (action == this.LOG_TYPE.DEACTIVATED) {
			var contentGr = new GlideRecord(this.TABLE_CONTENT);
			if (contentGr.get(contentId)) {
				if (!this._getBoolValue(contentGr, this.ATTR_SKIPPABLE, false)) {
					// Then we can't deactivate this content
					return '';
				}
			}
		}
		gr.setValue(this.ATTR_CONTENT, contentId);
		gr.setValue(this.ATTR_TYPE, action);
		gr.setValue(this.ATTR_CHANGED_BY, gs.getUserID());
		gr.setValue(this.ATTR_CHANGE_DATE, new GlideDateTime());
		if (relatedEntry) {
			gr.setValue(this.ATTR_RELATED_CHANGE_LOG_ENTRY, relatedEntry.getUniqueValue());
		}
		return gr.insert();
	},

	/*
	* Embedded help action click will send the screen back to Guided Setup post PRB661752 fix.
	* This method still continues to return the list of valid buttons as per content status.
	* Activate button is never returned in response, as express doesn't show that. Also there is no requirement
	* to show it as configure will be disabled for skipped tasks. And skipping from embedded help
	* will take user back to guided setup.
	*/
	_getRespForEmbeddedHelpActions: function(contentId, action) {
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		var showSkip = true;
		if (contentGr.get(contentId)) {
			var parentSkipInfo = this._getParentSkipInfo(contentGr);
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			if (statusGr.get(this.ATTR_CONTENT, contentId)) { //only one record is expected per content in status table
				var currentStatus = this._getIntValue(statusGr, this.ATTR_STATUS);
				if (parentSkipInfo.is_skipped || currentStatus == this.STATUS_TYPE.INACTIVE || !this._getBoolValue(contentGr, this.ATTR_SKIPPABLE, false)) {
					showSkip = false;
				}
				var lockedStatus = this._getLockedStatus(contentGr, true);
				if (lockedStatus.is_locked) {
					return this._prepareButtonList(contentId, false, false, showSkip);
				}
				if (currentStatus == this.STATUS_TYPE.IN_PROGRESS || currentStatus == this.STATUS_TYPE.NOT_STARTED) {
					//user requested to change status to complete. However current status is incomplete
					if (action == this.LOG_TYPE.COMPLETED) {
						gs.addInfoMessage(gs.getMessage("This Guided Setup activity's status has changed. So requested action is no longer valid."));
					}
					return this._prepareButtonList(contentId, true, false, showSkip);
				}
				if (currentStatus == this.STATUS_TYPE.COMPLETED) {
					//user requested to change status to incomplete. However current status is complete
					if (action == this.LOG_TYPE.UNCOMPLETED) {
						gs.addInfoMessage(gs.getMessage("This Guided Setup activity's status has changed. So requested action is no longer valid."));
					}
					return this._prepareButtonList(contentId, false, true, showSkip);
				}
			}
		}
	},

	_prepareButtonList: function(contentId, showComplete, showIncomplete, showSkip) {
		var buttonList = [];
		if (showComplete) {
			buttonList.push({
				name: this.EMBEDDED_HELP_ACTION_NAMES.COMPLETE,
				apiUrl: this.API_URL_EMBEDDED_HELP_ACTIONS + contentId + '/' + this.LOG_TYPE.COMPLETED
			});
		}
		if (showIncomplete) {
			buttonList.push({
				name: this.EMBEDDED_HELP_ACTION_NAMES.INCOMPLETE,
				apiUrl: this.API_URL_EMBEDDED_HELP_ACTIONS + contentId + '/' + this.LOG_TYPE.UNCOMPLETED
			});
		}
		if (showSkip) {
			buttonList.push({
				name: this.EMBEDDED_HELP_ACTION_NAMES.SKIP,
				apiUrl: this.API_URL_EMBEDDED_HELP_ACTIONS + contentId + '/' + this.LOG_TYPE.DEACTIVATED
			});
		}
		return buttonList;
	},

	embeddedHelpActions: function(contentId, action) {
		if (action == this.LOG_TYPE.VISITED || action == this.LOG_TYPE.INITIATED || action == this.LOG_TYPE.REACTIVATED) {
			throw 'This action is invalid.';
		} else {
			this._updateChangeLog(contentId, action);
			return this._getRespForEmbeddedHelpActions(contentId, action);
		}
	},

	updateChangeLog: function(contentId, action) {
		if (this._updateChangeLog(contentId, action)) {
			return {};
		}
	},

	/*
	*	Function to update status of gsw_content based on log entry.
	*	Currently completion / uncompletion transactions via this function are only made by content_item.
	*	Activation / De-activation is possible by all.
	*/
	updateStatusOfContent: function(changeLogGr) {
		var logType = this._getIntValue(changeLogGr, this.ATTR_TYPE);
		var contentGr = changeLogGr[this.ATTR_CONTENT].getRefRecord();
		var contentId = contentGr.getUniqueValue();
		var weight = contentGr.getValue(this.ATTR_WEIGHT) * 1.00;
		var updatedStatus;
		var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
		if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP
			&& logType != this.LOG_TYPE.DEACTIVATED && logType != this.LOG_TYPE.REACTIVATED && logType != this.LOG_TYPE.VISITED) {
			return;
		}
		if (statusGr.get(this.ATTR_CONTENT, contentId)) { //only one record is expected per content in status table
			var needsUpdate = false;
			var currentStatus = this._getIntValue(statusGr, this.ATTR_STATUS);
			if (logType == this.LOG_TYPE.COMPLETED) {
				if (currentStatus != this.STATUS_TYPE.COMPLETED) {
					updatedStatus = this.STATUS_TYPE.COMPLETED;
					statusGr.setValue(this.ATTR_STATUS, updatedStatus);
					statusGr.setValue(this.ATTR_PROGRESS, 100.00);
					needsUpdate = true;
				}
			} else if (logType == this.LOG_TYPE.UNCOMPLETED) {
				if (currentStatus != this.STATUS_TYPE.IN_PROGRESS) {
					updatedStatus = this.STATUS_TYPE.IN_PROGRESS;
					statusGr.setValue(this.ATTR_STATUS, updatedStatus);
					statusGr.setValue(this.ATTR_PROGRESS, 0.00);
					needsUpdate = true;
					this._updateStatusOfDependents(contentId, this.LOG_TYPE.UNCOMPLETED, changeLogGr);
				}
			} else if (logType == this.LOG_TYPE.VISITED || logType == this.LOG_TYPE.CONFIGURED) {
				var parentSkipInfo = this._getParentSkipInfo(contentGr);
				//we stop tracking visited or configured after completion or deactivation for status table as the status remains completed / skipped.
				//log would keep tracking visited or configured though.
				if (currentStatus != this.STATUS_TYPE.COMPLETED && currentStatus != this.STATUS_TYPE.INACTIVE && !parentSkipInfo.is_skipped) {
					statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.IN_PROGRESS);
					needsUpdate = true;
				}
			} else if (logType == this.LOG_TYPE.DEACTIVATED && this._getBoolValue(contentGr, this.ATTR_SKIPPABLE, false)) {
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.INACTIVE);
				statusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, 0.00);
				needsUpdate = true;
				this._updateStatusOfDependents(contentId, this.LOG_TYPE.DEACTIVATED, changeLogGr);
			} else if (logType == this.LOG_TYPE.REACTIVATED) {
				//We are re-activating a content which was previously inactive.
				//We will re-calculate progress to determine its state on re-activation.
				this._updateStatusOnReactivation(contentGr, statusGr);
				needsUpdate = true;
			}
			if (!needsUpdate) {
				return;
			}
			statusGr.setValue(this.ATTR_RELATED_LOG_ENTRY, changeLogGr.getUniqueValue());
			return statusGr.update();
		} else {
			statusGr.initialize();
			var progress = 0.00;
			if (logType == this.LOG_TYPE.COMPLETED) {
				updatedStatus = this.STATUS_TYPE.COMPLETED;
				progress = 100.00;
				statusGr.setValue(this.ATTR_STATUS, updatedStatus);
			} else if (logType == this.LOG_TYPE.UNCOMPLETED || logType == this.LOG_TYPE.VISITED) {
				updatedStatus = this.STATUS_TYPE.IN_PROGRESS;
				statusGr.setValue(this.ATTR_STATUS, updatedStatus);
			} else if (logType == this.LOG_TYPE.DEACTIVATED) {
				weight = 0;
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.INACTIVE);
			} else if (logType == this.LOG_TYPE.REACTIVATED) {
				return;
				//Activation request for a new status record is invalid. A record needs to be inactive
				//to be activated.
			}
			statusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, weight);
			statusGr.setValue(this.ATTR_CONTENT, contentId);
			statusGr.setValue(this.ATTR_RELATED_LOG_ENTRY, changeLogGr.getUniqueValue());
			statusGr.setValue(this.ATTR_PROGRESS, progress);
			return statusGr.insert();
		}
	},

	_updateStatusOnReactivation: function(contentGr, statusGr) {
		if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION) {
			statusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, contentGr.getValue(this.ATTR_WEIGHT) * 1.00);
			if (statusGr.getValue(this.ATTR_PROGRESS) * 1.00 == 100.00) {
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.COMPLETED);
			} else {
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.IN_PROGRESS);
			}
		} else if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP) {
			var progress = this._getContentGroupProgress(contentGr.getUniqueValue());
			statusGr.setValue(this.ATTR_PROGRESS, progress.calculatedProgress);
			if (progress.isComplete) {
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.COMPLETED);
			} else {
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.IN_PROGRESS);
			}
			statusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, progress.effectiveWeight);
		}
	},

	_updateStatusOfDependents: function(content, action, relatedEntry) {
		var dependentGr = new GlideRecord(this.TABLE_CONTENT);
		dependentGr.addQuery(this.ATTR_DEPENDENT_ON_CONTENTS, 'CONTAINS', content);
		dependentGr.query();
		while (dependentGr.next()) {
			this._updateChangeLog(dependentGr.getUniqueValue(), action, relatedEntry);
		}
	},

	_getContentGroupProgress: function(groupContentId) {
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		contentGr.addActiveQuery();
		contentGr.addQuery(this.ATTR_PARENT, groupContentId);
		contentGr.query();
		var actualProgressTotal = 0.00;
		var fullProgressTotal = 0.00;
		var completed = true;
		var effectiveWeight = 0.00;
		var activeChildrenCount = 0;
		var sumOfChildrenWeight = 0.00;
		while (contentGr.next()) {
			var weight = 0.00;
			var progress = 0.00;
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			if (statusGr.get(this.ATTR_CONTENT, contentGr.getUniqueValue())) { //only one record is expected per content in status table
				progress = statusGr.getValue(this.ATTR_PROGRESS) * 1.00;
				weight = statusGr.getValue(this.ATTR_EFFECTIVE_WEIGHT) * 1.00;
				if (this._getIntValue(statusGr, this.ATTR_STATUS) != this.STATUS_TYPE.COMPLETED && this._getIntValue(statusGr, this.ATTR_STATUS) != this.STATUS_TYPE.INACTIVE) {
					completed = false;
				}
			} else {
				if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION) {
					weight = contentGr.getValue(this.ATTR_WEIGHT) * 1.00;
					progress = 0.00;
					completed = false;
				} else if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP){
					var grpProgress = this._getContentGroupProgress(contentGr.getUniqueValue());
					weight = grpProgress.effectiveWeight;
					progress = grpProgress.calculatedProgress;
					completed = grpProgress.isComplete;
				}

			}
			if (weight != 0.00) { //for deactivated contents the weight is 0.
				sumOfChildrenWeight = sumOfChildrenWeight + weight;
				activeChildrenCount ++;
				actualProgressTotal = actualProgressTotal + weight * progress;
				fullProgressTotal = fullProgressTotal + weight * 100.00;
			}
		}
		if (activeChildrenCount == 0) {
			effectiveWeight = 0.00;
		} else {
			effectiveWeight = sumOfChildrenWeight / activeChildrenCount;
		}
		var calculatedProgress = 0.00;
		if (fullProgressTotal != 0.00) {
			calculatedProgress = (actualProgressTotal / fullProgressTotal) * 100.00;
		}
		if (actualProgressTotal == 0.00 && fullProgressTotal == 0.00) { //This case is possible when all children are inactivated
			calculatedProgress = 0.00;
			completed = false;
		}
		return {
			calculatedProgress: calculatedProgress,
			effectiveWeight: effectiveWeight,
			isComplete: completed
		};
	},

	calculateParentProgress: function(parentContentId, relatedLogEntryId) {
		var progress = this._getContentGroupProgress(parentContentId);
		var answer;

		var status = this.STATUS_TYPE.IN_PROGRESS;
		if (progress.isComplete) {
			status = this.STATUS_TYPE.COMPLETED;
		}
		var previousStatus = this.STATUS_TYPE.NOT_STARTED;
		var parentStatusGr =  new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
		if (parentStatusGr.get(this.ATTR_CONTENT, parentContentId)) { //only one record is expected per content in status table
			previousStatus = this._getIntValue(parentStatusGr, this.ATTR_STATUS);
			parentStatusGr.setValue(this.ATTR_PROGRESS, progress.calculatedProgress);
			parentStatusGr.setValue(this.ATTR_STATUS, status);
			parentStatusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, progress.effectiveWeight);
			parentStatusGr.setValue(this.ATTR_RELATED_LOG_ENTRY, relatedLogEntryId);
			answer = parentStatusGr.update();
		} else {
			parentStatusGr.initialize();
			parentStatusGr.setValue(this.ATTR_CONTENT, parentContentId);
			parentStatusGr.setValue(this.ATTR_PROGRESS, progress.calculatedProgress);
			parentStatusGr.setValue(this.ATTR_STATUS, status);
			parentStatusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, progress.effectiveWeight);
			parentStatusGr.setValue(this.ATTR_RELATED_LOG_ENTRY, relatedLogEntryId);
			answer = parentStatusGr.insert();
		}

		if (answer && relatedLogEntryId) {
			var relatedLogEntryGr = new GlideRecord(this.TABLE_CHANGE_LOG);
			if (relatedLogEntryGr.get(relatedLogEntryId)) {
				if (status == this.STATUS_TYPE.COMPLETED) {
					//If the group is completed, we log a informational log useful for analytics.
					//Status change for this informational log entry is rejected.
					this._updateChangeLog(parentContentId, this.LOG_TYPE.COMPLETED, relatedLogEntryGr);
				} else if (previousStatus == this.STATUS_TYPE.COMPLETED && status != this.STATUS_TYPE.COMPLETED) {
					//If the group is uncompleted, we log a informational log useful for analytics. Hence workflow is set false.
					//Status change for this informational log entry is rejected.
					this._updateChangeLog(parentContentId, this.LOG_TYPE.UNCOMPLETED, relatedLogEntryGr);
				}
			}
		}
		return answer;
	},

	updateParentWeight: function(parentContentId) {
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		contentGr.addActiveQuery();
		contentGr.addQuery(this.ATTR_PARENT, parentContentId);
		contentGr.query();
		var count = 0;
		var totalWeight = 0.00;
		while (contentGr.next()) {
			if (contentGr.getValue(this.ATTR_WEIGHT) * 1.00 != 0.00) {
				totalWeight = totalWeight + contentGr.getValue(this.ATTR_WEIGHT) * 1.00;
				count ++;
			}
		}
		var calculatedWeight = 0.00;
		if (count != 0) {
			calculatedWeight = totalWeight / count;
		}
		var parentContentGr = new GlideRecord(this.TABLE_CONTENT);
		if (parentContentGr.get(parentContentId)) {
			parentContentGr.setValue(this.ATTR_WEIGHT, calculatedWeight);
			return parentContentGr.update();
		}
	},

	createInitialStatusForContent: function(contentId, weight) {
		var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
		if (statusGr.get(this.ATTR_CONTENT, contentId)) {
			return;
		} else {
			statusGr.initialize();
			statusGr.setValue(this.ATTR_CONTENT, contentId);
			statusGr.setValue(this.ATTR_PROGRESS, 0);
			statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.NOT_STARTED);
			statusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, weight);
			statusGr.setValue(this.ATTR_RELATED_LOG_ENTRY, this._updateChangeLog(contentId, this.LOG_TYPE.INITIATED));
			statusGr.setWorkflow(false);
			return statusGr.insert();
		}
	},

	hasNoCyclicDependency: function(contentGr) {
		var startTime = new Date().getTime();
		var dependentContentIds = contentGr.getValue(this.ATTR_DEPENDENT_ON_CONTENTS);
		var parentContentId = contentGr.getValue(this.ATTR_PARENT);
		var selfContentId = contentGr.getValue(this.ATTR_SYS_ID);
		var dependentContentsList = [];
		if (dependentContentIds)
			dependentContentsList = (dependentContentIds + '').split(',');
		try {
			if (this.arrayUtil.contains(dependentContentsList, selfContentId)) {
				gs.addErrorMessage(gs.getMessage("A content cannot be added as its own dependency."));
				return false;
			} else if (this.arrayUtil.contains(dependentContentsList, parentContentId)) {
				gs.addErrorMessage(gs.getMessage("A content in parent hierarchy cannot be added as dependency."));
				return false;
			} else if (!this._checkDependentsWithParents(dependentContentsList, parentContentId)) {
				gs.addErrorMessage(gs.getMessage("A content in parent hierarchy cannot be added as dependency."));
				return false;
			} else if (!this._checkDependentsWithChildren(dependentContentsList, selfContentId)) {
				gs.addErrorMessage(gs.getMessage("A child content or their children cannot be added as dependency."));
				return false;
			} else if (!this._checkTransitiveDependency(contentGr)) {
				gs.addErrorMessage(gs.getMessage("This dependency definition will cause a cyclic dependency and can't be allowed"));
				return false;
			} else {
				return true;
			}
		} finally {
			var endTime = new Date().getTime();
			gs.info("Total time taken to detect cycles: " + (endTime - startTime) + "ms");
		}
	},

	_checkTransitiveDependency: function(contentGr) {
		var startTime = new Date().getTime();
		try {
			var rootContentId = this._quicklyFindRootContentIdForContent(contentGr);
			if (!rootContentId)
				// If root is not yet stamped, then fallback to slower approach.
				rootContentId = this._findRootContentIdForContentGr(contentGr); // contentGr might not be saved yet hence we need to send the gr instead of its sys_id.

			var dependentOnContentsMap = {};
			var isVisited = {};
			var isInRecursionStack = {};

			// We do this here so that we get the dependency as per the memory (unsaved changes).
			this._populateDependentContentsList(dependentOnContentsMap, isVisited, isInRecursionStack, contentGr);

			this._collectTree(rootContentId, dependentOnContentsMap, isVisited, isInRecursionStack);

			if (this._hasCycle(dependentOnContentsMap, isVisited, isInRecursionStack))
				return false;
			return true;
		} finally {
			var endTime = new Date().getTime();
			gs.info("Time taken to detect transitive cycles: " + (endTime - startTime) + "ms");
		}
	},

	_collectTree: function (rootContentId, dependentOnContentsMap, isVisited, isInRecursionStack) {
		dependentOnContentsMap[rootContentId] = [];
		isInRecursionStack[rootContentId] = false;
		isVisited[rootContentId] = false;

		var parentChildrenMap = {};
		var children, parentId;

		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		contentGr.addActiveQuery();
		contentGr.addQuery(this.ATTR_ROOT_PARENT, rootContentId);
		contentGr.query();
		while (contentGr.next()) {
			var contentId = contentGr.getUniqueValue();
			parentId = contentGr.getValue(this.ATTR_PARENT);
			if (!dependentOnContentsMap[contentId]) {
				this._populateDependentContentsList(dependentOnContentsMap, isVisited, isInRecursionStack, contentGr);
			}
			children = parentChildrenMap[parentId];
			if (!children)
				children = parentChildrenMap[parentId] = [];
			children.push(contentId);
		}
		for (parentId in parentChildrenMap) {
			children = parentChildrenMap[parentId];
			var depends = dependentOnContentsMap[parentId];
			if (typeof depends != 'undefined') {
				// Above is just a sanity check, this will be recaught later
				// and thrown with more details helpful for debugging.
				dependentOnContentsMap[parentId] =
					this.arrayUtil.concat(depends, children);
			}
		}
	},

	_populateDependentContentsList: function(dependentOnContentsMap, isVisited, isInRecursionStack, contentGr) {
		var contentId = contentGr.getUniqueValue();
		var depedentsList = contentGr.getValue(this.ATTR_DEPENDENT_ON_CONTENTS);
		if (depedentsList)
			depedentsList = (depedentsList + '').split(',');
		else
			depedentsList = [];
		dependentOnContentsMap[contentId] = depedentsList;
		isInRecursionStack[contentId] = false;
		isVisited[contentId] = false;
	},

	_hasCycle: function(dependentOnContentsMap, isVisited, isInRecursionStack) {
		for (var node in dependentOnContentsMap) {
			if (this._isCycleDetected(node, dependentOnContentsMap, isVisited, isInRecursionStack))
				return true;
		}
		return false;
	},

	_isCycleDetected: function(node, dependentOnContentsMap, isVisited, isInRecursionStack) {
		if (!isVisited[node]) {
			isInRecursionStack[node] = true;
			isVisited[node] = true;

			var adjacentNodes = dependentOnContentsMap[node];
			if (typeof adjacentNodes == 'undefined') // Will happen if due to coding error _populateDependentContentsList was not called for all nodes in the graph.
				throw 'Unexpected error: adjacentNodes is not populated for node: ' + node
					+ ', dependentOnContentsMap:' + JSON.stringify(dependentOnContentsMap);

			for (var i = 0; i < adjacentNodes.length; i++) {
				var n = adjacentNodes[i];
				if (isVisited[n] == true) {
					// If this node was already visited (that means it has already been processed and checked for cycles)
					// and we are still checking then certainly no cycles were detected for that node.
					if (isInRecursionStack[n] == true) // Means n is ancestor of (current) node, so this is a back edge.
						return true;
					// Else we have reached n via another branch which is okay.
				} else {
					// This node was not visited before, so now we need to process and check if it has any back edges.
					if (this._isCycleDetected(n, dependentOnContentsMap, isVisited, isInRecursionStack))
						return true;
				}
			}
		}
		isInRecursionStack[node] = false;
		return false;
	},

	_checkDependentsWithParents: function(dependentContentIds, contentId) {
		var gr = new GlideRecord(this.TABLE_CONTENT);
		if (gr.get(contentId)) {
			var parentContentId = gr.getValue(this.ATTR_PARENT);
			if (!parentContentId) {
				return true;
			} else if (this.arrayUtil.contains(dependentContentIds, parentContentId)) {
				return false;
			} else {
				return this._checkDependentsWithParents(dependentContentIds, parentContentId);
			}
		}
		return true;
	},

	_checkDependentsWithChildren: function(dependentContentIds, contentId) {
		var checkInSingleChild, checkInAllChilds;
		var gr = new GlideRecord(this.TABLE_CONTENT);
		gr.addQuery(this.ATTR_PARENT, contentId);
		gr.query();
		checkInAllChilds = true;
		while (gr.next()) {
			checkInSingleChild = false;
			if (this.arrayUtil.contains(dependentContentIds, gr.getUniqueValue())) {
				return false;
			} else {
				checkInSingleChild = this._checkDependentsWithChildren(dependentContentIds, gr.getUniqueValue());
			}
			if (!checkInSingleChild) {
				checkInAllChilds = checkInSingleChild;
				break;
			}
		}
		return checkInAllChilds;
	},

	isContentWeightValid: function(contentGr) {
		var weight = contentGr.getValue(this.ATTR_WEIGHT) * 1.00;
		if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP && !(weight >= this.WEIGHT_MIN_VAL && weight <= this.WEIGHT_MAX_VAL)) {
			gs.addErrorMessage(gs.getMessage('Weight for this content should be more than or equal to {0} and less than or equal to {1}.', [this.WEIGHT_MIN_VAL, this.WEIGHT_MAX_VAL]));
			return false;
		} else if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION && !(weight > this.WEIGHT_MIN_VAL && weight <= this.WEIGHT_MAX_VAL)) {
			gs.addErrorMessage(gs.getMessage('Weight for this content should be more than {0} and less than or equal to {1}.', [this.WEIGHT_MIN_VAL, this.WEIGHT_MAX_VAL]));
			return false;
		}
		return true;
	},

	validateConfigForEndPointTypes: function(contentInfoGr) {
		var endPointType = this._getIntValue(contentInfoGr, this.ATTR_END_POINT_TYPE);
		if (!endPointType) {
			if (contentInfoGr.end_point_open_mode) {
				contentInfoGr.end_point_open_mode = '';
			}
			if (contentInfoGr.end_point) {
				contentInfoGr.end_point = '';
			}
		} else if (endPointType === this.END_POINT_TYPE.CUSTOM) {
			if (!contentInfoGr.end_point) {
				gs.addErrorMessage(gs.getMessage('End Point value can not be empty'));
				return false;
			}
		} else if (endPointType === this.END_POINT_TYPE.CONFIGURE_CHOICES || endPointType === this.END_POINT_TYPE.CONFIGURE_LABEL) {
			if (!contentInfoGr.table || !contentInfoGr.field) {
				gs.addErrorMessage(gs.getMessage('Table and Field values can not be empty'));
				return false;
			} else if (contentInfoGr.end_point) {
				contentInfoGr.end_point = '';
			}
		} else if (endPointType === this.END_POINT_TYPE.ASSIGNMENT_RULE || endPointType === this.END_POINT_TYPE.FORM_LAYOUT || endPointType === this.END_POINT_TYPE.CONFIGURE_TABLE) {
			if (!contentInfoGr.table) {
				gs.addErrorMessage(gs.getMessage('Table value can not be empty'));
				return false;
			} else if (contentInfoGr.end_point) {
				contentInfoGr.end_point = '';
			}
		}
		return true;
	},

	_updateImplicitDependencies: function(parentContentId, dependentsAll, implicitField) {
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		contentGr.addQuery(this.ATTR_PARENT, parentContentId);
		contentGr.setValue(implicitField, dependentsAll);
		contentGr.updateMultiple();
	},

	updateImplicitDependencyOfChild: function(contentGroupGr) {
		var parentContentId = contentGroupGr.getUniqueValue();
		var dependentsExplicitOnContents = contentGroupGr.getValue(this.ATTR_DEPENDENT_ON_CONTENTS);
		var dependentsImplicitOnContents = contentGroupGr.getValue(this.ATTR_IMPLICIT_DEPENDENT_ON);
		var dependentsExplicitOnPlugins = contentGroupGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS);
		var dependentsImplicitOnPlugins = contentGroupGr.getValue(this.ATTR_IMPLICIT_PLUGINS_DEPENDENCIES);
		var dependentsAll = '';
		if (dependentsExplicitOnContents || dependentsImplicitOnContents) {
			if (dependentsExplicitOnContents) {
				dependentsAll = dependentsExplicitOnContents;
			}
			if (dependentsImplicitOnContents) {
				if (dependentsAll) {
					dependentsAll = dependentsAll + ',' + dependentsImplicitOnContents;
				} else {
					dependentsAll = dependentsImplicitOnContents;
				}
			}
			this._updateImplicitDependencies(parentContentId, dependentsAll, this.ATTR_IMPLICIT_DEPENDENT_ON);
		}
		dependentsAll = '';
		if (dependentsExplicitOnPlugins || dependentsImplicitOnPlugins) {
			if (dependentsImplicitOnContents) {
				dependentsAll = contentGroupGr.getUniqueValue() + ',' + dependentsImplicitOnPlugins;
			} else {
				dependentsAll = contentGroupGr.getUniqueValue();
			}
			this._updateImplicitDependencies(parentContentId, dependentsAll, this.ATTR_IMPLICIT_PLUGINS_DEPENDENCIES);
		}
	},

	updateImplicitDependencyFromParent: function(currentContentGr) {
		if (currentContentGr) {
			var currentParentContentGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			if (currentParentContentGr.get(currentContentGr.getValue(this.ATTR_PARENT))) {
				var dependentsExplicitOnContents = currentParentContentGr.getValue(this.ATTR_DEPENDENT_ON_CONTENTS);
				var dependentsImplicitOnContents = currentParentContentGr.getValue(this.ATTR_IMPLICIT_DEPENDENT_ON);
				var dependentsExplicitOnPlugins = currentParentContentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS);
				var dependentsImplicitOnPlugins = currentParentContentGr.getValue(this.ATTR_IMPLICIT_PLUGINS_DEPENDENCIES);
				var dependentsAll = '';
				if (dependentsExplicitOnContents) {
					dependentsAll = dependentsExplicitOnContents;
				}
				if (dependentsImplicitOnContents) {
					if (dependentsAll) {
						dependentsAll = dependentsAll + ',' + dependentsImplicitOnContents;
					} else {
						dependentsAll = dependentsImplicitOnContents;
					}
				}
				currentContentGr.setValue(this.ATTR_IMPLICIT_DEPENDENT_ON, dependentsAll);
				currentContentGr.update();
				dependentsAll = '';
				if (dependentsExplicitOnPlugins) {
					if (dependentsImplicitOnPlugins)
						dependentsAll = currentParentContentGr.getUniqueValue() + ',' + dependentsImplicitOnPlugins;
					else
						dependentsAll = currentParentContentGr.getUniqueValue();
				}
				currentContentGr.setValue(this.ATTR_IMPLICIT_PLUGINS_DEPENDENCIES, dependentsAll);
				currentContentGr.update();
			}
		}
	},

	removeImplicitDependencyOfChild: function(contentGroupGr) {
		var parentContentId = contentGroupGr.getUniqueValue();
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		contentGr.addQuery(this.ATTR_PARENT, parentContentId);
		contentGr.setValue(this.ATTR_IMPLICIT_DEPENDENT_ON, 'NULL');
		contentGr.updateMultiple();
	},

	validateContentGroup: function(contentGroupGr) {
		if (this._getBoolValue(contentGroupGr, this.ATTR_IS_ROOT_CONTENT, false)) {
			contentGroupGr.setValue(this.ATTR_PARENT, 'NULL');
			if (!contentGroupGr.getValue(this.ATTR_DISPLAY_CHILD_MAX_NUM)) {
				gs.addErrorMessage(gs.getMessage('"Maximum children to display" is mandatory for a root group'));
				return false;
			}
		} else {
			contentGroupGr.setValue(this.ATTR_DISPLAY_CHILD_MAX_NUM, 'NULL'); //'NULL' also nullifies number field
			contentGroupGr.setValue(this.ATTR_ROOT_INTRO_FRAME_LINK, 'NULL');
			if (!contentGroupGr.getValue(this.ATTR_PARENT)) {
				gs.addErrorMessage(gs.getMessage('"Parent Content" is mandatory for a non-root group'));
				return false;
			}
		}
		return true;
	},

	validateRelationship: function (/*GlideRecord*/ current) {
		if(!current){
			return false;
		}
		var isCurrentRoot = this._getBoolValue(current, this.ATTR_IS_ROOT_CONTENT, false);
		if (isCurrentRoot) {
			return this._validateRoot(current);
		} else {
			return this._validateNonRoot(current);
		}
	},

	_validateRoot: function (current) {
		if(!current){
			return false;
		}
		var isCurrentRoot = this._getBoolValue(current, this.ATTR_IS_ROOT_CONTENT, false);
		if (!isCurrentRoot) {
			throw gs.getMessage("Validation cannot be applied to this content group");
		}
		var i = this._getChildrenLayout(current);
		return this.ROOT_DEPENDENCY_MATRIX[i];
	},

	_validateNonRoot: function (/*GlideRecord*/ current) {
		var parent = current.getElement(this.ATTR_PARENT).getRefRecord();
		if(!parent || !current){
			return false;
		}
		var x = this._getChildrenLayout(parent);
		var y = this._getChildrenLayout(current);
		return this.DEPENDENCY_MATRIX[x][y];
	},

	_getChildrenLayout: function (/*GlideRecord*/ current) {
		if (current.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP) {
			return this._getIntValue(current, this.ATTR_CHILDREN_LAYOUT);
		} else if (current.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION) {
			return this.DEPENDENCY_MATRIX_INDEX.INFORMATION;
		} else if (this._getBoolValue(current, this.ATTR_SUPPORTS_CHILD_CONTENT, false)) {
			var childContentGroupGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			childContentGroupGr.get(current.getUniqueValue());
			return this._getIntValue(childContentGroupGr, this.ATTR_CHILDREN_LAYOUT);
		} else {
			throw gs.getMessage("Unsupported children layout");
		}
	},

    type: 'GuidedSetupUtilSNC'
};