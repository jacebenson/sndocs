var PAAdminConsoleUtil = Class.create();
PAAdminConsoleUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	PA_SOLUTION_HIERARCHY: 'pa_solutions_hierarchy',
	PA_DASHBOARDS: 'pa_dashboards',
	PA_TABS: 'pa_m2m_dashboard_tabs',
	PA_BREAKDOWN_SOURCE:'pa_m2m_dashboard_sources',
	getDashboardSolutionHierarchy: function() {
		var encodedQuery = this.getParameter('sysparm_encoded_query');
		return this.getSolution(encodedQuery);
	},
	getSolution: function(encodedQuery) {
		var root = {
			name: gs.getMessage("Solution"),
			id: "-1",
			type: "Root",
		};
		root.children = this.getDashboardGroups(encodedQuery);
		var result = this.newItem("result");
		result.setAttribute("solutions", JSON.stringify(root));
		return JSON.stringify(root);
	},
	getDashboardGroups: function(encodedQuery) {
		var groups = {};
		var allGroups = [];
		var grHierarchy = new GlideRecordSecure(this.PA_DASHBOARDS);
		if (encodedQuery !== null) {

			var thisEncodedQuery = JSON.parse(encodedQuery);
			gs.info("thisEncodedQuery");
			gs.info(encodedQuery);
			if (thisEncodedQuery.pa_dashboards_group) {
				grHierarchy.addEncodedQuery(thisEncodedQuery.pa_dashboards_group);
			}

			if (thisEncodedQuery.pa_dashboards) {
				grHierarchy.addEncodedQuery(thisEncodedQuery.pa_dashboards);

			}
		}

		grHierarchy.query();
		while (grHierarchy.next()) {
			var dashboard = {
				name: grHierarchy.getDisplayValue('sys_name'),
				id: grHierarchy.getDisplayValue('sys_id'),
				uuid: gs.generateGUID(),
				type:'dashboard'
			};
			var groupId = (typeof grHierarchy.getValue('group') === "string") ? grHierarchy.getDisplayValue('group.sys_id') : -1;
			var groupName = groupId === -1 ? gs.getMessage("(Others)") : grHierarchy.getDisplayValue('group.sys_name');
			if (groups[groupId]) {
				var currentGroup = groups[groupId];
				currentGroup.children = currentGroup.children || [];
				currentGroup.children.push(dashboard);
			} else {
				var group = {
					id: groupId,
					name: groupName,
					uuid: gs.generateGUID(),
					type:'group'
				};
				group.children = [];
				group.children.push(dashboard);
				groups[groupId] = group;
			}
		}
		for (var grp in groups) {
			allGroups.push(groups[grp]);
		}

		return allGroups;

	},
	getDashboardTabsAndBreakdown:function(){
		var tabs = this.getDashboardTabs();
		var breakdownSources = this.getDashboardBreakdownSource();
		var children = tabs.concat(breakdownSources);
		var result = this.newItem("result");
		result.setAttribute("children", JSON.stringify(children));
		return JSON.stringify(children);
		
	},
	getDashboardTabs: function() {
		var dashboardId = this.getParameter('sysparm_dashboard_id');
		var tabs = [];
		var grTabs = new GlideRecordSecure(this.PA_TABS);
		grTabs.addActiveQuery();
		grTabs.addQuery('dashboard', '=', dashboardId);
		grTabs.query();

		while (grTabs.next()) {
			var tab = {};
			var tabId = grTabs.getDisplayValue('sys_id');
			tab = {
				id: tabId,
				name: grTabs.getDisplayValue('tab.sys_name'),
				uuid: gs.generateGUID(),
				type:'tab',
				tabUniqueId:grTabs.getDisplayValue('tab.sys_id')
			};
			tabs.push(tab);
		}

		return tabs;
	},
	getDashboardBreakdownSource: function() {
		var dashboardId = this.getParameter('sysparm_dashboard_id');
		var breakdownSources = [];
		var grBreakdown = new GlideRecordSecure(this.PA_BREAKDOWN_SOURCE);
		grBreakdown.addActiveQuery();
		grBreakdown.addQuery('dashboard', '=', dashboardId);
		grBreakdown.query();

		while (grBreakdown.next()) {
			var breakdown = {};
			var breakdownId = grBreakdown.getDisplayValue('breakdown_source.sys_id');
			breakdown = {
				id: breakdownId,
				name: grBreakdown.getDisplayValue('breakdown_source.sys_name'),
				uuid: gs.generateGUID(),
				type:'breakdown_source'
			};
			if(typeof grBreakdown.getValue('publisher') === "string"){
				breakdown.children = [
					{
						name: grBreakdown.getDisplayValue('publisher.sys_name'),
						id: grBreakdown.getDisplayValue('publisher.sys_id'),
						uuid:gs.generateGUID(),
						type:'filter'
					}
				];
			}
			
			breakdownSources.push(breakdown);
		}
		return breakdownSources;
	},
	_getTabIdsForDashboard: function(dashboardId) {
		var tabIds = [];
		var dashboardGR = new GlideRecord("pa_dashboards");
		if(dashboardGR.get(dashboardId)) {
			var tabsGR = new GlideRecord("pa_m2m_dashboard_tabs");
			tabsGR.addQuery("dashboard", dashboardId);
			tabsGR.query();
			while(tabsGR.next()) {
				tabIds.push(tabsGR.getValue("sys_id"));
			}
		}
		return tabIds;
	},
	_getTabIdsForGroups: function(groupId) {
		var tabIds = [];
		var dashboardGroupGR = new GlideRecord("pa_dashboards_group");
		if(dashboardGroupGR.get(groupId)) {
			var dashboardGR = new GlideRecord("pa_dashboards");
			dashboardGR.addQuery("group", groupId);
			dashboardGR.query();
			while(dashboardGR.next()) {
				tabIds = tabIds.concat(this._getTabIdsForDashboard(dashboardGR.getValue("sys_id")));
			}
		}
		return tabIds;
	},
	_getTabIds: function(filterTable, filterTableId) {
		var tabIds = [];
		var dashboardGroupGR;
		var dashboardGR;
		var tabsGR;
		if(filterTable == "pa_dashboards_group")
			return this._getTabIdsForGroups(filterTableId);
		else if(filterTable == "pa_dashboards")
			return this._getTabIdsForDashboard(filterTableId);
		else
			return tabIds.push(filterTableId);
	},
	
	getWidgetListForaTab:function(){
		var tabId = this.getParameter('sysparm_tab_id');
		var widgets =  this._getWidgetsForaTab(tabId);
		var result = this.newItem("result");
		result.setAttribute("children", JSON.stringify(widgets));
		return JSON.stringify(widgets);
	},
	
	_getGridCanvasId: function(tab, tabId) {
		var sysPortalPageId = tab.getValue("page");
		var sysGridCanvasId = tab.getValue("canvas_page");
		if(sysGridCanvasId === null) {
			var canvasPage = new GlideRecord("sys_grid_canvas");
			canvasPage.addQuery("legacy_page", sysPortalPageId);
			canvasPage.query();
			if (canvasPage.next()) {
				sysGridCanvasId = canvasPage.getUniqueValue();
			} else {
				var layoutLoader = new SNC.LayoutLoader();
				layoutLoader.convertToCanvas(sysPortalPageId);
				tab.get(tabId);
				sysGridCanvasId = tab.getValue("canvas_page");
			}
		}
		return sysGridCanvasId;
	},
	_getWidgetFromPortal: function(portal) {
		var widget = {};
		var portalPreference = new GlideRecord("sys_portal_preferences");
		portalPreference.addQuery("portal_section", portal.getValue("sys_id"));
		portalPreference.query();
		while (portalPreference.next()) {
			var portalPreferenceName = portalPreference.getValue("name");
			if(portalPreferenceName === "sys_id")
				widget["id"] = portalPreference.getValue("value");
			if(portalPreferenceName === "renderer")
				widget["renderer"] = portalPreference.getValue("value");
			if(portalPreferenceName === "title")
				widget["name"] = portalPreference.getValue("value");
		}
		widget["type"] = "widget";
		widget["uuid"] = gs.generateGUID();
		return widget;
	},
	_getWidgetsForaTab: function(tabSysId) {
		var widgets = [];
		var dashboard = new GlideRecord("pa_m2m_dashboard_tabs");
		if(dashboard.get(tabSysId)) {
			var tabId = dashboard.getValue("tab");
			var tab = new GlideRecord("pa_tabs");
			if(tab.get(tabId)) {
				var sysGridCanvasId = this._getGridCanvasId(tab, tabId);
				var canvasPane = new GlideRecord("sys_grid_canvas_pane");
				canvasPane.addQuery("grid_canvas", sysGridCanvasId);
				canvasPane.query();
				while (canvasPane.next()) {
					var portal = new GlideRecord("sys_portal");
					portal.addQuery("sys_id", canvasPane.getValue("portal_widget"));
					portal.query();
					if (portal.next()) {
						widgets.push(this._getWidgetFromPortal(portal));
					}
				}
			}
		}
		return widgets;
	},

	_getWidgets: function(filterTable, filterTableId) {
		var self = this;
		var widgets = [];
		if(filterTableId && filterTableId !== "" && (filterTable == "pa_dashboards_group" || filterTable == "pa_dashboards" || filterTable == "pa_m2m_dashboard_tabs")) {
			var tabIds = self._getTabIds(filterTable, filterTableId);
			tabIds.forEach(function(tabId){
				widgets = widgets.concat(self._getWidgetsForaTab(tabId));
			});
		}
		return widgets;
	},
	/**
	 * Get Widget records form Filtered Table and Filter Table Id
	 * Parameters accepted:
	 * sysparm_filter_table -> pa_dashboards_group, pa_dashboards, pa_m2m_dashboard_tabs
	 * sysparm_filter_table_id
	**/
	getWidgetRecords: function(){
		var filterTable = this.getParameter("sysparm_filter_table");
		var filterTableId = this.getParameter("sysparm_filter_table_id");
		var result = this.newItem("result");
        result.setAttribute("widgets", JSON.stringify(this._getWidgets(filterTable, filterTableId)));
		return JSON.stringify(result);
	},
	/**
	 * Parameters accepted:
	 * sysparm_widget_id
	 * sysparm_renderer
	 * sysparm_record_type: indicator/indicator_source/breakdown/breakdown_source/indicator_jobs/script/report_source
	**/
	getWidgetDetails: function() {
		var self = this;
		var widgetId = self.getParameter("sysparm_widget_id");
		var renderer = self.getParameter("sysparm_renderer");
		var recordType = self.getParameter("sysparm_record_type");
		var recordTypeExist = recordType && recordType != "";
		if(!recordTypeExist)
			recordType = "";
		var widget = self._getWidgetChildren(widgetId, renderer, recordType);
		var result = self.newItem("result");
		if(recordTypeExist)
			result.setAttribute(recordType, JSON.stringify(self.getRecordsFromType(widget, recordType)));
		else
			result.setAttribute("widget", JSON.stringify(widget));
		return JSON.stringify(result);
	},
	/**
	 * Parameters accepted:
	 * sysparm_filter_table: pa_dashboards_group/pa_dashboards/pa_m2m_dashboard_tabs
	 * sysparm_filter_table_id: sys_id
	 * sysparm_record_type: indicator/indicator_source/breakdown/breakdown_source/indicator_jobs/script/report_source
	**/
	getWidgetsDetails: function() {
		var self = this;
		var filterTable = self.getParameter("sysparm_filter_table");
		var filterTableId = self.getParameter("sysparm_filter_table_id");
		var recordType = self.getParameter("sysparm_record_type");
		var recordTypeExist = recordType && recordType != "";
		if(!recordTypeExist)
			recordType = "";
		var widgets = self._getWidgets(filterTable, filterTableId);
		widgets.forEach(function(widget){
			widget.children = self._getWidgetChildren(widget.id, widget.renderer, recordType);
		});
		var result = self.newItem("result");
		if(recordTypeExist)
			result.setAttribute(recordType, JSON.stringify(self._getRecordsFromType(widgets, recordType)));
		else
			result.setAttribute("widgets", JSON.stringify(widgets));
		return JSON.stringify(result);
	},
	_getRecordsFromType: function (Objects, type) {
		var self = this;
	    var records = [];
	    Objects.forEach(function(obj){
			if(obj.children)
				records = records.concat(self._getRecordsFromType(obj.children, type));
			if(obj.type == type)
				records.push({
				  id: obj.id,
				  name: obj.name,
				  type: obj.type,
				  uuid: gs.generateGUID()	
				});
	    });
	    return records;
	},
	_getWidgetsDetailsForFilter: function(id) {
		var children = [];
		var filter = new GlideRecord("sys_ui_hp_publisher");
		if(filter.get(id)) {
			var record = {
				id: id,
				name: filter.getValue("name"),
				look_up_name: filter.getValue("look_up_name"),
				type: "interactive_filter",
				uuid:gs.generateGUID()
			};
			children = [record];
		}
		return children;
	},
	_getWidgetsDetailsForReport: function(id) {
		var children = [];
		var sysReport = new GlideRecord("sys_report");
		if(sysReport.get(id)) {
			var sysReportSourceR = new GlideRecord("sys_report_source");
			var reportSourceR = sysReport.getValue("report_source");
			var record = {
				id: id,
				name: sysReport.getValue("title"),
				type: "report",
				uuid:gs.generateGUID()
			};
			if(reportSourceR && sysReportSourceR.get(reportSourceR)) {
				record["children"] = [{
					id: reportSourceR,
					name: sysReportSourceR.getValue("display"),
					type: "report_source",
					uuid:gs.generateGUID(),
				}];
			}
			children = [record];
		}
		return children;
	},
	_getBreakDownDetails: function(paBreakdowns, breakdown, recordType) {	
		var subChildren = [];
		var paDimensions = new GlideRecord("pa_dimensions");
		var dimension = paBreakdowns.getValue("dimension");
		var record = {
				id: paBreakdowns.getValue("sys_id"),
				name: paBreakdowns.getValue("name"),
				type: "breakdown",
				uuid:gs.generateGUID()
			};
		if((recordType == "" || recordType == "breakdown_source") && dimension && paDimensions.get(dimension)) {
			record["children"] = [{
				id: dimension,
				name: paDimensions.getValue("name"),
				type: "breakdown_source",
				uuid:gs.generateGUID(),
			}];

		}
		var children = [record];
		return children;
	},
	_getIndicatorSourceDetails: function(paIndicator, recordType) {
		var children = [];
		var paCubes = new GlideRecord("pa_cubes");
		var cube = paIndicator.getValue("cube");
		if((recordType == "" || recordType == "indicator_source") && cube && paCubes.get(cube)) {
			var sysReportSource = new GlideRecord("sys_report_source");
			var reportSource = paCubes.getValue("report_source");
			var record = {
					id: cube,
					name: paCubes.getValue("name"),
					type: "indicator_source",
					uuid:gs.generateGUID(),
				};
			if(recordType == "" && reportSource && sysReportSource.get(reportSource))
				record["children"] = [{
						id: reportSource,
						name: sysReportSource.getValue("name"),
						type: "report_source",
						uuid: gs.generateGUID(),
					}];
			children = [record];
		}
		return children;
	},
	_getIndicatorScript: function(paIndicator, recordType) {
		var children = [];
		var paScripts = new GlideRecord("pa_scripts");
		var script = paIndicator.getValue("script");
		if(script && paScripts.get(script)) {
			children.push({
				id: script,
				name: paScripts.getValue("name"),
				type: "script",
				uuid:gs.generateGUID(),
			});
		}
		return children;
	},
	_getIndicatorJobs: function(indicator, recordType) {
		var children = [];
		if(recordType == "" || recordType == "indicator_jobs") {
			var sysAuto = new GlideRecord("sysauto");
			var paJobsIndicator = sysAuto.addJoinQuery("pa_job_indicators", "sys_id", "job");
			paJobsIndicator.addCondition("indicator", indicator);
			sysAuto.query();

			while (sysAuto.next()) {
				children.push({
					id: sysAuto.getValue("sys_id"),
					name: sysAuto.getValue("name"),
					type: "indicator_jobs",
					uuid:gs.generateGUID(),
				});
			}
		}
		return children;
	},
	_getIndicatorDetails: function(paIndicator, indicator, recordType) {
		var subChildren = [];
		subChildren = subChildren.concat(this._getIndicatorSourceDetails(paIndicator, recordType))
							.concat(this._getIndicatorScript(paIndicator, recordType))
							.concat(this._getIndicatorJobs(indicator, recordType));
		var record = {
				id: paIndicator.getValue("sys_id"),
				name: paIndicator.getValue("name"),
				type: "indicator",
				uuid:gs.generateGUID()
			};
		if(subChildren.length > 0)
			record["children"] =  subChildren;

		var children = [record];
		var type = paIndicator.getValue("type");
		if(type == 2) {
			var formula = paIndicator.getValue("formula");
			var indicatorList = formula.match(/[a-z0-9]{32}/g);
			for(var i = 0; i < indicatorList.length; i++) {
				if(indicatorList[i] && paIndicator.get(indicatorList[i]))
					children = children.concat(this._getIndicatorDetails(paIndicator, indicator, recordType));
			}
		}
		children = children.concat(this._getBreakdownFromIndicatorBrM2M(indicator, recordType));
		return children;
	},
	_getBreakdownFromIndicatorBrM2M: function(indicator, recordType) {
		var children = [];
		if(recordType == "" || recordType == "breakdown" || recordType == "breakdown_source") {
			var paBreakdowns = new GlideRecord("pa_breakdowns");
			var paIndicatorBreakdown = new GlideRecord("pa_indicator_breakdowns");
			paIndicatorBreakdown.addQuery("indicator", "=", indicator);
			paIndicatorBreakdown.query();
			while(paIndicatorBreakdown.next()) {
				var breakdown = paIndicatorBreakdown.getValue("breakdown");
				if(breakdown && paBreakdowns.get(breakdown))
					children = children.concat(this._getBreakDownDetails(paBreakdowns, breakdown, recordType));
			}
		}
		return children;
	},
	_getIndicatorFromM2M: function(id, recordType) {
		var children = [];
		var paIndicator = new GlideRecord("pa_indicators");
		var widgetIndicator = new GlideAggregate("pa_widget_indicators");
		widgetIndicator.addAggregate('COUNT', 'indicator');
		widgetIndicator.addQuery("widget", id);
		widgetIndicator.query();
		while(widgetIndicator.next()) {
			var indicator = widgetIndicator["indicator"];
			if(indicator && paIndicator.get(indicator))
				children = children.concat(this._getIndicatorDetails(paIndicator, indicator, recordType));
		}
		return children;
	},
	_getBreakdownFromM2M: function(id, recordType) {
		var children = [];
		var paBreakdowns = new GlideRecord("pa_breakdowns");
		var widgetIndicator = new GlideAggregate("pa_widget_indicators");
		widgetIndicator.addAggregate('COUNT', 'breakdown');
		widgetIndicator.addQuery("widget", id);
		widgetIndicator.query();
		while(widgetIndicator.next()) {
			var breakdown = widgetIndicator["breakdown"];
			if(breakdown && paBreakdowns.get(breakdown))
				children = children.concat(this._getBreakDownDetails(paBreakdowns, breakdown, recordType));
		}
		return children;
	},
	_getIndicatorsFromTag: function(paTag, tag, recordType) {
		var children = [];
		var paM2MIndicator = new GlideRecord("pa_m2m_indicator_tags");
		paM2MIndicator.addQuery("tag", "=", tag);
		paM2MIndicator.query();
		var paIndicator = new GlideRecord("pa_indicators");
		while(paM2MIndicator.next()) {
			var indicator = paM2MIndicator.getValue("indicator");
			if(indicator && paIndicator.get(indicator))
				children = children.concat(this._getIndicatorDetails(paIndicator, indicator, recordType));
		}
		return children;
	},
	_getWidgetChildren: function(id, renderer, recordType) {
		renderer = JSON.parse(JSON.stringify(renderer)); // Fix the renderer if passed as query param
		var children = [];
		var subChildren = [];
		switch (renderer) {
			case "com.snc.pa.ui.RenderPerformanceAnalytics": {
				var paWidgets = new GlideRecord("pa_widgets");
				if((recordType == "" || recordType != "report" || recordType != "interactive_filter") && paWidgets.get(id)) {
					var paIndicator = new GlideRecord("pa_indicators");
					var paTag = new GlideRecord("pa_tags");
					var paBreakdowns = new GlideRecord("pa_breakdowns");
					var indicator = paWidgets.getValue("indicator");
					var breakdown = paWidgets.getValue("breakdown");
					var breakdown2 = paWidgets.getValue("breakdown_level2");
					var tag = paWidgets.getValue("tag");
					
					if(indicator && paIndicator.get(indicator))
						children = children.concat(this._getIndicatorDetails(paIndicator, indicator, recordType));
					if(tag && paTag.get(tag))
						children = children.concat(this._getIndicatorsFromTag(paTag, tag, recordType));
					children = children.concat(this._getIndicatorFromM2M(id, recordType));
						
					if(recordType == "" || recordType == "breakdown" || recordType == "breakdown_source") {
						if(breakdown2 && paBreakdowns.get(breakdown2))
							children = children.concat(this._getBreakDownDetails(paBreakdowns, breakdown2, recordType));
						if(breakdown && paBreakdowns.get(breakdown))
							children = children.concat(this._getBreakDownDetails(paBreakdowns, breakdown, recordType));
						children = children.concat(this._getBreakdownFromM2M(id, recordType));
					}	
				}
				break;
			}
			case "com.glide.ui.portal.RenderDashboard": {
				var sysGauge = new GlideRecord("sys_gauge");
				if((recordType == "" || recordType == "report") && sysGauge.get(id)) {
					var report = sysGauge.getValue("report");
					children = children.concat(this._getWidgetsDetailsForReport(report));
				}
				break;
			}
			case "com.glide.ui.portal.RenderReport": {
				if((recordType == "" || recordType == "report"))
					children = children.concat(this._getWidgetsDetailsForReport(id));
				break;
			}
			case "com.glideapp.home.RenderHomepagePublishers": {
				if((recordType == "" || recordType == "interactive_filter"))
					children = children.concat(this._getWidgetsDetailsForFilter(id));
				break;
			}
			default: {

			}
		}
		return children;
	},
	_getGuidedSetUpPercentCompleted: function() {
		var percentCompleted = 0;
		var gr = new GlideRecordSecure('gsw_status_of_content');
		gr.query('content','8de556090b0212001e684ac3b6673ae7');
		gr.query();
		if(gr.next()) {
			percentCompleted = gr.getValue('progress');
		}
		return Math.floor(percentCompleted);
	},
	_getInactiveContentPackCount: function() {
		var inactiveCount = 0;
		var gr = new GlideAggregate('v_plugin');
		gr.addEncodedQuery('nameLIKEPerformance Analytics - Context Sensitive Analytics^ORnameLIKESecurity Incident Analytics^ORnameLIKEVulnerability Analytics^ORnameLIKEContent Pack^active=inactive');
		gr.addAggregate('COUNT');
		gr.query();
		if(gr.next()) {
			inactiveCount = gr.getAggregate('COUNT');
		}
		return inactiveCount;
		
	},
	_getDashboardGroupsCount: function() {
		var count = 0;
		var gr = new GlideRecordSecure('pa_dashboards_group');		
        gr.addActiveQuery();
		gr.query();
		while(gr.next()) {
			count += 1;
		}
		return count;
	},
	_getDashboardsCount: function() {
		var count = 0;
		var gr = new GlideRecordSecure('pa_dashboards');		
        gr.addActiveQuery();
		gr.query();
		while (gr.next()) {
			count += 1;
		}
		return count;
	},
	_getDiagnosticErrors: function() {
		var errorsCount = 0;
		var url = '/pa_diagnostic_execution_list.do?sysparm_query%3DORDERBYDESCexecution_date';
		var gr = new GlideRecord('pa_diagnostic_execution');
		gr.orderByDesc('execution_date');
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			errorsCount = gr.getValue('error_messages');
			url = '/pa_diagnostic_execution.do?sys_id=' + gr.getUniqueValue();
		}
		
		return {count: errorsCount, url: url};	
	},
	_getFailedJobsCount: function() {
		var errors = 0;
		var url = '/sysauto_pa_list.do?sysparm_query=run_type!%3Donce%5Erun_type!%3Don_demand%5Eactive%3Dtrue';
		var job = new GlideRecord('sysauto_pa');
		job.addEncodedQuery('run_type!=once^run_type!=on_demand^active=true');
		job.query();
		var ids = [];

		// for all non on demand jobs get the most recent job log
		while(job.next()) {
			var log = new GlideRecord('pa_job_logs');
			log.orderByDesc('completed');
			log.setLimit(1);
			log.addQuery('state', '!=', 'collecting');
			log.addQuery('job', job.getUniqueValue());
			log.query();
			if(log.next() && log.getValue('state') === 'collected_error') {
				errors++;
				ids.push(log.getValue('job'));
			}
		}
		
		if (ids.length > 0)
			url = '/sysauto_pa_list.do?sysparm_query=sys_idIN' + ids.join('%2C');
		
		return {count: errors, url: url};
	},
	getLandingPageStats: function() {
		var resp = {};
		var hasRole = gs.hasRole("admin") || gs.hasRole("pa_admin");
		resp.hasRole = hasRole;
		if(!hasRole)
			return JSON.stringify(resp);
		resp.guidedSetup = {};
		resp.guidedSetup.percentComplete = this._getGuidedSetUpPercentCompleted();
		resp.guidedSetup.inactiveContentPacks = parseInt(this._getInactiveContentPackCount());
		resp.manage = {};
		resp.manage.dashboardGroups = parseInt(this._getDashboardGroupsCount());
		resp.manage.dashboards = parseInt(this._getDashboardsCount());
		resp.troubleshoot = {};
		if (pm.isActive('com.snc.pa.diagnostics'))
			resp.troubleshoot.diagnosticErrors = this._getDiagnosticErrors();
		resp.troubleshoot.failedJobs = this._getFailedJobsCount();
        return JSON.stringify(resp);
	},
	type: 'PAAdminConsoleUtil'
});