var VersionComparator = Class.create();
VersionComparator.prototype = {
    initialize: function() {
    },
	
	isDowngrade: /*boolean */ function(/*from version*/ currentVersion, /* to version */ targetVersion) {
		currentVersion = currentVersion + '';
		targetComponents = targetComponents + '';
		var currentComponents = currentVersion.split('.');		
		var targetComponents = targetVersion.split('.');
		// 2.0 is a downgrade from 2.1
		// 3.0 is a downgrade from 1.0
		for (var i = 0; i < targetComponents.length; i++) {
			var targetComponent = parseInt(targetComponents[i], 10);
			var currentComponent = parseInt(i < currentComponents.length ? currentComponents[i] : 0, 10);
			if (targetComponent == currentComponent) 
				continue;

			return targetComponent < currentComponent;
		}
		
		return false;
	},
	
	isUpgrade: function(/*string*/ currentVersion, /*string*/ targetVersion){
		//only an upgrade if it's not a downgrade and they aren't equal
		return (!this.isDowngrade(currentVersion, targetVersion) && !this.isEqual(currentVersion, targetVersion));
	},
	
	isEqual: function(/*string*/ currentVersion, /*string*/ targetVersion) {
		return currentVersion == targetVersion;
	},

    type: 'VersionComparator'
};