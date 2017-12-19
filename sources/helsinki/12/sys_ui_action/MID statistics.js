// on ecc_agent table, list link and form link...
allStats();

function allStats() {
    var pt1 = 'ecc_queue_list.do?sysparm_query=topic%3Dqueue.stats^agent%3Dmid.server.';
    var pt2 = current.getValue('name');
    var pt3 = '^ORDERBYDESCsys_created_on';
    var url = pt1 + pt2 + pt3;
    gs.setRedirect(url);
}

