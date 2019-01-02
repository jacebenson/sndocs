function ($scope, $rootScope) {
  
  $rootScope.$on('sp.sessions', function(name, sessions) {
    $scope.sessions = sessions;
  });

  $scope.sessionCount = function() {
    var num = 0;
    var keys = Object.keys($scope.sessions);
    for (var i = 0; i < keys.length; i++) {
      if ($scope.sessions[keys[i]].status != "")
        num++;
    }
    return num;
  }
}