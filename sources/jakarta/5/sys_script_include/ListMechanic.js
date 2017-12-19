gs.include("PrototypeServer");

var ListMechanic = Class.create();

ListMechanic.prototype = {
	initialize: function() {
		this.viewName = "";
		this.parent =  "";
      this.parentID = "";
		this.relationship = "";
	},

	getList: function(tableName) {
		var sl = this._getSysList(tableName);
		var cls = sl.getListSet();
		this.applyRules(cls, tableName);
		var document =  cls.toXML();
		var e = document.getDocumentElement();
		var userList = "false";
		if (sl.isUserList())
			userList = "true";

		e.setAttribute("user_list", userList);

		e.setAttribute('table.wrap', gs.getPreference('table.wrap'));
		e.setAttribute('table.compact', gs.getPreference('table.compact'));
		e.setAttribute('table.highlighting', gs.getPreference('table.highlighting'));
		e.setAttribute('list_edit_enable', gs.getPreference('list_edit_enable'));
		e.setAttribute('list_edit_double', gs.getPreference('list_edit_double'));
		e.setAttribute('field_style_circles', gs.getPreference('glide.ui.field_style_circles', 'true'));

		answer = document;
		return document;
	},

	applyRules: function(cls, tableName) {
		var avail = cls.getColumns();
		var sm = GlideSecurityManager.get();
		for (var i = 0; i < avail.getSize();) {
			var c = avail.getChoice(i);
			var name = c.getValue();
			var url = "record/" + tableName + '.' + name + "/add_to_list";
			var canAdd = sm.hasRightsTo(url, null);
			if (canAdd) {
				i++;
				continue;
			}
			avail.remove(i);
		}
	},

	setViewName: function(viewName) {
		this.viewName = viewName;
	},

	setParent: function(parent) {
		this.parent = parent;
	},

   setParentID: function(parentID) {
      this.parentID = parentID;
   },

	setRelationship: function(relationship) {
		this.relationship = relationship;
	},

	setCompact: function(compact) {
		if (!compact)
			compact = 'false';

		session.getUser().setPreference('table.compact', compact);
	},

	setHighlighting: function(highlighting) {
		if (!highlighting)
			highlighting = 'false';

		session.getUser().setPreference('table.highlighting', highlighting);
	},

	setWrap: function(wrap) {
		if (!wrap)
			wrap = 'false';

		session.getUser().setPreference('table.wrap', wrap);
	},

	setListEditEnable: function(flag) {
		if ( !flag )  // if not defined, set to false
			flag = 'false';
		session.getUser().setPreference('list_edit_enable', flag);
	},

	setListEditDouble: function(flag) {
		if ( !flag )  // if not defined set to false
			flag = 'false';
		session.getUser().setPreference('list_edit_double', flag);
	},

	setFieldStyleCircles: function(flag) {
		if (!flag)
			flag = 'false';

		session.getUser().setPreference('glide.ui.field_style_circles', flag);
	},

	saveList: function(tableName, fields) {
		var sl = this._getSysList(tableName);
		sl.saveForUser(fields);
	},

	reset: function(tableName) {
		var sl = this._getSysList(tableName);
		sl.saveForUser("");
	},

	_getSysList: function(tableName) {
		var sl = new GlideSysList(tableName);
		sl.setRelatedParentName(this.parent);
      sl.setRelatedParentID(this.parentID);
		sl.setRelationshipID(this.relationship);
		sl.setViewName(this.viewName);
		return sl;
	},

	type: 'ListMechanic'
};