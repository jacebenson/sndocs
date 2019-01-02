var parent = g_request.getParameter("sysparm_parent");
var child = g_request.getParameter("sysparm_child");
var gzip = false;

if (child.endsWith('.out') || child.endsWith('.txt'))
    gzip = true;

var sa = new SecurelyAccess(parent, child);
sa.download(g_response, gzip);