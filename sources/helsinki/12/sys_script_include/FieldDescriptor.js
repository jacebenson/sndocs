gs.include("PrototypeServer");

var FieldDescriptor = Class.create();

FieldDescriptor.prototype = {

   initialize : function(name) {
      this.fieldName = name;
      this._setIgnoreList();
      this._setFieldNames();
   },

   _setIgnoreList : function() {
      this.ignoreList = new Object();
      this.ignoreList['name'] = true;
      this.ignoreList['element'] = true;
      this.ignoreList['array'] = true;
   },

   _setFieldNames : function() {
      this.fieldList = new Object();
      this.booleanList = new Object();
      var dict = new GlideRecord('sys_dictionary');
      dict.initialize();
      var fields = dict.getFields();
      for (var i = 0; i < fields.size(); i++) {
         var ge = fields.get(i);
         var fn = ge.getName();
         if (this.ignoreList[fn])
            continue;

         this.fieldList[fn] = "NULL";
         if (ge.getED().isBoolean())
            this.booleanList[fn] = true;
      }
      this.fieldList['label'] = "NULL";
      this.fieldList['plural'] = "NULL";
   },

   // A sys_dictionary record that provides the prototype for a new field
   setPrototype : function(r) {
      for (var fieldName in this.fieldList) {
         if (this.ignoreList[fieldName])
            continue;

         var v = r.getValue(fieldName);
         if (this.booleanList[fieldName]) {
            if (v == '0')
               v = 'false';
            else if (v == '1')
               v = 'true';
         }
         this.fieldList[fieldName] = v;
      }
   },

   setChoiceTable : function(tableName) {
      this.fieldList['choice_table'] = tableName;
   },

   setChoiceField : function(fieldName) {
      this.fieldList['choice_field'] = fieldName;
   },

   setReferenceTable : function(tableName) {
      this.fieldList['reference'] = tableName;
   },

   setField : function(name, value) {
      if (this.ignoreList[name]) {
         gs.log("Setting value of " + name + " to " + value + " has been ignored");
         return;
      }
      
      this.fieldList[name] = value;
   },

   getField: function(name) {
      return this.fieldList[name];
   },

   getName : function() {
      return this.fieldName;
   },

   toXML: function(doc) {
        this._clearDefaults();
    	var e = doc.createElement('element');
    	doc.setCurrent(e);
        doc.setAttribute('name', this.getName());
        for (var fieldName in this.fieldList) {
           var value = this.getField(fieldName);
           if (fieldName == 'internal_type')
              fieldName = 'type';

    	   doc.setAttribute(fieldName, value);
        }
        doc.pop();
   },

   _ignoreValue : function(fn, fv) {
        if (!fv)
           return true;

        if (fv == "NULL")
           return true;
           
        if (fv == "")
           return true;
           
        if (fv == "false")
           return true;

        return false;
   },

   _z : function() {
      return "FieldDescriptor";
   }

};
