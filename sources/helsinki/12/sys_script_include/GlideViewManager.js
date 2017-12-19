var GlideViewManager = Class.create();

GlideViewManager.prototype = Object.extendsObject(AbstractAjaxProcessor , {
 ajaxFunction_execute: function() {
    gs.include("ViewManager");
    var v = new ViewManager(this.getParameter('sysparm_table') +'', this.getParameter('sysparm_form')+'');
    v.setView(this.getParameter('sysparm_view')+'');
    switch(this.getParameter('sysparm_action')+'') {
      case 'refreshSelected': return v.getViews();

      case 'refreshSection':  return v.getSections();

      case 'getView':         var collection = this.getParameter('sysparm_collection') + '';
                              if(collection)
                                v.setCollection(collection);
                              return v.getSelected();

      case 'getSection':      return v.getSection();

      case 'createView':      v.setTitle(this.getParameter('sysparm_title') +'');
                              v.createView();
                              this._saveView(v);
                              return v.getViews();

      case 'createSection':   return v.createSection(this.getParameter('sysparm_caption')+'');

      case 'promptModifiedOk': this._saveView(v);
                            
    }

 },
  
 _saveView: function(v) {
    v.setView(this.getParameter('sysparm_view')+'');
    var collection = this.getParameter('sysparm_collection');
    if(collection)
      v.setCollection(collection+'');
    v.save(this.getParameter('sysparm_avail')+'',this.getParameter('sysparm_selected')+'',this.getParameter('sysparm_sections')+'');
  }
});