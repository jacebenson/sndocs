var TimezoneAjax = Class.create();

TimezoneAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
    if (this.getName() == "getRole")
      return this.getRole();
    else if (this.getName() == "getTimeZones")
      this.getTimeZones();
    else if (this.getName() == "getDefaultTimeZone")
      this.getDefaultTimeZone();
    else if (this.getName() == "changeTimeZone")
      this.changeTimeZone(this.getValue());
  },

  getRole: function() {
    return gs.getProperty('glide.timezone_changer.roles', '');
  },

  getTimeZones: function() {
    this.getRootElement().setAttribute('currentTZ', gs.getSession().getTimeZoneName());

    var gr = new GlideRecord("sys_choice");
    gr.addQuery('name', 'sys_user');
    gr.addQuery('element', 'time_zone');
    gr.addQuery('language', gs.getSession().getLanguage());
    gr.addQuery('inactive', '0');
    gr.addQuery('value', '!=', 'NULL_OVERRIDE');
    gr.orderBy('label');
    gr.query(); 

    // add the available timezones to selection from
    while (gr.next()) {
      var item = this.newItem();
      item.setAttribute('value', gr.getValue('value'));
      item.setAttribute('label', gr.getValue('label'));
    }
  },

  changeTimeZone: function(newTZ) {
    gs.getSession().setTimeZoneName(newTZ);
    gs.log("Timezone change to " + newTZ);
  },

  getDefaultTimeZone: function() {
    var defaultTZ = gs.getSession().getTimeZoneName();
    this.getRootElement().setAttribute('currentTZ', defaultTZ);
  },

  type: "TimezoneAjax"
});