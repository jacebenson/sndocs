
var mu = new GlideMultipleUpdate("sys_push_notif_app_install");
mu.addQuery("token", event.parm2.toString());
mu.setValue("active", false);
mu.execute();
