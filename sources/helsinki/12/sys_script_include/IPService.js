// Discovery class

/**
 * Encapsulates the notion of an IP Service.  Instances where isValid() returns true have the 
 * following properties initialized:
 * 
 * sysID:       sys_id of this record
 * port:        the TCP or UDP port used by the service
 * protocol:    protocol used by the service ("UDP", "TCP", or "TCP/UDP")
 * name:        short name or handle
 * serviceName: long, descriptive English name
 * creates:     table that this service creates entries in
 * description: description
  * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var IPService = Class.create();

/*
 * Get an array of IPService instances specified by a Java ArrayList of sysIDs.
 */
IPService.getFromArrayList = function(list) {
    return AbstractDBObject._getFromArrayList(list, 'cmdb_ip_service', IPService);
}

IPService.prototype = Object.extend(new AbstractDBObject(), {
    /*
     * Initializes this instance from the given source, which must be either a GlideRecord instance or a sysID string.
     */
    initialize: function(source) {
        // see if we've even got a record here...
        this.valid = false;
        var gr = this._getRecord(source, 'cmdb_ip_service');
        if (!gr)
            return;
            
        // we've got our record, so record our information...
        this.valid = true;
        this.sysID       = gr.getValue( 'sys_id'       );
        this.port        = gr.getValue( 'port'         );
        this.protocol    = gr.getValue( 'protocol'     );
        this.name        = gr.getValue( 'name'         );
        this.serviceName = gr.getValue( 'service_name' )
        this.creates     = gr.getValue( 'creates'      );
        this.description = gr.getValue( 'description'  );
     },
    
    type: "IPService"
});
