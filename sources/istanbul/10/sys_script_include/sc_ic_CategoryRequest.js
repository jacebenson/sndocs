var sc_ic_CategoryRequest = Class.create();
sc_ic_CategoryRequest.prototype = Object.extendsObject(sc_ic_Base,{
	initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);

		this.fieldsToCopy = {"description": true, "sc_catalog": true, "parent": true};
	},
	
	activate: function() {
		var catGr = new GlideRecord(sc_.CATEGORY);
		if (catGr.get(this._gr[sc_.CATEGORY])) {
			sc_Factory.wrap(catGr).activate();
			this._gs.addInfoMessage("Category \"" + catGr.getDisplayValue() + "\" has been activated");
		}
		else
			this._gs.addErrorMessage("Category \"" + this._gr[sc_.TITLE] + "\" has not been activated");
		this._gr.active = true;
		
		this.redirect();
		this._gr.update();
	},
	
	deactivate: function() {
		var catGr = new GlideRecord(sc_.CATEGORY);
		if (catGr.get(this._gr[sc_.CATEGORY])) {
			sc_Factory.wrap(catGr).deactivate();
			this._gs.addInfoMessage("Category \"" + catGr.getDisplayValue() + "\" has been deactivated");
		}
		else
			this._gs.addErrorMessage("Category \"" + this._gr[sc_.TITLE] + "\" has not been deactivated");
		this._gr.active = false;
		this.redirect();
		this._gr.update();
	},
	
	reject: function() {
		this._gr[sc_ic.STATE] = sc_ic.REJECTED;
		this._gr.update();
	},
	
	canActivate: function() {
		if (this._gr[sc_ic.STATE] != sc_ic.CREATED)
			return false;
		
		if (this._gr[sc_.CATEGORY].nil() || this._gr[sc_.CATEGORY].active)
			return false;
		
		if (!this.canManage())
			return false;
		
		return true;
	},
	
	canDeactivate: function() {
		if (this._gr[sc_ic.STATE] != sc_ic.CREATED)
			return false;
		
		if (this._gr[sc_.CATEGORY].nil() || !this._gr[sc_.CATEGORY].active)
			return false;
		
		if (!this.canManage())
			return false;
		
		return true;
	},
	
	canReject: function() {
		if (this._gr[sc_ic.STATE] != sc_ic.REQUESTED)
			return false;
		
		return this.isAdmin();
	},
	
	canManage: function() {
		if (this.isAdmin())
			return true;
		
		if (this._gs.hasRole(sc_ic.CATALOG_MANAGER) && this._gr[sc_ic.MANAGER] == this._gs.getUserID())
			return true;
	},
	
	isEditor: function() {
		return this._gs.hasRole(sc_ic.CATALOG_EDITOR) && (this._gr[sc_ic.EDITORS]+"").indexOf(gs.getUserID()) >= 0;
	},
	
	canCreateItem: function() {
		if (this._gr[sc_ic.STATE] != sc_ic.CREATED)
			return false;
		
		return this.canManage() || this.isEditor();
	},
	
	canCreateCategory: function() {
		if (this._gr[sc_ic.STATE] != sc_ic.REQUESTED)
			return false;
		
		return this.isAdmin();
	},
	
	createCategory: function() {
		var catGr = sc_Factory.getWrapperClass(sc_.CATEGORY).create(this._gr);
		if (catGr) {
			this._gr[sc_ic.STATE] = sc_ic.CREATED;
			this._gr[sc_.CATEGORY] = catGr.getUniqueValue();
			this._gr[sc_ic.COMMENTS] = "Category \"" + catGr.getDisplayValue() + "\" created";
			this._gr.active = true;
			this._gr.update();
			this.updateManagerRoles();
			this._gs.addInfoMessage("Category \"" + catGr.getDisplayValue() + "\" has been created");
		}
		else
			this._gs.addErrorMessage("Category \"" + this._gr[sc_.TITLE] + "\" has not been created");
		this.redirect();
	},
	
	isAdmin: function() {
		return this._gs.hasRole(sc_.CATALOG_ADMIN);
	},
	
	addRolesOnInsert: function() {
		var userRoleGr = new GlideRecord("sys_user_role");
		if (userRoleGr.get("name", sc_ic.CATALOG_ITEM_DESIGNER))
			this.addRoles(this._gr[sc_ic.MANAGER], userRoleGr.getUniqueValue());
	},
	
	checkAndUpdateRoles: function(previousGr) {
		if (this._gr[sc_ic.MANAGER].changes())
			this.updateManagerRoles(previousGr);
		
		if (this._gr[sc_ic.EDITORS].changes())
			this.updateEditorRoles(previousGr);
	},
	
	updateManagerRoles: function(previousGr) {
		var managerRoles = [];
		var userRoleGr = new GlideRecord("sys_user_role");
		if (userRoleGr.get("name", sc_ic.CATALOG_MANAGER))
			managerRoles.push(userRoleGr.getUniqueValue());
		if (userRoleGr.get("name", sc_ic.CATALOG_ITEM_DESIGNER))
			managerRoles.push(userRoleGr.getUniqueValue());
		
		if (managerRoles.length == 0)
			return;
		
		if (previousGr && previousGr[sc_ic.MANAGER] != this._gr[sc_ic.MANAGER])
			this.removeManagerRoles(previousGr[sc_ic.MANAGER], managerRoles);
		this.addRoles(this._gr[sc_ic.MANAGER], managerRoles);
	},
	
	removeManagerRoles: function(userId, roleIds) {
		if (JSUtil.nil(userId))
			return;
		
		var managerCatsGr = new GlideAggregate(sc_ic.CATEGORY_REQUEST);
		managerCatsGr.addQuery(sc_ic.MANAGER, userId);
		managerCatsGr.addNotNullQuery(sc_.CATEGORY);
		managerCatsGr.addQuery("sys_id", "!=", this._gr.getUniqueValue());
		managerCatsGr.addAggregate("COUNT");
		managerCatsGr.query();
		
		if (managerCatsGr.next() && managerCatsGr.getAggregate("COUNT") > 0)
			return;
		
		this.removeRoles(userId, roleIds);
	},
	
	updateEditorRoles: function(previousGr) {
		var editorRoles = [];
		var userRoleGr = new GlideRecord("sys_user_role");
		if (userRoleGr.get("name", sc_ic.CATALOG_EDITOR))
			editorRoles.push(userRoleGr.getUniqueValue());
		if (userRoleGr.get("name", sc_ic.CATALOG_ITEM_DESIGNER))
			editorRoles.push(userRoleGr.getUniqueValue());
		
		if (editorRoles.length == 0)
			return;
		
		var previousEditors = previousGr.getValue(sc_ic.EDITORS);
		var previousEditorsArr = (JSUtil.nil(previousEditors) ? [] : previousEditors.split(","));
		var currentEditors = this._gr.getValue(sc_ic.EDITORS);
		var currentEditorsArr = (JSUtil.nil(currentEditors) ? [] : currentEditors.split(","));
		
		var au = new ArrayUtil();
		editorsToRemove = au.diff(previousEditorsArr, currentEditorsArr);
		editorsToAdd = au.diff(currentEditorsArr, previousEditorsArr);
		
		for (var i = 0; i < editorsToRemove.length; i++)
			this.removeEditorRoles(editorsToRemove[i], editorRoles);
		
		for (var i = 0; i < editorsToAdd.length; i++)
			this.addRoles(editorsToAdd[i], editorRoles);
		
	},
	
	removeEditorRoles: function(userId, roleIds) {
		if (JSUtil.nil(userId))
			return;
		
		var editorCatsGr = new GlideAggregate(sc_ic.CATEGORY_REQUEST);
		editorCatsGr.addQuery(sc_ic.EDITORS, "CONTAINS", userId);
		editorCatsGr.addNotNullQuery(sc_.CATEGORY);
		editorCatsGr.addQuery("sys_id", "!=", this._gr.getUniqueValue());
		editorCatsGr.addAggregate("COUNT");
		editorCatsGr.query();
		
		if (editorCatsGr.next() && editorCatsGr.getAggregate("COUNT") > 0)
			return;
		
		this.removeRoles(userId, roleIds);
	},
	
	addRoles: function(userId, roleIds) {
		if (JSUtil.nil(userId))
			return;
		
		var roleIdsArr = new ArrayUtil().ensureArray(roleIds);
		if (roleIdsArr.length == 0)
			return;
		
		var userRoleGr = new GlideRecord("sys_user_has_role");
		
		for (var i = 0; i < roleIdsArr.length; i++) {
			userRoleGr.initialize();
			userRoleGr.addQuery("user", userId);
			userRoleGr.addQuery("role", roleIdsArr[i]);
			userRoleGr.query();
			if (userRoleGr.hasNext())
				return;
			
			userRoleGr.user = userId;
			userRoleGr.role = roleIdsArr[i];
			userRoleGr.insert();
		}
	},
	
	removeRoles: function(userId, roleIds) {
		if (JSUtil.nil(userId))
			return;
		
		var roleIdsArr = new ArrayUtil().ensureArray(roleIds);
		if (roleIdsArr.length == 0)
			return;
		
		var userRoleGr = new GlideRecord("sys_user_has_role");
		userRoleGr.addQuery("user", userId);
		userRoleGr.addQuery("role", roleIdsArr);
		userRoleGr.deleteMultiple();
	},
	
	getCategoryFieldInfoMsg: function() {
		if (JSUtil.nil(this._gr[sc_.CATEGORY]))
			return "";
		
		var infoMsg = "";
		infoMsg += "This category <span style='font-weight:bold'>" + this._gr[sc_.CATEGORY].getDisplayValue() + "</span> is currently ";
		
		if (this._gr[sc_.CATEGORY].active)
			if (this.canDeactivate())
				infoMsg += "<span style='color: green'>active</span> - use the Deactivate button to no longer show this in Catalog ";
			else
				infoMsg += "<span style='color: green'>active</span> and will be shown in Catalog ";
		else
			if (this.canActivate())
				infoMsg += "<span style='color: red'>inactive</span> - use the Activate button to make it available in Catalog ";
			else
				infoMsg += "<span style='color: red'>inactive</span> and will not be visible in Catalog ";
		
		infoMsg += "<span style='font-weight:bold'>" + this._gr[sc_.CATALOG].getDisplayValue() + "</span>";
		
		return infoMsg;
	},
	
	copyChangesToCategory: function() {
		if (JSUtil.nil(this._gr[sc_.CATEGORY]))
			return;
		
		var changesToCopy = false;
		for (var fieldName in this.fieldsToCopy)
			if (this._gr[fieldName].changes()) {
				changesToCopy = true;
				break;
			}
		
		var catGr = new GlideRecord(sc_.CATEGORY);
		if (catGr.get(this._gr[sc_.CATEGORY])) {
			sc_Factory.wrap(catGr).copyDesktopImage(this._gr);
			if (changesToCopy)
				sc_Factory.wrap(catGr).updateFields(this._gr);
		}
	},
	
	updateCategoryImage: function() {
		if (JSUtil.nil(this._gr[sc_.CATEGORY]))
			return;
		
		var catGr = new GlideRecord(sc_.CATEGORY);
		if (catGr.get(this._gr[sc_.CATEGORY]))
			sc_Factory.wrap(catGr).copyDesktopImage(this._gr);
	},
	
	copyFromCategory: function(category) {
		this._gr[sc_ic.STATE] = "created";
		this._gr.active = true;
		this._gr[sc_.CATEGORY] = category.getUniqueValue();
		this._gr[sc_.TITLE] = category[sc_.TITLE];
		this._gr[sc_.CATALOG] = category[sc_.CATALOG];
		this._gr[sc_.PARENT] = category[sc_.PARENT];
		this._gr[sc_.DESCRIPTION] = category[sc_.DESCRIPTION];
		this._gr[sc_ic.COMMENTS] = "This Item Designer Category Request was created from an existing category";
		return this;
	},
	
	copyImageFromCategory: function(category) {
		if (JSUtil.nil(category.getUniqueValue()))
			return;
		
		GlideSysAttachment.copy(category.getTableName(),category.getUniqueValue(),this._gr.getTableName(),this._gr.getUniqueValue());
		// Updating the field name on sys_attachment
		var att = new GlideRecord("sys_attachment");
		att.addQuery("file_name","IN",[sc_.HOMEPAGE_IMAGE]);
		att.addQuery("table_sys_id","=",this._gr.getUniqueValue());
		att.query();
		while (att.next()) {
			if(this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[copyImageFromCategory] Updating field name on attachment <" +att.getUniqueValue()+ ">");
			
			if (att.file_name+"" == sc_.HOMEPAGE_IMAGE)
				att.file_name = sc_.HOMEPAGE_IMAGE;
			att.update();
		}
		return this;
	},
	
	type: 'sc_ic_CategoryRequest'
});


sc_ic_CategoryRequest.createFromCategory = function(category) {
	if (JSUtil.nil(category) || category.getTableName() != sc_.CATEGORY || JSUtil.nil(category.getUniqueValue())) {
		this._gs.addErrorMessage("Cannot create a Category request from this record");
		return;
	}
	
	var categoryRequestGr = new GlideRecord(sc_ic.CATEGORY_REQUEST);
	var categoryRequest = sc_ic_Factory.wrap(categoryRequestGr);
	categoryRequest.copyFromCategory(category);
	categoryRequestGr.insert();
	categoryRequest.copyImageFromCategory(category);
	
	this._gs.addInfoMessage("New Category Request record created for category <span style='font-weight:bold'>" + category.getDisplayValue() +
		"</span> - <span style='font-style:italic;color:red'>you need to select a Manager for this record</span>");
	
	categoryRequest.redirect();
}