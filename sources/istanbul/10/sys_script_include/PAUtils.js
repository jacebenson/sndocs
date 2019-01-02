var PAUtils = Class.create();
PAUtils.prototype = {
    initialize: function() {
    },

    getCollectionIDFromURI: function() {
        var collectionID = null;
        var url = gs.action.getGlideURI().toString();
        var args = url.split("&");
        for (var i = 0; i < args.length; i++) {
            var parts = args[i].split("=");
            if (parts[0] == "sysparm_collectionID") {
                collectionID = parts[1];
                break;
            }
        }
        return collectionID;
    },

    ref_qual_managing_indicator: function(cur_sys_id, type) {
        var gr = new GlideRecord('pa_managed_sources_indicators');
        gr.query();
        var indicator_sysids = [];
        while (gr.next())
            indicator_sysids.push(gr.getValue('indicator'));
        if (indicator_sysids.length === 0)
            return 'sys_id=0';

        return 'sys_idIN' + indicator_sysids.toString() + '^sys_id!=' + cur_sys_id + '^type=' + type + '^managing_indicatorISEMPTY^EQ';
    },

    ref_qual_managed_breakdown: function(managing_indicator) {
        var gr = new GlideRecord('pa_managed_sources_indicators');
        if (managing_indicator)
            gr.addQuery('indicator', managing_indicator);
        gr.query();
        var managed_source_sysids = [];
        while (gr.next())
            managed_source_sysids.push(gr.getValue('managed_source'));
        if (managed_source_sysids.length === 0)
            return 'sys_id=0';

        var breakdown_sysids = [];
        gr = new GlideRecord('pa_managed_sources');
        gr.addQuery('sys_id', 'IN', managed_source_sysids);
        gr.query();
        while (gr.next())
            breakdown_sysids.push(gr.getValue('breakdown'));
        if (breakdown_sysids.length === 0)
            return 'sys_id=0';

        return 'sys_idIN' + breakdown_sysids.toString();
    },

    ref_qual_indicator_breakdown: function(level, followed) {
        if (!level) {
            level = 1;
        }
        var ids = [];
        var indicator = null;
        var job_indicator = null;
        if (current == null) {
            var url = gs.action.getGlideURI().toString();
            var args = url.split("&");
            for (var i = 0; i < args.length; i++) {
                var parts = args[i].split("=");
                if (parts[0] == "sysparm_collectionID") {
                    job_indicator = parts[1];
                    break;
                }
            }
            if (job_indicator != null) {
                var gr = new GlideRecord('pa_job_indicators');
                gr.addQuery('sys_id', job_indicator);
                gr.query();
                if (gr.next())
                    indicator = gr.getValue("indicator");
            }
        } else if (!current.indicator.nil()) {
            indicator = current.indicator;
        }

        if (indicator != null) {
            var has_breakdown_matrix = false;
            var formula_indicator = false;
            var exclusions = {};

            var scopedByBreakdown;
            if (current == null) {
                scopedByBreakdown = true;
            } else {
                if (level === 1) {
                    scopedByBreakdown = current.breakdown_level2;
                } else if (level === 2) {
                    scopedByBreakdown = current.breakdown;
                }
            }

            if (followed)
                scopedByBreakdown = current.breakdown;

            if (scopedByBreakdown) {
                var gr = new GlideRecord('pa_indicators');
                gr.addQuery('sys_id', indicator);
                gr.query();
                gr.next();
                has_breakdown_matrix = (gr.getValue('collect_breakdown_matrix') == true);
                formula_indicator = (gr.getValue('type') == 2);
                if (has_breakdown_matrix) {
                    gr = new GlideRecord('pa_indicator_breakdown_excl');
                    gr.addQuery('indicator', indicator);
                    gr.query();
                    while (gr.next()) {
                        exclusions[gr.breakdown + ':' + gr.breakdown_level2] = true;
                        exclusions[gr.breakdown_level2 + ':' + gr.breakdown] = true;
                    }
                }
            }

            if (!followed && scopedByBreakdown && !has_breakdown_matrix && !formula_indicator) {
                ids.push("-1");
            } else {
                var gr = new GlideRecord('pa_indicator_breakdowns');
                gr.addQuery('indicator', indicator);
                gr.addActiveQuery();
                gr.query();
                while (gr.next()) {
                    var sys_id = gr.breakdown.sys_id;

                    if (scopedByBreakdown) {
                        if (scopedByBreakdown == sys_id) {
                            continue;
                        }
                        if (exclusions[scopedByBreakdown + ':' + sys_id]) {
                            continue;
                        }
                    }

                    ids.push(sys_id);
                }
            }
        }
        return 'sys_idIN' + ids.toString();
    },

    ref_qual_indicator_followed_breakdown: function() {
        if (current.type == "list")
            return '';
        if (current.type == "time" && current.visualization == "relative" && current.tag != "")
            return '';
        return this.ref_qual_indicator_breakdown(1, true);
    },

    ref_qual_indicator_followed_breakdown_relation: function() {
        var ids = [];
        if (current.type == 'breakdown' && current.visualization == 'scorecard' && !current.breakdown.nil()) {
            var gr = new GlideRecord('pa_breakdown_relations');
            gr.addQuery('related_breakdown', current.breakdown);
            gr.orderBy('order');
            gr.query();
            while (gr.next())
                ids.push(gr.getValue('sys_id'));
        }
        if (ids.length === 0)
            ids.push('-1');
        return 'sys_idIN' + ids.toString();
    },

    ref_qual_script: function(tableElement) {
        return 'tableIN' + this.getTableAncestors(tableElement).toString();
    },

    // input: indicator
    // output: allowed breakdowns
    // - you may link any breakdown to the given indicator if it is
    //   a manual indicator or a formula indicator
    // - you may link any manual breakdown to an automated indicator
    // - you may link an automated breakdown to an automated indicator
    //   if it has a mapping where its facts table is equal to the
    //   facts table (or any of its parent tables) of the indicator.
    ref_qual_m2m_indicator_breakdown: function() {
        var indicator = this.getCollectionIDFromURI(),
            tableElement = null;
        if (indicator != null) {
            var gr = new GlideRecord("pa_indicators");
            gr.addQuery('sys_id', indicator);
            gr.query();
            if (gr.next()) {
                var cube = new GlideRecord("pa_cubes");
                cube.addQuery('sys_id', gr.getValue("cube"));
                cube.query();
                if (cube.next()) {
                    tableElement = cube.getValue("facts_table");
                }
            }
        }

        if (!tableElement)
            return '';

        var ancestors = this.getTableAncestors(tableElement);
        var mapping = new GlideRecord('pa_breakdown_mappings');
        mapping.addQuery('facts_table', ancestors);
        mapping.query();

        var breakdown_ids = [];
        while (mapping.next()) {
            var breakdown = '' + mapping.breakdown;
            var found = false;
            for (var i = 0; i < breakdown_ids.length; i++) {
                if (breakdown_ids[i] === breakdown) {
                    found = true;
                    break;
                }
            }
            if (!found)
                breakdown_ids.push(breakdown);
        }
        var ref_qual = 'type=2';
        if (breakdown_ids.length > 0)
            ref_qual = ref_qual + '^ORsys_idIN' + breakdown_ids.toString();
        return ref_qual;
    },

    // input: breakdown
    // output: allowed indicators
    // - you may link a breakdown to any indicator that shares
    //   the same facts table (or one of its descendants) as any
    //   facts table in the breakdown mappings of the breakdown
    ref_qual_m2m_breakdown_indicator: function() {
        var breakdown = this.getCollectionIDFromURI(),
            tableElements = [];

        if (breakdown != null) {
            var gr = new GlideRecord("pa_breakdowns");
            gr.addQuery('sys_id', breakdown);
            gr.query();
            if (gr.next() && gr.getValue("type") == '1') {
                var mapping = new GlideRecord('pa_breakdown_mappings');
                mapping.addQuery('breakdown', breakdown);
                mapping.query();
                while (mapping.next()) {
                    var tables = this.getTableDecendants(mapping.getValue("facts_table"));
                    for (var i = 0; i < tables.length; i++) {
                        var found = false;
                        for (var j = 0; j < tableElements.length; j++) {
                            if (tableElements[j] === tables[i])
                                found = true;
                        }
                        if (!found)
                            tableElements.push(tables[i]);
                    }
                }
            }
        }

        if (tableElements.length === 0)
            return '';

        return 'cubeISEMPTY^ORcube.facts_tableIN' + tableElements.toString();
    },

    ref_qual_default_indicator: function() {
       var ids = [];
        var gr = new GlideRecord('pa_widget_indicators');
        gr.addQuery('widget', current.sys_id);
       gr.addNullQuery('widget_indicator');
        gr.query();
       while (gr.next()) {
         ids.push(String(gr.sys_id));
       }
        return 'sys_idIN' + ids.toString();
    },

    ref_qual_breakdown_source_dashboard: function(dashboardSysId) {
        var gr = new GlideRecord('pa_m2m_dashboard_sources');
		gr.addQuery('dashboard', dashboardSysId);
        gr.query();
        var breakdown_source_sysids = [];
        while (gr.next())
            breakdown_source_sysids.push(gr.getValue('breakdown_source'));
        if (breakdown_source_sysids.length === 0)
            return 'sys_id=0';

        return 'sys_idIN' + breakdown_source_sysids.toString() + '^EQ';
    },

     ref_qual_tabs_dashboard: function(dashboardSysId) {
        var gr = new GlideRecord('pa_m2m_dashboard_tabs');
		gr.addQuery('dashboard', dashboardSysId);
        gr.query();
        var tabs_sysIds = [];
        while (gr.next())
            tabs_sysIds.push(gr.getValue('tab'));
        if (tabs_sysIds.length === 0)
            return 'sys_id=0';

        return 'sys_idIN' + tabs_sysIds.toString() + '^EQ';
    },

    getTableAncestors: function(tableName) {
        var tables = [];
        var ar = GlideDBObjectManager.get().getTables(tableName);
        for (var i = 0; i < ar.size(); i++) {
            tables[i] = ar.get(i);
        }
        return tables;
    },

    getTableDecendants: function(tableName) {
        var tables = [];
        var ar = GlideDBObjectManager.get().getAllExtensions(tableName);
        for (var i = 0; i < ar.size(); i++) {
            tables[i] = ar.get(i);
        }
        return tables;
    },

    hasBreakdownMapping: function(sys_id, breakdown, facts_table) {
        var mapping = new GlideRecord('pa_breakdown_mappings');
        if (sys_id && sys_id != '')
            mapping.addQuery('sys_id', '!=', sys_id);
        mapping.addQuery('breakdown', breakdown);
        mapping.addQuery('facts_table', facts_table);
        mapping.query();
        return mapping.next() ? true : false;
    },

    hasRestrictedOperatorsInConditions: function (conditions) {
        return this.hasKeywordsInConditions(conditions) ||
            this.hasGTFieldInConditions(conditions) ||
            this.hasGTOrEqualInCondition(conditions) ||
			this.hasINCondition(conditions) ||
			this.hasNOTINCondition(conditions);
    },

    hasKeywordsInConditions: function(conditions) {
        return (conditions.indexOf("123TEXTQUERY321") > -1);
    },

    hasGTFieldInConditions: function(conditions) {
        var regex = /(GT|LT)_FIELD/;
        return regex.test(conditions);
    },

    hasGTOrEqualInCondition: function(conditions) {
        var regex = /(GT|LT)_OR_EQUALS_FIELD/;
        return regex.test(conditions);
    },

	hasINCondition: function(conditions) {
		var regex = /[a-z0-9_]+IN[a-z0-9_]+/;
		return regex.test(conditions);
	},

	hasNOTINCondition: function(conditions) {
		var regex = /[a-z0-9_]+NOT IN[a-z0-9_]+/;
		return regex.test(conditions);
	},

    getContributors: function(){
        var contributors = [];
        var userRoles = new GlideRecord('sys_user_has_role');
        userRoles.addQuery('role.name', 'pa_contributor');
        userRoles.query();

        while(userRoles.next()){
            contributors.push(userRoles.getValue('user'));
        }

        return 'sys_idIN' + contributors.toString();
    },

    getAvailableAggregates: function() {
        return PAIndicator.getAvailableAggregates(current.indicator);
    },

    ref_qual_element_filters: function() {
        return PABreakdown.getElementFiltersSysIds(current.breakdown);
    },

    ref_qual_pivot_element_filters: function() {
        return PABreakdown.getElementFiltersSysIds(current.pivot_breakdown);
    },

    // DEPRECATED: use new PAUtils().getSnapshotIDs()
    getSnapshotSysIDs: function(indicator, period, breakdown, element, breakdown_level2, element_level2, aggregate) {
        return PASnapshot.getSysIDs(indicator, period, breakdown, element, breakdown_level2, element_level2, aggregate);
    },

    getSnapshotIDs: function(uuidScope, period) {
        return PASnapshot.getIDs(uuidScope, period);
    },

    getCompareSnapshotIDs: function(uuidScope, period1, period2, type) {
        return PASnapshot.getCompareIDs(uuidScope, period1, period2, type);
    },

    _getIndicator: function(){
        var indicator = null;
        var job_indicator = null;
        if (current == null) {
            var url = gs.action.getGlideURI().toString();
            var args = url.split("&");
            for (var i=0; i<args.length; i++) {
                var parts = args[i].split("=");
                if (parts[0] == "sysparm_collectionID") {
                    job_indicator = parts[1];
                    break;
                }
            }
            if (job_indicator != null) {
                var gr = new GlideRecord('pa_job_indicators');
                gr.addQuery('sys_id', job_indicator);
                gr.query();
                if (gr.next())
                    indicator = gr.getValue("indicator");
            }
        } else if (!current.indicator.nil()) {
            indicator = current.indicator;
        }
        return indicator;
    },
    //Reference qualifier for all the breakdowns of an indicator,
    //ignores matrix/levels/exclusions
    ref_qual_indicator_breakdown_all: function() {
        gs.log("ref_qual_indicator_breakdown_all");
        var ids = [];
        var indicator = this._getIndicator();
        if (indicator !== null) {
            gr = new GlideRecord('pa_indicator_breakdowns');
            gr.addQuery('indicator', indicator);
            gr.addActiveQuery();
            gr.query();
            while (gr.next()) {
                ids.push(gr.breakdown.sys_id);
            }
        }
        return 'sys_idIN' + ids.toString();
    },

    getParamFromGlideURI: function(param) {
        var transaction = GlideTransaction.get();
        if (transaction && transaction.getRequest()) {
            var url = gs.action.getGlideURI().toString();
            var args = url.split("&");
            for (var i = 0; i < args.length; i++) {
                var parts = args[i].split("=");
                if (parts[0] == param)
                    return parts[1];
            }
        }
        return "undefined";
    },

    usedInFormulaIndicators: function(indicator_sys_id) {
        var formulas = new GlideRecord('pa_indicators');
        formulas.addQuery("type", "2"); // formula indicators only
        formulas.query();
        while (formulas.next()) {
            var formula = new SNC.PAFormula(formulas.getValue('formula'));
            if (formula.isValid() == true && formula.contains(current.sys_id)) {
                return formulas.getValue('name');
            }
        }
        return false;
    },

    type: 'PAUtils'
};