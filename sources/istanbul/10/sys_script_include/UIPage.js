var UIPage = Class.create();

UIPage.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  ajaxFunction_createGauge: function() {
    var g = new Gauge(this.getParameter('sysparm_gauge_id'));
    g.setName(this.getParameter('sysparm_gauge_name'));
  },

  ajaxFunction_createListMechanic: function() {
   var v = new ListMechanic();
   v.setViewName(this.getParameter('sysparm_list_view'));
   v.setParent(this.getParameter('sysparm_list_parent'));
   v.setParentID(this.getParameter('sysparm_list_parent_id'));
   v.setRelationship(this.getParameter('sysparm_list_relationship'));
   if(!this.getParameter('sysparm_reset')) {
     if(this.getParameter('sysparm_changes'))
       v.saveList(this.getParameter('sysparm_table'), this.getParameter('sysparm_f'));
   } else
       v.reset(this.getParameter('sysparm_table'));

   v.setHighlighting(this.getParameter('sysparm_highlighting'));
   v.setCompact(this.getParameter('sysparm_compact'));
   v.setWrap(this.getParameter('sysparm_wrap'));
   v.setFieldStyleCircles(this.getParameter('sysparm_field_style_circles'));
   var o = this.getParameter('sysparm_edit_enable');
   if (typeof o != 'undefined')
     v.setListEditEnable(o);
   o = this.getParameter('sysparm_edit_double');
   if (typeof o != 'undefined')
    v.setListEditDouble(o);
  },

  ajaxFunction_getList: function() {
   var v = new ListMechanic();
   v.setViewName(this.getParameter('sysparm_list_view'));
   v.setParent(this.getParameter('sysparm_list_parent'));
   v.setParentID(this.getParameter('sysparm_list_parent_id'));
   v.setRelationship(this.getParameter('sysparm_list_relationship'));
   return v.getList(this.getParameter('sysparm_table'));
  } ,

  ajaxFunction_createSecurityMechanic: function() {
   var v = new SecurityMechanic(
               this.getParameter('sysparm_table'),
               this.getParameter('sysparm_field'),
               this.getParameter('sysparm_operation'));
    if(this.getParameter('sysparm_save'))
      return v.saveList(this.getParameter('sysparm_f'));
    else
      return v.getList();
  },

  sendDomainChangeNotification: function() {
      var changed = this.getParameter('sysparm_domain_change');
      if (changed == 'true' && gs.getProperty('glide.domain.notify_change', 'true') == 'true') {
      	var oldDomain = this.getParameter('sysparm_old_domain');
        var newDomain = this.getParameter('sysparm_new_domain');
        var sessionChange = this.getParameter('sysparm_session_change');
        if (sessionChange == 'true' || gs.getProperty('glide.domain.notify_record_change', 'false') == 'true') {
        	var n = new UINotification('domain_change');
            n.setAttribute('oldDomain', oldDomain);
            n.setAttribute('newDomain', newDomain);
            n.setAttribute('sessionChange', sessionChange);
            n.send();
         }
      }
  },

  ajaxFunction_fillWidget: function() {
    var func = this.getParameter('sysparm_function_select') + "";
    switch(func) {
      case 'DomainReference':
            var d = new DomainSelect();
            this.sendDomainChangeNotification();
            return d.getReferenceList();
      case 'Domain':
            var d = new DomainSelect();
            this.sendDomainChangeNotification();
            return d.getList();
      case 'Encrypt':
            var es = new EncryptionSelect();
            return es.getList();
      case 'Group':
            var d = new GroupSelect();
            return d.getList();
    }
  },

  ajaxFunction_changeChoice: function() {
    var func = this.getParameter('sysparm_function_select') + "";
    switch(func){
      case 'Domain':
            var d = new DomainSelect();
            return d.changeDomain(this.getParameter('sysparm_value'));
      case 'DefaultDomain':
            var d = new DomainSelect();
            return d.setDefaultDomain();
      case 'Group':
            var d = new GroupSelect();
            return d.changeGroup(this.getParameter('sysparm_value'));
      case 'Encrypt':
            var es = new EncryptionSelect();
            return es.changeKey(this.getParameter('sysparm_value'));
    }
  },

  ajaxFunction_sendAndRefresh: function() {
    gs.include('Scheduler');
    var x = new Scheduler();
    if(this.getParameter('sysparm_action') == 'start')
      x.start(this.getParameter('sysparm_node_id')+'');
    else if(this.getParameter('sysparm_action') == 'stop')
      x.stop(this.getParameter('sysparm_node_id') + '');

  },

  ajaxFunction_ajaxTest: function() {
    gs.print('super duper');
    return answer = 'Yikes!';
  }
});