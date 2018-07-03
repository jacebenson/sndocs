/*! RESOURCE: /scripts/classes/TableExtension.js */
var TableExtension = Class.create({
      REF_ELEMENT_PREFIX: 'ref_',
      initialize: function(elementName, elementLabel) {
        this.name = elementName;
        this.label = elementLabel;
        this.table = null;
        this.fields = null;
      },
      getName: function() {
        return this.name;
      },
      getExtName: function() {
        return this.REF_ELEMENT_PREFIX + this.getName();
      },
      getLabel: function() {
        return this.label;
      },
      setTable: function(t) {
        this.table = t;
      },
      addOption: function(select, namePrefix, labelPrefix) {
          var t = this.getName();
          var ext = this.getExtName();
          if (namePrefix && namePrefix != '') {
            var idx = namePrefix.lastIndexOf(".");
            var s = namePrefix.substring(idx + 1);
            var previousIsExtension = true;
            if (s.indexOf(this.REF_ELEMENT_PREFIX) == 0)
              ext = namePrefix.substring(0, idx + 1) + ext;
            else {
              ext = namePrefix + "." + ext;
              previousIsExtension = false;
            }
          }
          var label = this.getLabel();
          var reflabel = label;
          if (labelPrefix && labelPrefix != '')
            if (previousIsExtension)
              reflabel = labelPrefix.substring(0, labelPrefix.lastIndexOf(".")) + "." + reflabel;
            else
              reflabel = labelPrefix + "." + reflabel;
          tlabel = label + " (+)";
          appendSelectOption(select