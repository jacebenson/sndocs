var GuidedSetupUtilSNC = Class.create();
GuidedSetupUtilSNC.prototype = {
	API_VERSION: '2',
	TABLE_CONTENT: 'gsw_content',
	TABLE_CONTENT_GROUP: 'gsw_content_group',
	TABLE_CONTENT_INFORMATION: 'gsw_content_information',
	TABLE_CHANGE_LOG: 'gsw_change_log',
	TABLE_STATUS_OF_CONTENT: 'gsw_status_of_content',
	TABLE_PLUGINS: 'v_plugin',
	TABLE_TASK: 'gsw_task',
	TABLE_USER: 'sys_user',
	ATTR_CONTENT_GROUP: 'content_group',
	ATTR_RELATED_LOG_ENTRY: 'related_log_entry',
	ATTR_RELATED_CHANGE_LOG_ENTRY: 'related_change_log_entry',
	ATTR_RELATED_TASK_ENTRY: 'related_task_entry',
	ATTR_ACTIVE: 'active',
	ATTR_INACTIVE: 'inactive',
	ATTR_CONTENT: 'content',
	ATTR_PARENT: 'parent',
	ATTR_PARENTS: 'parents',
	ATTR_TITLE: 'title',
	ATTR_NAME: 'name',
	ATTR_DESCRIPTION: 'description',
	ATTR_ORDER: 'order',
	ATTR_ICON: 'icon',
	ATTR_SYS_ID: 'sys_id',
	ATTR_ID: 'id',
	ATTR_CHECKSUM: 'checksum',
	ATTR_CHANGE_DATE: 'change_date',
	ATTR_CHANGED_BY: 'changed_by',
	ATTR_SYS_CLASS_NAME: 'sys_class_name',
	ATTR_TYPE: 'type',
	ATTR_TABLE: 'table',
	ATTR_FIELD: 'field',
	ATTR_PROPERTY_NAME: 'property_name',
	ATTR_PROPERTY_VALUE: 'property_value',
	ATTR_PLUGIN_ID: 'plugin_id',
	ATTR_FILTER: 'filter',
	ATTR_FILTER_RESULT: 'filter_result',
	ATTR_IS_DYNAMIC: 'is_dynamic',
	ATTR_STATUS: 'status',
	ATTR_PREVIOUS_STATUS: 'previous_status',
	ATTR_PROGRESS: 'progress',
	ATTR_WEIGHT: 'weight',
	ATTR_ASSIGNED_TO: 'assigned_to',
	ATTR_TASK_STATE: 'state',
	ATTR_CONTENT_URL: 'gsw_content_url',
	ATTR_NUMBER: 'number',
	ATTR_SHORT_DESCRIPTION: 'short_description',
	ATTR_EFFECTIVE_WEIGHT: 'effective_weight',
	ATTR_SUPPORTS_CHILD_CONTENT: 'supports_child_content',
	ATTR_DEPENDENT_ON_CONTENTS: 'dependent_on_contents',
	ATTR_DEPENDENT_ON_PLUGINS: 'dependent_on_plugins',
	ATTR_DEPENDENT_ON_PLUGINS_IDS: 'dependent_on_plugins_ids',
	ATTR_IMPLICIT_DEPENDENT_ON: 'implicit_dependent_on',
	ATTR_IMPLICIT_PLUGINS_DEPENDENCIES: 'implicit_plugin_dependencies',
	ATTR_IS_ROOT_CONTENT: 'is_root_content',
	ATTR_ROLES: 'roles',
	ATTR_CHILD_CAN_HAVE_ROLES: 'child_can_have_roles',
	ATTR_PROGRESS_TEXT: 'progress_text',
	ATTR_DONE_TEXT: 'done_status_text',
	ATTR_HIDE_GETTING_STARTED: 'hide_getting_started',
	ATTR_CHILDREN_LAYOUT: 'children_layout',
	ATTR_ARTICLE: 'article',
	ATTR_MORE_INFO_AVAILABLE: 'more_info_available',
	ATTR_MORE_INFO_HTML: 'more_info_html',
	ATTR_MORE_INFO_VISITED: 'more_info_visited',
	ATTR_QUICK_STARTABLE: 'quick_startable',
	ATTR_BEST_PRACTICE_ACCEPTABLE: 'best_practice_acceptable',
	ATTR_BEST_PRACTICE_ALLOWED_EVER: 'best_practice_allowed_ever',
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
	GUIDED_SETUP_MODAL_STACK: 'SNC_GUIDED_SETUP_MODAL',
	GUIDED_SETUP_TAB_STACK: 'SNC_GUIDED_SETUP_TAB',
	EXTERNAL_URL_HANDLER: '$guided_setup_external_url_handler.do',
	SYS_PLUGIN: 'v_plugin.do',
	SYS_PLUGINS_LIST: 'v_plugin_list.do',
	LOG_TYPE: {
		VISITED: 1,
		COMPLETED: 2,
		UNCOMPLETED: 3,
		INITIATED: 4,
		DEACTIVATED: 5,
		REACTIVATED: 6,
		CONFIGURED: 7,
		BEST_PRACTICE_ACCEPTED: 8,
		MORE_INFO_VISITED: 9
	},
	STATUS_TYPE: {
		NOT_STARTED: 0,
		IN_PROGRESS: 1,
		COMPLETED: 2,
		INACTIVE: 3,
		BEST_PRACTICE_ACCEPTED: 4
	},
	TASK_STATE_TYPE: {
		NEW: 1,
		WORK_IN_PROGRESS: 2,
		CLOSED: 3,
		SKIPPED: 4
	},
	END_POINT_TYPE: {
		CUSTOM: 1,
		CONFIGURE_CHOICES: 2,
		CONFIGURE_LABEL: 3,
		ASSIGNMENT_RULE: 4,
		FORM_LAYOUT: 5,
		CONFIGURE_TABLE: 6,
		CONFIGURE_PROPERTY: 7,
		CONFIGURE_PLUGIN: 8,
		CONFIGURE_FILTER: 9
	},
	END_POINTS: {
		CONFIGURE_CHOICE_SLUSHBUCKET: '/slushbucket_choice.do',
		FORM_LAYOUT_SLUSHBUCKET: '/slushbucket.do',
		SYS_DOCUMENTATION: '/sys_documentation.do',
		SYSRULE_ASSIGNMENT_LIST: '/sysrule_assignment_list.do',
		SYS_DOCUMENTATION_TABLE: 'sys_documentation',
		SYS_UI_SECTION_TABLE: 'sys_ui_section',
		SYS_PROPERTIES: '/sys_properties.do',
		SYS_PROPERTIES_LIST: '/sys_properties_list.do',
		PLUGIN: '/v_plugin.do'
	},
	END_POINT_OPEN_MODE_TYPE: {
		MODAL: 1,
		TAB: 2,
		INLINE: 3
	},
	BEST_PRACTICE_ALLOWED_EVER: {
		NOT_APPLICABLE: 0,
		YES: 1,
		NO: 2
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
		this.MODAL_LAUNCHER_URL_GS_STACK = this.EXTERNAL_URL_HANDLER + '?sysparm_clear_stack=true&sysparm_nameofstack=' + this.GUIDED_SETUP_MODAL_STACK;
		this.TAB_LAUNCHER_URL_GS_STACK = this.EXTERNAL_URL_HANDLER + '?sysparm_clear_stack=true&sysparm_nameofstack=' + this.GUIDED_SETUP_TAB_STACK;
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

	_getExternalHandlerRedirectedUrl: function (url, endPointOpenMode) {
		var params = {};
		params.sysparm_gsw_goto_url = url;
		var launcherUrl = '';
		if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.MODAL) {
			launcherUrl = this.MODAL_LAUNCHER_URL_GS_STACK;
		} else if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.TAB) {
			launcherUrl = this.TAB_LAUNCHER_URL_GS_STACK;
		} else if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.INLINE) {
			launcherUrl = this.INLINE_LAUNCHER_URL;
		}
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
			if (!con.getValue(this.ATTR_PARENT)) {
				this._validateRootStatusChecksum(contentId);
				this._evaluateDynamicContents(contentId);
			} else if (con.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP) {
				this._validateRootStatusChecksum(con.getValue(this.ATTR_ROOT_PARENT));
				this._evaluateDynamicContents(contentId);
			}

			res = this._prepareContentDetails(con, params, 1);
			if (!res) {
				throw {
					message: gs.getMessage('Access to content denied'),
					error_code: this.ERR_REST_SECURITY,
					status: 403
				};
			}
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
		rootPreferences.done_status_text = rootContent.done_status_text;
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
		var isContentAccessible = this.isMetaAccessAllowedGr(dependentGr);
		if (!isContentAccessible) {
			lockedContents.is_not_accessible.push(lockedContent);
		} else {
			lockedContents.is_accessible.push(lockedContent);
		}
	},

	/**
	 * Populates the locked_due_to.contents Array for use on the UI
	 * @private
	 */
	_getLockedStatusDueToContents: function(/*GlideRecord*/ contentGr,  /*boolean*/ fetchImplicits) {
		var contents = {
			is_accessible: [],
			is_not_accessible: []
		};
		var dependentGr = this._getDependentGrContents(contentGr, fetchImplicits);
		while (dependentGr && dependentGr.next()) {
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			if (statusGr.get(this.ATTR_CONTENT, dependentGr.getUniqueValue())) {
				var statusOfContent = this._getIntValue(statusGr, this.ATTR_STATUS);
				var isComplete = (statusOfContent == this.STATUS_TYPE.COMPLETED) || (statusOfContent == this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED);
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
	 * if 'isPluginIDsAvailable' is true, then 'GlidePluginManager.isActive()' API is used to check the status for the non-accessible plugins
	 * If 'isPluginIDsAvailable' is false, we use v_plugins table to find the status which may be unavailable in some cases and hence plugin is marked as non-accessible, which ultimately becomes responsible for lock
	 * @returns pluginsListWithAccessInfo array of objects with plugins sys_ids and it's accessible info
	 * @private
	 */
	_getLockedStatusDueToPlugins: function(/*GlideRecord*/ contentGr) {
		var pluginsListWithAccessInfo = [];
		if (contentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS)) {
			var dependentOnPluginsIDsList = '', isPluginIDsAvailable = false;
			var dependentOnPluginsSysIDsList = contentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS).split(',');
			if (contentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS_IDS)) {
				dependentOnPluginsIDsList = contentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS_IDS).split(',');
				isPluginIDsAvailable = true;
			}
			var isPluginActive, isPluginAccessible, pluginSysId, pluginId;
			var pluginGr = new GlideRecord(this.TABLE_PLUGINS);
			for (var i = 0; i < dependentOnPluginsSysIDsList.length; i++) {
				isPluginActive = false;
				isPluginAccessible = false;
				pluginId = '';
				if (isPluginIDsAvailable && dependentOnPluginsIDsList[i]) { // plugin ids and sys_ids are stamped in a sequence hence 'i'th index is mapping correspondingly
					pluginId = dependentOnPluginsIDsList[i];
					isPluginActive = GlidePluginManager.isActive(pluginId);
				}
				pluginSysId = dependentOnPluginsSysIDsList[i];
				if (pluginGr.get(pluginSysId)) {
					if (pluginGr.canRead())
						isPluginAccessible = true;
					if (!isPluginIDsAvailable) { // if plugin_id is available, it's status is already known from GlidePluginManager
						if (pluginGr.getValue(this.ATTR_ACTIVE) == this.ATTR_INACTIVE) {
							isPluginActive = false;
						} else {
							isPluginActive = true;
						}
					}
				} else {
					isPluginAccessible = false;
				}
				if (!isPluginActive) { // if plugin is inactive, then lock will be applied
					pluginsListWithAccessInfo.push ({
						is_plugin_accessible: isPluginAccessible, // this info is used to prepare URL of accessible inactive plugins and non-accessible plugins, which are responsible for lock
						sys_id: pluginSysId,
						plugin_id: pluginId
					});
				}
			}
		}
		return pluginsListWithAccessInfo;
	},

	/**
	 * Populates the locked_due_to.contents_with_plugin_dependencies Array for use on the UI
	 * Implicit lock should be provided for this case: If content X is dependent on Y and Y has some plugin dependency, if any one of plugin is inactive OR not accessible
	 * Lock will be applied if plugin is accessible but inactive OR plugin is not-accessible
	 * @private
	 */
	_getLockedStatusDueToImplicitPluginDependency: function(/*GlideRecord*/ contentGr) {
		var contentsWithPluginDependencies = {
			is_accessible: [],
			is_not_accessible: []
		};
		var dependentGr = this._getDependentGrContentsForImplicitPluginDependency(contentGr);
		while (dependentGr && dependentGr.next()) {
			var pluginsListWithAccessInfo = this._getLockedStatusDueToPlugins(dependentGr);
			if (pluginsListWithAccessInfo.length) {
				/**
				* Access info is only provided for the accessible inactive plugins or non-accessible plugins, which are responsible for locking the content
				* Hence if 'pluginsListWithAccessInfo' exists, implicit lock will be applied
				*/
				this._updateLockStatusForContents(dependentGr, contentsWithPluginDependencies);
			}
		}
		return contentsWithPluginDependencies;
	},

	/**
 	*  @returns Url of dependent and inactive plugins list to load in modal's iframe on UI
	*  @params accessiblePluginsUrl - Url of accessible plugins to load in iframe
	*  @params nonAccessiblePluginsList - comma separated list of non accessible plugins
	*  This data is provided to UI page $plugin_handler.xml on client side
	*  pluginInfo -> accessible_plugins_url: $guided_setup_external_url_handler.do?sysparm_clear_stack=true&sysparm_nameofstack=SNC_GUIDED_SETUP_MODAL&sysparm_gsw_goto_url={Url to navigate}
	*  pluginInfo -> non_accessible_plugins_list: Array of non-accessible plugins
 	*/
	_getPluginsListUrl: function(plugins) {
		var accessiblePluginsUrl = '', nonAccessiblePluginsList = '', nonAccessiblePluginName = '';
		var pluginInfo = {
			accessible_plugins_url: '',
			non_accessible_plugins_list: []
		};
		if (plugins && plugins.length) {
			var lockedPluginsLength = plugins.length, lockedPlugin, numberOfAccessiblePlugins = 0;
			for (var i = 0; i < lockedPluginsLength; i++) {
				lockedPlugin = plugins[i];
				if (!lockedPlugin.is_plugin_accessible) {
					nonAccessiblePluginName = (lockedPlugin.plugin_id) ? lockedPlugin.plugin_id : lockedPlugin.sys_id; // if plugin_id is available then show it else show plugin's sys_id
					pluginInfo.non_accessible_plugins_list.push(nonAccessiblePluginName);
					continue;
				}
				if (numberOfAccessiblePlugins > 0) {
					accessiblePluginsUrl = accessiblePluginsUrl + '^OR';
				}
				numberOfAccessiblePlugins++;
				accessiblePluginsUrl = accessiblePluginsUrl + 'sys_id=' + lockedPlugin.sys_id;
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
			if (accessiblePluginsUrl)
				pluginInfo.accessible_plugins_url = this._getExternalHandlerRedirectedUrl(accessiblePluginsUrl, this.END_POINT_OPEN_MODE_TYPE.MODAL);
		}
		return pluginInfo;
	},

	/**
	 * Populates the locked_status for use on the UI
	 * @param contentGr	The GlideRecord object of gsw_content table
	 * @param params	The GlideRequest parameter map
	 * @param lockedStatus	The locked status object to update
	 * @returns { is_locked: boolean,
	 			  locked_due_to.contents: 'is_accessible' - Array of gsw_content objects which are accessible to logged in user (based on roles defined for content), 'is_not_accessible': which are not accessible
	 			  locked_due_to.contents_with_plugin_dependencies - 'is_accessible' - Array of gsw_content objects which are accessible to logged in user (based on roles defined for content), 'is_not_accessible': which are not accessible
				  locked_due_to.plugins: Array of v_plugins,
				  plugin_info.accessible_plugins_url: url of accessible dependent and inactive plugins,
				  plugin_info.non_accessible_plugins_list: list of non-accessible dependent inactive plugins
				}
	 * @private
	 */
	_getLockedStatus: function (/*GlideRecord*/ contentGr, /*boolean*/ fetchImplicits) {
		var lockedStatus = {
			is_locked: false,
			locked_due_to: {
				contents: {
					is_accessible: [],
					is_not_accessible: []
				},
				plugins: [],
				contents_with_plugin_dependencies: {
					is_accessible: [],
					is_not_accessible: []
				}
			},
			plugin_info: {
				accessible_plugins_url: '',
				non_accessible_plugins_list: []
			}
		};
		lockedStatus.locked_due_to.contents = this._getLockedStatusDueToContents(contentGr, fetchImplicits);
		var lockedDueToContentsLength = 0, lockedDueToContentsWithImplicitDependencyLength = 0;
		lockedDueToContentsLength = lockedStatus.locked_due_to.contents.is_accessible.length + lockedStatus.locked_due_to.contents.is_not_accessible.length;
		if (fetchImplicits) { // We need to fetch implicit plugin dependency only when 'fetchImplicit' is true. fetchImplicit true or false on UI is governed by previous method which sets this param.
			lockedStatus.locked_due_to.contents_with_plugin_dependencies = this._getLockedStatusDueToImplicitPluginDependency(contentGr);
			lockedDueToContentsWithImplicitDependencyLength = lockedStatus.locked_due_to.contents_with_plugin_dependencies.is_accessible.length + lockedStatus.locked_due_to.contents_with_plugin_dependencies.is_not_accessible.length;
		}
		// If parent content is locked there is no need to show plugin dependency.
		if (!(lockedDueToContentsLength || lockedDueToContentsWithImplicitDependencyLength)) {
			lockedStatus.locked_due_to.plugins = this._getLockedStatusDueToPlugins(contentGr);
			if (lockedStatus.locked_due_to.plugins.length) {
				this._updateLockStatusForContents(contentGr, lockedStatus.locked_due_to.contents_with_plugin_dependencies);
				lockedStatus.plugin_info = this._getPluginsListUrl(lockedStatus.locked_due_to.plugins);
			}
		}

		if (lockedDueToContentsLength || lockedStatus.locked_due_to.plugins.length || lockedDueToContentsWithImplicitDependencyLength) {
			lockedStatus.is_locked = true;
		}

		return lockedStatus;
	},

	/**
	* returns which content can be rendered as the top level content
	* For content_group if children layout is TILE / TABLIST Or content_information if has more info - returns true otherwise false
	*/
	_canBeRenderedAtPageTopLevel: function(contentGr) {
		var sysClassName = contentGr.getValue(this.ATTR_SYS_CLASS_NAME);
		if (sysClassName == this.TABLE_CONTENT_GROUP) {
			var childrenLayout = this._getIntValue(contentGr, this.ATTR_CHILDREN_LAYOUT);
			if (childrenLayout == this.DEPENDENCY_MATRIX_INDEX.TILE || childrenLayout == this.DEPENDENCY_MATRIX_INDEX.TABLIST)
				return true;
		} else if (sysClassName == this.TABLE_CONTENT_INFORMATION) {
			if (this._getBoolValue(contentGr, this.ATTR_MORE_INFO_AVAILABLE, false))
				return true;
		}
		return false;
	},

	/**
	* Determines the display status of the overall progress on the UI
	* This is calculated when rootContentDetails are fetched
	* If some of the categories in routine are not visible to a user, overall progress is hidden
	* For Admin users, it will always show since they have access to whole guided setup routine
	*/
	_determineDisplayStatusOfOverallProgress: function(rootSysId) {
		if (gs.hasRole('admin') || !this._determineIfChildHaveDiffRoles(rootSysId))
			return true;
		var isAllChildrenVisible = true, isChildVisible = true;
		var rootGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
		if (rootSysId && rootGr.get(rootSysId)) {
			var childGr = this._getImmediateChildGroupsForRootGr(rootSysId);
			if (childGr) {
				while (childGr.next()) {
					isChildVisible = this.isMetaAccessAllowedGr(childGr);
					if (!isChildVisible) {
						isAllChildrenVisible = false;
						break;
					}
				}
			}
		}
		return isAllChildrenVisible;
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

	_prepareContentDetails: function(contentGr, params, level) {
		if (!this.isMetaAccessAllowedGr(contentGr)) {
			return null;
		}
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
		content.supports_child_content = this._getBoolValue(contentGr, this.ATTR_SUPPORTS_CHILD_CONTENT, false);
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
				last_changed_by: null,
				status: null,
				previous_status: null,
				is_best_practice_accepted: false,
				is_best_practice_acceptable: false
			};

			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			if (statusGr.get(this.ATTR_CONTENT, contentGr.getUniqueValue())) {
				var logGr = statusGr[this.ATTR_RELATED_LOG_ENTRY].getRefRecord();
				if (logGr) {
					content.audit.last_change_date = (new GlideDateTime(logGr[this.ATTR_CHANGE_DATE])).getUTCValue();
					content.audit.last_changed_by = statusGr.getDisplayValue(this.ATTR_RELATED_LOG_ENTRY + '.' + this.ATTR_CHANGED_BY);
					if (!content.audit.last_changed_by) {
						// In case of maint access the userid saved in log could be invalid.
						// Also we do not want to get name always from sys column since the
						// above logic allows us to get the updated user name.
						content.audit.last_changed_by = statusGr.getDisplayValue(this.ATTR_RELATED_LOG_ENTRY + '.' + this.ATTR_SYS_CREATED_BY);
					}
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
				} else { // fail safe code if related records are invalid
					content.audit.last_change_date = new GlideDateTime().getUTCValue();
					content.audit.last_changed_by = gs.getMessage('unknown');
				}
				content.audit.progress = statusGr.progress * 1.00;
				content.audit.status = statusGr.status * 1;
				content.audit.previous_status = statusGr.previous_status * 1;
			} else {
				content.audit.progress = 0.00;
				content.audit.status = this.STATUS_TYPE.NOT_STARTED;
			}
			// setting best practice accepted info
			if (content.sys_class_name == this.TABLE_CONTENT_INFORMATION) {
				if (this._getIntValue(statusGr, this.ATTR_BEST_PRACTICE_ALLOWED_EVER) == this.BEST_PRACTICE_ALLOWED_EVER.YES) {
					if (statusGr.getValue(this.ATTR_STATUS) == this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED) {
						content.audit.is_best_practice_accepted = true; // content-information is accepted if best peactice is allowed and status is best practice accepted
					} else {
						content.audit.is_best_practice_acceptable = true;
					}
				}
				content.audit.more_info_visited =  this._getBoolValue(statusGr, this.ATTR_MORE_INFO_VISITED, false);
			} else if (content.sys_class_name == this.TABLE_CONTENT_GROUP) {
				var bestPracticeAcceptableChildren = this._getBestPracticeAcceptableChildrenCount(content.sys_id);
				var bestPracticeAcceptedChildren = this._getBestPracticeAcceptedChildrenCount(content.sys_id);
				if (bestPracticeAcceptedChildren) { // there are some children which are best practice allowed, so this will be used to mark content grp as best practice accepted 'Filter Use'
					content.audit.is_best_practice_accepted = true;
				}
				if (bestPracticeAcceptableChildren != bestPracticeAcceptedChildren) { // there are some children left which can be still accepted as best practice, so this is used to show accept default on 'UI'
					content.audit.is_best_practice_acceptable = true;
				}
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
				content.more_info_available = this._getBoolValue(contentInfoGr, this.ATTR_MORE_INFO_AVAILABLE, false);
				content.more_info_html = contentInfoGr.getDisplayValue(this.ATTR_MORE_INFO_HTML);
				content.quick_startable = this._getBoolValue(contentInfoGr, this.ATTR_QUICK_STARTABLE, false);
				content.end_point_open_mode = this._getIntValue(contentInfoGr, this.ATTR_END_POINT_OPEN_MODE);
				content.end_point = this._getEndUrlForEndPointTypes(contentInfoGr);
				if (content.end_point_open_mode == this.END_POINT_OPEN_MODE_TYPE.INLINE)
					content.end_point_modal_fallback =
					this._getEndUrlForEndPointTypes(contentInfoGr,
						this.END_POINT_OPEN_MODE_TYPE.MODAL);
				content.qualifier = contentInfoGr.getValue(this.ATTR_QUALIFIER) + '';
				content.is_dynamic = this._getBoolValue(contentInfoGr, this.ATTR_IS_DYNAMIC, false);
				content.can_be_page_top = this._canBeRenderedAtPageTopLevel(contentInfoGr);
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
					content.is_overall_progress_visible = this._determineDisplayStatusOfOverallProgress(content.sys_id);
					content.progress_text = contentGroupGr.getValue(this.ATTR_PROGRESS_TEXT);
					content.done_status_text = contentGroupGr.getValue(this.ATTR_DONE_TEXT);
					content.hide_getting_started = this._getBoolValue(contentGroupGr, this.ATTR_HIDE_GETTING_STARTED, false);
				}
				if (content.children_layout == this.DEPENDENCY_MATRIX_INDEX.TABLIST && this._getBoolParamVal('task_roles', params, false)) {
					content.roles_which_can_assign_tasks = this._getRolesWhichCanAssignTasksToContent(contentGr);
					params.task_roles = false;
				}
				content.can_be_page_top = this._canBeRenderedAtPageTopLevel(contentGroupGr);
				if (level + 1 <= wantedLevels) {
					var contentWithinGr = new GlideRecord(this.TABLE_CONTENT);
					contentWithinGr.addActiveQuery();
					contentWithinGr.addQuery(this.ATTR_PARENT, contentGr.getUniqueValue());
					this._addOrderBy(contentWithinGr, params);
					contentWithinGr.query();
					while (contentWithinGr.next()) {
						var contentDetails = this._prepareContentDetails(contentWithinGr, params, level + 1);
						if (contentDetails) {
							content.group_contents.push(contentDetails);
						}
					}
				} else {
					content.group_contents_not_fetched = true;
				}
			}
		}
		// Getting 'assigned_to'
		var taskGr = new GlideRecord(this.TABLE_TASK);
		if (taskGr.get(this.TABLE_CONTENT, contentGr.getUniqueValue())) {
			content.assigned_to = taskGr.getDisplayValue(this.ATTR_ASSIGNED_TO);
			content.assigned_to_id = taskGr.getValue(this.ATTR_ASSIGNED_TO);
			this._setTaskDetails(content, taskGr);
		} else {
			content.assigned_to = '';
			content.assigned_to_id = '';
			this._setTaskDetails(content, null);
		}
		return content;
	},

	_setTaskDetails: function(content, taskGr) {
		if(taskGr) {
			content.task_id = taskGr.getUniqueValue();
			content.task_number = taskGr.getDisplayValue(this.ATTR_number);
			content.task_short_description = taskGr.getValue(this.ATTR_SHORT_DESCRIPTION);
		} else {
			content.task_id = '';
			content.task_number = '';
			content.task_short_description = '';
		}
		return content;
	},

	_getParentSkipInfo: function (contentGr) {
		var parentSkipInfo = {
			is_skipped: false,
			title: null,
			sys_id: null
		};
		var parents = this._getAllParentIds(contentGr).join();
		if (parents) {
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			statusGr.addQuery(this.ATTR_CONTENT, 'IN', parents);
			statusGr.addQuery(this.ATTR_STATUS, this.STATUS_TYPE.INACTIVE);
			statusGr.query();

			if (statusGr.next()) { //Only one record in hierarchy can be inactive.
				parentSkipInfo.is_skipped = true;
				contentGr = statusGr[this.ATTR_CONTENT].getRefRecord();
				parentSkipInfo.title = contentGr.getDisplayValue(this.ATTR_STATUS);
				parentSkipInfo.sys_id = contentGr.getUniqueValue();
			}
		}
		return parentSkipInfo;
	},

	/**
	  * Get count of best practice allowed children (content-information) for a content-group
	  * Best practice allowed ever flag is true for a given content information if : it is best practice acceptable + not completed once in setup's life cycle
	*/
	_getBestPracticeAcceptableChildrenCount: function(contentGrpId) {
		var bestPracticeAcceptableChildrenCount = 0;
		var grContentInfo = new GlideRecord(this.TABLE_CONTENT);
		grContentInfo.addQuery(this.ATTR_PARENTS, 'CONTAINS', contentGrpId);
		var grStatus = grContentInfo.addJoinQuery(this.TABLE_STATUS_OF_CONTENT, this.ATTR_SYS_ID, this.ATTR_CONTENT);
		grStatus.addCondition(this.ATTR_BEST_PRACTICE_ALLOWED_EVER, this.BEST_PRACTICE_ALLOWED_EVER.YES);
		grStatus.addCondition(this.ATTR_STATUS, '!=', this.STATUS_TYPE.INACTIVE);
		grContentInfo.query();
		while (grContentInfo.next()) {
			var lockedStatusDueToContents = this._getLockedStatusDueToContents(grContentInfo, false);
			var lockedDueToContentsLength = lockedStatusDueToContents.is_accessible.length + lockedStatusDueToContents.is_not_accessible.length;
			if (!lockedDueToContentsLength && !this._getLockedStatusDueToPlugins(grContentInfo).length) {
				bestPracticeAcceptableChildrenCount++;
			}
		}
		return bestPracticeAcceptableChildrenCount;
	},

	/**
	  * Get count of children which are best practice allowed and accepted as best practice
	*/
	_getBestPracticeAcceptedChildrenCount: function(contentGrpId) {
		var bestPracticeAcceptedChildrenCount = 0;
		var grContentInfo = new GlideRecord(this.TABLE_CONTENT);
		grContentInfo.addQuery(this.ATTR_PARENTS, 'CONTAINS', contentGrpId);
		var grStatus = grContentInfo.addJoinQuery(this.TABLE_STATUS_OF_CONTENT, this.ATTR_SYS_ID, this.ATTR_CONTENT);
		grStatus.addCondition(this.ATTR_BEST_PRACTICE_ALLOWED_EVER, this.BEST_PRACTICE_ALLOWED_EVER.YES);
		grStatus.addCondition(this.ATTR_STATUS, this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED);
		grContentInfo.query();
		while (grContentInfo.next()) {
			var lockedStatusDueToContents = this._getLockedStatusDueToContents(grContentInfo, false);
			var lockedDueToContentsLength = lockedStatusDueToContents.is_accessible.length + lockedStatusDueToContents.is_not_accessible.length;
			if (!lockedDueToContentsLength && !this._getLockedStatusDueToPlugins(grContentInfo).length) {
				bestPracticeAcceptedChildrenCount++;
			}
		}
		return bestPracticeAcceptedChildrenCount;
	},

	_getEndUrlForEndPointTypes: function (contentInfoGr, forcedOpenMode) {
		var table = contentInfoGr.getValue(this.ATTR_TABLE);
		var field = contentInfoGr.getValue(this.ATTR_FIELD);
		var propertyName = contentInfoGr.getValue(this.ATTR_PROPERTY_NAME);
		var pluginID = contentInfoGr.getValue(this.ATTR_PLUGIN_ID);
		var filter = contentInfoGr.getValue(this.ATTR_FILTER);
		var endPointType = this._getIntValue(contentInfoGr, this.ATTR_END_POINT_TYPE);
		var endPointOpenMode = forcedOpenMode ? forcedOpenMode : this._getIntValue(contentInfoGr, this.ATTR_END_POINT_OPEN_MODE);
		var fieldSysId = '', endPointUrl = '';
		var endPointUrlParams = {};
		if (endPointType === this.END_POINT_TYPE.CUSTOM) {
			endPointUrl = contentInfoGr.getValue(this.ATTR_END_POINT) + '';
			if (this._isExternalUrl(endPointUrl)) {
				return endPointUrl;
			}
			return this._getExternalHandlerRedirectedUrl(endPointUrl, endPointOpenMode);
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
		} else if (endPointType === this.END_POINT_TYPE.ASSIGNMENT_RULE) {
			endPointUrlParams = {};
			endPointUrlParams.sysparm_query = 'table=' + table;
			endPointUrl = this._makeUrl(this.END_POINTS.SYSRULE_ASSIGNMENT_LIST, endPointUrlParams);
			return this._getExternalHandlerRedirectedUrl(endPointUrl, endPointOpenMode);
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
			return '';
		} else if (endPointType === this.END_POINT_TYPE.CONFIGURE_TABLE) {
			endPointUrlParams = {};
			this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_goto_url');
			this._setStackParam(endPointUrlParams, endPointOpenMode);
			return this._makeUrl('/' + table + '.do', endPointUrlParams);
		} else if (endPointType === this.END_POINT_TYPE.CONFIGURE_PROPERTY) {
			endPointUrlParams = {};
			var propertyGr = new GlideRecord("sys_properties");
			//If the property exists, take them to the property form, else to the list with the appropriate filter
			if (propertyGr.get("name", propertyName)) {
				endPointUrlParams.sys_id = propertyGr.getUniqueValue();
				this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_goto_url');
				this._setStackParam(endPointUrlParams, endPointOpenMode);
				return this._makeUrl(this.END_POINTS.SYS_PROPERTIES, endPointUrlParams);
			} else {
				endPointUrlParams.sysparm_query = 'name=' + propertyName;
				endPointUrl = this._makeUrl(this.END_POINTS.SYS_PROPERTIES_LIST, endPointUrlParams);
				return this._getExternalHandlerRedirectedUrl(endPointUrl, endPointOpenMode);
			}
		} else if (endPointType === this.END_POINT_TYPE.CONFIGURE_PLUGIN) {
			endPointUrlParams = {};
			endPointUrlParams.sysparm_query = 'id=' + pluginID;
			this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_goto_url');
			this._setStackParam(endPointUrlParams, endPointOpenMode);
			return this._makeUrl(this.END_POINTS.PLUGIN, endPointUrlParams);
		} else if (endPointType === this.END_POINT_TYPE.CONFIGURE_FILTER) {
			endPointUrlParams = {};
			var url = '';
			var tableGr = new GlideRecord(table);
			if (tableGr.isValid()) {
				url = "/" + table + "_list.do";
				endPointUrlParams.sysparm_query = filter;
				this._setReferringUrlParam(endPointUrlParams, endPointOpenMode, 'sysparm_goto_url');
				this._setStackParam(endPointUrlParams, endPointOpenMode);
				return this._makeUrl(url, endPointUrlParams);
			} else {
				url = "/sys_db_object_list.do";
				endPointUrlParams.sysparm_query = 'name=' + table;
				endPointUrl = this._makeUrl(url, endPointUrlParams);
				return this._getExternalHandlerRedirectedUrl(endPointUrl, endPointOpenMode);
			}
		}
	},

	_setStackParam: function (endPointUrlParams, endPointOpenMode) {
		if (endPointOpenMode == this.END_POINT_OPEN_MODE_TYPE.TAB) {
			endPointUrlParams.sysparm_clear_stack = 'true';
			endPointUrlParams.sysparm_nameofstack = this.GUIDED_SETUP_TAB_STACK;
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

	_isExternalUrl: function(url) {
		if (url && url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
			return false;
		}
		return true;
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
						title: parentContentGr.getDisplayValue(this.ATTR_TITLE),
						can_be_page_top: this._canBeRenderedAtPageTopLevel(parentContentGr)
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

	//This function is required to check whether there is any need of recalculating status of contents depending upon change in metadata structure
	//The requirement is:-
	//status checksum - root checksum - action
	//1. present - present - check if they are equal, if not refresh status and update status checksum
	//2. present - null - Do nothing
	//3. null - present - same as 1
	//4. null - null - same as 1 except treat them as if they are *not* equal
	_validateRootStatusChecksum: function (rootContentId){
		if (rootContentId) {
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			var rootContentGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			if (rootContentGr.get(rootContentId)) {
				var rootContentChecksum = rootContentGr.getValue(this.ATTR_CHECKSUM);
				if (statusGr.get(this.ATTR_CONTENT, rootContentId)) {
					var rootStatusChecksum = statusGr.getValue(this.ATTR_CHECKSUM);
					if ((rootStatusChecksum && rootContentChecksum && (rootStatusChecksum != rootContentChecksum)) || (!rootStatusChecksum && rootContentChecksum)) {
						this._createAndRefreshStatusForAllContents(rootContentId);
						statusGr.setValue(this.ATTR_CHECKSUM, rootContentChecksum);
						statusGr.update();
					} else if (!rootStatusChecksum && !rootContentChecksum) {
						this._createAndRefreshStatusForAllContents(rootContentId);
						statusGr.setValue(this.ATTR_CHECKSUM, this._getChecksumForRoot(rootContentId));
						statusGr.update();
					}
				} else {
					this._createAndRefreshStatusForAllContents(rootContentId);
					statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
					if (statusGr.get(this.ATTR_CONTENT, rootContentId)) {
						if (rootContentChecksum)
							statusGr.setValue(this.ATTR_CHECKSUM, rootContentChecksum);
						else
							statusGr.setValue(this.ATTR_CHECKSUM, this._getChecksumForRoot(rootContentId));
						statusGr.update();
					}
				}
			}
		}
	},

	// possibly refresh dynamic content
	_evaluateDynamicContents: function (rootContentId) {
		var dynamicContentGr = new GlideRecord(this.TABLE_CONTENT_INFORMATION);
		dynamicContentGr.addQuery(this.ATTR_ROOT_PARENT, rootContentId);
		dynamicContentGr.addQuery(this.ATTR_IS_DYNAMIC, true);
		dynamicContentGr.addQuery(this.ATTR_ACTIVE, true);
		dynamicContentGr.query();
		while (dynamicContentGr.next()) {
			this._refreshDynamicContent(this._getRealRecord(dynamicContentGr));
		}
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

	stampChildLayoutInContent: function (contentGr) {
		var newLayout, parent = contentGr.getValue(this.ATTR_PARENT);
		if (parent && parent !== 'NULL') {
			var parentGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			if (parentGr.get(parent)) {
				if (parentGr.getValue(this.ATTR_PARENT)) {
					newLayout = this.DEPENDENCY_MATRIX_INDEX.TRAIN;
				}
				else {
					newLayout = this.DEPENDENCY_MATRIX_INDEX.TABLIST;
				}
			} else {
				gs.addErrorMessage(gs.getMessage("Parent value is invalid"));
				return false;
			}
		} else {
			newLayout = this.DEPENDENCY_MATRIX_INDEX.TILE;
		}
		contentGr.setValue(this.ATTR_CHILDREN_LAYOUT, newLayout);
		return true;
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
		var rootContentId = contentGr.getValue(this.ATTR_ROOT_PARENT);
		var qry = '';
		if (rootContentId)
			qry = this.ATTR_ROOT_PARENT + '=' + rootContentId + '^';
		var combinedIds = this.arrayUtil.concat(this._getAllParentIds(contentGr), this._getAllChildrenIds(contentGr));
		combinedIds.push(contentGr.getUniqueValue());
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
				qry = qry + '^';
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
				error_code: this.ERR_REST_SECURITY,
				status: 403
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

	isMetaReadAllowed: function () {
		return gs.hasRole('admin');
	},

	isMetaUpdateAllowed: function () {
		return gs.hasRole('maint');
	},

	/**
	* @returns - bool value if current user can access the given content
	* Admins always have access for all the contents in a routine
	*/
	isMetaAccessAllowed: function(contentId) {
		if (gs.hasRole('admin'))
			return true;
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		if (contentId && contentGr.get(contentId)) {
			return this.isMetaAccessAllowedGr(contentGr);
		}
		return false;
	},

	/**
	* @input GlideRecord for a content (group / information)
	* @returns true if any role in the roles list is available to the logged in user else returns false
	* This public api if also used in 'guided_setup_invalid_url.xml'
	*/
	isMetaAccessAllowedGr: function(contentGr) {
		if (gs.hasRole('admin'))
			return true;
		var rolesWhichCanAccess = this._getRolesWhichCanAccessContent(contentGr);
		return this._isRoutineAccessibleForUser(rolesWhichCanAccess);
	},

	/**
	* Determine roles which can access the given content
	* For Contents:
		1. If 'Enable child categories to have different roles' is unchecked, all children should follow the roles defined on root
		2. If 'Enable child categories to have different roles' is checked:
			- Root and immediate child of root should honor the roles defined on them
			- All the subsequent children will follow the roles defined on immediate child of root in there tree hierachy
	* function 'quicklyFindRootContentIdForContent' gives rootContentId in O(1)
	*/
	_getRolesWhichCanAccessContent: function(contentGr) {
		var rolesWhichCanAccess = [], contentId = contentGr.getUniqueValue();
		var contentParents = [], numOfParents = 0;
		var rootContentId = this._quicklyFindRootContentIdForContent(contentGr);
		if ((rootContentId == contentId) || !this._determineIfChildHaveDiffRoles(rootContentId)) { // root always honors it's roles
			rolesWhichCanAccess = this._getRootRoles(rootContentId);
		} else {
			if (contentGr.getValue(this.ATTR_PARENTS)) {
				contentParents = contentGr.getValue(this.ATTR_PARENTS).split(',');
				numOfParents = contentParents.length;
				if (numOfParents == 1) { // Determines if given content group is immediate child of root
					rolesWhichCanAccess = this._getContentGrpRolesGrOrId(contentGr);
				} else {
					contentId = contentParents[numOfParents - 2]; // get immediate child from root in parent hierachy
					rolesWhichCanAccess = this._getContentGrpRolesGrOrId(contentId);
				}
			}
		}
		return rolesWhichCanAccess;
	},

	/**
	* Admins / Application admins can assign tasks to all other valid(who are defined in roles) application admins as well as to the admins
	* gsw_tasks can be assigned to 'admin' users by default
	*/
	_getRolesWhichCanAssignTasksToContent: function(contentGr) {
		var rolesWhichCanAssignTasks = [];
		rolesWhichCanAssignTasks = this._getRolesWhichCanAccessContent(contentGr);
		rolesWhichCanAssignTasks.push('admin');
		return rolesWhichCanAssignTasks;
	},

	/**
	* Determines if children can have their individual roles
	* So, here we get the rootContent and check the value of 'Enable child categories to have different roles' checkbox
	* returns 'true' if 'Enable child categories to have different roles' checkbox is checked, since in that case,
	  immediate child content groups of root are supposed to have roles which their respective children will follow
	* Here, '_child_can_have_roles' is used as cache
	*/
	_determineIfChildHaveDiffRoles: function(rootContentId) {
		if (typeof(this._child_can_have_roles) !== 'undefined') {
			return this._child_can_have_roles;
		}
		var contentGrpGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
		if (rootContentId && contentGrpGr.get(rootContentId)) {
			this._child_can_have_roles = this._getBoolValue(contentGrpGr, this.ATTR_CHILD_CAN_HAVE_ROLES, false);
		} else {
			this._child_can_have_roles = false;
		}
		return this._child_can_have_roles;
	},

	/**
	* '_root_roles' value is cached
	* @returns the roles defined on the root
	*/
	_getRootRoles: function(rootSysId) {
		if (typeof(this._root_roles) !== 'undefined') {
			return this._root_roles;
		}
		this._root_roles = this._getContentGrpRolesGrOrId(rootSysId);
		return this._root_roles;
	},

	/**
	* content - it can take: contentId (for contentInfo) or contentGr (for immediate children groups of root)
	*/
	_getContentGrpRolesGrOrId: function(content) {
		var rolesWhichCanAccess = [];
		if (typeof(content) == 'string') {
			var contentGrpGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			if (content && contentGrpGr.get(content)) {
				if (contentGrpGr.getValue(this.ATTR_ROLES))
					rolesWhichCanAccess = contentGrpGr.getValue(this.ATTR_ROLES).split(',');
			}
		} else { // it is assumed to be a glideRecord
			if (content.getTableName() == this.TABLE_CONTENT_GROUP) {
				if (content.getValue(this.ATTR_ROLES))
					rolesWhichCanAccess = content.getValue(this.ATTR_ROLES).split(',');
			} else {
				rolesWhichCanAccess = this._getContentGrpRolesGrOrId(content.getUniqueValue());
			}
		}
		return rolesWhichCanAccess;
	},

	/**
	* @input - List of roles who can access the current routine
	* @returns - bool if current user has role in the list
	* 'hasrole('X')' always returns true for admins and hence admins will always have access for all the routines
	*/
	_isRoutineAccessibleForUser: function(availableRoles) {
		for (var i = 0; i < availableRoles.length; i++) {
			if (gs.hasRole(availableRoles[i]))
				return true;
		}
		return false;
	},

	/**
	* Check if all elements in arr1 are there in arr2
	* @returns comma separated list of elements which are in arr1 and not in arr2
	*/
	_compareAccessRoles: function(arr1, arr2) {
		var diffInRolesArr = [];
		for (var i = 0; i < arr1.length; i++) {
			if (arr2.indexOf(arr1[i]) == -1)
				diffInRolesArr.push(arr1[i]);
		}
		return diffInRolesArr.join(', ');
	},

	/**
	* @returns glide record for all the children group's for a given root content
	*/
	_getImmediateChildGroupsForRootGr: function(rootSysId) {
		if (rootSysId) {
			var childGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
			childGr.addActiveQuery();
			childGr.addQuery(this.ATTR_PARENT, rootSysId);
			childGr.query();
			return childGr;
		}
		return null;
	},

	/**
	* Validate the roles defined on the content groups
	* For a root content, 'Enable child categories to have different roles' is unchecked by default, which implicates that roles defined on the root, will be inherited to all the children and hence will get the access of whole routine
	* Immediate Children groups of root will be allowed to define 'roles' on them if 'Enable child categories to have different roles' is checked
	* Validations are handled in these cases :
		1. Root will show the warning for the roles which it's children have and it does not have. Also warning would be shown for the roles which root have but none of it's children have
		2. For immediate children of root, a whole tree validation would run, which will show the roles, current group have but root doesn't and also warning for the siblings of current group which have mismatch of roles with root
		3. For grand-children onwards of root, warning would be shown that roles should not be defined at that level
	*/
	validationOnRoles: function(contentGr) {
		if (this._getBoolValue(contentGr, this.ATTR_IS_ROOT_CONTENT, false)) {
			if (this._getBoolValue(contentGr, this.ATTR_CHILD_CAN_HAVE_ROLES, false)) {
				this._checkValidationOfRolesFromRootToAllChildren(contentGr);
			}
		} else {
			if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP) {
				var parentId = contentGr.getValue(this.ATTR_PARENT);
				var grpGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
				if (parentId && grpGr.get(parentId)) {
					if (this._getBoolValue(grpGr, this.ATTR_IS_ROOT_CONTENT, false) && this._getBoolValue(grpGr, this.ATTR_CHILD_CAN_HAVE_ROLES, false)) {
						this._checkValidationOfRolesFromChildToRoot(contentGr, grpGr); // whole tree validation, valid only for the immediate children of root
					} else {
						if (contentGr.getValue(this.ATTR_ROLES)) { // if train has roles OR immediate child group has roles with root's checkbox unchecked
							gs.addInfoMessage(gs.getMessage("Defining role(s) on '{0}' group in invalid. These roles won't be considered.", contentGr.getDisplayValue(this.ATTR_TITLE)));
						}
					}
				}
			}
		}
	},

	/**
	* Checks validation of the roles in terms of root content, if 'Enable child categories to have different roles' is checked
	* Warning would be shown for:
		1. Roles which children have (union of roles) but root does not
		2. Roles which root have but none of it's children have
	*/
	_checkValidationOfRolesFromRootToAllChildren: function(rootGr) {
		var rolesInRoot = [], rolesInChild = [], rolesInAllChildren = [];
		if (rootGr && rootGr.getValue(this.ATTR_ROLES))
			rolesInRoot = rootGr.getValue(this.ATTR_ROLES).split(',');
		var childGr = this._getImmediateChildGroupsForRootGr(rootGr.getUniqueValue());
		if (childGr) {
			while (childGr.next()) {
				if (childGr.getValue(this.ATTR_ROLES)) {
					rolesInChild = childGr.getValue(this.ATTR_ROLES).split(',');
					for (var i = 0; i < rolesInChild.length; i++) { // take union of all roles in children
						if (rolesInAllChildren.indexOf(rolesInChild[i]) == -1)
							rolesInAllChildren.push(rolesInChild[i]);
					}
				}
			}
			var rolesDiffInChildrenFromRoot = this._compareAccessRoles(rolesInAllChildren, rolesInRoot); // roles in children, but not in root
			if (rolesDiffInChildrenFromRoot) {
				gs.addInfoMessage(gs.getMessage("Root ({0}) does not have role(s) - '{1}' which some of it's children contents have. So, they could be inaccessible to some users.", [rootGr.getValue(this.ATTR_TITLE), rolesDiffInChildrenFromRoot]));
			}
			var rolesDiffInRootFromChildren = this._compareAccessRoles(rolesInRoot, rolesInAllChildren); // in root, but not in child
			if (rolesDiffInRootFromChildren) {
				gs.addInfoMessage(gs.getMessage("Root ({0}) have role(s) - '{1}' which none of it's children content have. Make sure you need them.", [rootGr.getValue(this.ATTR_TITLE), rolesDiffInRootFromChildren]));
			}
		}
	},

	/**
	* Checks validation of the roles in terms of root's immediate group content, only if 'Enable child categories to have different roles' is checked
	* Warning would be shown for:
		1. Roles which current group have but root content does not
		2. Full tree validation for the sibling content groups of current group, showing the list of those contents which have mismatch of roles with the root
	*/
	_checkValidationOfRolesFromChildToRoot: function(contentGr, rootGr) {
		var rolesWhichCanAccessRoot = [], rolesWhichCanAccessChild = [], diffRolesForCurrentGrp = '', childrenWithDiffInRolesArr = [];
		if (rootGr && rootGr.getValue(this.ATTR_ROLES))
			rolesWhichCanAccessRoot = rootGr.getValue(this.ATTR_ROLES).split(',');
		var childGr = this._getImmediateChildGroupsForRootGr(rootGr.getUniqueValue());
		if (childGr) {
			while (childGr.next()) {
				if (childGr.getValue(this.ATTR_ROLES)) {
					rolesWhichCanAccessChild = childGr.getValue(this.ATTR_ROLES).split(',');
					if (childGr.getUniqueValue() == contentGr.getUniqueValue()) {
						diffRolesForCurrentGrp = this._compareAccessRoles(rolesWhichCanAccessChild, rolesWhichCanAccessRoot);
					} else {
						if (this._compareAccessRoles(rolesWhichCanAccessChild, rolesWhichCanAccessRoot))
							childrenWithDiffInRolesArr.push(childGr.getValue(this.ATTR_TITLE));
					}
				}
			}
		}
		if (diffRolesForCurrentGrp) {
			gs.addInfoMessage(gs.getMessage("Content group '{0}' have some role(s) - '{1}' which it's root ({2}) does not. So, this content could be inaccessible to some users.", [contentGr.getValue(this.ATTR_TITLE), diffRolesForCurrentGrp, rootGr.getValue(this.ATTR_TITLE)]));
		}
		if (childrenWithDiffInRolesArr.length) {
			gs.addInfoMessage(gs.getMessage("Other Content group(s) - '{0}' have some roles which root ({1}) does not have. They could be inaccessible.", [childrenWithDiffInRolesArr.join(", "), rootGr.getValue(this.ATTR_TITLE)]));
		}
	},

	_updateChangeLog: function(contentId, action, relatedLogEntry, relatedTaskEntry) {
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
		if (relatedLogEntry) {
			gr.setValue(this.ATTR_RELATED_CHANGE_LOG_ENTRY, relatedLogEntry.getUniqueValue());
		}
		if (relatedTaskEntry) {
			gr.setValue(this.ATTR_RELATED_TASK_ENTRY, relatedTaskEntry.getUniqueValue());
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

	/**
	  * find out the children of content-group which are best practice acceptable and make corresponding entry in 'gsw_change_log' so that progress will be propagated till root
	  * updateChangeLogContentIds - array which stores the sys_ids of records
	*/
	_updateChangeLogOfContentForBestPracticeAcceptedGrp: function(contentGr, changeLogGr) {
		var updateChangeLogContentIds = [];
		var grContentInfo = new GlideRecord(this.TABLE_CONTENT);
		grContentInfo.addQuery(this.ATTR_PARENTS, 'CONTAINS', contentGr.getUniqueValue());
		var grStatus = grContentInfo.addJoinQuery(this.TABLE_STATUS_OF_CONTENT, this.ATTR_SYS_ID, this.ATTR_CONTENT);
		grStatus.addCondition(this.ATTR_BEST_PRACTICE_ALLOWED_EVER, this.BEST_PRACTICE_ALLOWED_EVER.YES);
		grContentInfo.query();
		while (grContentInfo.next()) {
			var lockedStatusDueToContents = this._getLockedStatusDueToContents(grContentInfo, false);
			var lockedDueToContentsLength = lockedStatusDueToContents.is_accessible.length + lockedStatusDueToContents.is_not_accessible.length;
			if (!lockedDueToContentsLength && !this._getLockedStatusDueToPlugins(grContentInfo).length) {
				updateChangeLogContentIds.push(grContentInfo.getValue(this.ATTR_SYS_ID));
			}
		}
		for (var i = 0; i < updateChangeLogContentIds.length; i++) {
			 this._updateChangeLog(updateChangeLogContentIds[i], this.LOG_TYPE.BEST_PRACTICE_ACCEPTED, changeLogGr); // insert entry in gsw_change_log, so that updateStatusOfContent gets called for leaf node, which will propagate the progress till root
		}
	},

	/*
	 *	Function to update status of gsw_content based on log entry.
	 *	Currently completion / uncompletion transactions via this function are only made by content_item.
	 *	Activation / De-activation is possible by all.
	 */
	updateStatusOfContent: function(changeLogGr) {
		var logType = this._getIntValue(changeLogGr, this.ATTR_TYPE);
		var taskId = changeLogGr.getValue(this.ATTR_RELATED_TASK_ENTRY);
		var contentGr = changeLogGr[this.ATTR_CONTENT].getRefRecord();
		var contentId = contentGr.getUniqueValue();
		var weight = contentGr.getValue(this.ATTR_WEIGHT) * 1.00;
		var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
		if (taskId && contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP && logType != this.LOG_TYPE.DEACTIVATED && logType != this.LOG_TYPE.REACTIVATED) {
			var childrenGr = new GlideRecord(this.TABLE_CONTENT);
			childrenGr.addQuery(this.ATTR_PARENT, contentId);
			childrenGr.query();
			while(childrenGr.next())
				this._updateChangeLog(childrenGr.getUniqueValue(), logType, changeLogGr);
		}
		if (!taskId && contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP &&
			logType != this.LOG_TYPE.DEACTIVATED && logType != this.LOG_TYPE.REACTIVATED && logType != this.LOG_TYPE.VISITED && logType != this.LOG_TYPE.BEST_PRACTICE_ACCEPTED) {
			return;
		}
		if (statusGr.get(this.ATTR_CONTENT, contentId)) { //only one record is expected per content in status table
			var needsUpdate = false;
			var currentStatus = this._getIntValue(statusGr, this.ATTR_STATUS);
			if (logType == this.LOG_TYPE.COMPLETED) {
				if (currentStatus != this.STATUS_TYPE.COMPLETED) {
					statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.COMPLETED);
					statusGr.setValue(this.ATTR_PROGRESS, 100.00);
					if (this._getIntValue(statusGr, this.ATTR_BEST_PRACTICE_ALLOWED_EVER) == this.BEST_PRACTICE_ALLOWED_EVER.YES) {
						statusGr.setValue(this.ATTR_BEST_PRACTICE_ALLOWED_EVER, this.BEST_PRACTICE_ALLOWED_EVER.NO); // If activity completed once, it will never be allowed as best practice acceptable
					}
					needsUpdate = true;
				}
			} else if (logType == this.LOG_TYPE.BEST_PRACTICE_ACCEPTED) {
				if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP) {
					this._updateChangeLogOfContentForBestPracticeAcceptedGrp(contentGr, changeLogGr); // going from top to bottom for content-group
					return;
				}
				else {
					currentStatus = this._getIntValue(statusGr, this.ATTR_STATUS);
					if (currentStatus != this.STATUS_TYPE.COMPLETED && currentStatus != this.STATUS_TYPE.INACTIVE && this._getIntValue(statusGr, this.ATTR_BEST_PRACTICE_ALLOWED_EVER) == this.BEST_PRACTICE_ALLOWED_EVER.YES) {
						statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED);
						statusGr.setValue(this.ATTR_PROGRESS, 100.00);
						needsUpdate = true;
					}
				}
			} else if (logType == this.LOG_TYPE.UNCOMPLETED) {
				if (currentStatus != this.STATUS_TYPE.IN_PROGRESS) {
					statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.IN_PROGRESS);
					statusGr.setValue(this.ATTR_PROGRESS, 0.00);
					needsUpdate = true;
					this._updateStatusOfDependents(contentId, this.LOG_TYPE.UNCOMPLETED, changeLogGr);
				}
			} else if (logType == this.LOG_TYPE.VISITED || logType == this.LOG_TYPE.CONFIGURED) {
				var parentSkipInfo = this._getParentSkipInfo(contentGr);
				//we stop tracking visited or configured after completion or deactivation for status table as the status remains completed / skipped.
				//log would keep tracking visited or configured though.
				if (currentStatus != this.STATUS_TYPE.COMPLETED && currentStatus != this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED && currentStatus != this.STATUS_TYPE.INACTIVE && !parentSkipInfo.is_skipped) {
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
			} else if (logType == this.LOG_TYPE.MORE_INFO_VISITED) {
				statusGr.setValue(this.ATTR_MORE_INFO_VISITED, true);
				needsUpdate = true;
			}
			if (!needsUpdate) {
				return;
			}
			var prevStatus = this._getIntValue(statusGr, this.ATTR_PREVIOUS_STATUS); // previous status will be used to get the state back on reactivation from skipped
			if (currentStatus != prevStatus && currentStatus != this._getIntValue(statusGr, this.ATTR_STATUS)) //'statusGr's status is updatedstatus, since setValue is done above
				statusGr.setValue(this.ATTR_PREVIOUS_STATUS, currentStatus);
			if (logType !== this.LOG_TYPE.MORE_INFO_VISITED) // status text on more info page should remain in sync with category level task
				statusGr.setValue(this.ATTR_RELATED_LOG_ENTRY, changeLogGr.getUniqueValue());
			return statusGr.update();
		} else {
			statusGr.initialize();
			var progress = 0.00;
			if (logType == this.LOG_TYPE.COMPLETED) {
				progress = 100.00;
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.COMPLETED);
			} else if (logType == this.LOG_TYPE.BEST_PRACTICE_ACCEPTED) {
				if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_GROUP) {
					this._updateStatusOfContentForBestPracticeAcceptedGrp(contentGr);
					return;
				}
				else {
					statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED);
					statusGr.setValue(this.ATTR_PROGRESS, 100.00);
				}
			} else if (logType == this.LOG_TYPE.UNCOMPLETED || logType == this.LOG_TYPE.VISITED) {
				statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.IN_PROGRESS);
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

	synchTaskStateAndContentStatus: function(taskOrStatusGr) {
		var taskGr;
		var status;
		var state;
		var statusGr;
		if (taskOrStatusGr.getTableName() == this.TABLE_STATUS_OF_CONTENT)
			statusGr = taskOrStatusGr;
		else if (taskOrStatusGr.getTableName() == this.TABLE_TASK)
			taskGr = taskOrStatusGr;
		if (taskGr) {
			state = taskGr.getValue(this.ATTR_TASK_STATE);
			var contentId = taskGr.getValue(this.TABLE_CONTENT);
			statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			statusGr.addQuery(this.ATTR_CONTENT, contentId);
			statusGr.query();
			if (statusGr.next()) {
				status = statusGr.getValue(this.ATTR_STATUS);
				var changeLogType = this._getChangeLogTypeDependingOnTaskState(state, status);
				if (changeLogType) {
					this._updateChangeLog(contentId, changeLogType, null, taskGr);
				}
			}
		} else if (statusGr) {
			status = statusGr.getValue(this.ATTR_STATUS);
			taskGr = new GlideRecord(this.TABLE_TASK);
			taskGr.addQuery(this.TABLE_CONTENT, statusGr.getValue(this.ATTR_CONTENT));
			taskGr.query();
			if (taskGr.next()) {
				state = taskGr.getValue(this.ATTR_TASK_STATE);
				var newState = this._getTaskStateDependingOnStatus(status);
				if (state != newState && newState) {
					taskGr.setValue(this.ATTR_TASK_STATE, newState);
					taskGr.update();
				}
			}
		}
	},

	_getChangeLogTypeDependingOnTaskState: function(state, status) {
		var changeLogType;
		if ((state == this.TASK_STATE_TYPE.NEW || state == this.TASK_STATE_TYPE.WORK_IN_PROGRESS) && status == this.STATUS_TYPE.INACTIVE) {
			changeLogType = this.LOG_TYPE.REACTIVATED;
		} else if ((state == this.TASK_STATE_TYPE.NEW || state == this.TASK_STATE_TYPE.WORK_IN_PROGRESS) && status == this.STATUS_TYPE.COMPLETED) {
			changeLogType = this.LOG_TYPE.UNCOMPLETED;
		} else if (state == this.TASK_STATE_TYPE.NEW && status != this.STATUS_TYPE.NOT_STARTED) {
			changeLogType = this.LOG_TYPE.VISITED;
		} else if (state == this.TASK_STATE_TYPE.WORK_IN_PROGRESS && status != this.STATUS_TYPE.IN_PROGRESS) {
			changeLogType = this.LOG_TYPE.VISITED;
		} else if (state == this.TASK_STATE_TYPE.CLOSED && status != this.STATUS_TYPE.COMPLETED && status != this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED) {
			changeLogType = this.LOG_TYPE.COMPLETED;
		} else if (state == this.TASK_STATE_TYPE.SKIPPED && status != this.STATUS_TYPE.INACTIVE) {
			changeLogType = this.LOG_TYPE.DEACTIVATED;
		}
		return changeLogType;
	},

	_updateStatusOnReactivation: function(contentGr, statusGr) {
		if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION) {
			statusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, contentGr.getValue(this.ATTR_WEIGHT) * 1.00);
			var statusBeforeSkipped = statusGr.getValue(this.ATTR_PREVIOUS_STATUS);
			statusGr.setValue(this.ATTR_STATUS, statusBeforeSkipped);
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
				var statusOfContent = this._getIntValue(statusGr, this.ATTR_STATUS);
				if (statusOfContent != this.STATUS_TYPE.COMPLETED && statusOfContent != this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED && statusOfContent != this.STATUS_TYPE.INACTIVE) {
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
		var parentGr = new GlideRecord(this.TABLE_CONTENT_GROUP); // In ITOM GS we found one content info with delete parent.
																  // That was leading to creation of status record with non-existent content.
		if (!parentGr.get(parentContentId))
			return false;

		var progress = this._getContentGroupProgress(parentContentId);
		var answer;

		var status = progress.calculatedProgress ?
			this.STATUS_TYPE.IN_PROGRESS : this.STATUS_TYPE.NOT_STARTED;
		if (progress.isComplete) {
			status = this.STATUS_TYPE.COMPLETED;
		}
		var previousStatus = this.STATUS_TYPE.NOT_STARTED;
		var parentStatusGr =  new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
		if (parentStatusGr.get(this.ATTR_CONTENT, parentContentId)) { //only one record is expected per content in status table
			previousStatus = this._getIntValue(parentStatusGr, this.ATTR_STATUS);
			if (previousStatus === this.STATUS_TYPE.IN_PROGRESS
				&& status === this.STATUS_TYPE.NOT_STARTED)
				// If calculatedProgress is 0 we do not want status to be
				// reset to Not Started, if it was already in progress.
				status = this.STATUS_TYPE.IN_PROGRESS;
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
					//If the group is completed, we log an informational log useful for analytics.
					//Status change for this informational log entry is rejected.
					this._updateChangeLog(parentContentId, this.LOG_TYPE.COMPLETED, relatedLogEntryGr);
				} else if (previousStatus == this.STATUS_TYPE.COMPLETED && status != this.STATUS_TYPE.COMPLETED) {
					//If the group is uncompleted, we log an informational log useful for analytics.
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

	updateChecksumForRoot: function(contentGr) {
		var rootContentId;
		if (contentGr.getValue(this.ATTR_ROOT_PARENT))
			rootContentId = contentGr.getValue(this.ATTR_ROOT_PARENT);
		else
			rootContentId = contentGr.getUniqueValue();
		var hashChecksum = this._getChecksumForRoot(rootContentId);
		var gr = new GlideRecord(this.TABLE_CONTENT_GROUP);
		if (gr.get(rootContentId)) {
			gr.setValue(this.ATTR_CHECKSUM, hashChecksum);
			gr.update();
		}
		return hashChecksum;
	},

	_getChecksumForRoot: function(rootContentId) {
		var checksum = this._createChecksumForParent(rootContentId);
		var hashChecksum = new GlideDigest().sha1_digest(checksum);
		return hashChecksum;
	},

	_createChecksumForParent: function(parentContentId) {
		var checksum = parentContentId;
		var childrenGr = this._getChildrenGr(parentContentId);
		if (childrenGr.hasNext()) {
			checksum = checksum + '(';
			var firstChild = true;
			while (childrenGr.next()) {
				if (firstChild)
					firstChild = false;
				else
					checksum = checksum + ',';
				checksum = checksum + this._createChecksumForParent(childrenGr.getUniqueValue());
			}
			checksum = checksum + ')';
		}
		return checksum;
	},

	_getChildrenGr: function(parentContentId) {
		var childrenGr = new GlideRecord(this.TABLE_CONTENT);
		childrenGr.addActiveQuery();
		childrenGr.addQuery(this.ATTR_PARENT, parentContentId);
		childrenGr.orderBy(this.ATTR_ORDER);
		childrenGr.query();
		return childrenGr;
	},

	/**
	* Initially 'Best practice allowed ever' will be set 'Yes' if content-info is best practice acceptable, else will remain as 'Not applicable'
	* 'Best practice alowed ever' will be set false, if activity is completed once in life cycle
	*/
	_createInitialBestPracticeAllowedContentStatus: function(contentGr) {
		if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION) {
			var infoGr = new GlideRecord(this.TABLE_CONTENT_INFORMATION);
			infoGr.get(this.ATTR_SYS_ID, contentGr.getUniqueValue());
			if (this._getBoolValue(infoGr, this.ATTR_BEST_PRACTICE_ACCEPTABLE, false)) {
				return true;
			}
		}
		return false;
	},

	_createAndRefreshStatusForContent: function(contentGr) {
		var contentId = contentGr.getUniqueValue();
		var parentId = contentGr.getValue(this.ATTR_PARENT);
		var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
		var relatedChangeId;

		if (statusGr.get(this.ATTR_CONTENT, contentId)) {
			if (this._createInitialBestPracticeAllowedContentStatus(contentGr)) {
				statusGr.setValue(this.ATTR_BEST_PRACTICE_ALLOWED_EVER, this.BEST_PRACTICE_ALLOWED_EVER.YES);
				statusGr.update();
			}
		} else {
			relatedChangeId = this._updateChangeLog(contentId, this.LOG_TYPE.INITIATED);

			statusGr.initialize();
			statusGr.setValue(this.ATTR_CONTENT, contentId);
			statusGr.setValue(this.ATTR_PROGRESS, 0);
			statusGr.setValue(this.ATTR_STATUS, this.STATUS_TYPE.NOT_STARTED);
			statusGr.setValue(this.ATTR_EFFECTIVE_WEIGHT, contentGr.getValue(this.ATTR_WEIGHT) * 1.00);
			statusGr.setValue(this.ATTR_RELATED_LOG_ENTRY, relatedChangeId);
			statusGr.setWorkflow(false);
			if (this._createInitialBestPracticeAllowedContentStatus(contentGr)) {
				statusGr.setValue(this.ATTR_BEST_PRACTICE_ALLOWED_EVER, this.BEST_PRACTICE_ALLOWED_EVER.YES);
			}
			statusGr.insert();
		}

		if (contentGr.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION) {
			// optionally auto sync the status for properties and plugins
			this._updateStatusOfDynamicContent(this._getRealRecord(contentGr), statusGr);

			if (!relatedChangeId) {
				// Means current content info already had a status record, which could be referencing any
				// type of change log record. But that change is not the cause of possible updates in parent
				// statuses. Hence, we create a new init change log pointing to current content. However,
				// since current content status already is linked to a change log, that reference won't be
				// overwritten. After all a status completed pointing to init log makes no sense. In fact
				// all logs except init sync status type with their own types.
				var logGr = new GlideRecord(this.TABLE_CHANGE_LOG);
				logGr.addQuery(this.ATTR_CONTENT, contentId);
				logGr.orderByDesc(this.ATTR_CHANGE_DATE);
				logGr.setLimit(1);
				logGr.query();
				if (logGr.next() && this._getIntValue(logGr, this.ATTR_TYPE) === this.LOG_TYPE.INITIATED)
					relatedChangeId = logGr.getUniqueValue();
				else
					relatedChangeId = this._updateChangeLog(contentId, this.LOG_TYPE.INITIATED);
			}

			while (parentId) {
				// If current parent is Not Started then we should still not bail out from this while-loop.
				// If suppose we have tree like Root->A->A.1. Root is In Progress because some category B
				// is in progress, but A is Not Started. If now we add a new task A.2 with wt 2.
				// This will have cascading effect and wt of Root too will change. Not recalculating
				// A won't have effect because it has 0% progress but Root will now have incorrect
				// progress.
				this.calculateParentProgress(parentId, relatedChangeId);
				var parentGr = new GlideRecord(this.TABLE_CONTENT);
				if (parentGr.get(parentId))
					parentId = parentGr.getValue(this.ATTR_PARENT);
				else
					parentId = null;
			}
		}
		return statusGr;
	},

	_getRealRecord: function(gr) {
		if (gr == null || !gr.isValid())
			return gr;

		var isTrueClass = gr.getRecordClassName() == gr.getTableName();
		if (isTrueClass)
			return gr;

		var childGr = new GlideRecord(gr.getRecordClassName());
		childGr.get(gr.getUniqueValue());
		return childGr;
	},

	_isDynamicContent: function(contentGr) {
		return this._getBoolValue(contentGr, this.ATTR_IS_DYNAMIC, false);
	},

	_refreshDynamicContent: function(contentGr) {
		if (!this._isDynamicContent(contentGr))
			return false;

		var contentId = contentGr.getUniqueValue();
		var parentId = contentGr.getValue(this.ATTR_PARENT);
		var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);

		if (!statusGr.get(this.ATTR_CONTENT, contentId))
			return false;

		if (!this._updateStatusOfDynamicContent(contentGr, statusGr))
			return false;

		return true;
	},

	_updateStatusOfDynamicContent: function(contentGr, statusGr) {
		if (!this._isDynamicContent(contentGr))
			return false;

		var actualEqualsDesired = false;
		var endPointType = parseInt(contentGr.getValue(this.ATTR_END_POINT_TYPE));
		var propertyName = contentGr.getValue(this.ATTR_PROPERTY_NAME);
		var pluginID = contentGr.getValue(this.ATTR_PLUGIN_ID);
		var table = contentGr.getValue(this.ATTR_TABLE);
		var filter = contentGr.getValue(this.ATTR_FILTER);

		if (this.END_POINT_TYPE.CONFIGURE_PROPERTY == endPointType && !gs.nil(propertyName)) {				
			var actualValue = gs.getProperty(propertyName);
			var desiredValue = contentGr.getValue(this.ATTR_PROPERTY_VALUE);
			if (desiredValue == actualValue)
				actualEqualsDesired = true;
		} else if (this.END_POINT_TYPE.CONFIGURE_PLUGIN == endPointType && !gs.nil(pluginID)) {
			actualEqualsDesired = GlidePluginManager.isActive(pluginID);
		} else if (this.END_POINT_TYPE.CONFIGURE_FILTER == endPointType && !gs.nil(table)) {
			var filterResult = contentGr.getValue(this.ATTR_FILTER_RESULT);
			var actualRowCount = 0;
			var desiredRowCountIsZero = filterResult == "1";

			var filterGr = new GlideRecord(table);
			if (filterGr.isValid()) {
				if (!gs.nil(filter))
					filterGr.addEncodedQuery(filter);
				filterGr.setLimit(1); // we only care about empty/not empty currently
				filterGr.query();
				actualRowCount = filterGr.getRowCount();
			}

			if (actualRowCount == 0 && desiredRowCountIsZero == true)
				actualEqualsDesired = true;
			else if (actualRowCount > 0 && desiredRowCountIsZero == false)
				actualEqualsDesired = true;
		}

		var currentStatus = this._getIntValue(statusGr, this.ATTR_STATUS);
		var currentProgress = parseFloat(statusGr.getValue(this.ATTR_PROGRESS));

		var desiredStatus = currentStatus;
		var desiredProgress;

		if (currentStatus === this.STATUS_TYPE.INACTIVE)
			return false;

		if (actualEqualsDesired) {
			if (parseInt(currentProgress) !== 100) {
				if (this._getIntValue(statusGr, this.ATTR_BEST_PRACTICE_ALLOWED_EVER) == this.BEST_PRACTICE_ALLOWED_EVER.YES)
					this._updateChangeLog(contentGr.getUniqueValue(), this.LOG_TYPE.BEST_PRACTICE_ACCEPTED);
				else
					this._updateChangeLog(contentGr.getUniqueValue(), this.LOG_TYPE.COMPLETED);
				return true;
			}
		} else {
			if (parseInt(currentProgress) === 100) {
				this._updateChangeLog(contentGr.getUniqueValue(), this.LOG_TYPE.UNCOMPLETED);
				return true;
			}
		}

		return false;
	},

	createInitialStatusForContent2: function(contentGr) {
		this._createAndRefreshStatusForContent(contentGr);
	},

	_createAndRefreshStatusForAllContents: function (rootContentId) {
		var gr = new GlideRecord(this.TABLE_CONTENT);
		gr.addActiveQuery();
		gr.addQuery(this.ATTR_ROOT_PARENT, rootContentId);
		gr.query();
		gs.info("***Creating Content Status***");
		while (gr.next()) {
			this._createAndRefreshStatusForContent(gr);
		}
	},

	newAssigneeUpdate: function(contentId, user, contentUrl) {
		var taskGr = new GlideRecord(this.TABLE_TASK);
		taskGr.addQuery(this.TABLE_CONTENT, contentId);
		taskGr.query();
		if (taskGr.next()) {
			taskGr.setValue(this.ATTR_ASSIGNED_TO, user);
			taskGr.update();
		} else {
			taskGr.initialize();
			taskGr.setValue(this.TABLE_CONTENT, contentId);
			taskGr.setValue(this.ATTR_ASSIGNED_TO, user);
			var contentGr = new GlideRecord(this.TABLE_CONTENT);
			contentGr.get(contentId);
			var shortDescription = this._getContentTitle(contentGr.getValue(this.ATTR_ROOT_PARENT)) + ' - ' + this._getContentTitle(contentGr.getValue(this.ATTR_PARENT)) + ' - ' +  contentGr.getValue(this.ATTR_TITLE);
			taskGr.setValue(this.ATTR_SHORT_DESCRIPTION, shortDescription);
			taskGr.setValue(this.ATTR_CONTENT_URL, contentUrl);
			var statusGr = new GlideRecord(this.TABLE_STATUS_OF_CONTENT);
			statusGr.get(this.ATTR_CONTENT, contentId);
			var state;
			var status = statusGr.getValue(this.ATTR_STATUS);
			if (status == this.STATUS_TYPE.IN_PROGRESS && statusGr.getValue(this.ATTR_PROGRESS) == 0)
				state = this.TASK_STATE_TYPE.NEW;
			else
				state= this._getTaskStateDependingOnStatus(status);
			taskGr.setValue(this.ATTR_TASK_STATE, state);
			taskGr.insert();
		}
		var taskDetails = {};
		this._setTaskDetails(taskDetails, taskGr);
		return taskDetails;
	},

	_getContentTitle: function(contentId) {
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		contentGr.get(contentId);
		return contentGr.getValue(this.ATTR_TITLE);
	},

	_getTaskStateDependingOnStatus: function(status) {
		var newState;
		if (status == this.STATUS_TYPE.NOT_STARTED)
			newState = this.TASK_STATE_TYPE.NEW;
		else if (status == this.STATUS_TYPE.IN_PROGRESS)
			newState = this.TASK_STATE_TYPE.WORK_IN_PROGRESS;
		else if (status == this.STATUS_TYPE.COMPLETED || status == this.STATUS_TYPE.BEST_PRACTICE_ACCEPTED)
			newState = this.TASK_STATE_TYPE.CLOSED;
		else if (status == this.STATUS_TYPE.INACTIVE)
			newState = this.TASK_STATE_TYPE.SKIPPED;
		return newState;
	},

	setAllAssignee: function(contentId, user, contentUrl) {
		var childrenGr = new GlideRecord(this.TABLE_CONTENT);
		childrenGr.addActiveQuery();
		childrenGr.addQuery(this.ATTR_PARENT, contentId);
		childrenGr.query();
		while (childrenGr.next())
			this.newAssigneeUpdate(childrenGr.getUniqueValue(), user, contentUrl[childrenGr.getUniqueValue()]);
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
			} else if (endPointType === this.END_POINT_TYPE.FORM_LAYOUT) {
				var formGr = new GlideRecord(this.END_POINTS.SYS_UI_SECTION_TABLE);
				formGr.addQuery('name', contentInfoGr.table);
				formGr.query();
				if (!formGr.hasNext()) {
					gs.addErrorMessage(gs.getMessage("This table does not have a form view defined. You need to access the form view for this table at least once, or create a form view manually before specifying this table as the end point."));
					return false;
				}
			} else if (contentInfoGr.end_point) {
				contentInfoGr.end_point = '';
			}
		}
		return true;
	},

	/**
	*  'dependent_on_plugins' list has the sys_id's for all the defined plugins
	*  'dependent_on_plugins_ids' field is introduced which has the plugins ids stamped for each plugin in 'dependent_on_plugins' list
	*   Plugin ids are stamped since 'GlidePluginManager.isActive()' is required to check the status for non-accessible plugins and this API takes 'plugin_id' as a input
	*/
	stampDependentOnPluginsIDs: function(contentGr) {
		var dependentsOnPlugins = contentGr.getValue(this.ATTR_DEPENDENT_ON_PLUGINS),  dependentOnPluginsIDs = '';
		if (dependentsOnPlugins) {
			var dependentsOnPluginsList = dependentsOnPlugins.split(',');
			var pluginGr = new GlideRecord(this.TABLE_PLUGINS);
			for (var i = 0; i < dependentsOnPluginsList.length; i++) {
				if (pluginGr.get(dependentsOnPluginsList[i])) {
					dependentOnPluginsIDs += pluginGr.getValue(this.ATTR_ID);
					if (i < (dependentsOnPluginsList.length - 1))
						dependentOnPluginsIDs += ',';
				} else { // This case might arise if a dependent plugin which was previously published is deleted later on
					gs.addErrorMessage(gs.getMessage("The dependent Plugin - {0} needs to be deleted from dependent on plugins list, since it seems to be non-accessible", dependentsOnPluginsList[i]));
					contentGr.setAbortAction(true);
				}
			}
		}
		contentGr.setValue(this.ATTR_DEPENDENT_ON_PLUGINS_IDS, dependentOnPluginsIDs);
	},

	_updateImplicitDependencies: function(parentContentId, dependentsAll, implicitField) {
		var contentGr = new GlideRecord(this.TABLE_CONTENT);
		contentGr.addActiveQuery();
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
		if(!current) {
			return false;
		}
		var isCurrentRoot = this._getBoolValue(current, this.ATTR_IS_ROOT_CONTENT, false);
		var parentValidation;
		if (isCurrentRoot) {
			parentValidation = this._validateRoot(current);
		} else {
			var parentSysId = current.getValue(this.ATTR_PARENT);
			if (parentSysId && parentSysId == current.getUniqueValue()) {
				gs.addErrorMessage(gs.getMessage("Any content can not be parent of itself"));
				return false;
			}
			parentValidation = this._validateNonRoot(current);
		}
		if (!parentValidation) { // if this flag is false, no need to check for children
			gs.addErrorMessage(gs.getMessage("The parent's(ancestors) children layout is not supported for this content type"));
			return false;
		}
		if (current.getValue(this.ATTR_SYS_CLASS_NAME) == this.TABLE_CONTENT_INFORMATION) {
			// This record is incapable of having children, skipping children check.
			return true;
		}
		var childrenValidation = this._validateChildren(current);
		if (!childrenValidation) {
			gs.addErrorMessage(gs.getMessage("The descendant(s) children / children layout is not supported for this content type"));
			return false;
		}
		return true;
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

	_validateChildren: function (/*GlideRecord*/ current) {
		var parentLayout = this._getChildrenLayout(current), childLayout;
		if (typeof parentLayout === 'undefined' || parentLayout === null)
			return false;
		var childGrpGr = new GlideRecord(this.TABLE_CONTENT_GROUP);
		childGrpGr.addActiveQuery();
		childGrpGr.addQuery(this.ATTR_PARENT, current.getUniqueValue());
		childGrpGr.query();
		while (childGrpGr.next()) {
			childLayout = this._getIntValue(childGrpGr, this.ATTR_CHILDREN_LAYOUT);
			if (!this.DEPENDENCY_MATRIX[parentLayout][childLayout]) {
				return false;
			}
		}
		childLayout = this.DEPENDENCY_MATRIX_INDEX.INFORMATION;
		var childInfoGr = new GlideRecord(this.TABLE_CONTENT_INFORMATION);
		childInfoGr.addActiveQuery();
		childInfoGr.addQuery(this.ATTR_PARENT, current.getUniqueValue());
		childInfoGr.setLimit(1);
		childInfoGr.query();
		if (childInfoGr.hasNext()) {
			return this.DEPENDENCY_MATRIX[parentLayout][childLayout];
		}
		return true;
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