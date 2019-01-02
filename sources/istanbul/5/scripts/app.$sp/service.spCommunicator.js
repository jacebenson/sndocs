/*! RESOURCE: /scripts/app.$sp/service.spCommunicator.js */
angular.module('sn.$sp').factory('spCommunicator', ['$rootScope', function($rootScope) {
  return {
    deregFuncMap: {},
    _getEventMap: function($scope) {
      var eventMap = this.deregFuncMap[$scope.$id];
      if (!eventMap)
        eventMap = this.deregFuncMap[$scope.$id] = {};
      return eventMap;
    },
    start: function(event, handler, $scope) {
      this.stop(event, $scope);
      var eventMap = this._getEventMap($scope);
      eventMap[event] = $rootScope.$on(event, function(event, data) {
        handler(data);
      });
    },
    stop: function(event, $scope) {
      var eventMap = this._getEventMap($scope);
      var deregFunc = eventMap[event];
      if (deregFunc)
        deregFunc();
    },
    fire: function(event, data) {
      if (event)
        $rootScope.$broadcast(event, data);
    }
  }
}]);