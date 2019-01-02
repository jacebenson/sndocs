var LabelsAjax = Class.create();

LabelsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   process: function() {
      if (this.getType() == "create")
         this.createLabel();
      else if (this.getType() == "get")
         this.getLabels();
      else if (this.getType() == "delete")
         this.deleteLabel();
      else if (this.getType() == "removeByName")
         this.removeByName();
	  else if (this.getType() == "remove")
		 this.remove();
	  else if (this.getType() == "checkNameCollision")
		 this.checkNameCollision();
	  else if (this.getType() == "getLabelInfo")
		 this.getLabelInfo();
	  else if (this.getType() == "processLabel")
		 this.processLabel();
   },
   
   createLabel: function() {
      var view = this.getParameter("sysparm_view");
      var sysIds = this.getValue();
      if (!sysIds)
         return;
      
      sysIds = sysIds.split(',');
      for (var i = 0; i < sysIds.length; i++)
         GlideLabelUtil.assignLabel(this.getName(), sysIds[i], this.getChars(), view);
   },
   
   getLabels: function() {
      var ids = this.getValue().split(",");
      for(var i = 0; i < ids.length; i++) {
         var labelId = ids[i];
         this.getSingleLabel(labelId);
      }
   },
   
   getSingleLabel: function(labelId) {
      var labelEntry = this._getLabelRecord("label", labelId);
      if (!labelEntry)
         return;
      
      var LabelUtil = GlideLabelUtil;
      var max = LabelUtil.getMaxEntries(labelEntry);
      var entries = LabelUtil.getLabelEntries(labelEntry);
      
      var labelRoot = this.getDocument().createElement("label");
      labelRoot.setAttribute("id", labelId);
      
      while (entries != null && entries.next() && max > 0) {
         if (!LabelUtil.authorized(labelEntry, entries) || !LabelUtil.canRead(entries))
            continue;
         
         var title = LabelUtil.getTitleFromGlideRecord(entries);
         if (gs.nil(title))
            continue;
         
         var item = this.getDocument().createElement("item");
         item.setAttribute("name", entries.sys_id);
         item.setAttribute("title", title);
         item.setAttribute("image", LabelUtil.getImage(entries));
         item.setAttribute("url", LabelUtil.getURL(entries));
         item.setAttribute("style", LabelUtil.getStyle(entries));
         item.setAttribute("read", LabelUtil.labelRead(entries)? "true" : "false");
         
         labelRoot.appendChild(item);
         max--;
      }
      
      this.getRootElement().appendChild(labelRoot);
   },
   
   deleteLabel: function() {
      var appID = this.getName();
      
      var sysIds = this.getValue();
      if (!sysIds)
         return;
      
      sysIds = sysIds.split(',');
      for (var i = 0; i < sysIds.length; i++) {
         var labelEntry = this._getLabelEntry(sysIds[i]);
         if (labelEntry) {
            if (!appID)
               appID = labelEntry.label + '';
            
            labelEntry.deleteRecord();
         }
      }
      
      if (appID)
         this.getRootElement().setAttribute('sysparm_name', appID);
   },
   
   removeByName: function() {
      var labelName = this.getName();
      var labelID = this._getUsersLabelIDFromName(labelName);
      this._remove(labelID);
   },

   remove: function () {
      var labelID = this.getName();
      this._remove(labelID);
   },

   _remove: function (labelID) {
      this.getRootElement().setAttribute('sysparm_name', '');
      if (!labelID)
         return;
          
      this.getRootElement().setAttribute('sysparm_name', labelID);
      var sysIds = this.getValue() + '';
      if (!sysIds)
         return;
      
      sysIds = sysIds.split(',');
      var gr = new GlideRecord('label_entry');
      gr.addQuery('label', labelID);
      gr.addQuery('table_key', sysIds);
      gr.query();
      while (gr.next()) {
         gr.deleteRecord();
      }
   },
	
   checkNameCollision: function() {
	  var label = {name: this.getParameter("sysparm_label_name"), 
						 viewable_by: this.getParameter("sysparm_viewable_by"),
						 sys_id: this.getParameter("sysparm_label_id"), 
						 owner: gs.getUserID()};
	  var msg = (new LabelCollision().validateAndProcessChange(null, label));
	  var result = this.newItem("result");
	  result.setAttribute("message", msg);
   },
	
   getLabelInfo: function() {
      var labelRecord = new GlideRecord("label");
      labelRecord.get(this.getParameter("sysparm_label_id"));

      var labelName = this.newItem("labelName");
      labelName.setAttribute("name", labelRecord.name);
	   
	  var labelViewableBy = this.newItem("labelViewableBy");
	  labelViewableBy.setAttribute("viewable_by", labelRecord.viewable_by);
	  if (labelRecord.viewable_by != "groups and users")
		  return;
	  
	  this._addAudience(labelRecord);	
   },
	
   processLabel: function() {
	  var labelId = this.getParameter("sysparm_label_id");
	  var labelName = this.getParameter("sysparm_label_name");
	  var viewableBy = this.getParameter("sysparm_viewable_by");
	  var groupList = this.getParameter("sysparm_group_list");
	  var userList = this.getParameter("sysparm_user_list");
	  var sysIds = this.getParameter("sysparm_target_ids");
	  var table = this.getParameter("sysparm_table");
	  
      if (labelId == "null") {
	     labelId = GlideLabelUtil.createSharedLabel(labelName, viewableBy, groupList, userList);
		 sysIds = sysIds.split(",");
	     for (var i = 0; i < sysIds.length; i++)
		    GlideLabelUtil.assign(table, sysIds[i], labelId);
      } else {
	     var labelRecord = new GlideRecord("label");
	     if (labelRecord.get(labelId)) {
		    labelRecord.name = labelName;
		    labelRecord.viewable_by = viewableBy;
		    labelRecord.group_list = groupList;
		    labelRecord.user_list = userList;
		    labelRecord.update();
	     }
      }
   },
   
   _getLabelIDFromName: function(labelName) {
      var gr = new GlideRecord("label");
      gr.addQuery("name", labelName);
      gr.query();
      if (gr.next())
         return gr.sys_id + '';

      return null;
   },

   _getUsersLabelIDFromName: function(labelName) {
      var gr = new GlideRecord("label");
      gr.addQuery("name", labelName);
      gr.query();
      while (gr.next()) {
         if (this._hasPermission(gr))
            return gr.sys_id + '';
      }
      return null;
   },

   _hasPermission: function(gr) {
      var currentUser = gs.getUserID();
      return ((gr.viewable_by.equals("me") && gr.owner.equals(currentUser))
         || (gr.viewable_by.equals("groups and users") && (gr.user_list.indexOf(currentUser) > -1))
         || (gr.viewable_by.equals("everyone") || gs.hasRole("tags_admin")))
   },

   _getLabelEntry: function(id) {
      var gr = new GlideRecord("label_entry");
      gr.addQuery("sys_id", id);
      gr.query();
      if (gr.next())
         return gr;
      
      return null;
   },
   
   _getLabelRecord: function(tableName, labelId) {
      var gr = new GlideRecord(tableName);
      gr.addQuery("sys_id", labelId);
      gr.query();
      if (gr.next())
         return gr;
      
      var index = labelId.indexOf('(');
      if (labelId > 0)
         labelId = labelId.substring(0, index - 1);
      
      gr.initialize();
      gr.addQuery("name", labelId);
      gr.query();
      if (gr.next())
         return gr;
      
      return;
   },
	
   _addAudience: function(labelRecord) {
      var groupIds = labelRecord.group_list;
	  if (groupIds) {
		 groupIds = groupIds.split(",");
	     var groups = new GlideRecord("sys_user_group");
		 groups.addQuery("sys_id", "IN", groupIds);
		 groups.query();
		 while (groups.next()) {
		    var group = this.newItem("group");
		    group.setAttribute("name", groups.name);
			group.setAttribute("sys_id", groups.sys_id);
		 }
	  }
	   
	  var userIds = labelRecord.user_list;
	  if (userIds) {
		 userIds = userIds.split(",");
	     var users = new GlideRecord("sys_user");
		 users.addQuery("sys_id", "IN", userIds);
		 users.query();
		 while (users.next()) {
		    var user = this.newItem("user");
			user.setAttribute("name", users.name);
			user.setAttribute("sys_id", users.sys_id);
		 }
	  }
   },
   
   type: "LabelsAjax"
});