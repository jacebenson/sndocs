var GenerateDashboardMeta = Class.create();
GenerateDashboardMeta.prototype = {
    initialize: function() {
    },

	PA_CONTENT_PACK: 'pa_content_pack',
	PA_DASHBOARDS: 'pa_dashboards',
	PA_M2M_DASHBOARD_TABS: 'pa_m2m_dashboard_tabs',
	PA_TABS: 'pa_tabs',
	SYS_PORTAL_PAGE: 'sys_portal_page',
	SYS_IDIN: 'sys_idIN',
	SYS_PORTAL_PREFERENCES: 'sys_portal_preferences',
	NAME: 'name',
	RECORD_UPDATE: 'record_update',
	TABLE: 'table',
	TYPE: 'type',
	DESCRIPTION: 'description',
	tabs: [],
	portal_prefs: [],
	widgets: [],
	
	createDashboardMeta: function(dashboardId) {
		var dashboard = new GlideRecord(this.PA_DASHBOARDS);
		if(!dashboard.get(dashboardId)) {
			var e = Error(gs.getMessage('Could not find pa_dashboard record with sys_id: {0}', dashboardId));
			e.name = 'DashboardNotFound';
			throw e;
		}
		
		// create parent metadata record
		var dashboardMeta = new GlideRecord(this.PA_CONTENT_PACK);
		dashboardMeta.initialize();
		dashboardMeta.setValue(this.NAME, dashboard.getValue(this.NAME));
		dashboardMeta.setValue('plugin', 'com.snc.pa');
		dashboardMeta.setValue('content_updated', new GlideDateTime());
		dashboardMeta.setValue('dashboard', dashboardId);
		var parentId = dashboardMeta.insert();
		
		var outputStream = new Packages.java.io.ByteArrayOutputStream();
		try {
			this.serializeDashboard(dashboard, outputStream);
			var name = dashboard.getValue(this.NAME);
			this.insertMetadata(parentId, name, name, 'dashboard', outputStream.toString());
			dashboardMeta.setValue(this.DESCRIPTION, 'This dashboard contains the following tabs:\n\n- ' + this.tabs.join('\n- '));
			dashboardMeta.update();
		} catch (err) {
			throw err;
		} finally {
			outputStream.close();
		}
		
		return parentId;
	},
	
	/**
	 * Serializes several GlideRecords that make up a dashboard into XML
	 */
	serializeDashboard: function(dashboard, outputStream) {
		var transformerHandler = this.getTransformer();
		var streamResult = this.getResultStream(outputStream);
		transformerHandler.setResult(streamResult);
		transformerHandler.getTransformer().setOutputProperty(Packages.javax.xml.transform.OutputKeys.INDENT, 'yes');

		// start the XML document and begin serializing GlideRecords to XML
		transformerHandler.startDocument();
		var attr = new GlidesoftGlideAttributesImpl();
		attr.addAttribute(this.TABLE, dashboard.getTableName());
		transformerHandler.startElement('', '', this.RECORD_UPDATE, attr);
		
		// serialize all records related to a dashboard
		this.serializeRecord(dashboard, transformerHandler);
		var dashboardId = dashboard.getUniqueValue();
		this.serializeRecords('pa_m2m_dashboard_sources', 'dashboard.sys_id=' + dashboardId, transformerHandler);
		this.serializeRecords(this.PA_M2M_DASHBOARD_TABS, 'dashboard.sys_id=' + dashboardId, transformerHandler);
		var ids = this.getRelationshipIDs(this.PA_M2M_DASHBOARD_TABS, 'dashboard.sys_id=' + dashboardId, 'tab');
		this.serializeRecords(this.PA_TABS, this.SYS_IDIN + ids, transformerHandler);
		ids = this.getRelationshipIDs(this.PA_TABS, this.SYS_IDIN + ids, 'page');
		this.serializeRecords(this.SYS_PORTAL_PAGE, this.SYS_IDIN + ids, transformerHandler);
		this.serializeRecords('sys_portal', 'page.' + this.SYS_IDIN + ids, transformerHandler);
		this.serializeRecords(this.SYS_PORTAL_PREFERENCES, 'portal_section.page.' + this.SYS_IDIN + ids, transformerHandler);
		this.serializeRecords('sys_grid_canvas', 'legacy_page.' + this.SYS_IDIN + ids, transformerHandler);
		this.serializeRecords('sys_grid_canvas_pane', 'grid_canvas.legacy_page.' + this.SYS_IDIN + ids, transformerHandler);
		
		// end XML document and create dashboard metadata record in content_metadata record
		transformerHandler.endElement('', '', 'record_update');
		transformerHandler.endDocument();
	},
	
	/**
	 * Serialize a sinlge record into the TransformerHandler
	 */
	serializeRecord: function(record, transformerHandler) {
		var recordSerializer = new GlideRecordXMLSerializer();
		var realRecord = new GlideScriptRecordUtil.get(record).getRealRecord();
		recordSerializer.setApplySecurity(true);
		recordSerializer.serialize(record, transformerHandler, new Packages.java.lang.String('INSERT_OR_UPDATE'));
	},
	
	/**
	 * Serializes all records returned by the table query into a single XML document in the TransformerHandler
	 */
	serializeRecords: function(table, encodedQuery, transformerHandler) {
		var record = new GlideRecord(table);
		record.addEncodedQuery(encodedQuery);
		record.query();

		while(record.next()) {
			if (table === this.PA_TABS)
				this.tabs.push(record.getValue(this.NAME));
			if (table === this.SYS_PORTAL_PREFERENCES && record.getValue(this.NAME) === 'sys_id')
				this.portal_prefs.push(record.getValue('value'));
				
			this.serializeRecord(record, transformerHandler);
		}
	},
	
	/**
	 * Serializes a single record into XML
	 */
	serialize: function(record) {
		var outputStream = new Packages.java.io.ByteArrayOutputStream();
		try {
			var transformerHandler = this.getTransformer();
			var streamResult = this.getResultStream(outputStream);
			transformerHandler.setResult(streamResult);
			transformerHandler.getTransformer().setOutputProperty(Packages.javax.xml.transform.OutputKeys.INDENT, 'yes');
			transformerHandler.startDocument();
			var attr = new GlidesoftGlideAttributesImpl();
			attr.addAttribute(this.TABLE, record.getTableName());
			transformerHandler.startElement('', '', this.RECORD_UPDATE, attr);
			this.serializeRecord(record, transformerHandler);
			transformerHandler.endElement('', '', 'record_update');
			transformerHandler.endDocument();
		} catch (e) {
			throw e;
		} finally {
			outputStream.close();
		}
		
		return outputStream.toString();
	},
		
	createWidgetMeta: function(parentId) {	
		var widgetsAdded = [];		
		for (var i = 0; i < this.portal_prefs.length; i++) {
			// get widget XML and insert it as new records
			var widget = new GlideRecord('pa_widgets');
			var id = this.portal_prefs[i];
			if (widgetsAdded.indexOf(id) === -1 && widget.get(id)) {
				widgetsAdded.push(id);
				var outputStream = new Packages.java.io.ByteArrayOutputStream();
				try {
					this.serializeWidget(outputStream, widget);
					var name = widget.getValue(this.NAME);
					this.widgets.push(name);
					this.insertMetadata(parentId, name, widget.getValue(this.DESCRIPTION), 'widget', outputStream.toString());
					this.port_prefs.splice(i, 1);
				} catch (e) {
					throw e;
				} finally {
					outputStream.close();
				}
			}
		}
		
		var desc = '\n\n with these widgets: \n\n- ' + this.widgets.join('\n- ');
		this.appendDescription(parentId, desc);
	},
	
	/**
	 * Serialize a single widget with its dependent records as one XML document
	 */
	serializeWidget: function (outputStream, widget) {
		var transformerHandler = this.getTransformer();
		var streamResult = this.getResultStream(outputStream);
		transformerHandler.setResult(streamResult);
		transformerHandler.getTransformer().setOutputProperty(Packages.javax.xml.transform.OutputKeys.INDENT, 'yes');

		// start the XML document and begin serializing GlideRecords to XML
		this.startDocument(transformerHandler);
		this.serializeRecord(widget, transformerHandler);

		var type = widget.getValue(this.TYPE);
		if (type === 'time' || type === 'list' || type === 'process')
			this.serializeRecords('pa_widget_indicators', 'widget.sys_id=' + widget.getUniqueValue(), transformerHandler);
		
		this.endDocument(transformerHandler);
	},
	
	createGroupMeta: function(dashboardId, parentId) {
		var dash = new GlideRecord('pa_dashboards');
		dash.get(dashboardId);
		var group = new GlideRecord('pa_dashboards_group');
		if (group.get(dash.getValue('group'))) {
			try {
				var name = group.getDisplayValue(this.NAME);
				this.insertMetadata(parentId, name, name, 'dashboard_group', this.serialize(group));
			} catch (e) {
				throw e;
			}
		}
	},
	
	createPermissionsMeta: function(dashboardId, parentId) {
		var permissions = new GlideRecord('pa_dashboards_permissions');
		permissions.addQuery('dashboard', dashboardId);
		permissions.query();
		
		while (permissions.next()) {
			try {
				var type = permissions.getDisplayValue(this.TYPE);
				this.insertMetadata(parentId, type, type, 'permission', this.serialize(permissions));	
			} catch (e) {
				throw e;
			}
		}
	},
	
	createFilterMeta: function(parentId) {
		var filtersAdded = [];
		for (var i = 0; i < this.portal_prefs.length; i++) {
			var filter = new GlideRecord('sys_ui_hp_publisher');
			var id = this.portal_prefs[i];
			
			// filters are often reused on different tabs so dont duplicate metadata
			if (filtersAdded.indexOf(id) === -1 && filter.get(id)) {
				filtersAdded.push(id);
				var outputStream = new Packages.java.io.ByteArrayOutputStream();
				try {
					this.serializeFilter(outputStream, filter);
					this.insertMetadata(parentId, filter.getValue('look_up_name'), filter.getValue(this.DESCRIPTION), 'filter', outputStream.toString());
					this.port_prefs.splice(i, 1);
				} catch (e) {
					throw e;
				} finally {
					outputStream.close();
				}
			}
		}
	},
	
	/**
	 * Serialize a single filter with its dependt records as one XML document
	 */
	serializeFilter: function(outputStream, filter) {
		var transformerHandler = this.getTransformer();
		var streamResult = this.getResultStream(outputStream);
		transformerHandler.setResult(streamResult);
		transformerHandler.getTransformer().setOutputProperty(Packages.javax.xml.transform.OutputKeys.INDENT, 'yes');

		// start the XML document and begin serializing GlideRecords to XML
		this.startDocument(transformerHandler);
		this.serializeRecord(filter, transformerHandler);
		
		var type = filter.getValue(this.TYPE);
		var id = filter.getUniqueValue();
		// reference filter
		if (type == 2)
			this.serializeRecords('sys_ui_hp_reference', 'publisher_reference.sys_id=' + id, transformerHandler);

		// date filter
		if (type == 3)
			this.serializeRecords('sys_ui_hp_date', 'publisher_reference.sys_id=' + id, transformerHandler);
		
		// group filter
		if (type == 4)
			this.serializeRecords('sys_ui_hp_group', 'child_publish.sys_id=' + id, transformerHandler);
		
		this.endDocument(transformerHandler);
	},
	
	createReportMeta: function(parentId) {
		for (var i = 0; i < this.portal_prefs.length; i++) {
			var report = new GlideRecord('sys_report');
			var id = this.portal_prefs[i];
			if (report.get(id)) {
				var outputStream = new Packages.java.io.ByteArrayOutputStream();
				try {
					this.serializeReport(outputStream, report);
					this.insertMetadata(parentId, report.getValue('title'), report.getValue(this.DESCRIPTION), 'report', outputStream.toString());
					this.port_prefs.splice(i, 1);
				} catch (e) {
					throw e;
				} finally {
					outputStream.close();
				}
			}
		}
	},
	
	/**
	 * Serialize a single report with its dependt records as one XML document
	 */
	serializeReport: function(outputStream, report) {
		var transformerHandler = this.getTransformer();
		var streamResult = this.getResultStream(outputStream);
		transformerHandler.setResult(streamResult);
		transformerHandler.getTransformer().setOutputProperty(Packages.javax.xml.transform.OutputKeys.INDENT, 'yes');

		// start the XML document and begin serializing GlideRecords to XML
		this.startDocument(transformerHandler);
		this.serializeRecord(report, transformerHandler);
		var gReport = new GlideReport(report.getUniqueValue());
		this.serializeRecords('sys_report_drill', this.SYS_IDIN + gReport.getDrillSysIds(), transformerHandler);
		this.serializeRecords('sys_report_layer', this.SYS_IDIN + gReport.getLayerSysIds(), transformerHandler);
		this.serializeRecords('sys_report_users_groups', this.SYS_IDIN + gReport.getReportUsersGroupsSysIds(), transformerHandler);
		this.endDocument(transformerHandler);
	},
	
	/**
	 * Returns a comma seperated list of values for the provided foreign key column.
	 */
	getRelationshipIDs: function(table, query, foreignKey) {
		var record = new GlideRecord(table);
		record.addEncodedQuery(query);
		record.query();
		var IDs = [];
		while (record.next()) {
			var id = record.getValue(foreignKey);
			if (id != null)
				IDs.push(id);
		}

		return IDs.join();
	},
	
	insertMetadata: function(parentMeta, name, description, type, xml) {
		var meta = new GlideRecord('pa_content_metadata');
		meta.initialize();
		meta.setValue(this.NAME, name);
		meta.setValue(this.DESCRIPTION, description);
		meta.setValue('pa_content_pack', parentMeta);
		meta.setValue(this.TYPE, type);
		meta.setValue('metadata', xml);
		meta.setValue('content_updated', new GlideDateTime());
		meta.insert();
	},
	
	/**
	 * Generate all metadata records required by the Content Generator app to (re)produce a dashboard.
	 */
	generate: function (dashboardId) {
		if (arguments.length === 1 && typeof arguments[0] === 'string') {
			try {
				var parentId = this.createDashboardMeta(dashboardId);
				if (JSUtil.notNil(parentId)) {
					this.createPermissionsMeta(dashboardId, parentId);
					this.createGroupMeta(dashboardId, parentId);
					this.createWidgetMeta(parentId);
					this.createFilterMeta(parentId);
					this.createReportMeta(parentId);
					return parentId;
				} else {
					var e = Error(gs.getMessage('There was a problem creating the content_pack record', dashboardId));
					e.name = 'NoParentID';
					throw e;
				}
			} catch (err) {
				// This is error is generated by the script so displaying the error in the UI is sufficient
				if (err.name === 'DashboardNotFound' || err.name === 'NoParentID')
					gs.addErrorMessage(err.message);
				else {
					// display a general message for other errors not thrown by this script
					// and log anything that might be too cryptic for the end user
					gs.addErrorMessage(gs.getMessage('An error occurred while trying to generate meta data for pa_dashboards with sys_id: {0}', dashboardId));
					gs.addErrorMessage(err.message);
					gs.debug(err.message);
				}
			}
		} else {
			gs.addErrorMessage(gs.getMessage('The generate() function takes the sys_id of a pa_dashboards record as the argument'));
		}
	},
	
	getTransformer: function() {
		return Packages.javax.xml.transform.sax.SAXTransformerFactory.newInstance().newTransformerHandler();
	},
	
	getResultStream: function (outputStream) {
		return new Packages.javax.xml.transform.stream.StreamResult(outputStream);
	},
	
	startDocument: function(transformerHandler) {
		transformerHandler.startDocument();
		transformerHandler.startElement('', '', this.RECORD_UPDATE, new GlidesoftGlideAttributesImpl());
	},
	
	endDocument: function(transformerHandler) {
		transformerHandler.endElement('', '', 'record_update');
		transformerHandler.endDocument();
	},
	
	getDashboardPages: function(dashboardId) {
		// get all dashboard tab IDs and then the IDs of pages related to each tab
		var ids = this.getRelationshipIDs(this.PA_M2M_DASHBOARD_TABS, 'dashboard.sys_id=' + dashboardId, 'tab');
		ids = this.getRelationshipIDs(this.PA_TABS, this.SYS_IDIN + ids, 'page');
		return ids;
	},
	
	/**
	 * Get a set of portal preference records with sys_id value for a certain type of renderer;
	 */
	getPortalPrefs: function(dashboardId) {
		var portalPrefs = new GlideRecord(this.SYS_PORTAL_PREFERENCES);
		portalPrefs.addEncodedQuery('name=sys_id^portal_section.page.sys_idIN' + this.getDashboardPages(dashboardId));
		portalPrefs.query();
		
		return portalPrefs;
	},
	
	appendDescription: function(contentPackId, description) {
		var contentPack = new GlideRecord(this.PA_CONTENT_PACK);
		contentPack.get(contentPackId);
		var desc = contentPack.getValue(this.DESCRIPTION);
		desc += description;
		contentPack.setValue(this.DESCRIPTION, desc);
		return contentPack.update();
	},
	
    type: 'GenerateDashboardMeta'
};