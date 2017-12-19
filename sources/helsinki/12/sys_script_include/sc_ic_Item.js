var sc_ic_Item = Class.create();
sc_ic_Item.prototype = Object.extendsObject(sc_ic_Base, {
	initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
		
		if (this._gr.getTableName()+"" != sc_ic.ITEM_STAGING)
			throw new sc_ic_Exception("Incorrect GlideRecord type " + this._gr.getTableName() +" for " + this.type);
		
		// The set of fields that will make this record change to the draft state.
		this._toDraft = {'name': true, 'short_description': true, 'description': true, 'sc_catalogs': true, 'sc_categories': true,
						 'availability': true, 'cost': true, 'recurring_cost': true, 'recurring_frequency': true, 'desktop_image': true,
						 'mobile_image': true, 'var_changed': true, 'item_type': true, 'var_defn_changed':true, 'var_meta_changed': true,
						 'aprvl_defn_changed': true, 'task_defn_changed': true, 'layout_changed': true, 'entitlements': true};
		
		// The list of states that you're allowed to edit this item in.
		this._editState = { 'draft': true, 'ready_to_publish': true, 'published':true, 'expired': true };
	},
	
	/**
	 * Sets an Item to draft and increments version number if one of the trigger fields has been changed
	 */
	setDraft: function() {
		for (var fld in this._toDraft) {
			if (this._gr[fld].changes() && this._toDraft[fld]) {
				this._gr.state = sc_ic.DRAFT;
				this._gr.version = parseInt(this._gr.version+"") + 1;
				this._gr[sc_ic.ACTIVE] = true;
				
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[setDraft] " + this._gr.name + " <" + this._gr.getUniqueValue() + ">");

				return this;
			}
		}
		return this;
	},
	
	setDraftForImage: function() {
		var oldState = this._gr.state.toString();
		this._gr.state = sc_ic.DRAFT;
		this._gr.version = parseInt(this._gr.version+"") + 1;
		this._gr[sc_ic.ACTIVE] = true;
		this._gr.update();
		this.displayDraftMessage(oldState);
		return this;
	},
	
	/**
	 * Sets the item as expired
	 */
	setExpired: function() {
		this._gr.state = sc_ic.EXPIRED;
		this._gr.active = false;
		return this;
	},
	
	/**
	 * expires the item
	 */
	expire: function() {
		this.setExpired();
		this._gr.update();
		
		if (!this._gr.isActionAborted() && !JSUtil.nil(this._gr[sc_.CATALOG_ITEM]))
			sc_ic_Factory.wrap(this._gr[sc_.CATALOG_ITEM].getRefRecord()).expire();
	},
	
	/**
	 * Makes the item draft
	 */
	draft: function() {
		var oldState = this._gr.state.toString();
		
		this.setDraft();
		this._gr.update();
		this.displayDraftMessage(oldState);
		
	},
	
	isEditable: function() {
		return (this._editState[this._gr[sc_ic.STATE]+""] ? true : false);
	},
	
	/**
	 * Sets the question definition changed flag if it's not already set.
	 */
	questionDefinitionChanged: function() {
		if (this._gr[sc_ic.VAR_DEFN_CHANGED]+"" == "true")
			return;
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[questionDefinitionChanged] Changed for " + this._gr.name + " <" + this._gr.getUniqueValue() + ">");
		
		this._gr[sc_ic.VAR_DEFN_CHANGED] = true;
		this.draft();
	},
	
	/**
	 * Sets the question meta changed flag if not already set
	 */
	questionMetaChanged: function() {
		if (this._gr[sc_ic.VAR_META_CHANGED]+"" == "true")
			return;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[questionMetaChanged] Changed for " + this._gr.name + " <" + this._gr.getUniqueValue() + ">");
		
		this._gr[sc_ic.VAR_META_CHANGED] = true;
		this.draft();
	},
	
	/**
	 * Sets the approval definition changed flag if not already set
	 */
	approvalDefinitionChanged: function() {
		if (this._gr[sc_ic.APRVL_DEFN_CHANGED]+"" == "true")
			return;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[approvalDefinitionChanged] Changed for " + this._gr.name + " <" + this._gr.getUniqueValue() + ">");
		
		this._gr[sc_ic.APRVL_DEFN_CHANGED] = true;
		this.draft();
	},
	
	/**
	 * Sets the task definition change flag if not already set
	 */
	taskDefinitionChanged: function() {
		if (this._gr[sc_ic.TASK_DEFN_CHANGED]+"" == "true")
			return;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[taskDefinitionChanged] Changed for " + this._gr.name + " <" + this._gr.getUniqueValue() + ">");
		
		this._gr[sc_ic.TASK_DEFN_CHANGED] = true;
		this.draft();
	},
	
	/**
	 * Sets the layout flag changed if not already set
	 */
	layoutChanged: function() {
		if (this._gr[sc_ic.LAYOUT_CHANGED]+"" == "true")
			return;

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[layoutChanged] Changed for " + this._gr.name + " <" + this._gr.getUniqueValue() + ">");
		
		this._gr[sc_ic.LAYOUT_CHANGED] = true;
		this.draft();
	},
	
	okToPublish: function() {
		var missingData = [];
		if (JSUtil.nil(this._gr.sc_categories))
			missingData.push("Categories: you need to add your Item to at least 1 Category");
		
		if (!this.createdFromServiceCreator()) {
			var taskDefnGr = new GlideAggregate(sc_ic.TASK_DEFN_STAGING);
			taskDefnGr.addQuery(sc_ic.ITEM_STAGING, this._gr.getUniqueValue());
			taskDefnGr.addActiveQuery();
			taskDefnGr.addAggregate("COUNT");
			taskDefnGr.query();
			
			if (!taskDefnGr.next() || taskDefnGr.getAggregate("COUNT") == 0)
				missingData.push("Tasks: your Item needs to have at least 1 Task");
		}
		
		if (missingData.length > 0) {
			this._gr.setAbortAction(true);
			var infoMessage = "Your Item isn't quite ready to be published - you need to resolve the following issues first:<ul>";
			for (var i = 0; i < missingData.length; i++)
				infoMessage += "<li>" + missingData[i] + "</li>";
			infoMessage += "</ul>";
			
			gs.addInfoMessage(infoMessage);
			this.redirect();

			return false;
		}
		
		return true;
	},
	
	/**
 	* Publishes this simple item to a catalog item and returns the catalog item GlideRecord.
 	* Checks the var_defn_changed and var_meta_changed values to check if the variables have been updated.
	 * If the definition is changed it forces the expiration of the current and creation of a new item.  If
	 * the meta has changed only the item and variables are updated.
	 */
	publish: function() {
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[publish] Publishing Item: " + this._gr.name + " <"+ this._gr.getUniqueValue() +"> to table " + this._gr.item_type);
		
		// Check the minimum data requirements are met before publishing
		if (!this.okToPublish())
			return;

		//Which kind of target record are we dealing with
		var targetTable = this._gr.item_type +"";
		
		var retVal;
		
		if (JSUtil.notNil(this._gr[sc_.CATALOG_ITEM])) {
			var ci = new GlideRecord(targetTable);
			ci.get(this._gr[sc_.CATALOG_ITEM]);
			
			var catItem = sc_ic_Factory.wrap(ci);
			
			//If the variables have been changed expire/create, otherwise update.
			if (this._gr[sc_ic.VAR_DEFN_CHANGED]+"" == "true") {
				catItem.expire();
				retVal = sc_ic_Factory.getWrapperClass(targetTable).create(this._gr);
			}
			else {
				catItem.refresh(this._gr);
				if (this._gr[sc_ic.VAR_META_CHANGED]+"" == "true" || this._gr[sc_ic.LAYOUT_CHANGED]+"" == "true")
					catItem.refreshQuestions(this._gr);
				retVal = ci;
			}
		}
		else {
			// If there's not one published, create a Catalog Item.
			retVal = sc_ic_Factory.getWrapperClass(targetTable).create(this._gr);
		}
		
		var itemID = retVal.sys_id;
		var itemStagingID = this._gr.sys_id;
		
		new SNC.NGSCCatalogRules(itemID + "", itemStagingID + "").publish();
		
		// Update the publishing information on this record.
		this._gr[sc_.CATALOG_ITEM] = retVal.getUniqueValue();
		this._gr[sc_ic.STATE] = sc_ic.PUBLISHED;
		this._gr[sc_ic.VAR_DEFN_CHANGED] = false;
		this._gr[sc_ic.VAR_META_CHANGED] = false;
		this._gr[sc_ic.APRVL_DEFN_CHANGED] = false;
		this._gr[sc_ic.TASK_DEFN_CHANGED] = false;
		this._gr[sc_ic.LAYOUT_CHANGED] = false;
		
		this._enableQuietUpdate();
		this._gr.update();
		gs.updateSave(this._gr);
		this._disableQuietUpdate();
		
		if (!this.createdFromServiceCreator()) {
			var infoMsg = "Your item has been published successfully - you can try your new item by clicking <a href='" +
						GlideappCatalogURLGenerator.getItemBaseURLFromGR(retVal) + "'>here</a>";
			if (this.isAdmin())
				infoMsg += " and the new Catalog Item can be viewed by clicking " +
						   "<a href=\"" + retVal.getLink() + "\">here</a>";
			gs.addInfoMessage(infoMsg);
		}
		
		return retVal;
	},
	
	unpublish: function () {
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[publish] Unpublishing Item: " + this._gr.name + " <"+ this._gr.getUniqueValue() +"> to table " + this._gr.item_type);
		
		if (JSUtil.nil(this._gr[sc_.CATALOG_ITEM]))
			return;
		
		this.draft();
		if (!this._gr.isActionAborted())
			sc_ic_Factory.wrap(this._gr[sc_.CATALOG_ITEM].getRefRecord()).expire();
		
		this._gs.addInfoMessage("Catalog Item  <span style='font-weight:bold'>" + this._gr[sc_.CATALOG_ITEM].getDisplayValue() + "</span> is now inactive");
	},
	
	/**
 	* Validate categories exist in a catalog, and attempt give meaningful data if possible or show error.
 	*/
	validateCategories: function() {
		var retVal = true;
		if (JSUtil.nil(this._gr.sc_catalogs) && JSUtil.notNil(this._gr.sc_categories)) {
			this._gr.sc_catalogs = GlideappCategory.getCatalogsByCategories(this._gr.sc_categories);
			if (JSUtil.nil(this._gr.sc_catalogs)) {
				this._gs.addErrorMessage(this._gs.getMessage('You cannot select categories that do not exist in selected catalog(s)'));
				retVal = false;
			}
		}
		else if (JSUtil.nil(this._gr.sc_catalogs) && JSUtil.nil(this._gr.sc_categories) && SNC.Catalog.getTotalCatalogCount() == 1)
			this._gr.sc_catalogs = SNC.Catalog.getDefaultCatalog();
		else if (JSUtil.notNil(this._gr.sc_catalogs) && JSUtil.notNil(this._gr.sc_categories)) {
			if (!GlideappCategory.areCategoriesInCatalogs(this._gr.sc_catalogs, this._gr.sc_categories)) {
				this._gs.addErrorMessage(this._gs.getMessage('You cannot select categories that do not exist in selected catalog(s)'));
				retVal = false;
			}
		}
		return retVal;
	},
	
	createDefaultSection: function() {
		var sectionGr = new GlideRecord(sc_ic.SECTION);
		sectionGr[sc_ic.ITEM_STAGING] = this._gr.getUniqueValue();
		sectionGr[sc_ic.INDEX] = 0;
		sectionGr.insert();
	},
	
	createdFromServiceCreator: function() {
		return this._gr[sc_ic.ITEM_TYPE] == "sc_cat_item_producer" ||
				this._gr[sc_ic.ITEM_TYPE] == "sc_cat_item_producer_service";
	},
	
	isAdmin: function() {
		return gs.hasRole(sc_.CATALOG_ADMIN);
	},
	
	getUsersAvailableCatalogsRQ: function() {
		if (this.isAdmin())
			return "";

		var availableCatalogIds = this.getUsersAvailableCatalogs().toString();
		
		return (availableCatalogIds == "" ? "sys_idIN0" : "sys_idIN" + availableCatalogIds);
	},
	
	getUsersAvailableCatalogs: function() {
		var availableCatalogIds = [];
	
		var availableCatalogsGr = new GlideAggregate(sc_ic.CATEGORY_REQUEST);
		availableCatalogsGr.addEncodedQuery(sc_ic.MANAGER + "=" + gs.getUserID() + "^OR" + sc_ic.EDITORS + "LIKE" + gs.getUserID());
		availableCatalogsGr.addNotNullQuery(sc_.CATEGORY);
		availableCatalogsGr.groupBy(sc_.CATALOG);
		availableCatalogsGr.query();
	
		while (availableCatalogsGr.next())
			availableCatalogIds.push(availableCatalogsGr[sc_.CATALOG]+"");
	
		return availableCatalogIds;
	},

	getUsersAvailableCategoriesRQ: function() {
		if (this.isAdmin()) {
			return "sc_catalogIN" + this._gr[sc_ic.CATALOGS];
		}
				
		var availableCategoryIds = this.getUsersAvailableCategories().toString();

		return (availableCategoryIds == "" ? "sys_idIN0" : "sys_idIN" + availableCategoryIds);
	},
	
	getUsersAvailableCategories: function() {
		var availableCategoryIds = [];
		var selectedCatalogs = this._gr[sc_ic.CATALOGS] + "";
	
		var availableCategoriesGr = new GlideRecord(sc_ic.CATEGORY_REQUEST);
		availableCategoriesGr.addEncodedQuery(sc_ic.MANAGER + "=" + gs.getUserID() + "^OR" + sc_ic.EDITORS + "LIKE" + gs.getUserID());
		availableCategoriesGr.addNotNullQuery(sc_.CATEGORY);
		if (!JSUtil.nil(selectedCatalogs)) {
			var selectedCatalogsArr = selectedCatalogs.split(",");
			for (var i = 0; i < selectedCatalogsArr.length; i++) {
				var catQuery;
				if (i == 0) 
					catQuery = availableCategoriesGr.addQuery("sc_catalog", selectedCatalogsArr[i]);
				else
					catQuery.addOrCondition("sc_catalog", selectedCatalogsArr[i]);
			}
		}
		availableCategoriesGr.query();

		while (availableCategoriesGr.next())
			availableCategoryIds.push(availableCategoriesGr[sc_.CATEGORY]+"");
		
		return availableCategoryIds;
	},
	
	getUsersDefaultCatalog: function() {
		var availableCatalogIds = this.getUsersAvailableCatalogsRQ();
		
		var catalogGr = new GlideRecord(sc_.CATALOG);
		catalogGr.addEncodedQuery(availableCatalogIds);
		catalogGr.query();
		if (catalogGr.getRowCount() == 1) {
			catalogGr.next();
			return catalogGr.getDisplayValue();
		}
		
		return "";
	},
	
	getUsersDefaultCategory: function() {
		var availableCategoryIds = this.getUsersAvailableCategoriesRQ();
		
		var categoryGr = new GlideRecord(sc_.CATEGORY);
		categoryGr.addEncodedQuery(availableCategoryIds);
		categoryGr.query();
		if (categoryGr.getRowCount() == 1) {
			categoryGr.next();
			return categoryGr.getDisplayValue();
		}
		
		return "";
	},
		
	/**
	 * Warn user if the previous state was Published
	 */

	displayDraftMessage: function(oldState){
		var wasPublished = false;
		if (oldState == sc_ic.PUBLISHED)
			wasPublished = true;
		if (wasPublished)
			this._gs.addInfoMessage("Your item has been set back to Draft from Published state");
	},
	
	type: 'sc_ic_Item'
});
