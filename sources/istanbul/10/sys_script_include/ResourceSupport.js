gs.include("PrototypeServer");
gs.include("RoleSupport");

var ResourceSupport = Class.create();

ResourceSupport.prototype = {
	initialize : function() {
		this.support = new RoleSupport();
		// init our object ID
		var gr = new GlideRecord('sys_security_type');
		gr.addQuery('name', 'record');
		gr.query();
		if (gr.next())
			this.objectID = gr.sys_id;
		else {
			gr.initialize();
			gr.name = 'record';
			this.objectID = gr.insert();
		}
		this.operation_read = this.getOperation('read');
		this.operation_write = this.getOperation('write');
		this.operation_delete = this.getOperation('delete');
		this.operation_create = this.getOperation('create');
	},

	getOperation : function (opName) {
		var gr = new GlideRecord('sys_security_operation');
		gr.addQuery('name', opName);
		gr.query();
		if (gr.next())
			return gr.sys_id;
		else {
			gr.initialize();
			gr.name = opName;
			return gr.insert();
		}

	},

        buildTableResources : function(tableName) {
                var gr = new GlideRecord('sys_dictionary');
                gr.addQuery('name', tableName);
		gr.query();
		while (gr.next()) {
			this.process(gr);
		}
        },

	buildResources : function() {
		var gr = new GlideRecord('sys_dictionary');
		gr.query();
		while (gr.next()) {
			this.process(gr);
		}
	},

	process : function(gr) {
		this.addACL(gr.name, gr.element, this.operation_read, gr.read_roles);
		this.addACL(gr.name, gr.element, this.operation_write, gr.write_roles);
		this.addACL(gr.name, gr.element, this.operation_delete, gr.delete_roles);
		this.addACL(gr.name, gr.element, this.operation_create, gr.create_roles);
	},

	addACL : function(tableName, fieldName, operation, roles) {
	
		if (roles == '' || roles == 'undefined' || roles == null)
			return;
		var id;
                var suffix = '.*';
                // property is set by the com.glide.security.strict_read_roles plugin
                var useStrictReadRoles = gs.getProperty('glide.security.strict_read_roles', 'false');
                // old style create and delete rules are actually row rules
                if (operation == this.operation_delete ||
                    operation == this.operation_create ||
                    (useStrictReadRoles == 'true' && operation == this.operation_read))
                        suffix = '';

                // all ts_index_#_# are row rules
                if (tableName.startsWith('ts_index_'))
                        suffix = '';

		if (fieldName == '' || fieldName == null)
			id = tableName + suffix;
		else
			id = tableName + '.' + fieldName;
		
		var scope = new GlideRecord(tableName).getTableScopeId();
		var aclID = this._createACLRecord(operation, id, roles, scope);
		this._createACLRoleRecord(aclID, roles, scope);
	},

	// create ACL records uniquely
	_createACLRecord : function(operation, id, roles, scope) {
	    // check if roles contains maint
	    // if true set admin override false
	    var aov = true;
	    if(roles.indexOf("maint") > -1 || roles.indexOf("nobody") > -1)
		aov = false;

	    var acl = new GlideRecord('sys_security_acl');
	    acl.addQuery("type", this.objectID);
	    acl.addQuery("operation", operation);
	    acl.addQuery("name", id);
	    acl.addQuery("admin_overrides", aov);
	    acl.addEncodedQuery("scriptISEMPTY^conditionISEMPTY");
	    acl.query();
	    if (acl.next()) {
		return acl.sys_id;
	    } else {
		acl.initialize();
		acl.type = this.objectID;
		acl.operation = operation;
		acl.name = id;
		acl.admin_overrides = aov;
		if (typeof scope != 'undefined' && acl.isValidField('sys_scope'))
			acl.sys_scope = scope;	
		return acl.insert();
	    }
	},

	// Create ACL Role records uniquely (also)
	_createACLRoleRecord : function(aclID, roles, scope) {
	    var work = roles + '';
	    var ra = work.split(',');
	    for (var x=0; x < ra.length; x++) {
		var thisRole = ra[x];
		var roleID = this.support.map(thisRole, scope);
		var aclr = new GlideRecord('sys_security_acl_role');
		aclr.addQuery('sys_security_acl', aclID);
		aclr.addQuery('sys_user_role', roleID);
		aclr.query();
		if (!aclr.next()) {
		    aclr.initialize();
		    aclr.sys_security_acl = aclID;
		    aclr.sys_user_role = roleID;
		    if (typeof scope != 'undefined' && aclr.isValidField('sys_scope'))
				aclr.sys_scope = scope;		
		    aclr.insert();
		}
	    }
	}
}
