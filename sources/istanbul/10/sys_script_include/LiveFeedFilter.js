var LiveFeedFilter = Class.create();

LiveFeedFilter.prototype = {
  initialize: function() {
  },

  // Return the user profile for the current session
  // Duplicated from LiveFeedUtil to avoid extra dependency
  getSessionProfile: function() {
    return new GlideappLiveProfile().getID();
  },

  // List the groups that the current session may access
  getSessionGroups: function() {
    var gr = new GlideRecord('live_group_member');
    gr.addQuery('member', this.getSessionProfile());
    gr.query();
    result = [];
    while (gr.next()) {
      result.push(gr.group.toString());
    }
    return result;
  },
    
  type: "LiveFeedFilter"
}