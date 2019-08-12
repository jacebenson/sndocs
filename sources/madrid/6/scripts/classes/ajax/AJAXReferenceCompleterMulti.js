/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceCompleterMulti.js */
var AJAXReferenceCompleterMulti = Class.create(AJAXReferenceCompleter, {
      _hash: new Hash(),
      _SEPARATOR: ',',
      _handleDeleteKey: function() {
        this._rebuildFromInput();
      },
      _rebuildFromInput: function() {
        var s = this.getDisplayElement().value;
        var arr = s.split(this._SEPARATOR);
        var _hashNew = new Hash();
        for (var i = 0; i < arr.length; i++) {
          var a = arr[i].strip();
          if (this._hash.keys().indexOf(a) != -1)
            _hashNew.set(a, this._hash.get(a).escapeHTML());
          else {
            if (this.allowInvalid)
              _hashNew.set(a, a.escapeHTML());
          }
        }
        this._hash = _hashNew;
        this._setFormValues();
      },
      _arrayToString: function(array, useSpacer) {
          var s = '';
          for (var i = 0; i < array.length; i++) {
            var a = array[i].strip();
            if (a.length == 0)
              continue;
            if (i > 0) {
              s += thi