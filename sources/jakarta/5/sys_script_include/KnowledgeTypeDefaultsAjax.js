gs.include("PrototypeServer");

var KnowledgeTypeDefaultsAjax = Class.create();

KnowledgeTypeDefaultsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor ,{
 
  getValues: function() {
    var xml = new GlideXMLDocument("template_values");
    var list = new SNC.KnowledgeHelper().getDefaultElements(this.getParameter('sysparm_query_string')+'');
	var elements = list.get(0);
	var kbKnowledgeGR = list.get(1);  
    for (var i = 0; i < elements.size(); i++) {
        var ge = kbKnowledgeGR.getElement(elements.get(i));
        if (ge.getED().isVirtual())
           continue;

        var name = ge.getName();
        var value = this.getValue(ge);
        var e = xml.createElement("item", null);
        e.setAttribute("name", name);
        e.setAttribute("value", value);
        var dep = ge.getDependent();
        if (dep)
           e.setAttribute('dependent', dep);
    }
    var document =  xml.getDocument(); 
    answer = document;
    return document;
  },

  getValue: function(ge) {
     if (!ge.isObject())
        return ge + '';
    
     var ed = ge.getED();
     if (ed.isJournal() || ed.isChoiceTable())
        return ge + '';

     //Domain types are same as the reference types for this purpose
     if (ed != null && ed.getInternalType() == 'domain_id')
		  return ge + '';	  
     
	  if (ed.getInternalType() != 'glide_duration' && ed.getInternalType() != 'timer')
        return ge.getDisplayValue();
	  
     return ge.getDurationValue();
  }

});
