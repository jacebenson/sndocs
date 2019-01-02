/*! RESOURCE: /scripts/app.$sp/service.spAnnouncement.js */
angular.module('sn.$sp').factory('spAnnouncement', function($rootScope, $http, $window, $timeout, $q, spConf, spUtil) {
  'use strict';
  var _initialized = false;
  var _initializing = false;
  var _sessionId = $window.NOW.session_id;
  var _all = [];
  var _list = [];

  function _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function _cleanupStorage() {
    for (var key in $window.localStorage) {
      if (!$window.localStorage.hasOwnProperty(key)) {
        return;
      }
      if (key.indexOf('dismissed_announcement_') === 0 && $window.localStorage.getItem(key) !== _sessionId) {
        $window.localStorage.removeItem(key)
      }
    }
  }

  function _handleHttpError(res) {
    console.log(spUtil.format('*** [HTTP::{code}] Unable to retrieve announcement', {
      code: res.status
    }));
  }

  function _buildReq(path, method) {
    return {
      method: method ? method : 'GET',
      url: path ? spConf.announcementApi + '/' + path : spConf.announcementApi,
      headers: {
        'X-PORTAL-ID': $rootScope.portal_id
      }
    };
  }

  function _filterType(type) {
    return function(announcement) {
      if (!type) {
        return true;
      }
      var filterTypes = type.trim().toLowerCase().split(',');
      var types = announcement.type.trim().toLowerCase().split(',');
      for (var i = 0; i < types.length; i++) {
        for (var j = 0; j < filterTypes.length; j++) {
          if (types[i].trim() === filterTypes[j].trim()) {
            return true;
          }
        }
      }
      return false;
    }
  }

  function _filter(list, query, limit, page) {
    var result = [];
    if (!query) {
      result = list;
    } else {
      result = list.filter(function(a) {
        var include = false;
        try {
          if (typeof(query) === 'function') {
            include = query(a);
          } else if (query.key) {
            include = a[query.key] === query.value;
          }
        } catch (e) {
          console.log('*** spAnnouncement.service: unable to process filter', e);
        }
        return include;
      });
    }
    if (limit && page) {
      if (!result.length) {
        return {
          data: result,
          page: 0,
          totalPages: 0,
          totalRecords: 0
        };
      }
      limit = parseInt(limit, 10);
      page = parseInt(page + '', 10);
      var offset = (page - 1) * limit;
      return {
        data: result.slice(offset, offset + limit),
        page: page,
        totalPages: Math.ceil(result.length / limit),
        totalRecords: result.length
      };
    }
    return result;
  }

  function _remove(id, list) {
    return list.filter(function(a) {
      return a.id !== id;
    });
  }

  function _sessionDismissed(id) {
    return $window.localStorage.getItem('dismissed_announcement_' + id) === _sessionId;
  }

  function _dismiss(id) {
    var announcement = _.find(_all, {
      id: id
    });
    if (announcement.dismissOption === 'SESSION_DISMISSIBLE' || !$rootScope.user.logged_in) {
      try {
        $window.localStorage.setItem('dismissed_announcement_' + id, _sessionId);
      } catch (e) {}
    } else {
      $http(_buildReq(id + '/dismiss', 'POST'));
    }
    announcement.dismissed = true;
    _processAnnouncements();
  }

  function _processAnnouncements() {
    _list = [];
    _all.forEach(function(a) {
      if (a.dismissed || ((a.dismissOption === 'SESSION_DISMISSIBLE' || !$rootScope.user.logged_in)) && _sessionDismissed(a.id)) {
        a.dismissed = true;
      }
      _list.push(a);
    });
    $rootScope.$broadcast(spConf.e.announcement);
  }

  function _subscribe(scope, callback) {
    var handler = scope.$on(spConf.e.announcement, callback);
    scope.$on('$destroy', handler);
  }

  function _getAnnouncements(announcements) {
    if (announcements) {
      return $q(function(resolve) {
        _all = announcements;
        resolve();
      });
    }
    return $http(_buildReq()).then(function(res) {
      _all = res.data.result;
    }, _handleHttpError);
  }

  function _init(announcements) {
    if (_initialized || _initializing) {
      return $q(function(resolve) {
        console.log(spUtil.format('*** spAnnouncement.service is {state}', {
          state: _initialized ? 'already initialized' : 'currently initializing'
        }));
        resolve();
      });
    }
    _initializing = true;
    return _getAnnouncements(announcements).then(function() {
      _processAnnouncements();
      $rootScope.$evalAsync(_cleanupStorage);
      _initialized = true;
      _initializing = false;
    });
  }
  return {
    init: _init,
    subscribe: _subscribe,
    dismiss: _dismiss,
    filterOnType: _filterType,
    get: function(query, limit, page) {
      return _clone(_filter(_list, query, limit, page));
    }
  };
});;