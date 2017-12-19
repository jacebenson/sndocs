var TextSearchAjax = Class.create();

TextSearchAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      if (this.getName() == "recent")
          return this.getRecentSearches();
  },

  getRecentSearches: function() {
      var answer = new Array();
      var i = 0;

      var hp = new GlideRecord('ts_query');
      hp.addQuery('user', gs.getUserID());
      hp.orderByDesc('sys_updated_on');
      hp.setLimit(10);
      hp.query();

      if (!hp.hasNext())
          answer.push("xyzzyx" + gs.getMessage("No recent searches"));
      else { 
          while (hp.next()) {
              answer.push(hp.search_term.toString());
              i++;
          }
      }

      return answer.join('^');
  },
  
  isPublic: function() {
    return false;
  },
  
  type: "TextSearchAjax"
});