gs.include("PrototypeServer");

var SecurityMechanic = Class.create();

SecurityMechanic.prototype = {
  RULE_NAME : 'System Generated Rule',

  initialize: function(tableName, fieldName, operation) {
     this.tableName = tableName;
     this.fieldName = fieldName;
     this.operation = operation;
  },

  getList: function() {
    if (!this.trusted())
       return;

    var cls = new GlideChoiceListSet();
    var available = cls.getColumns(); 
    var selected = cls.getSelected();
    var gr = new GlideRecord('sys_user_role');
    gr.orderBy('name');
    gr.query();
    while (gr.next()) {
       available.add(gr.sys_id, gr.name);
    }
    this.mergeExisting(available, selected);
    var document =  cls.toXML(); 
    
    var e = document.getDocumentElement(); 
    this.addWarnings(e);

    answer = document;
    return document;
  },

  addWarnings : function(e) {
    var gr = new GlideRecord('sys_security_acl');
    gr.addQuery('name', this.tableName);
    gr.addQuery('operation', this.operation);
    gr.query();
    if (gr.next()) {
       e.setAttribute('row_rule', 'true');
    } else
       e.setAttribute('row_rule', 'false');

    gr = new GlideRecord('sys_security_acl');
    gr.addQuery('name', this.tableName + '.' + this.fieldName);
    gr.addQuery('operation', this.operation);
    gr.query();
    var hasOther = 'false';
    while (gr.next()) {
       if (gr.description != this.RULE_NAME && !this.canUsurp(gr))
           hasOther = 'true';
    } 
    e.setAttribute('field_rule', hasOther);
  },

  getRule : function() {
     var gr = new GlideRecord('sys_security_acl');
     gr.addQuery('name', this.tableName + '.' + this.fieldName);
     gr.addQuery('operation', this.operation);
     gr.addQuery('description', this.RULE_NAME);
     gr.query();
     gr.next();
     if (!gr.isValidRecord()) {
        var gr2 = new GlideRecord('sys_security_acl');
        gr2.addQuery('name', this.tableName + '.' + this.fieldName);
        gr2.addQuery('operation', this.operation);
        gr2.query();
        gr2.next();
        if (this.canUsurp(gr2))
           return gr2;
     }
     return gr;
  },

  canUsurp : function(gr) {
     return gr.getRowCount() == 1 && gr.script.nil() && gr.condition.nil();
  },

  mergeExisting : function(available, selected) {
     var gr = this.getRule();
     if (!gr.isValidRecord())
        return;

     var roles = new GlideRecord('sys_security_acl_role');
     roles.addQuery('sys_security_acl', gr.sys_id);
     roles.orderBy('sys_user_role.name');
     roles.query();
     while (roles.next()) {
         var choice = available.removeChoice(roles.sys_user_role);
         selected.add(choice);
     }

  },

  saveList: function(fields) {
    if (!this.trusted())
       return;

    var a = fields.split(',');
    var rule = this.getRule();
    if (!rule.isValidRecord()) {
        rule.initialize();
        rule.name=this.tableName + '.' + this.fieldName;
        rule.description = this.RULE_NAME;
        rule.operation = this.operation;
        var rule_id = rule.insert();
    } else
        var rule_id = rule.sys_id + '';


    var gr = new GlideRecord('sys_security_acl_role');
    gr.addQuery('sys_security_acl', rule_id);
    gr.deleteMultiple();
    gr.initialize();
    for (var i =0; i < a.length; i++) {
       gr.sys_user_role = a[i];
       gr.sys_security_acl = rule_id;
       gr.insert();
    }
  },

  trusted: function() {
    return gs.hasRole('admin') || !RhinoEnvironment.useSandbox();
  },

  reset: function(tableName) {
    GlideCacheManager.flush("syscache_realform");
  }


};

















