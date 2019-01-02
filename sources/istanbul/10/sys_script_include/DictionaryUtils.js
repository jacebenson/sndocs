gs.include("PrototypeServer");

var DictionaryUtils = Class.create();

DictionaryUtils.prototype = {
    isDeletable: function (curr) {
        // works for both tables and fields
        // This is to protect system things, which are:
        // a) Global scoped fields/tables that don't have u_ (though you can delete them if you're maint and in developer mode)
        // b) Store fields/tables that don't have u_ (can't even delete them if you're maint)

        // Assume access handlers have run, so we know we're in the same scope as the field or table

        var tableName = curr.name.toString();
        var isColumn = !(curr.getRecordClassName() == 'sys_db_object' || curr.element.nil());
        var name = isColumn ? curr.element.toString() : tableName; // deletion target, either the column or table name
        var isCustomItem = this._isUserCustomization(name) || this._isFromCustomerScopedApp(name);


        // user customizations are permitted for delete in all situations
        if (this._isUserCustomization(name))
            return true;

        // allow deletion of sys_domain, sys_domain_path, or sys_overrides column on a user-created table
        if (isColumn && (name == 'sys_domain' || name == 'sys_domain_path' || name == 'sys_overrides')) {
            if (this._isUserCustomization(tableName))
                return true;
        }

        // Items may be deleted form global scope if they are custom and from a deleted pkg
        // (or if user is maint on a developer mode instance)
        if (curr.isInGlobalScope()) {
            if (gs.hasRole('maint') && GlideUtil.isDeveloperInstance())
                return true;

            return isCustomItem && this._fromDeletedPackage(curr);
        }

        // Store app items may only be deleted if the app is being uninstalled (no maint override)
        if (curr.isInStoreScope())
            return SNC.Apps.isScopeBeingUninstalled(curr.sys_scope);

        // At this point we have a non-global, non-store item.  If item is in same scope as user, okay to delete
        if (this._isItemInUserScope(name, tableName))
            return true;

        // Otherwise we'll permit delete if it's a non-ServiceNow item and the package is not found
        return isCustomItem && this._fromDeletedPackage(curr);
    },

    // u_ prefix indicates user customization of global or store apps
    _isUserCustomization: function (name) {
        return name.startsWith('u_');
    },

    // x_ prefix indicates item belongs to either a store or custom app
    _isFromCustomerScopedApp: function (name) {
        return name.startsWith('x_');
    },

    _fromDeletedPackage: function (curr) {
        var pkg = curr.sys_package.toString();
        if (!gs.nil(pkg) && pkg != 'global') {
            var pkgGR = new GlideRecord('sys_package');
            if (!pkgGR.get(pkg))
                return true;
        }
        return false;
    },

    _isItemInUserScope: function (targetName, tableName) {
        var userPrefix = SNC.Apps.getDatabasePrefixForUser();
        return targetName.indexOf(userPrefix) == 0 || tableName.indexOf(userPrefix) == 0;
    }
};