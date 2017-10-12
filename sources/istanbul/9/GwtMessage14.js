/*! RESOURCE: /scripts/doctype/GwtMessage14.js */
var GwtMessage = Class.create({
      DEFAULT_LANGUAGE: "en",
      PREFETCH_ENTRY_KEY: "PREFETCH_ENTRY_KEY",
      initialize: function() {},
      set: function(n, v) {
        if (!v)
          GwtMessage._messages[n] = true;
        else
          GwtMessage._messages[n] = v;
      },
      format: function(msg) {
        if (!msg)
          return "";
        var str = msg;
        for (var i = 1; i < arguments.length; i++) {
          var paramIndex = i - 1;
          var rx = new RegExp("\{[" + paramIndex + "]\}", "g");
          str = str.replace(rx, arguments[i]);
        }
        return str;
      },
      getMessage: function(strVal) {
        var valList = [];
        valList.push(strVal);
        var messages = this.getMessages(valList);
        var msg = messages[strVal];
        if (arguments.length > 1) {
          var realArray = [].slice.call(arguments, 0);
          realArray[0] = msg;
          msg = this.format.apply(this, realArray);
        }
        return msg;
      },
      getMessages: function(resolveList) {
          var pageMsgs = {};
          var dataRequiringAjaxCall = [];
          var results = {};
          for (var i = 0; i < resolveList.length; i++) {
            var v = GwtMessage._messages[resolveList[i]];
            if (v === true)
              pageMsgs[resolveList[i]] = resolveList[i];
            else if (v)
              pageMsgs[resolveList[i]] = v;
            else
              dataRequiringAjaxCall.push(resolveList[i]);
          }
          if (dataR