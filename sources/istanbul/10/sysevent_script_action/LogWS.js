var client = new WSClientAdaptor("http://hi.service-now.com/incident.do?WSDL");
var myname = gs.getProperty("glide.installation.name");
client.impersonate(myname);
client.setMethodName("insert");
var sd = "Logfile match found for file: " + event.parm1
client.setParameter("short_description", event.parm2);
client.setParameter("comments", sd + "\n" + event.parm2);
client.setParameter("category", "Monitor");
var sysid = client.invokeFiltered("//sys_id");
gs.print("LogFileMonitor created incident: " + sysid);