// call script to upgrade myself
gs.loadBatchScript("sys.scripts/" + gs.getProperty( "glide.sys.upgrade_script"));

// now tell the mothership I am done
var myname = gs.getProperty("glide.db.name");
var mynameonly = new String(myname);
mynameonly = mynameonly.split("_")[0];

var r = new GlideRemoteGlideRecord("https://hi.service-now.com/", "ecc_queue"); 
r.initialize(); 
r.setValue("agent", "Service-now deployer"); 
r.setValue("name", "system.update.confirm");
r.setValue("source", mynameonly);
r.setValue("queue", "input");
r.setValue("payload", "<update><url>" + mynameonly + "</url><war>" + event.parm1 + "</war></update>");
r.insert();
