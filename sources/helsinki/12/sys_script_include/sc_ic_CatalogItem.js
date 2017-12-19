var sc_ic_CatalogItem = Class.create();
sc_ic_CatalogItem.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);

		// We have to deal with a specific table or it's children here so check table names
		var tn = this._gr.getTableName();
		var lineage = (new TableUtils(tn)).getTables();
		
        if (!lineage.contains(sc_.CATALOG_ITEM)) {
            this._log.error("Invalid GlideRecord provided when instanciating sc_ic_CatalogItem, " + tn);
            throw new sc_ItemCreatorException("Invalid GlideRecord provided when instanciating sc_ic_CatalogItem, " + tn);
        }
    },
	
	/**
	 * Sets all the appropriate states for a catalog item to be expired.
	 */
	setExpired: function() {
		this._gr[sc_.ACTIVE] = false;
		return this;
	},
	
	/**
	 * Expires the current item.  This calls the setExpired method and then updates the current gr
	 */
	expire: function() {
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[expire] Expiring sc_cat_item <" + this._gr.getUniqueValue() + ">");
		this.setExpired();
		this._gr.update();
	},
	
	/**
	 * Refreshes catalog item from a simple item
	 */
	refresh: function(item) {
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[updateFrom] Updating sc_cat_item <" + this._gr.getUniqueValue() + "> from sc_ic_item <" + item.getUniqueValue() + ">");
		
		this._gr.active = true;
		this._deleteImages();
		this._copyFields(item);
		this._deleteCategories(item);
		this._copyCategories(item);
		this._copyTranslations(item);
		this._copyAttachments(item);
		this._deleteApprovals(item);
		this._copyApprovals(item);
		this._deleteTasks();
		this._copyTasks(item);
		this._gr.update();
	},
	
	/**
	 * Refreshes the questions for a catalog item from a simple item
	 */
	refreshQuestions: function(item) {
		
		// First we have to get rid of the sections
		var sectIOGr = new GlideRecord(sc_.ITEM_OPTION);
		sectIOGr.addQuery("cat_item","=",this._gr.getUniqueValue());
		sectIOGr.addQuery("type","IN",[19,20,24]);
		sectIOGr.query();
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[refreshQuestions] Removing " + sectIOGr.getRowCount() + " section variables");
		
		sectIOGr.deleteMultiple();
		
		var qGr = new GlideRecord(sc_ic.QUESTION);
		qGr.addQuery(sc_ic.ITEM_STAGING,"=",item.getUniqueValue());
		qGr.addActiveQuery();
		qGr.orderBy(sc_ic.SECTION + "." + sc_ic.INDEX);
		qGr.orderBy(sc_ic.COLUMN + "." + sc_ic.INDEX);
		qGr.orderBy("order");
		qGr.query();
		
		var ioGr = new GlideRecord(sc_.ITEM_OPTION);
		ioGr.addQuery("cat_item","=",this._gr.getUniqueValue());
		ioGr.addActiveQuery();
		ioGr.orderBy("order");
		ioGr.query();
		
		var itemOption = sc_ic_Factory.wrap(ioGr);
		var ioWrapper = sc_ic_Factory.getWrapperClass(sc_.ITEM_OPTION);
		
		var lastSec = null;
		var lastCol = null;
		var n = 0;

		while (qGr.next()) {
			ioGr.setLocation(-1);
			
			// Compensate for null section records
			if (JSUtil.nil(qGr.sc_ic_section.index)) {
				if (lastSec == null)
					qGr.sc_ic_section.index = 0;
				else
					qGr.sc_ic_section.index = lastSec;
			}
			
			//Sort out the container start and end.
			if (lastSec != qGr.sc_ic_section.index) {
				if (lastSec != null)
					ioWrapper.createContainerEnd(this._gr, n++);

				ioWrapper.createContainerStart(this._gr, n++, qGr[sc_ic.SECTION].label);
				lastSec = qGr[sc_ic.SECTION].index;
				
				// Compensate for null columns
				if (JSUtil.nil(qGr.sc_ic_column.index))
					qGr[sc_ic.COLUMN].index = 0;
				
				lastCol = qGr[sc_ic.COLUMN].index;
			}

			// Sort out the container split
			if (lastCol != qGr[sc_ic.COLUMN].index) {
				ioWrapper.createContainerSplit(this._gr, n++);
				lastCol = qGr[sc_ic.COLUMN].index;
			}
			
			// Find the related published variable
			var found = false;
			while (ioGr.next()) {				
				if (ioGr.name+"" == qGr.name+"") {
					found = true;
					break;
				}
			}
			
			/* If we don't find a matching name move onto the next variable 'do the best we can'
			 * This can only mean the Catalog item variables have been modified outside of the Item Creator
			 */
			if (!found) {
				this._log.error("[refreshQuestions] Failed to fine question " + qGr.name + " <" + qGr.getUniqueValue() + ">"+
								" on Catalog Item '" + this._gr.name + "' <"+this._gr.getUniqueValue()+">");
				continue;
			}
			
			qGr.order = n++;
			
			// At this point the names should match up.
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[refreshQuestions] Refreshing var " + ioGr.name + " <" + ioGr.getUniqueValue() + "> using " +
								 sc_ic.QUESTION + " <" + qGr.getUniqueValue() + ">");
			
			itemOption.refresh(qGr);
		}	

		ioWrapper.createContainerEnd(this._gr, n);
	},
	
	/**
	 * Deletes the desktop and mobile images related to this catalog item
	 */
	_deleteImages: function() {
		var att = new GlideRecord("sys_attachment");
		att.addQuery("file_name","IN",[sc_.DESKTOP_IMAGE,sc_.MOBILE_IMAGE]);
		att.addQuery("table_sys_id","=",this._gr.getUniqueValue());
		att.query();
		
		if (att.getRowCount() > 0) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[_deleteImages] Removing " + att.getRowCount() + " image attachments from sc_cat_item <" + this._gr.getUniqueValue() + ">");
			
			att.deleteMultiple();
		}
		return this;
	},
	
	/**
	 * Deletes category item mapping from the M2M
	 */
	_deleteCategories: function(validCategories) {
		if (JSUtil.nil(this._gr.getUniqueValue()))
			return;
		
		var catalogItemCategoryGr = new GlideRecord(sc_.CATALOG_ITEM_CATEGORY);
		catalogItemCategoryGr.addQuery("sc_cat_item", this._gr.getUniqueValue());
		if (!JSUtil.nil(validCategories))
			catalogItemCategoryGr.addQuery("sc_category","NOT IN",validCategories);
		catalogItemCategoryGr.query();
		
		if (catalogItemCategoryGr.getRowCount() > 0) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[_deleteCategories] Removing " + catalogItemCategoryGr.getRowCount() + " categories from sc_cat_item <" + this._gr.getUniqueValue() + ">");
			
			catalogItemCategoryGr.deleteMultiple();
		}
		return this;
	},
	
	/**
	 * Delete Item approval records
	 */
	_deleteApprovals: function(item) {
		if (JSUtil.nil(this._gr.getUniqueValue()))
			return this;
		
		var approvalDefns = new GlideRecord(sc_ic.APRVL_DEFN);
		approvalDefns.addQuery(sc_.CATALOG_ITEM, this._gr.getUniqueValue());
		approvalDefns.query();
		
		if (approvalDefns.getRowCount() > 0) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[_deleteApprovals] Removing " + approvalDefns.getRowCount() + " approval definitions from sc_cat_item <" + this._gr.getUniqueValue() + ">");
			
			approvalDefns.deleteMultiple();
		}
		return this;
	},
	
	_deleteTasks: function() {
		if (JSUtil.nil(this._gr.getUniqueValue()))
			return this;
		
		var taskDefn = new GlideRecord(sc_ic.TASK_DEFN);
		taskDefn.addQuery(sc_.CATALOG_ITEM,this._gr.getUniqueValue());
		taskDefn.query();
		
		if (taskDefn.getRowCount() > 0) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[_deleteTasks] Removing " + taskDefn.getRowCount() + " task definitions from sc_cat_item <" + this._gr.getUniqueValue() + ">");
			taskDefn.deleteMultiple();
		}
		return this;
	},
	
	/**
	 * Copy data from the fields in the source item
	 */
	_copyFields: function(item) {
		this._gr.name = item.name;
		this._gr.sc_catalogs = item.sc_catalogs;
		
		//We only have one in the item at the moment so use the first one.
		if (JSUtil.notNil(item.sc_categories))
			this._gr.category = (item.sc_categories+"").split(",")[0];
		
		this._gr.short_description = item.short_description;
		this._gr.description = item.description;
		
		this._gr.availability = item.availability;
		this._gr.price = item.cost.getCurrencyString();
		this._gr.recurring_price = item.recurring_cost.getCurrencyString();
		this._gr.recurring_frequency = item.recurring_frequency;
		// Sort out the version information
		this._gr[sc_ic.ITEM_STAGING] = item.getUniqueValue();
		this._gr[sc_.IC_VERSION] = item[sc_ic.VERSION]+"";
		
		this._gr.delivery_plan="";
		this._gr.workflow = sc_ic.WORKFLOW_ID;
		return this;
	},
	
	/**
	 * Checks the contents of the category table and adds as appropriate
	 */
	_copyCategories: function(item) {
		var catalogItemCategory = new SNC.CatalogItemCategory(this._gr.getUniqueValue(), this._gr.category+"");
		catalogItemCategory.createRecord(this._gr.getUniqueValue(), (item.sc_categories+"").split(","));
		
		return this;
	},
	
	/**
	 * Copies the attachment records and handles field associations
	 */
	_copyAttachments: function(item) {
		GlideSysAttachment.copy(item.getTableName(),item.getUniqueValue(),this._gr.getTableName(),this._gr.getUniqueValue());
		// Updating the field name on sys_attachment
		var att = new GlideRecord("sys_attachment");
		att.addQuery("file_name","IN",[sc_ic.DESKTOP_IMAGE,sc_ic.MOBILE_IMAGE]);
		att.addQuery("table_sys_id","=",this._gr.getUniqueValue());
		att.query();
		while (att.next()) {
			
			if(this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[_copyAttachments] Updating field name on attachment <" +att.getUniqueValue()+ ">");
			
			if (att.file_name+"" == sc_ic.DESKTOP_IMAGE) 
				att.file_name = sc_.DESKTOP_IMAGE;
			else if (att.file_name+"" == sc_ic.MOBILE_IMAGE)
				att.file_name = sc_.MOBILE_IMAGE;
			att.update();
		}
		
		var att = new GlideRecord("sys_attachment");
		att.addQuery("file_name","IN", sc_.MOBILE_IMAGE);
		att.addQuery("table_sys_id","=", this._gr.getUniqueValue());
		att.query();
		if (att.next())
			this._gr.mobile_picture_type = "use_mobile_picture";
		else
			this._gr.mobile_picture_type = "use_no_picture";
		return this;
	},
	
	/**
	 * Copies the approval definitions to the catalog item
	 */
	_copyApprovals: function(item) {
		if (JSUtil.nil(item.getUniqueValue()))
			return this;
		
		var approvalStagingDefnGr = new GlideRecord(sc_ic.APRVL_DEFN_STAGING);
		approvalStagingDefnGr.addQuery(sc_ic.ITEM_STAGING, item.getUniqueValue());
		approvalStagingDefnGr.addActiveQuery();
		approvalStagingDefnGr.query();
		
		while (approvalStagingDefnGr.next())
			sc_ic_Factory.getWrapperClass(sc_ic.APRVL_DEFN).create(this._gr, approvalStagingDefnGr);
		
		return this;
    },
	
	_copyTranslations: function(source) {
		//Copy the translated fields for this record.
		//name, short description, description (html)
		this.copyElementTranslations(source,"name","name");
		this.copyElementTranslations(source,"short_description","short_description");
		this.copyElementTranslations(source,"description","description");
	},
	
	/**
	 * Copies task items from the source item to the catalog item
	 */
	_copyTasks: function(item) {
		if (JSUtil.nil(item.getUniqueValue()))
			return this;
		
		var tds = new GlideRecord(sc_ic.TASK_DEFN_STAGING);
		tds.addQuery(sc_ic.ITEM_STAGING, item.getUniqueValue());
		tds.addActiveQuery();
		tds.query();
		
		var taskDefn = sc_ic_Factory.getWrapperClass(sc_ic.TASK_DEFN);
		
		while (tds.next())
			taskDefn.create(this._gr,tds);
			
		return this;
	},
	
	/**
	 * Copies questions from a source item to the variables of a catalog item
	 */
	_copyVariables: function(item) {
		
		//For each of the variables wrap and create from the question.
		var questGr = new GlideRecord(sc_ic.QUESTION);
		questGr.addQuery(sc_ic.ITEM_STAGING,item.getUniqueValue());
		questGr.orderBy(sc_ic.SECTION + "." + sc_ic.INDEX);
		questGr.orderBy(sc_ic.COLUMN + "." + sc_ic.INDEX);
		questGr.orderBy(sc_ic.ORDER);
		questGr.query();
		
		var lastColumn = null;
		var lastSection = null;
		var itemOption = sc_ic_Factory.getWrapperClass(sc_.ITEM_OPTION);
		var n = 0;
		while(questGr.next()) {
			var section = questGr.getValue(sc_ic.SECTION);
			var column = questGr.getValue(sc_ic.COLUMN);
			if (section != lastSection) {
				if (lastSection != null)
					itemOption.createContainerEnd(this._gr, n++);
				itemOption.createContainerStart(this._gr, n++, questGr[sc_ic.SECTION].label);		
				lastSection = section;
				lastColumn = column;
			}else if (column != lastColumn) {
				itemOption.createContainerSplit(this._gr, n++);		
				lastColumn = column;
			}
			questGr[sc_ic.ORDER] = n++;
			itemOption.create(this._gr, questGr);
		}
		if (lastSection != null)
			itemOption.createContainerEnd(this._gr,n++);
	},
	
    type: 'sc_ic_CatalogItem'
});

/**
 * Creates a regular Catalog Item from a Item Creator definition.
 *
 * Parameters: simpleItem - The GlideRecord of the Item to use as a base.
 * Returns: GlideRecord("sc_cat_item") that represents the new catalog item.
 */
sc_ic_CatalogItem.create = function(item) {
	if (item == null || item.getRowCount() == 0 || item.getTableName()+"" !== sc_ic.ITEM_STAGING)
		return null;
	
	var ci = new GlideRecord(sc_.CATALOG_ITEM);
	var catItem = sc_ic_Factory.wrap(ci);
	catItem._copyFields(item);
	ci.insert();
	catItem._copyTranslations(item);
	catItem._copyCategories(item);
	catItem._copyAttachments(item);
	catItem._copyApprovals(item);
	catItem._copyTasks(item);
	catItem._copyVariables(item);
	ci.update();
	return ci;
};