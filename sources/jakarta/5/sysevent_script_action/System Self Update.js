gs.print("starting self update");

gs.pause();  // pause scheduler
gs.sleep(1000); // now wait just a second, for lazy writer race condition

// queue up the upgrade script for when system returns
gs.eventQueue("system.upgrade", "", event.parm1, ""); 

// execute the update request
new UpgradeClient().runUpdateScript(event.parm1);