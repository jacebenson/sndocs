gs.include("PrototypeServer");

var Template = Class.create();

Template.prototype = {
  initialize: function(sysID) {
     this.sys_id = sysID;
  },

  getValues: function(tableName, elementName) {
    var t = GlideTemplate.get(this.sys_id);
    if (t == null)
       return t;

    var xml = new GlideXMLDocument("template_values");
    t.setApplyChildren(false);
    var target = t.apply();
    var list = t.getTemplateElements();
    for (var i = 0; i < list.size(); i++) {
        var ge = target.getElement(list.get(i));
        if (ge.getED().isVirtual())
           continue;

        var name = ge.getName();
        var value = this.getValue(ge);
        var label = this.getLabel(ge);
        var e = xml.createElement("item", null);
        e.setAttribute("name", name);
        e.setAttribute("value", value);
        e.setAttribute('label', label);
        var dep = ge.getDependent();
        if (dep)
           e.setAttribute('dependent', dep);
    }
    var document =  xml.getDocument(); 
    answer = document;
    return document;
  },

  getValue: function(ge) {
     if (ge.getED().isJournal())
        return ge + '';

     if (ge.getED().isChoiceTable())
		return ge.getChoiceValue() == null ? '' : ge + '';

     if (!ge.isObject())
        return ge + '';

     var ed = ge.getED();
     //Domain types are same as the reference types for this purpose
     if (ed != null && ed.getInternalType() == 'domain_id')
		  return ge + '';	  
     
	  if (ed.getInternalType() != 'glide_duration' && ed.getInternalType() != 'timer')
        return ge.getDisplayValue();
	  
     return ge.getDurationValue();
  },

  getLabel: function(ge){
	return ge.getLabel();
  }

};
