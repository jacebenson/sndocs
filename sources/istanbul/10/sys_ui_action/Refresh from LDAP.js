var ldap = new GlideLDAPUsers();
ldap.load(current.user_name.toString());
action.setRedirectURL(current);
gs.addInfoMessage("Reload of LDAP data for " + current.name + " has been started");