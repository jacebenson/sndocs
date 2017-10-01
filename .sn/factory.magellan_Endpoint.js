/*! RESOURCE: /scripts/app.magellan/factory.magellan_Endpoint.js */
angular.module('Magellan').factory('magellan_Endpoint', function($http) {
    return {
        Navigator: {
            getApplications: function() {
                var url = '/api/now/ui/navigator';
                return $http.get(url).then(function(response) {
                    if ((!response.data || !response.data.result) && response.status === 202) {
                        return $http.get(url).then(function(response) {
                            return response.data.result;
                        });
                    }
                    return response.data.result;
                });
            },
            getApplicationsAndFavorites: function() {
                var url = '/api/now/ui/navigator/favorites';
                return $http.get(url).then(function(response) {
                    if ((!response.data || !response.data.result) && response.status === 202) {
                        return $http.get(url).then(function(response) {
                            return response.data.result;
                        });
                    }
                    return response.data.result;
                });
            }
        },
        Favorites: {
            create: function(favorite) {
                return $http.post('/api/now/ui/favorite', favorite).then(function(response) {
                    return response.data.result;
                });
            },
            get: function() {
                return $http.get('/api/now/ui/favorite').then(function(response) {
                    return response.data.result;
                });
            },
            remove: function(id, group) {
                return $http.delete('/api/now/ui/favorite?id=' + id + '&group=' + group).then(function(response) {});
            }
        },
        Groups: {
            update: function(favoritesList) {
                return $http.put('/api/now/ui/favorite/multiple', {
                    'favorites': favoritesList
                }).then(function(response) {
                    return response;
                });
            }
        },
        NavigatorHistory: {
            getHistory: function() {
                return $http.get('/api/now/ui/history').then(function(response) {
                    return response;
                });
            },
            create: function() {
                return $http.post('/api/now/ui/history').then(function(response) {
                    return response;
                });
            }
        }
    };
});;