gs.print("starting self update of war only (upgrade.js will not run)");

gs.pause();  // pause scheduler
gs.sleep(1000); // now wait just a second, for lazy writer race condition

SncReplicationEngine.specialTransaction('zzSpecialUpgradeyy', event.parm1);
gs.sleep(1000);

// execute the update request
new UpgradeClient().runUpdateScript(event.parm1);