/*! RESOURCE: /scripts/amb.Logger.js */
amb['Logger'] = function(callerType) {
    var _debugEnabled = amb['properties']['logLevel'] == 'debug';

    function print(message) {
        if (window.console)
            console.log(callerType + ' ' + message);
    }
    return {
        debug: function(message) {
            if (_debugEnabled)
                print('[DEBUG] ' + message);
        },
        addInfoMessage: function(message) {
            print('[INFO] ' + message);
        },
        addErrorMessage: function(message) {
            print('[ERROR] ' + message);
        }
    }
};;