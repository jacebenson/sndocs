var ACLDescriber = Class.create();

ACLDescriber.prototype = {

    ensureDescription: function(gr, overwrite) {
        if (!this.shouldUpdate(gr, overwrite))
            return;
        
        // generate our text...
        this.analyze(gr);
        var text = '';
        text += 'Allow ';
        text += gr.operation.name;
        text += ' for ';
        text += this.field;
        text += ' in ';
        text += this.table;
        text += ', ';
        text += this.getWhen(gr);
        text += '.';
        
        gr.description = text;
    },
    
    getWhen: function(gr) {
        var clause = '';
        
        // if roles are specified, list 'em...
        var roles = this.getRoles(gr);
        if (roles.length == 1) {
            clause += 'for users with role ';
            clause += roles[0];
        } else if (roles.length > 1) {
            clause += 'for users with roles (';
            clause += roles.join(', ');
            clause += ')';
        }
        
        // if a script is specified, say so...
        if (!gs.nil(gr.script)) {
            if (clause.length > 0)
                clause += ', and ';
            clause += 'if the ACL script returns true';
        }
        
        // if a condition is specified, say so...
        if (!gs.nil(gr.condition)) {
            if (clause.length > 0)
                clause += ', and ';
            clause += 'if the ACL condition (';
            clause += gr.condition;
            clause += ') evaluates to true';
        }
        
        // if nothing was specified, then this operation is always allowed...
        if (clause == '')
            clause = 'always';
        
        return clause;
    },
    
    getRoles: function(gr) {
        var m2m_gr = new GlideRecord('sys_security_acl_role');
        m2m_gr.addQuery('sys_security_acl', gr.sys_id);
        m2m_gr.query();
        var results = [];
        while (m2m_gr.next()) {
            var role_gr = new GlideRecord('sys_user_role');
            if (role_gr.get(m2m_gr.sys_user_role))
                results.push('' + role_gr.name);
        }
        return results;
    },
    
    analyze: function(gr) {
        var parts = ('' + gr.name).split('.');
        this.table = (parts[0] == '*') ? 'all tables' : parts[0];
        if (parts.length == 1)
            this.field = 'records';
        else
            this.field = (parts[1] == '*') ? 'all fields' : parts[1];
    },
    
    shouldUpdate: function(gr, overwrite) {
        // if we don't have a valid GlideRecord for an ACL, bail...
        if (!gr || !gr.isValidRecord() || gr.getTableName() != 'sys_security_acl')
            return false;
        
        // if this isn't a record type ACL, bail...
        if (gr.type != 'record')
            return false;
        
        // if we already have a description that we didn't write, and we're not overwriting, bail...
        var descr = '' + gr.description;
        if (descr == null)
            descr = '';
        var ours = descr.match(/^Allow .*? for .*? in .*?, (?:always|(for users with role.*?)?(, and )?(if the ACL script returns true)?(, and )?(if the ACL condition \(.*?\) evaluates to true)?)\.$/);
        if (!ours && !overwrite && !gs.nil(gr.description))
            return false;
        
        // we've passed the gauntlet...
        return true;
    },
    
    type: 'ACLDescriber'
}