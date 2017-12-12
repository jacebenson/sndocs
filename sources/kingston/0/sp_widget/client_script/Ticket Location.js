function ($scope, $element, $timeout, $http, cabrillo, $rootScope, spUtil) {
  $scope.locationSupported = !!navigator.geolocation;

	$scope.requested = false;

  $scope.isNative = false;
  if (cabrillo.isNative())
    $scope.isNative = true;
	
  $rootScope.$broadcast("sp.show_location_icon");

  $scope.getLocation = function() {
    $rootScope.$broadcast("location.sharing.start");
    $scope.requested = true;
    $scope.status = $scope.data.askingMsg;
    if (cabrillo.isNative()) {
      cabrillo.geolocation.getCurrentLocation().then(function(o) {
        $scope.data.cabrilloloc = o;
        $scope.position = {};
        $scope.position.coords = {};
        $scope.position.coords.latitude = o.coordinate.latitude;
        $scope.position.coords.longitude = o.coordinate.longitude;
        spLoadMaps(); // in sp.geo.js
      });
    } else
			navigator.geolocation.getCurrentPosition(gotLocation, error, {timeout: 10000});
  }

  function gotLocation(pos) {
    $scope.position = pos;
    $scope.$digest();
    spLoadMaps(); // in sp.geo.js
  }

  function error(msg) {
    if (msg.code == 1) {
      alert($scope.data.enableMsg);
      $scope.status = $scope.data.notEnabledMsg;
    } else if (msg.code == 2 || msg.code == 3)
			$scope.status = $scope.data.notDeterminedMsg;
    $rootScope.$broadcast("location.sharing.end");
    $scope.$digest();
  }

  $scope.$on('check_in_location', function(evt) {
    $scope.getLocation()
  });

  CustomEvent.observe('map.initialized', function() {
    if (!$scope.position)
      return;

    $scope.mapInit = true;
    $scope.$digest();

    var position = $scope.position;
    console.log(position);
    $scope.data.lat = position.coords.latitude;
    $scope.data['long'] = position.coords.longitude;

    $scope.latlng = new google.maps.LatLng($scope.data.lat, $scope.data['long']);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': $scope.latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          $scope.address = results[0].formatted_address;
          $scope.data.address = results[0].formatted_address;
          $scope.$digest();

          $scope.data.geodata = {};
          $scope.data.geodata["latitude"] = $scope.data.lat;
          $scope.data.geodata["longitude"] = $scope.data['long'];
          $scope.data.geodata["address"] = results[0].formatted_address;
          $scope.data.geodata["sys_user"] = $scope.data.user;

          $scope.phoneHome();

        } else
          $scope.address = "Street address not found";
      }
    });
    var mapOptions = {
      scrollwheel: false,
      zoom : 17,
      center : $scope.latlng,
      mapTypeControl : true,
      navigationControlOptions : {
        style : google.maps.NavigationControlStyle.SMALL
      },
      mapTypeId : google.maps.MapTypeId.ROADMAP
    };
    var target = $element.find(".sp-geo-canvas-container")[0];
    $scope.status = $scope.data.fetchingMapMsg;
    $scope.map = new google.maps.Map(target, mapOptions);

    var R = 6371; // kilometers
    var radius = .25; // 100 meter circle
    // first-cut bounding box (in degrees)

    $scope.data.maxLat = $scope.data.lat + rad2deg(radius/R);
    $scope.data.minLat = $scope.data.lat - rad2deg(radius/R);
    // compensate for degrees longitude getting smaller with increasing latitude
    $scope.data.maxLon = $scope.data['long'] + rad2deg(radius/R/Math.cos(deg2rad($scope.data.lat)));
    $scope.data.minLon = $scope.data['long'] - rad2deg(radius/R/Math.cos(deg2rad($scope.data.lat)));
    $scope.submit();

    var marker = new google.maps.Marker({
      position : $scope.latlng,
      map : $scope.map,
      title : $scope.data.youAreHereMsg
    });

    var cir = {
      strokeColor: '#00FF00',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: '#00FF00',
      fillOpacity: 0.15,
      map: $scope.map,
      center: $scope.latlng,
      radius: Math.sqrt(20000)
    };
    var circle = new google.maps.Circle(cir);
    $rootScope.$broadcast("location.sharing.end");
  });

  $scope.phoneHome = function() {
    var dataURL = spUtil.getWidgetURL($scope);
    $http.post(dataURL, $scope.data).success(function(response) {
      $scope.data.address = "";
      $scope.data.geodata = {};
    });
  }

  $scope.submit = function(map, latlng) {
    var dataURL = spUtil.getWidgetURL($scope);
    $http.post(dataURL, $scope.data).success(function(response) {
      angular.extend($scope.data, response.result.data);  
      if (!$scope.data.others) 
        return; 

      for (var i = 0; i < $scope.data.others.length; i++) {
        var u = $scope.data.others[i];
        var ll = new google.maps.LatLng(u.lat, u.lon);
        var ic = "/images/google_map_man_" + (i+1) + ".gif";
        var marker = new google.maps.Marker({
          icon: ic,
          position : ll,
          map : $scope.map,
          title: u.name
        });

      }
    });
  }

  function rad2deg(rad) {
    return rad * 57.2957795;
  }

  function deg2rad(deg) {
    return deg * 0.0174532925;
  }
}

