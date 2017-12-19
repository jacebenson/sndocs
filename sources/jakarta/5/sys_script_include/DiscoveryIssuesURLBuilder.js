// Discovery class

/**
 * Builds a URL for the calculated issues_link field in discovery_device_history.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryIssuesURLBuilder = Class.create();

DiscoveryIssuesURLBuilder.url = function(dh) {
    if (dh.issues == 0)
        return 'NULL';
   
    // get message from first log entry with something in it...
    var gr = new GlideRecord('discovery_log');
    gr.addQuery('status', '' + dh.status);
    gr.addQuery('device_history', '' + dh.sys_id);
    gr.addQuery("sys_created_on", ">", dh.sys_created_on);  // Bounding the queries for the discovery log because of table rotation.
    gr.addQuery("sys_created_on", "<=", dh.sys_updated_on);
    gr.addQuery('level', '!=', 0);
    gr.orderBy("sys_created_on"); // Pick up the warnings or errors in order...
    gr.query();
    var msg = '';
    while (gr.next() && (msg.length < 60)) {
        if (msg.length > 0)
            msg += '; ';
        msg += gr.message;
    }
    
    // remove any double quotes and single quotes...
    msg = msg.replace(/[\"\']/g, '');
    
    // limit length to 60 characters so we don't exceed length of table field...
    if (msg.length > 58)
        msg = msg.substr(0, 55) + '...';
        
    // if we don't have a message, put 'See log for details' into message...
    if (gs.nil(msg))
        msg = 'See log for details...';
    
    // now build the URL, since we know it all...
    var url = [];
    url.push( '[code]<a title="' );
    url.push( msg );
    url.push( '" class="linked" href="discovery_log_list.do' );
    url.push( '?sysparm_query=status=' );
    url.push( dh.status );
    url.push( '^level!=0^ORlevel=NULL^device_history=' );
    url.push( dh.sys_id );
    url.push( '">Details</a>[/code]' );
    url = url.join('');
    
    return url;
}

DiscoveryIssuesURLBuilder.prototype = Object.extend(new AbstractDBObject(), {
    type: "DiscoveryIssuesURLBuilder"
});
