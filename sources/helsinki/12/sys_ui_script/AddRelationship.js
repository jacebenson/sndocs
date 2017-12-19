var AddRelationship = Class.create();

AddRelationship.prototype = {
	
	initialize: function(item_id, changeset_id, propose_change) {
		this.changeset_id = changeset_id;
		this.propose_change = propose_change;
		this.is_proposed_save = (this.changeset_id && (this.propose_change == 'true'));
		this.item_id = item_id;
		this.select = gel('available_select');
		this.slush = gel('relationship_slushbucket');
		this.ok_button = gel('ok_button');
		this.apply_button = gel('apply_button');
		this.cancel_button = gel('cancel_button');
		this.loading = gel('loading_span');
		this.hide_ci = gel('hide_ci_relationships');
		this.hide_user = gel('hide_user_relationships');
		this.hide_group = gel('hide_group_relationships');
		this.show_all = gel('show_all_relationships');
		this.no_rel_possible = gel('no_rel_possible');
		this.slushMode = 'cmdb_ci';
		this.madeChanges = false;
		this.dirty = false;
		this.selectedIndex = 0;
		this.NAVIGATE_AWAY_MESSAGE = new GwtMessage().getMessage("Press OK to discard your changes. Press Cancel to stay here.");
		this.NON_CI_PROPOSED_REL_MESSAGE = "Cannot Propose Changes for User or Group Relationships";
		this.filter_td = gel('filter_td');
		this.filter_cmdb_ci = gel('filteron.cmdb_ci');
		this.filter_sys_user = gel('filteron.sys_user');
		this.filter_sys_user_group = gel('filteron.sys_user_group');
		this.left_select = gel('select_0');
	},
	
	init: function() {
		this.loadSelect();
		this.select.onchange = this._relationShipSelected.bindAsEventListener(this);
		if (this.apply_button)
			this.apply_button.onclick = this._saveRelationships.bindAsEventListener(this);
		if (this.ok_button)
			this.ok_button.onclick = this._saveRelationshipsAndExit.bindAsEventListener(this);
		if (this.cancel_button)
			this.cancel_button.onclick = this._close.bindAsEventListener(this);
		this.hide_ci.onclick = this._applySelectFilter.bindAsEventListener(this);
		this.hide_user.onclick = this._applySelectFilter.bindAsEventListener(this);
		this.hide_group.onclick = this._applySelectFilter.bindAsEventListener(this);
		if (this.show_all)
			this.show_all.onclick = this._applySelectFilter.bindAsEventListener(this);
		this.filter_cmdb_ci.onchange = this._applyQuickFilter.bindAsEventListener(this);
		this.filter_sys_user.onchange = this._applyQuickFilter.bindAsEventListener(this);
		this.filter_sys_user_group.onchange = this._applyQuickFilter.bindAsEventListener(this);
	},
	
	destroy: function() {
		this.select = null;
		this.slush = null;
		this.ok_button = null;
		this.apply_button = null;
		this.cancel_button = null;
		this.loading = null;
		this.show_ci = null;
		this.show_user = null;
		this.show_group = null;
		this.show_all = null;
		this.no_rel_possible = null;
		this.original = null;
		
		this.filter_td = null;
		this.filter_cmdb_ci = null;
		this.filter_sys_user = null;
		this.filter_sys_user_group = null;
		this.left_select = null;
	},
	
	_applySelectFilter: function(e) {
		var ci = !this.hide_ci.checked;
		var user = !this.hide_user.checked;
		var group = !this.hide_group.checked;
		var all = false;
		if (this.show_all)
			all = this.show_all.checked;
		this.select.options.length = 0;
		for (var i = 0; i < this.original.length; i++) {
			var o = this.original[i];
			var add = false;
			if (o.value.indexOf(':sys_user:') >= 0)
				add = user;
			else if (o.value.indexOf(':sys_user_group:') >= 0)
				add = group;
			else
				add = ci;
			
			if (add)
				add = all || (o.getAttribute('gsft_suggested') == 'true');
			
			if (!add)
				continue;
			
			var oNew = addOption(this.select, o.value, o.text, false);
			oNew.setAttribute('gsft_label', o.getAttribute('gsft_label'));
		}
		
		this._selectFirst();
	},
	
	_applyQuickFilter: function(e) {
		var filter = this._quickFilter();
		
		var oldSQL = g_filter.gsft_SQL;
		if (!oldSQL)
			oldSQL = '';
		
		var set_sql = oldSQL + '^' + filter;
		this._setFilterAndResize(set_sql, oldSQL);
	},
	
	_quickFilter: function() {
		var filter = '';
		if (this.slushMode == 'cmdb_ci')
			filter = this.filter_cmdb_ci.value;
		else if (this.slushMode == 'sys_user')
			filter = this.filter_sys_user.value;
		else if (this.slushMode == 'sys_user_group')
			filter = this.filter_sys_user_group.value;
		
		return filter;
	},
	
	_selectFirst: function() {
		if (this.select.options.length == 0) {
			this.slush.style.display = 'none';
			this.no_rel_possible.style.display = '';
		} else {
			this.slush.style.display = '';
			this.no_rel_possible.style.display = 'none';
			this.select.options[0].selected = true;
			this._relationShipSelected();
		}
	},
	
	_setLabel: function() {
		var type = 'CIs';
		if (this.slushMode == 'sys_user')
			type = 'Users';
		else if (this.slushMode == 'sys_user_group')
			type = 'Groups';
		var label = $$('[for=select_1]')[0];
		var name = gel('item_name').value;
		label.innerHTML = name + ' ' + this.select[this.select.selectedIndex].getAttribute('gsft_label') + ' these ' + type;
		var label2 = $$('[for=select_0]')[0];
		label2.innerHTML = 'Available ' + type;
	},
	
	loadSelect: function() {
		var ajax = new GlideAjax("AddRelationshipAjax");
		ajax.addParam("sysparm_type", "getRelationships");
		ajax.addParam("sysparm_value", this.item_id);
		ajax.getXML(this.getRelationshipsResponse.bind(this));
	},
	
	_saveRelationshipsAndExit: function(e) {
		if (!this.dirty) {
			this._close(e);
			return;
		}
		
		this.madeChanges = true;
		var ajax;
		if (this.is_proposed_save) {
			if (!this._isNotCIRelationship(this.select.value)) {
				ajax = new GlideAjax("AddRelationshipAjax");
				ajax.addParam("sysparm_type", "save_proposed_changes");
				ajax.addParam("sysparm_changeset", this.changeset_id);
				ajax.addParam("sysparm_name", this.item_id);
				ajax.addParam("sysparm_value", this.select.value);
				ajax.addParam("sysparm_chars", this._serializeSelect());
				//PRB631393
				ajax.setWantSessionMessages(false);
				ajax.getXML(this._close.bind(this));
			}
		} else {
			ajax = new GlideAjax("AddRelationshipAjax");
			ajax.addParam("sysparm_type", "save");
			ajax.addParam("sysparm_name", this.item_id);
			ajax.addParam("sysparm_value", this.select.value);
			ajax.addParam("sysparm_chars", this._serializeSelect());
			//PRB631393
			ajax.setWantSessionMessages(false);
			ajax.getXML(this._close.bind(this));
		}
	},
	
	_isNotCIRelationship: function(relationshipId) {
		var relSplit = relationshipId.split(':');
		return (relSplit.length == 3);
	},
	
	_setApply: function() {
		if (this.apply_button) {
			this.apply_button.disabled = !this.dirty;
			
			if (this.apply_button.disabled)
				addClassName(this.apply_button, 'disabled');
			else
				removeClassName(this.apply_button, 'disabled');
			
		}
	},
	
	_saveRelationships: function(e) {
		if (!this.dirty)
			return;
		
		this.madeChanges = true;
		var ajax;
		if (this.is_proposed_save) {
			if (!this._isNotCIRelationship(this.select.value)) {
				ajax = new GlideAjax("AddRelationshipAjax");
				ajax.addParam("sysparm_type", "save_proposed_changes");
				ajax.addParam("sysparm_changeset", this.changeset_id);
				ajax.addParam("sysparm_name", this.item_id);
				ajax.addParam("sysparm_value", this.select.value);
				ajax.addParam("sysparm_chars", this._serializeSelect());
				//PRB631393
				ajax.setWantSessionMessages(false);
				ajax.getXML(this._saveRelationshipsResponse.bind(this));
			}
		} else {
			ajax = new GlideAjax("AddRelationshipAjax");
			ajax.addParam("sysparm_type", "save");
			ajax.addParam("sysparm_name", this.item_id);
			ajax.addParam("sysparm_value", this.select.value);
			ajax.addParam("sysparm_chars", this._serializeSelect());
			//PRB631393
			ajax.setWantSessionMessages(false);
			ajax.getXML(this._saveRelationshipsResponse.bind(this));
		}
	},
	
	_close: function(e) {
		var dlg = document.getElementById("FormDialog");
		if (dlg)
			dlg.gWindow.destroy();
		else
			history.go(-1);
	},
	
	_saveRelationshipsResponse: function(e) {
		var responseText = (this.is_proposed_save) ? 'Saved Proposed Relationships' : 'Relationships saved';
		
		this._showMessage(new GwtMessage().getMessage(responseText));
		this._asLoaded = new Array();
		var options = gel('select_1').options;
		for (var i = 0; i < options.length; i++) {
			var opt = options[i];
			var v = opt.value;
			this._asLoaded.push(v);
		}
		
		this.dirty = false;
		this.madeChanges = true;
		this._setApply();
	},
	
	_serializeSelect: function() {
		var options = gel('select_1').options;
		var answer = '';
		for (var i = 0; i < options.length; i++) {
			var opt = options[i];
			var v = opt.value;
			if (i > 0)
				answer += ',';
			answer += v;
		}
		return answer;
	},
	
	getRelationshipsResponse: function(response) {
		var xml = response.responseXML;
		var e = xml.documentElement;
		var items = xml.getElementsByTagName("item");
		if (items.length == 0)
			return;
		
		var select = this.select;
		if (!select)
			return;
		
		this.original = new Array();
		
		// Remove any existing options
		select.options.length = 0;
		var item_name = gel('item_name').value;
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var v = item.getAttribute('value');
			var label = item.getAttribute('label');
			label = '[' + item_name + '] ' + label + ' ...';
			var suggested = item.getAttribute('suggested');
			
			var o = addOption(select, v, label, false);
			o.setAttribute('gsft_label', item.getAttribute('label'));
			o.setAttribute('gsft_suggested', suggested);
			this.original.push(o);
			if (suggested == 'false')
				select.options.length = select.options.length - 1;
		}
		
		this._selectFirst();
	},
	
	_relationShipSelected: function(e) {
		if (this.dirty) {
			var ok = confirm(this.NAVIGATE_AWAY_MESSAGE);
			if (!ok) {
				this.select.selectedIndex = this.selectedIndex;
				return;
			}
		}
		
		this.left_select.options.length = 0;
		var v = this.select.value;
		var visible = true;
		if (v == '' || v == 'loading')
			visible = false;
		
		if (visible) {
			this._showLoading();
			this._transformSlush();
			this._loadRelationships(e);
			this._showFilters();
			this.selectedIndex = this.select.selectedIndex;
		} else
		this.slush.style.display = 'none';
	},
	
	_showFilters: function() {
		var cmdb_ci = this.slushMode == 'cmdb_ci';
		var sys_user_group = this.slushMode == 'sys_user_group';
		var sys_user = this.slushMode == 'sys_user';
		
		cmdb_ci ? cmdb_ci = '' : cmdb_ci = 'none';
		sys_user ? sys_user = '' : sys_user = 'none';
		sys_user_group ? sys_user_group = '' : sys_user_group = 'none';
		
		this.filter_cmdb_ci.style.display = cmdb_ci;
		this.filter_sys_user.style.display = sys_user;
		this.filter_sys_user_group.style.display = sys_user_group;
		
		this.filter_td.style.display = ''
	},
	
	_showLoading: function() {
		this.loading.style.display = '';
		this.slush.style.display = 'none';
		this.slush.style.visibility = '';
	},
	
	_hideLoading: function() {
		this.loading.style.display = 'none';
		this.slush.style.display = '';
		this.slush.style.visibility = '';
	},
	
	_transformSlush: function() {
		var x = this.select.value.split(':');
		var mode = 'cmdb_ci';
		if (x.length == 3)
			mode = x[1];
		
		if (this.slushMode == mode)
			return; // we're already set
		
		this.slushMode = mode;
		g_filter = new GlideFilter(mode);
		
		_getMTOMRelatedTable = new Function("return '" + mode + ".1'");
		
		var magic_label = gel(mode + '.1');
		if (magic_label)
			return;
		
		magic_label = document.createElement("label");
		magic_label.type = "hidden";
		magic_label.id = mode + ".1";
		magic_label.style.display = "none";
		
		var om = gel('cmdb_ci.1');
		om.parentNode.appendChild(magic_label);
	},
	
	_loadRelationships: function(e) {
		var ajax = new GlideAjax("AddRelationshipAjax");
		ajax.addParam("sysparm_type", "getExisting");
		ajax.addParam("sysparm_name", this.item_id);
		ajax.addParam("sysparm_value", this.select.value);
		ajax.getXML(this._getExistingResponse.bind(this));
	},
	
	_getExistingResponse: function(response) {
		var xml = response.responseXML;
		var e = xml.documentElement;
		var select = gel('select_1');
		if (!select)
			return;
		
		this._loading = true;
		// Remove any existing options
		select.options.length = 0;
		this._asLoaded = new Array();
		var items = xml.getElementsByTagName("item");
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			this._asLoaded.push(item.getAttribute('value'));
			addOption(select, item.getAttribute('value'), item.getAttribute('label'), false);
		}
		
		var items = xml.getElementsByTagName('suggested_query');
		var sql = '';
		if (items.length == 1)
			sql = items[0].getAttribute('value');
		
		var set_sql = this._mergeSQL(sql, g_filter);
		this._setFilterAndResize(set_sql, sql);
	},
	
	_setFilterAndResize: function(set_sql, sql) {
		g_filter.reset();
		g_filter.setQuery(set_sql);
		g_filter.gsft_SQL = sql;
		
		// resize ourselves to account
		// for the new query
		var dlg = document.getElementById("FormDialog");
		
		if (dlg)
			dlg.gWindow._resizeDialog();
		
		acRequest(null);
		
		this._loading = false;
		this.dirty = false;
		this._setLabel();
		this._setApply();
		this._hideLoading();
		this.slush.style.display = '';
	},
	
	_mergeSQL: function(newSQL, filter) {
		var oldSQL = g_filter.gsft_SQL;
		if (!oldSQL || oldSQL == '^')
			oldSQL = '';
		
		var currentSQL = getFilter(); // see ac.js
		if (currentSQL)
			currentSQL = currentSQL.substring(0, currentSQL.length - 3); // strip the trailing ^EQ
		
		if (currentSQL.indexOf(oldSQL) < 0)
			return currentSQL;
		
		var filter = this._quickFilter();
		if (filter)
			filter = filter.substring(0, filter.length - 3); // strip the trailing ^EQ
		
		if (oldSQL == '')
			return currentSQL + '^' + newSQL + '^' + filter;
		
		var l = currentSQL.indexOf(oldSQL);
		var answer = currentSQL.substring(0, l); // quite possibly 0 characters
		answer += newSQL;
		answer += currentSQL.substring(l + oldSQL.length);
		if (answer.indexOf(filter) == -1)
			answer += '^' + filter;
		
		return answer;
	},
	
	selChange: function() {
		if (this._loading)
			return;
		
		var select = gel('select_1');
		if (!select)
			return;
		
		if (!this._asLoaded)
			return;
		
		var newRel = new Array();
		var missingRel = this._asLoaded.slice(); // clone our old array
		
		var options = select.options;
		for (var i = 0; i < options.length; i++) {
			var opt = options[i];
			var v = opt.value;
			if (v == '')
				continue;
			
			var match = false;
			for (var j = 0; j < missingRel.length; j++) {
				if (missingRel[j] != v)
					continue;
				
				match = true;
				missingRel.splice(j, 1);
			}
			if (!match)
				newRel.push(v);
		}
		
		var isProposedNonCIRelationship = (this._isNotCIRelationship(this.select.value) && this.is_proposed_save);
		if (isProposedNonCIRelationship && this.ok_button) {
			// Disable Ok button
			this.ok_button.disabled = true;
			addClassName(this.ok_button, 'disabled');
		} else if (this.ok_button) {
			// Enable Ok button
			this.ok_button.disabled = false;
			removeClassName(this.ok_button, 'disabled');
		}
		
		var msg = '';
		var gwt = new GwtMessage();
		if (newRel.length == 0 && missingRel.length == 0) {
			msg = (isProposedNonCIRelationship) ? gwt.getMessage(this.NON_CI_PROPOSED_REL_MESSAGE) : '';
			this._showMessage(msg);
			this.dirty = false;
			return;
		}
		
		this.dirty = true;
		
		if (newRel.length > 0) {
			if (missingRel.length > 0)
				msg = formatMessage(gwt.getMessage('Pending addition of {0} new relationships and removal {1} old ones'), newRel.length, missingRel.length);
			else
				msg = formatMessage(gwt.getMessage('Pending addition of {0} new relationships'), newRel.length);
		} else
		msg = formatMessage(gwt.getMessage('Pending removal of {0} old relationships'), missingRel.length);
		
		if (isProposedNonCIRelationship) {
			this.dirty = false;
			msg = gwt.getMessage(this.NON_CI_PROPOSED_REL_MESSAGE);
		}
		
		this._showMessage(msg);
		this._setApply();
		
	},
	
	_showMessage: function(msg) {
		var rel_msg = gel('rel_changed');
		if (!msg) {
			rel_msg.style.visibility = 'hidden';
		} else {
			rel_msg.innerHTML = msg;
			rel_msg.style.visibility = '';
		}
	}
}