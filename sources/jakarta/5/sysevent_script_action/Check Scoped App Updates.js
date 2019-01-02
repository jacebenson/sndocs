// checks the upgrade server for latest version of installed apps
new UpdateChecker().checkAvailableUpdates();

// install any auto upgrades
new AppUpgrader().autoUpdates();