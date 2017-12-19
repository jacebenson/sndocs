gs.include("PrototypeServer");


var ActionUtils = Class.create();

ActionUtils.prototype = {
   initialize : function() {
   },
   
   postInsert : function(/* GlideRecord */ gr) {
      if (gr.isActionAborted())
         return;
      
      var linkedM2MTable = action.get('sysparm_link_collection');
      if (linkedM2MTable)
         this._insertM2M(linkedM2MTable, gr.sys_id);
      
      var relationship = action.get('sysparm_collection_relationship');
      if (relationship) {
         var parentKey = action.get('sysparm_collectionID');
         var parentTable = action.get('sysparm_collection');
         var r = GlideRelationship.get(relationship);
         r.postInsert(parentTable, parentKey, current);
      }
   },
   
   _insertM2M : function(/* String */ table, /* String */ sys_id) {
      var fromRefName = action.get('sysparm_collection_key');
      if (!fromRefName)
         return;
      
      var fromRefValue = action.get('sysparm_collectionID');
      if (!fromRefValue)
         return;
      
      var newRefName = action.get('sysparm_collection_related_field');
      if (!newRefName )
         return;
      
      var gr = new GlideRecord(table);
      if (!gr.isValid())
         return;
      
      gr.initialize();
      gr.setValue(fromRefName, fromRefValue);
      gr.setValue(newRefName, sys_id);
      gr.insert();
   },
   
   convertListActions: function() {
      var convert = [ 'action_list_button', 'action_list_contextmenu', 'action_list_choice' ];
      this._convertActions(convert);
   },
   
   convertFormActions: function() {
      var convert = [ 'action_button', 'action_menu' ];
      this._convertActions(convert);
   },
   
   _convertActions: function(convert) {
      var gr = new GlideRecord('sys_script');
      
      gr.addQuery('when', convert);
      gr.query();
      while (gr.next()) {
         var id = gr.sys_id.toString();
         var action = this._initAction(gr);

		 // first delete sys_script record since we are inserting into another table 
		 gr.deleteRecord();
		  
         // insert or update the action record after the converted from
         // sys_script record has been purged
         action.insertOrUpdate('sys_id');
      }
   },
   
   _initAction : function(gr) {
      var action = new GlideRecord('sys_ui_action');
      action.newRecord();
      // use same sys_id as old script so that customers get a predictable sys_id
      // such that we can subequently ship updates to these things
      action.setNewGuidValue(gr.sys_id);
      action.table = gr.collection;
      action.condition = gr.condition;
      action.order = gr.order;
      action.active = gr.active;
      action.name = gr.name;
      action.action_name = gr.action_name;
      action.script = gr.script;
      this._prep(action, gr);
      return action;
   },
   
   _prep : function(action, gr) {
      if (gr.action_run_at == 'client') {
         action.client = true;
         action.onclick = gr.onclick;
      }
      
      if (gr.when == 'action_button')
         action.form_button = true;
      else if (gr.when == 'action_menu')
         action.form_context_menu = true;
      else if (gr.when == 'action_list_button')
         action.list_button = true;
      else if (gr.when == 'action_list_contextmenu')
         action.list_context_menu = true;
      else if (gr.when == 'action_list_choice')
         action.list_choice = true;
   },
   
   _isAction : function(when) {
      if (when == 'action')
         return false;
      
      when = when.substring(0, 6);
      gs.print('WHEN = ' + when);
      return when == 'action';
   },
   
   convertUnloads : function() {
      var ser =  new GlideRecordXMLSerializer();
      var gr = new GlideRecord('sys_update_xml');
      gr.addQuery('name', 'STARTSWITH', 'sys_script');
      gr.query();
      while (gr.next()) {
         var xml = gr.payload + '';
         var d = GlideXMLUtil.parse(xml, true);
         var node = d.getDocumentElement().getChildNodes().item(0);
         var s = node.getLocalName();
         if (!s)
            s = node.getNodeName();
         if (s != 'sys_script')
            continue; // not a script
         
         var script = new GlideRecord('sys_script');
         script.initialize();
         ser.deserializeFromElement(script, node);
         var when = script.when + '';
         if (!this._isAction(when)) {
            gs.print('Not updating ' + gr.name + ' since it is not an action script');
            continue;
         }
         var action = this._initAction(script);
         var newPayLoad = this._createPayload(action, ser);
         gr.payload = newPayLoad;
         var oldName = gr.name + '';
         gr.name = "sys_ui_action_" + action.sys_id;
         gr.update();
         gs.print('Updated ' + oldName + ' to ' + gr.name);
      }
   },
   
   _createPayload : function(action, ser) {
      var doc = GlideXMLUtil.newDocument('record_update');
      var root = doc.getDocumentElement();
      root.setAttribute('table', 'sys_ui_action');
      var e = doc.createElement('sys_ui_action');
      root.appendChild(e);
      e.setAttribute('action', 'INSERT_OR_UPDATE');
      ser.serializeIntoElement(action, e);
      return GlideXMLUtil.toString(doc);
   }
}