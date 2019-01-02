var r = new GlideRemoteGlideRecord("https://scripterrorreporting.service-now.com/", "ecc_queue"); 
r.initialize(); 
r.setValue("agent", "illegal.member"); 
r.setValue("name", "system.illegal.member.inserted");
r.setValue("source", SncReplicationEngine.getSystemID());
r.setValue("queue", "input");
r.setValue("payload", "<update><instance_id>" + gs.getProperty("instance_id") + "</instance_id><instance_name>" + gs.getProperty("instance_name") + "</instance_name><instance_build>" + gs.getProperty("glide.war") + "</instance_build><classname>" + current.classname + "</classname><membername>" + current.membername + "</membername><signature>" + current.signature + "</signature></update>");
r.insert();
