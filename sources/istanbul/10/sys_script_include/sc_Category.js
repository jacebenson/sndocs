var sc_Category = Class.create();
sc_Category.prototype = Object.extendsObject(sc_Base, {
    initialize: function(_gr,_gs) {
		sc_Base.prototype.initialize.call(this,_gr,_gs);
    },
	
	activate: function() {
		this._gr.active = true;
		this._gr.update();
	},
	
	deactivate: function() {
		this._gr.active = false;
		this._gr.update();
	},
	
	copyFields: function(source) {
		this._gr[sc_.PARENT] = source[sc_.PARENT];
		this._gr[sc_.CATALOG] = source[sc_.CATALOG];
		this._gr[sc_.DESCRIPTION] = source[sc_.DESCRIPTION];
	},
	
	updateFields: function(source) {
		this.copyFields(source);
		this._gr.update();
	},
	
	copyDesktopImage: function(catRequest) {
		this._deleteImages();
		this._copyImages(catRequest);
	},
	
	/**
	 * Deletes the desktop image related to this category
	 */
	_deleteImages: function() {
		if (JSUtil.nil(this._gr.getUniqueValue()))
			return;
		
		var att = new GlideRecord("sys_attachment");
		att.addQuery("file_name",sc_.HOMEPAGE_IMAGE);
		att.addQuery("table_sys_id","=",this._gr.getUniqueValue());
		att.query();
		
		if (att.getRowCount() > 0) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[_deleteImages] Removing " + att.getRowCount() + " image attachments from sc_category <" + this._gr.getUniqueValue() + ">");
			
			att.deleteMultiple();
		}
		return this;
	},
	
	/**
	 * Copies the desktop image record
	 */
	_copyImages: function(catRequest) {
		if (JSUtil.nil(catRequest.getUniqueValue()))
			return;
			
		GlideSysAttachment.copy(catRequest.getTableName(),catRequest.getUniqueValue(),this._gr.getTableName(),this._gr.getUniqueValue());
		// Updating the field name on sys_attachment
		var att = new GlideRecord("sys_attachment");
		att.addQuery("file_name","IN",[sc_.HOMEPAGE_IMAGE]);
		att.addQuery("table_sys_id","=",this._gr.getUniqueValue());
		att.query();
		while (att.next()) {			
			if(this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[_copyImages] Updating field name on attachment <" +att.getUniqueValue()+ ">");
			
			if (att.file_name+"" == sc_.HOMEPAGE_IMAGE) 
				att.file_name = sc_.HOMEPAGE_IMAGE;
			att.update();
		}
		return this;
	},
	
	canAddToItemDesigner: function() {
		if (!gs.hasRole(sc_.CATALOG_ADMIN))
			return false;
		
		if (!this._gr.active)
			return false;
		
		var categoryRequestGr = new GlideAggregate(sc_ic.CATEGORY_REQUEST);
		categoryRequestGr.addQuery(sc_.CATEGORY, this._gr.getUniqueValue());
		categoryRequestGr.addAggregate("COUNT");
		categoryRequestGr.query();
				
		if (categoryRequestGr.next() && categoryRequestGr.getAggregate("COUNT") > 0)
			return false;
		
		return true;
	},
	
	addToItemDesigner: function() {
		if (!gs.hasRole(sc_.CATALOG_ADMIN))
			return;

		sc_ic_Factory.getWrapperClass(sc_ic.CATEGORY_REQUEST).createFromCategory(this._gr);
	},
	
    type: 'sc_Category'
});

sc_Category.create = function(source) {
	if (source == null || source.getRowCount() == 0 || source.getTableName()+"" !== sc_ic.CATEGORY_REQUEST)
		return null;
	
	var catGr = new GlideRecord(sc_.CATEGORY);
	catGr[sc_.TITLE] = source[sc_.TITLE];
	var cat = sc_Factory.wrap(catGr);
	cat.copyFields(source);
	catGr.active = true;
	catGr.insert();
	
	return catGr;
};