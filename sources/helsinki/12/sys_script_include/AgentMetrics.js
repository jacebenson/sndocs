gs.include("PrototypeServer");

/**
 * Processes inbound MID server metrics.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var AgentMetrics = Class.create();

AgentMetrics.prototype = {
    
    /*
     * Initializes a new instance of this class. 
     */
    initialize: function() {
    },
    
    process: function(midID, doc) {
        if (!midID)
            return;
            
        var root = doc.getDocumentElement();
        var XMLUtil = GlideXMLUtil;
        var metrics = XMLUtil.selectNodes(root, '//metric');
        
        for (var i = 0; i < metrics.getLength(); i++) {
            var metric = metrics.item(i);
            var name = metric.getAttribute('name');
            this.handleMemory(  metric, name, midID );
            this.handleCounter( metric, name, midID );
            this.handleRGR(     metric, name, midID );
            this.handleScalar(  metric, name, midID );
        }
    },
    
    handleCounter: function(metric, name, midID) {
        if (metric.getAttribute('type') != 'counter')
            return;
        
        var values = {};
        values['count'] = metric.getAttribute('count');
        this.updateMetric('ecc_agent_counter_metric', values, metric, midID);
    },
    
    handleScalar: function(metric, name, midID) {
        if (metric.getAttribute('type') != 'scalar')
            return;
        
        var values = {};
        values ['count']       = metric.getAttribute( 'count'       );
        values ['min']         = metric.getAttribute( 'min'         );
        values ['max']         = metric.getAttribute( 'max'         );
        values ['mean']        = metric.getAttribute( 'mean'        );
        values ['median']      = metric.getAttribute( 'median'      );
        values ['chi2_mean']   = metric.getAttribute( 'chi2_mean'   );
        values ['chi2_median'] = metric.getAttribute( 'chi2_median' );
        this.updateMetric('ecc_agent_scalar_metric', values, metric, midID);
    },
    
    handleRGR: function(metric, name, midID) {
        if (name.indexOf('remote_glide_record.bytes_to_time') != 0)
            return;
        
        var values = {};
        values['count']             = metric.getAttribute( 'count'             );
        values['bytes_per_second']  = metric.getAttribute( 'bytes_per_second'  );
        values['overhead_ms']       = metric.getAttribute( 'overhead_ms'       );
        values['chi2']              = metric.getAttribute( 'chi2'              );
        values['min_bytes']         = metric.getAttribute( 'min_bytes'         );
        values['max_bytes']         = metric.getAttribute( 'max_bytes'         );
        values['mean_bytes']        = metric.getAttribute( 'mean_bytes'        );
        values['median_bytes']      = metric.getAttribute( 'median_bytes'      );
        values['chi2_mean_bytes']   = metric.getAttribute( 'chi2_mean_bytes'   );
        values['chi2_median_bytes'] = metric.getAttribute( 'chi2_median_bytes' );
        values['min_ms']            = metric.getAttribute( 'min_ms'            );
        values['max_ms']            = metric.getAttribute( 'max_ms'            );
        values['mean_ms']           = metric.getAttribute( 'mean_ms'           );
        values['median_ms']         = metric.getAttribute( 'median_ms'         );
        values['chi2_mean_ms']      = metric.getAttribute( 'chi2_mean_ms'      );
        values['chi2_median_ms']    = metric.getAttribute( 'chi2_median_ms'    );
        
        this.updateMetric('ecc_agent_rgr_metric', values, metric, midID);
    },
    
    handleMemory: function(metric, name, midID) {
        if (name.indexOf('memory.') != 0)
            return;
        
        var values = {};
        values['count']                  = metric.getAttribute( 'count'                  );
        values['min_used_bytes']         = metric.getAttribute( 'min_used_bytes'         );
        values['max_used_bytes']         = metric.getAttribute( 'max_used_bytes'         );
        values['median_used_bytes']      = metric.getAttribute( 'median_used_bytes'      );
        values['chi2_used_median']       = metric.getAttribute( 'chi2_used_median'       );
        values['min_allocated_bytes']    = metric.getAttribute( 'min_allocated_bytes'    );
        values['max_allocated_bytes']    = metric.getAttribute( 'max_allocated_bytes'    );
        values['median_allocated_bytes'] = metric.getAttribute( 'median_allocated_bytes' );
        values['max_available_bytes']    = metric.getAttribute( 'max_available_bytes'    );
        values['max_used_pct']           = 100.0 * values['max_used_bytes']      / values['max_available_bytes'];
        values['max_allocated_pct']      = 100.0 * values['max_allocated_bytes'] / values['max_available_bytes'];
        
        this.updateMetric('ecc_agent_memory_metric', values, metric, midID);
    },
    
    updateMetric: function(tableName, values, metric, midID) {
        values['type']  = metric.getAttribute( 'type' );
        values['name']  = metric.getAttribute( 'name' );
        values['agent'] = midID;
        
        var gr = new GlideRecord(tableName);
        gr.initialize();
        for (var fieldName in values) {
            var value = values[fieldName];
            
            // if the value is numeric, make sure it fits in an integer field type...
            if (value.match(/^\d+(?:\.\d+)?$/)) {
                value = Math.round(value);
                value = Math.min(value, 2147483647);
                value = Math.max(value, -2147483648);
            }
            
            gr[fieldName] = value;
        }
        gr.insert();
    },
   
    type: 'AgentMetrics'
}
