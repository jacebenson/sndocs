/*! RESOURCE: /scripts/app.ng_chat/util/factory.commandFactory.js */
angular.module('sn.connect.util').factory('commandFactory', function($http, $rootScope) {
  var service = {};
  var SN_Commands = {
    "commands": {
      'key': 'commands',
      'args': 0,
      'value': function() {
        angular.element("#commandPopupModal").detach().appendTo("body").modal()
      },
      'description': "Displays a list of all available commands. If unknown command is entered, defaults to this."
    },
    "snip": {
      'key': 'snip',
      'args': 0,
      'value': function() {
        $rootScope.$broadcast("conversation.enable_snippet_search", true);
      },
      'description': "Opens snippet search window"
    }
  };
  var Customer_Commands = {};
  var commands = angular.extend(SN_Commands, Customer_Commands);
  service.commands = commands;
  service.commandNames = [];
  service.arr = Object.keys(commands);
  for (var i = 0; i < service.arr.length; i++)
    service.arr[i] = "/" + service.arr[i];
  service.commandNames = Object.keys(commands);
  service.setMessageFilter = function(m) {
    service.messageFilter = m;
  };
  service.getMessageFilter = function() {
    return service.messageFilter;
  }
  service.addSNCommand = function(key, args, value, description) {
    if (commands[key])
      return false;
    commands[key] = {
      'key': key,
      'args': args,
      'value': value,
      'official': true,
      'description': description
    };
    return true;
  };
  service.getCommand = function(entry) {
    var tokens = entry.split(" ");
    tokens[0] = tokens[0].slice(1);
    var key = tokens[0] || "commands";
    var comm = commands[key] || commands["commands"];
    var f = comm['value'];
    return f(entry);
  };
  return service;
});;