gs.include("PrototypeServer");

var RelationshipAuditor = Class.create();

RelationshipAuditor.prototype = {
  initialize : function() {
  },

  audit : function(gr, action) {
    if (!this._setup(gr, action))
        return;

    if (action == 'insert')
      this._auditInsert(gr);
    else if (action == 'delete')
      this._auditDelete(gr);
    else if (action == 'update') {
      this._auditInsert(gr);
      if (this._setup(previous))
        this._auditDelete(previous);
    }
  },
  
  _setup : function(gr, action) {  
    var tgr = new GlideRecord('cmdb_ci');
    var tgr2 = new GlideRecord('cmdb_ci');
    if (gr.instanceOf('cmdb_rel_ci')) {            
      if (gr.parent.nil() || gr.child.nil() || !tgr.get(gr.parent) || !tgr2.get(gr.child))
         return false;
         
      if (tgr.sys_class_name.nil() || tgr2.sys_class_name.nil())
         return false;
      
      if(action == 'update' && !gr.parent.changes() && !gr.child.changes() && !gr.type.changes())
         return false;
   
      this.parent_auditor = new GlideAuditor(tgr.sys_class_name, gr.parent);
      this.child_auditor = new GlideAuditor(tgr2.sys_class_name, gr.child);               
      var dn = 'cmdb_rel_type';
      var reason = 'CI Relationship Change';
    } else if (gr.instanceOf('cmdb_rel_person')) {
      if (gr.ci.nil() || !tgr.get(gr.ci) || gr.user.nil())
        return false;
      
      if (tgr.sys_class_name.nil())
         return false;      

      this.parent_auditor = new GlideAuditor(tgr.sys_class_name, gr.ci);
      this.child_auditor = new GlideAuditor('sys_user', gr.user);
      var dn = 'cmdb_rel_user_type';
      var reason = 'User Relationship Change';
    } else if (gr.instanceOf('cmdb_rel_group')) {
      if (gr.ci.nil() || !tgr.get(gr.ci) || gr.group.nil())
        return false;
      
      if (tgr.sys_class_name.nil())
         return false;

      this.parent_auditor = new GlideAuditor(tgr.sys_class_name, gr.ci);
      this.child_auditor = new GlideAuditor('sys_user_group', gr.group);
      var dn = 'cmdb_rel_group_type';
      var reason = 'Group Relationship Change';
    }

    this.parent_auditor.setReason(reason);
    this.child_auditor.setReason(reason);
    var type = new GlideRecord(dn);
    type.get(gr.type);
    this.parent_descriptor = type.getValue('parent_descriptor');
    this.child_descriptor = type.getValue('child_descriptor');
    if (typeof(g_rel_audit_cp) == 'undefined')
      g_rel_audit_cp = GlideCounter.next('internal_checkpoint');

    return true;
  },

  _auditInsert : function(gr) {
    if (gr.instanceOf('cmdb_rel_ci'))
       this._auditCIInsert(gr);
    else if (gr.instanceOf('cmdb_rel_person'))
       this._auditUserInsert(gr);
    else if (gr.instanceOf('cmdb_rel_group'))
       this._auditGroupInsert(gr);
  },

  _auditDelete : function(gr) {
    if (gr.instanceOf('cmdb_rel_ci'))
       this._auditCIDelete(gr);
    else if (gr.instanceOf('cmdb_rel_person'))
       this._auditUserDelete(gr);
    else if (gr.instanceOf('cmdb_rel_group'))
       this._auditGroupDelete(gr);
  }, 

  _auditGroupInsert : function(gr) {
	var modCount = gr.ci.sys_mod_count == 0 ? 1 : gr.ci.sys_mod_count;
    this.parent_auditor.auditField(null, modCount, g_rel_audit_cp, this.parent_descriptor, '(relationship added)', gr.group.getDisplayValue());
	modCount = gr.group.sys_mod_count == 0 ? 1 : gr.group.sys_mod_count;
    this.child_auditor.auditField(null, modCount, g_rel_audit_cp, this.child_descriptor, '(relationship added)', gr.ci.getDisplayValue());
  },

  _auditGroupDelete : function(gr) {
	var modCount = gr.ci.sys_mod_count == 0 ? 1 : gr.ci.sys_mod_count;
    this.parent_auditor.auditField(null, modCount, g_rel_audit_cp, this.parent_descriptor, gr.group.getDisplayValue(), '(relationship removed)');
	modCount = gr.group.sys_mod_count == 0 ? 1 : gr.group.sys_mod_count;
    this.child_auditor.auditField(null, modCount, g_rel_audit_cp, this.child_descriptor, gr.ci.getDisplayValue(), '(relationship removed)');
  },

  _auditUserInsert : function(gr) {
	var modCount = gr.ci.sys_mod_count == 0 ? 1 : gr.ci.sys_mod_count;
    this.parent_auditor.auditField(null, modCount, g_rel_audit_cp, this.parent_descriptor, '(relationship added)', gr.user.getDisplayValue());
	modCount = gr.user.sys_mod_count == 0 ? 1 : gr.user.sys_mod_count;
    this.child_auditor.auditField(null, modCount, g_rel_audit_cp, this.child_descriptor, '(relationship added)', gr.ci.getDisplayValue());
  },

  _auditUserDelete : function(gr) {
	var modCount = gr.ci.sys_mod_count == 0 ? 1 : gr.ci.sys_mod_count;
    this.parent_auditor.auditField(null, modCount, g_rel_audit_cp, this.parent_descriptor, gr.user.getDisplayValue(), '(relationship removed)');
	modCount = gr.user.sys_mod_count == 0 ? 1 : gr.user.sys_mod_count;
    this.child_auditor.auditField(null, modCount, g_rel_audit_cp, this.child_descriptor, gr.ci.getDisplayValue(), '(relationship removed)');
  },


  _auditCIInsert : function(gr) {
	var modCount = gr.parent.sys_mod_count == 0 ? 1 : gr.parent.sys_mod_count;
    this.parent_auditor.auditField(null, modCount, g_rel_audit_cp, this.parent_descriptor, '(relationship added)', gr.child.getDisplayValue());
	modCount = gr.child.sys_mod_count == 0 ? 1 : gr.child.sys_mod_count;
    this.child_auditor.auditField(null, modCount, g_rel_audit_cp, this.child_descriptor, '(relationship added)', gr.parent.getDisplayValue());
  },

  _auditCIDelete : function(gr) {
	var modCount = gr.parent.sys_mod_count == 0 ? 1 : gr.parent.sys_mod_count;
    this.parent_auditor.auditField(null, modCount, g_rel_audit_cp, this.parent_descriptor, gr.child.getDisplayValue(), '(relationship removed)');
	modCount = gr.child.sys_mod_count == 0 ? 1 : gr.child.sys_mod_count;
    this.child_auditor.auditField(null, modCount, g_rel_audit_cp, this.child_descriptor, gr.parent.getDisplayValue(), '(relationship removed)');
  },

}