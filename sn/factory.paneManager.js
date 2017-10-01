/*! RESOURCE: /scripts/sn/common/ui/factory.paneManager.js */
angular.module("sn.common.ui").factory("paneManager", ['$timeout', 'userPreferences', 'snCustomEvent', function($timeout, userPreferences, snCustomEvent) {
    "use strict";
    var paneIndex = {};

    function registerPane(paneName) {
        if (!paneName in paneIndex) {
            paneIndex[paneName] = false;
        }
        userPreferences.getPreference(paneName + '.opened').then(function(value) {
            var isOpen = value !== 'false';
            if (isOpen) {
                togglePane(paneName, false);
            }
        });
    }

    function togglePane(paneName, autoFocusPane) {
        for (var currentPane in paneIndex) {
            if (paneName != currentPane && paneIndex[currentPane]) {
                CustomEvent.fireTop(currentPane + '.toggle');
                saveState(currentPane, false);
            }
        }
        snCustomEvent.fireTop(paneName + '.toggle', false, autoFocusPane);
        saveState(paneName, !paneIndex[paneName]);
    };

    function saveState(paneName, state) {
        paneIndex[paneName] = state;
        userPreferences.setPreference(paneName + '.opened', state);
    }
    return {
        registerPane: registerPane,
        togglePane: togglePane
    };
}]);;