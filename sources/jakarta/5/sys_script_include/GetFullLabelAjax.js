var GetFullLabelAjax = Class.create();

GetFullLabelAjax.prototype =Object.extendsObject(AbstractAjaxProcessor, {

  process: function() {
    var name = this.getParameter('sysparm_full_name'); 
    if (name)
       return new CompositeElement(name).getFullLabel();   
    return '';
  }

});