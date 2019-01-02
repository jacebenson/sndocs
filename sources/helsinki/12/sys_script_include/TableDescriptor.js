gs.include("PrototypeServer");

var TableDescriptor = Class.create();

TableDescriptor.prototype = {

   initialize : function(name, label) {
      this.tableName = name;
      this.tableLabel = label;
      this.extendsName = '';
      this.attributes = '';
      this.read_roles = '';
      this.write_roles = '';
      this.create_roles = '';
      this.delete_roles = '';
      this.fields = new Array();
      this.fieldsSeen = new Object();
   },

   setExtends : function(name) {
      this.extendsName = name;
   },

   setAttributes : function(attrs) {
      this.attributes = attrs;
   },

   setRoles : function(td) {
      var tableName = td.getName();
      var d = new GlideRecord("sys_dictionary");
      d.addQuery("name", tableName);
      d.addNullQuery("element");
      d.query();
      if (!d.next())
         return;

      this.read_roles = d.read_roles.toString();
      this.write_roles = d.write_roles.toString();
      this.create_roles = d.create_roles.toString();
      this.delete_roles = d.delete_roles.toString();
   },

   create: function() {
      var doc = new GlideXMLDocument('database');
      var e = doc.createElement('element');
      e.setAttribute('name', this.tableName);
      e.setAttribute('label', this.tableLabel);
      e.setAttribute('type', 'collection');
      if (this.read_roles)
         e.setAttribute('read_roles', this.read_roles);
      if (this.write_roles)
         e.setAttribute('write_roles', this.write_roles);
      if (this.create_roles)
         e.setAttribute('create_roles', this.create_roles);
      if (this.delete_roles)
         e.setAttribute('delete_roles', this.delete_roles);
      if (this.attributes)
         e.setAttribute('attributes', this.attributes);

      if (this.extendsName != '')
         e.setAttribute("extends", this.extendsName);
    	
      doc.setCurrent(e);
      for (var i = 0; i < this.fields.length; i++) {
         var fd = this.fields[i];
         fd.toXML(doc);
      }

      var boot = new GlideBootstrap(doc.getDocument());
      boot.upgradeTables();
   },

	copyIndexes: function(source, target) {
      var td = new GlideTableDescriptor(source);
      td.getSchema();
      var toCreate = new Packages.java.util.ArrayList();
      var indexes = td.getIndexDescriptors();
      for (var iter = indexes.values().iterator(); iter.hasNext(); ) {
         var idx = iter.next();
         if (idx.isPrimary())
            continue;
			
         var flds = idx.getFields();
         var idxname = idx.getName();
         var parts = idxname.split("_");
		 var unique = idx.isUnique();

         idxname = parts[parts.length-1];
         var idx1 = new GlideIndexDescriptor(target, idxname, flds);
         idx1.setUnique(unique);
         toCreate.add(idx1);
      }

      td.close();

      var dbi = new GlideDBConfiguration.getDBI(target);
      new GlideDBIndex(dbi).create(target, toCreate);
      dbi.close();
   },

   addField: function(fieldDescriptor) {
      var fn = fieldDescriptor.getName();
      if (this.fieldsSeen[fn])
         return;

      this.fieldsSeen[fn] = true;
      this.fields.push(fieldDescriptor);
   },

   // Copy the attributes from current to new table
   copyAttributes : function(td) {
      var attrs = td.getED().serializeAttributes();
      if (!attrs)
         return;

      if (!td.getED().hasAttribute("no_update")) {
         this.setAttributes(attrs);
         return;
      }

      if (!td.getElementDescriptor('sys_updated_on')) {
         this.setAttributes(attrs);
         return;
      }

      this.setAttributes(this.removeAttr(attrs, 'no_update'));
         
   },

   removeAttr: function(attrs, attr) {
      var list = attrs.split(',');
      var answer = new Array();
      for (var i = 0; i < list.length; i++) {
         if (!(list[i].indexOf(attr) == 0))
            answer.push(list[i]);
      }
      
      return answer.join(",");
   },

   // Copy the fields from current to new table
   setFields : function(tblGr) {
      var fields = tblGr.getFields();
      for (var i = 0; i < fields.size(); i++) 
         this._processField(fields.get(i), tblGr.getTableName());
   },

   // Get all the details for a field in the current table
   _processField : function (fldObj, targetTable) {
      this.currentFieldObject = fldObj;
      var fieldTable = this.currentFieldObject.getTableName();
      if (fieldTable != targetTable)
         return;
     
      if (this._ignoreField(this.currentFieldObject.getName()))
         return;

      var dict = new GlideRecord('sys_dictionary');
      dict.addQuery('name', fieldTable);
      dict.addQuery('element', this.currentFieldObject.getName());
      dict.query();
      if (!dict.hasNext())
         return;

      dict.next();
      if (this.displayName == this.currentFieldObject.getName())
         dict.display = true;

      var ca = new FieldDescriptor(this.currentFieldObject.getName());
      ca.setPrototype(dict);

      ca.setField('label', this.currentFieldObject.sys_meta.label);
      ca.setField('plural', this.currentFieldObject.sys_meta.plural);
      this._setReference(ca);
      if (this.currentFieldObject.getED().getChoice()) {
         ca.setChoiceTable(targetTable);
         ca.setChoiceField(this.currentFieldObject.getName());
      }
      this.addField(ca);
   },

   // Ignore the sys_ fields that are created automatically
   _ignoreField : function (fieldName) {
      if (fieldName == 'sys_updated_by')
         return true;
     
      if (fieldName == 'sys_updated_on')
         return true;
     
      if (fieldName == 'sys_created_by')
         return true;
     
      if (fieldName == 'sys_created_on')
         return true;
     
      if (fieldName == 'sys_mod_count')
         return true;
  
      return false;
   },
	

   _setReference : function (ca) {
      var ref = this.currentFieldObject.getED().getReference();
      if (ref == null || ref == '')
         return;
     
      ca.setReferenceTable(ref);
   },

   _z : function() {
      return "TableDescriptor";
   }

};