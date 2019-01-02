var gr = new GlideRecord('ts_query');
gr.initialize();
gr.addQuery('user', gs.getUserID());
gr.addQuery('search_term', g_request.getParameter('sysparm_search'));
gr.query();
if (gr.next()) {
  gr.setForceUpdate(true);
  gr.update();
} else {
  gr.initialize();
  gr.setValue('user', gs.getUserID());
  gr.search_term = g_request.getParameter('sysparm_search');
  gr.insert();
}


var current_site = g_request.getParameter('sysparm_current_site');
var sp = getResultPage(current_site);

var pl = new GlideCMSPageLink().getPageLink(sp);

var sep = pl.indexOf('?') == -1 ? '?' : '&';
g_response.sendRedirect(pl + sep + 'sysparm_search=' + g_request.getParameter('sysparm_search'));

function getResultPage(site) {
  var answer;
  if (site) {
    var gr = new GlideRecord('content_site');
    if (gr.get(site)) 
       answer = gr.getValue('search_page');
  }

  if (answer)
    return answer;

  return GlideContentConfig.get().getSearchPage(); 
}