var sc_ic_BaseTypeDefnStaging = Class.create();
sc_ic_BaseTypeDefnStaging.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
		
		//This should be overloaded in sub-classes
		this._toDraft = {};
    },
	
	/**
	 * Sets aa Type definition to draft and increments version number.
	 * This will only set the approval definition to draft if one of the trigger fields is changed.
	 */
	setDraft: function() {
		for (var fldName in this._toDraft) {
			if ((this._gr[fldName].changes() && this._toDraft[fldName])) {
				this._gr.state = sc_ic.DRAFT;
				this._gr.version = parseInt(this._gr.version+"") + 1;
				this._gr.active = true;
				
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[setDraft] Draft: " + this._gr.name + " <" + this._gr.getUniqueValue() + ">");
				
				return this;
			}
		}
		
		return this;
	},
	
	/**
	 * Wrapper for setDraft which updates the record
	 */
	draft: function() {
		this.setDraft();
		this._gr.update();
	},
	
	/**
	 * Expires the current record
	 */
	setExpired: function() {
	    this._gr[sc_ic.STATE] = sc_ic.EXPIRED;
		this._gr[sc_.ACTIVE] = false;
		return this;
	},
	
	/**
	 * Wrapper for setExpired which updates the record
	 */
	expire: function() {
	    this.setExpired();
		this._gr.update();
	},
	
	/**
	 * Publishes the glide record to a provided table.
	 */
	_publishToTable: function(tableName) {
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_publishToTable] Publishing: " + this._gr.name + " <"+this._gr.getUniqueValue()+"> to table " + tableName);
		
		// Expire the currently published definition
	    if (JSUtil.notNil(this._gr[tableName])) {
			var pubDefn = new GlideRecord(tableName);
			if (pubDefn.get(this._gr[tableName])) {
				
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[publish] Expiring Published Def: " + pubDefn.name + " <"+pubDefn.getUniqueValue()+">");
				
				sc_ic_Factory.wrap(pubDefn).expire();
			}
		}
		
		// Create the new definition
		var newDefn = sc_ic_Factory.getWrapperClass(tableName).create(this._gr);
		
		// Update the current staged definition with newly published item.
		// The field linking to the published item must be named the same as the publish table
		this._gr[tableName] = newDefn.getUniqueValue();
		this._gr[sc_ic.STATE] = sc_ic.PUBLISHED;
		this._enableQuietUpdate();
		this._gr.update();
		gs.updateSave(this._gr);
		this._disableQuietUpdate();
	},
	
    type: 'sc_ic_BaseTypeDefnStaging'
});