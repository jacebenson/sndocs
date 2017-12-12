// Discovery
    
/***
 * The purpose of this class is to provide an adapter API between the Identity and
 * Process Classification phases of Discovery and the CMDB Identification Engine API
 */

ArrayPolyfill;
var DiscoveryCMDBUtil;
(function() {

DiscoveryCMDBUtil = {
    /***
     * useCMDBIdentifiers()
     *
     * @return boolean true, if Discovery should use the CMDB ID Engine, false if should use legacy engine
     */
    useCMDBIdentifiers: useCMDBIdentifiers,

    /***
     * checkInsertOrUpdate(ciData, logger)
     *
     * Used to call the CMDB ID Engine to check whether the given ciData would result in an
     * insert or update without actually committing the data to the CMDB
     *
     * @param CIData, ciData (required) The CIData obj to use for identification
     * @param DiscoveryLogger, logger (required) The DiscoveryLogger instance to use for errors
     *
     * @return {
     *              success:    boolean, true if identification was sucessful, false if unsuccessful
     *              insert:     boolean, true if operation would be an insert (false if would be update)
     *              sysId:      string, sys_id of matching record if update, null if no match (insert)
     *              className:  string, sys_class_name of matching record, null if no match (insert)
     *              attempts:   [], list of identification attempts during matching process
     *         }
     */
    checkInsertOrUpdate: checkInsertOrUpdate,

    /***
     * insertOrUpdate(ciData, logger)
     *
     * Used to call the CMDB ID Engine for identification with the given ciData and commit the insert or update
     *
     * @param CIData, ciData (required) The CIData obj to use for identification
     * @param DiscoveryLogger, logger (required) The DiscoveryLogger instance to use for errors
     *
     * @return {
     *              success:    boolean, true if identification was sucessful, false if unsuccessful
     *              insert:     boolean, true if operation would be an insert (false if would be update)
     *              sysId:      string, sys_id of matching record if update, null if no match (insert)
     *              className:  string, sys_class_name of matching record, null if no match (insert)
     *              attempts:   [], list of identification attempts during matching process
     *         }
     */
    insertOrUpdate: insertOrUpdate,

    /***
	 * rerunIDWithLogContext(contextID, ieDebugLevel, serviceContextDebugLevel, logger)
	 * 
	 * Used to call CMDB ID Engine for rerun identification context, in order to provide more debug logging.
	 */
	rerunIDWithLogContext: rerunIDWithLogContext,

    /***
     * createOrUpdateApp(appGr, hostSysId, relType, attrMap)
     *
     * Used to call the CMDB ID Engine to create or update applications
     *
     * @param GlideRecord appGr (required) The application GlideRecord to update or create
     * @param string hostSysId (required) The sys_id of the host to tie the application to
     * @param string relType (optional; default: Runs on::Runs) The relationship type between the app and host
     * @param {} attrMap (optional) A map of attributes and their values to update for the app
     *
     * @return string sys_id of successful insert/update or null if failure
     */
    createOrUpdateApp: createOrUpdateApp,

/***
     * logIDAttempts(attempts, logger)
 *
     * Used to log match attempts by the CMDB ID Engine
     *
     * @param [], atempts (required) The list of identification attempts to log
     * @param DiscoveryLogger, logger (required) The DiscoveryLogger instance to use for logging
 */

    logIDAttempts: logIDAttempts,
    type: 'DiscoveryCMDBUtil'
};

var json = new JSON();
var cmdbApi = SNC.IdentificationEngineScriptableApi;
var lookupTableCache = {};

function useCMDBIdentifiers() {
    return (JSUtil.toBoolean(gs.getProperty("glide.discovery.use_cmdb_identifiers", "false")) || GlidePluginManager.isRegistered('com.snc.service-mapping'));
}

function createOrUpdateApp(appGr, hostSysId, relType, attrMap) {
    if (JSUtil.nil(appGr) || JSUtil.nil(hostSysId))
        return null;
    
    relType = relType || "Runs on::Runs";
    
    var hostGr = new GlideRecord("cmdb_ci");
    if (!hostGr.get(hostSysId))
        return null;
    
    var hostClass = hostGr.sys_class_name+'';
    
    /***
     * Convert the app (GlideRecord) to a normal js object and update attributes if appropriate
     * This ensures that we use the IE because changing values in the passed down GlideRecord
     * Can possibly circumvent IE updates due to how normal Discovery Sensor processing works
     */
    var appClass = appGr.getTableName();
    var appValues = glideRecordToJS(appGr, attrMap);
    
    /***
     * Remove the sys_id so we utilize IE matching instead of assuming we have the correct application after ADM
     */
    delete appValues.sys_id;
    
    var payload = 
        { 
            "items": [ 
                { "className": appClass, "values": appValues }, // App
                { "className": hostClass, "values": { "sys_id": hostSysId } } // Host
            ],

            "relations": [
                {
                    "parent": 0, 
                    "child": 1, 
                    "type": relType
                }
            ] 
        };

    var result = json.decode(cmdbApi.createOrUpdateCI(gs.getProperty('glide.discovery.source_name', "ServiceNow"), json.encode(payload)));
    return getAppSysIdFromResult(result, appClass);

/***
 * Returns the sys id of the given IE result
     * Assumes that there is only one app per payload
 */
    function getAppSysIdFromResult(result, appClass) {
        if (JSUtil.nil(result) || JSUtil.nil(result.items) || JSUtil.nil(appClass))
        return null;
    
    var sysId = null;
        for (var i = 0; i < result.items.length; i++) {
            var item = result.items[i];
            if (item.className === appClass) {
                sysId = item.sysId;
                break;
        }
    }

    return sysId;
    }

/***
     * Converts a GlideRecord object into a plain js object (ignoring null attributes)
     * And merge with optional map of attributes to update
 */
    function glideRecordToJS(gr, attrMap) {
        var obj = attrMap || {};

        for (var grField in gr) {
            if (obj[grField])
                continue;

            var value = gr.getValue(grField);
            if (JSUtil.nil(value))
                continue;

            obj[grField] = value;
        }

        return obj;
    }
}

function generateIDPayload(ciData) {
    var data = ciData.getData();
    var className = data.sys_class_name;
    var payload = 
        { 
            "items": [
                { 
                    "className": className,
                    "values": valuesToJson(data),
                    "lookup": lookupValuesToJson(ciData, className)
                }
            ] 
        };

    return json.encode(payload);

    /***
     * Make sure that we coerce java strings to javascript
     */
    function valuesToJson(obj) {
    var values = {};
    for (var fieldName in obj)
        values[fieldName] = obj[fieldName] + '';

    return values;
    }

    function itemsToJson(objs, table) {
        var items = [];

        objs.forEach(function(o) {
            if (JSUtil.nil(o))
                return;

            items.push({className: table, values: valuesToJson(o)});
        });

        return items;
    }

/*** 
 * Currently we rely on lookups on cmdb_serial_number and cmdb_ci_network_adapter
 * tables for device identification, so we need to build the lookup payload accordingly
 */
    function lookupValuesToJson(ciData, className) {
        var lookups = [];

        if (isActiveLookupRule(className, "cmdb_serial_number"))
            lookups = lookups.concat(processSerialNumbers(ciData));

        if (isActiveLookupRule(className, "cmdb_ci_network_adapter"))
            lookups = lookups.concat(processNetworkAdapters(ciData));

        return lookups;

        /***
         * Checks if the given lookup table has an active corresponding lookup rule entry for the given class
         */
        function isActiveLookupRule(className, lookupTable) {
            if (!lookupTableCache[className]) {
                lookupTableCache[className] = {};
                j2js(cmdbApi.getLookupRuleTablesForClass(className)).forEach(function(lookupTable){
                    lookupTableCache[className][lookupTable] = true;
                });
            }

            return lookupTableCache[className][lookupTable] || false;
        }

/***
 * Serial numbers must be checked for validity before used for lookup
 * We only want to send valid serial numbers for the lookup & CI reconciliation
 * But we still want the intact list of serial numbers for cleaning up absent/invalid
 */
        function processSerialNumbers(ciData) {
    var validSNs = [];
    var serialNumbers = ciData.getRelatedList("cmdb_serial_number", "cmdb_ci");
    for (var i = 0; i < serialNumbers.length; i++) {
        var srl = serialNumbers[i];
        var sn = new SncSerialNumber();
        if (sn.isValid(srl.serial_number))
            validSNs.push(srl); 
    }

            return itemsToJson(validSNs, "cmdb_serial_number");
        }

/***
 * Network adapters must be checked for validity before used for lookup
 */
        function processNetworkAdapters(ciData) {
    var validAdapters = [];
    var networkAdapters = ciData.getRelatedList("cmdb_ci_network_adapter", "cmdb_ci");
    for (var i = 0; i < networkAdapters.length; i++) {
        var adapter = networkAdapters[i];
                if (isInvalidAdapter(adapter))
            continue;

                var cleanedAdapter = {};
                for (var fieldName in adapter) {
                    if (fieldName === "mac_address") {
        var ma = SncMACAddress.getMACAddressInstance(adapter.mac_address);
                        cleanedAdapter.mac_address = ''+ma.getAddressAsString();
                    } else {
                        var value = adapter[fieldName];
                        // We only care about flat values for the NIC for use in identifiers,
                        // the related list comes with arrays of IP addresses and route maps
                        // that shouldn't be passed to the Identification Engine
                        if (value instanceof Array || typeof value === 'object')
                            continue;

                        cleanedAdapter[fieldName] = value + '';
                    }
                }

        validAdapters.push(cleanedAdapter);
    }

            return itemsToJson(validAdapters, "cmdb_ci_network_adapter");

/*** 
 * A valid NIC must have a mac address, ip address, name and cannot be a localhost or loopback adapter
 */
            function isInvalidAdapter(adapter) {
    if (JSUtil.nil(adapter.mac_address) || JSUtil.nil(adapter.ip_address))
        return true;
    
    // Localhost adapter check
    if (adapter.ip_address == '127.0.0.1')
        return true;

    if (adapter.ip_addresses) {
        for (var i = 0; i < adapter.ip_addresses.length; i++) {
            if (adapter.ip_addresses[i].ip_address == '127.0.0.1')
                return true;
        }
    }

    // Loopback adapter check
    return (JSUtil.nil(adapter.name) || adapter.name.startsWith("lo"));
            }
        }
    }
}
    
function logIDAttempts(attempts, logger) {
    if (JSUtil.nil(attempts))
        return;
    
    var resultMap = { "MATCHED": "Match",
                      "NO_MATCH": "No Match",
                      "MULTI_MATCH": "Multi-Match Error",
                      "SKIPPED": "Skipped Identifier Entry" };

    attempts.forEach(function(attempt, i) {
        var identifier = attempt.identifierName !== null ? attempt.identifierName : "";
        var result = resultMap[attempt.attemptResult];
        var table = attempt.searchOnTable !== null ? attempt.searchOnTable : "";
        var attributes = attempt.attributes !== null ? attempt.attributes.join(", ") : "";

        var logMsg = "Rule " + (i+1) + ": Searched on <" + table + "> for attributes: " + attributes + ": " + result;
        
        if (result === resultMap.MULTI_MATCH)
            logger.warn(logMsg, "Identifier: " + identifier);
        else
            logger.info(logMsg, "Identifier: " + identifier);
    });
    }

function parseIDResult(result, logger) {
    var idResultObj = {     success:    false,
                            insert:     false,
                            sysId:      null,
                            className:  null,
						    logContextId: null,
                            attempts:   [] };

	// Set the log context ID if there is one
    idResultObj.logContextId = result.logContextId;
	
    if (JSUtil.nil(result) || JSUtil.nil(result.items) || !result.items.length || result.items.length > 1)
        return idResultObj;

    // There should be only one item returned
    var item = result.items[0];
	
	if (item.errors) {
        if (logger) {
            // Log attempts in case of multi-match error to see which failed
            logIDAttempts(item.identificationAttempts, logger);
            item.errors.forEach(function(error) {
                // These are redundant to log since any error will cause an 'ABANDONED' msg
                // and we already specifically logged the multi-match attempt
                if (error.error !== "MULTI_MATCH" && error.error !== "ABANDONED") {
                    
					logger.error("CMDB Identification Error: " + error.message);
					
					if (g_device) {
						if (GlidePluginManager.isActive("com.snc.discovery.ip_based")) {
							var logLastError = new SNC.DiscoveryErrorMessagesHandler();
							logLastError.createOrUpdate(g_device.source,error.message, 'Configuration','identification', '');
						}
					}
				}
            });
        }
		
		this.logITOMError(item.errors);
        return idResultObj;
    }

    idResultObj.success = true;
    idResultObj.insert = item.operation === "INSERT" ? true : false;
    idResultObj.sysId = item.sysId || null; // will be undefined if its a check call which returns insert
    idResultObj.className = item.className;
    idResultObj.attempts = item.identificationAttempts;

    return idResultObj;
    }
    
function checkInsertOrUpdate(ciData, logger) {
    var payload = generateIDPayload(ciData);
	var result = json.decode(cmdbApi.identifyCI(payload));
    return parseIDResult(result, logger);
}

function insertOrUpdate(ciData, logger) {
    var payload = generateIDPayload(ciData);
	
	// Before we insert or update a CI - lets see if we need to reconcile with a CI created by credential less discovery created CI
	new SncCredentiallessDeviceDiscovery().reconcileJson(payload);
    
    var result = json.decode(cmdbApi.createOrUpdateCI(gs.getProperty('glide.discovery.source_name', "ServiceNow"), payload));
	return parseIDResult(result, logger);
}

// Possible value of ieDebugLevel and serviceCacheDebugLevel: Info, Warn, Error, Debug, DebugVerbose, DebugObnoxious
function rerunIDWithLogContext(logContextId, ieDebugLevel, serviceCacheDebugLevel, logger) {
	var runId = cmdbApi.runIdentificationContext(logContextId, ieDebugLevel, serviceCacheDebugLevel);
	var gr = new GlideRecord('cmdb_ie_run');
	gr.get(runId);
	var result = json.decode(gr.getValue('output_payload'));
	result.logContextId = logContextId;
	return parseIDResult(result, logger);
}

function logITOMError(errors) {
	if (JSUtil.nil(errors))
		return;
	
	// full list of codes in IdentificationError.java
	errors.forEach(function(error) {
		var code = 'SN-5999'; // Unexpected error
        if (error.error == 'MULTI_MATCH')
            code = 'SN-1561';
		else if (error.error == 'INVALID_INPUT_DATA')
			code = 'SN-1552';
		
		SNC.DiscoveryErrorMessage.insert(code, g_device.status, null, g_device.source, error.message);
    });
}

})();