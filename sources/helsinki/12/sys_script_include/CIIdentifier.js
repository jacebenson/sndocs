// CI Identification class

/**
 * Loads and processes Discovery CI Identifiers.
 * 
 * Aleck Lin aleck.lin@service-now.com
 */
var CIIdentifier = Class.create();

/*
 * Loads a identifier by name and tables that it applies to and then runs it against the specified parameters.
 * @param string identifierName The ci_identifier name
 * @param string appliesToTable The CI table
 * @param object ciData
 * @return CIIdentifierResult
 * @throws AutomationException on invalid identifier
 */
CIIdentifier.run = function(identifierName, appliesToTable, ciData, log) {
    var recordUtil = new GlideRecordUtil();
    var identifierRecord = new GlideRecord('ci_identifier');
    identifierRecord.addQuery('name', identifierName);
    identifierRecord.addQuery('applies_to', recordUtil.getTables(appliesToTable));
    identifierRecord.orderBy('order');
    identifierRecord.setLimit(1);
    identifierRecord.query();
    if (!identifierRecord.next())
      throw new AutomationException('Identifier `' + identifierName + '` does not exist and cannot be ran.');

    var identifier = {};
    recordUtil.populateFromGR(identifier, identifierRecord);
    var func = eval( '(' + identifier.script + ')' ); 
    return func(ciData, ( log ? log : new DiscoveryLogger() ), identifier); 
}

CIIdentifier.prototype = {

    /*
     * Truth table to determine the outcome of identifiers.
     * Match means having matchable data, 
     * 0 means no match, 
     * 1 means exactly 1 match,
     * M means multiple matches
     *
     *  Match | 0 | 1 | M | (state value) | Continue Discovery | Create CI 
     *   ----------------------------------------------------------------------
     *    F   | F | F | F |     0         |        N           |     N           
     *    F   | F | F | T |     1         |        N           |     N 
     *    F   | F | T | F |     2         |        N           |     N 
     *    F   | F | T | T |     3         |        N           |     N 
     *    F   | T | F | F |     4         |        N           |     N 
     *    F   | T | F | T |     5         |        N           |     N 
     *    F   | T | T | F |     6         |        N           |     N 
     *    F   | T | T | T |     7         |        N           |     N 
     *    T   | F | F | F |     8         |        N           |     N 
     *    T   | F | F | T |     9         |        N           |     N 
     *    T   | F | T | F |    10         |        Y           |     N 
     *    T   | F | T | T |    11         |        Y           |     N 
     *    T   | T | F | F |    12         |        Y           |     Y 
     *    T   | T | F | T |    13         |        N           |     N 
     *    T   | T | T | F |    14         |        Y           |     N 
     *    T   | T | T | T |    15         |        Y           |     N 
     */

    continueDiscovery: [false, false, false, false, false, false, false, false,
                        false, false, true,  true,  true,  false, true,  true], 
    
    /*
     * Initializes a new instance of this class. Loads all the identifiers. 
     * 
     * status: sys_id of discovery status record, or null if none
     * debug: boolean, true if debugging is enabled
     */
    initialize: function(ciData, logger, debug) {
        this.debug_flag = debug;      // boolean, true if debugging is enabled...
        this.ciData = ciData;         // CIData instance for our CI...
        this.identifiers = [];        // the identifiers that apply to our CI, once load() is called... 
        this.logger = logger;
        
        this.debug('CIIdentifier.initialize()');
    },
    
    /*
     * Returns an instance of IDResult containing the results of the identification process.
     */
    run: function() {
        this.debug('CIIdentifier.run()');
       
        var target = null;
        var matchable = false;
        var mulMatch = false;
        var oneMatch = false;
        var noMatch = false;
        var continueExplore = false;

        if (this.identifiers.length == 0) {
            logger.warn("No identifiers are loaded!");
            return new IDResult(continueExplore, target);;
        }

        // iterate through all our identifiers figuring out what to do...
        for (var i = 0; i < this.identifiers.length; i++) {
            // first, some setup...
            var identifier = this.identifiers[i];
            var name = identifier.name;
            // now run the identifier's script, catching any exceptions the identifier's script throws...
            var logger = new DiscoveryLogger();
            try {
                var ciIDResult = this._runIdentifier(name, identifier, this.logger);
                
                if (ciIDResult.matchable) {
                    matchable = true;
                    
                    // if we got exactly one match, we've got our CI...
                    if (ciIDResult.matched.length == 1) {
                        oneMatch = true;
                        target = ciIDResult.matched[0];
                        this.logger.info('Exactly one match was found in the CMDB: ' + this.cisMatched(ciIDResult.matched), 'Identifier: ' + name);
                        break;
                    }                    

                    // if we got no matches, then remember if we got matchable information...
                    else if (ciIDResult.matched.length == 0) {
                        noMatch = true;
                        this.logger.info('No match was found in the CMDB, but there is matchable info', 'Identifier: ' + name);
                    }
   
                    // if we got multiple matches, move along to the next identifier...
                    else if (ciIDResult.matched.length > 1) {
                        mulMatch = true;
                        this.logger.info('Multiple matches were found in the CMDB: ' + this.cisMatched(ciIDResult.matched), 'Identifier: ' + name);
                    }

                } else
                    this.logger.info('There is no valid data to match', 'Identifier: ' + name);

            } catch (ex if ex instanceof AutomationException) {
                this.logger.error('Script evaluation error in identifier "' + name + '": ' + ex.getMessage(), 'CIIdentifier');
                break;       
            } catch (ex) {
                this.logger.error('Script evaluation error in identifier "' + name + '": ' + ex, 'CIIdentifier');
                break;
            }

            if (ciIDResult.terminatedChain) {
                this.logger.info('CI Identification process is stopped after running the identifier: ' + name);
                break;
            }
            
        }
        
        //Check the state table to see what we should do here.
        var state = this.findState(matchable, noMatch, oneMatch, mulMatch);
        continueExplore = this.continueDiscovery[state];

        return new IDResult(continueExplore, target);
    },
    
    _runIdentifier: function(name, identifier, logger) {
        this.debug('Running CI identifier: ' + name);
        var func = eval( '(' + identifier.script + ')' );  // get the identifier's script into a variable...
        return func(this.ciData, logger, identifier);  // execute the identifier's function...
    },
    
    /*
     * Load all the identifiers that apply to the given table name, into an array of hashmaps...
     * 
     * table: the table name of our source
     */
    load: function(table) {
        var gru = new GlideRecordUtil();
        var tables = gru.getTables(table);
        this.identifiers = [];
        var fgr = new GlideRecord('ci_identifier');
        fgr.addQuery('applies_to', tables);
        fgr.addActiveQuery();
        fgr.orderBy('order');
        fgr.query();

        while (fgr.next()) {
            var hm = {};
            gru.populateFromGR(hm, fgr);
            this.identifiers.push(hm);
        }
    },

    cisMatched: function(matched) {
        var matches = [];
        for (var i = 0; i < matched.length; i++)
            matches.push('' + new RecordToHTML('cmdb_ci', matched[i], '${name}',  true));
        return '[code]' + matches.join(', ') + '[/code]';
    },
    
    findState: function(matchable, noMatch, oneMatch, mulMatch) {
        return matchable * 8 + noMatch * 4 + oneMatch * 2 + mulMatch;
    },

    debug: function(msg) {
        if (this.debug_flag)
            this.logger.info(msg, 'CIIdentifier');
    },

    type: 'CIIdentifier'
}
