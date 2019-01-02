// Discovery
/**
 * Traverses a relationship schema for CIs.
 * @author roy.laurie
 *
 * Example usage:
 *
 * var ciwalker = new CIRelationWalker('cmdb_ci_storage_server(Runs on::Depends on,Installed on::Hosted on).cmdb_ci_storage_pool.cmdb_ci_storage_volume');
 * var server = null;
 * // perform a reverse-traversal back up to the server record, from the volume record.
 * ciwalker.moonwalk(volumeci, function(serverRecord) {
 *    gs.log('Volume CI lives on server: ' + serverRecord.name);
 *    server = serverRecord;
 * });
 * // perform a traversal from the server record down to all of its volume records
 * ciwalker.walk(server, function(volumeRecord) {
 *    gs.log('Server CI has volume: ' + volumeRecord.lun);
 * });
 *
 * Or build using cascaded calls:
 *
 * var ciwalker = new CIRelationWalker()
 * .addRelation('cmdb_ci_storage_server', [ 'Runs On::Depends On', 'Installed on::Hosted on' ], 'cmdb_ci_storage_pool')
 * .addRelation('cmdb_ci_storage_pool', , 'Runs On::Depends On', 'cmdb_ci_storage_volume');
 * .addRelation('cmdb_ci_storage_pool', , [], 'cmdb_ci_storage_volume');
 */
var CIRelationWalker = Class.create();

/**
 * Represents a single relationship node in the walker schema.
 * @param string originTable The parent table of the relationship.
 * @param string targetTable The child table of the relationship.
 * @param string|[string] The nature(s) of the relationship.
 */
CIRelationWalker.Relation = function(originTable, natures, targetTable) {
    this.originTable = originTable;
    this.targetTable = targetTable;
	this.relationTypeIds = [];
	
	if (gs.nil(natures))
		return;
   
	if (typeof(natures) === 'string') {
		this.relationTypeIds.push(new DiscoveryFunctions().findCIRelationshipType('cmdb_rel_type', natures));
	} else {
		for (var i = 0, n = natures.length; i < n; ++i)
			this.relationTypeIds.push(new DiscoveryFunctions().findCIRelationshipType('cmdb_rel_type', natures[i]));
	}
};

CIRelationWalker.prototype = {
	/**
	 * @param string|undefined relationQuery Optionally pass a dot-notation query to build the schema.
	 */
    initialize: function(relationQuery) {
		this._debugLogger = null;

		if (!gs.nil(relationQuery))
			this._relations = this._parseQuery(relationQuery);
		else
			this._relations = [];
	},
   
	/**
	 * @param Function((string), (string)class, (string)method)|null The debug logger to use or null (default) to disable.
	 */
	setDebugLogger: function(debugLogger) {
		this._debugLogger = debugLogger;
	},
   
	/**
	 * @param string query
	 * @return [CIRelationWalker.Relation]
	 */
	_parseQuery: function(query) {
		var relations = [];
		var originTable = null;
		var originNatures = null;
		var tokens = query.split(/\./);
		for (var i = 0, n = tokens.length; i < n; ++i) {
			var parts = tokens[i].split(/\(/); // bug in rhino prevents proper regex here
			if (parts[1] === undefined) {
				var table = tokens[i];
				var natures = [];
			} else {
				var table = parts[0];
				var natures = parts[1].substr(0, parts[1].length - 1);
				natures = natures.split(/,/);
			}

			if (originTable !== null)
				relations.push(new CIRelationWalker.Relation(originTable, originNatures, table));
		   
			originTable = table;
			originNatures = natures;
		}
	   
		return relations;
	},
   
	/**
	 * @param string originTable
	 * @param string|[string] natures The CI relationship type description(s). Single or array. E.g., 'Runs on::Hosted on'
	 * @return CIRelationWalker this. Allows for cascaded calls.
	 */
    addRelation: function(originTable, natures, targetTable) {
        this._relations.push(new CIRelationWalker.Relation(originTable, natures, targetTable));
	    return this;
    },
   
	/**
	 * Traverses the relationship schema from origin (parent) to target (child).
	 * @param string originId The origin (parent) CI id to start from.
	 * @param Function(targetId) The listener function to call iteratively, for each target CI found.
	 */
    walk: function(originId, onTarget) {
        this._traverse([originId], 0, true, onTarget);
	},
   
	/**
	 * Traverses the relationship schema from target (child) to origin (parent), effectively in reverse.
	 * @param string targetId The target (child) CI id to start from.
	 * @param Function(originId) onOrigin The listener function to call iteratively, for each origin CI found.
	 */
    moonwalk: function(targetId, onOrigin) {;
	    this._traverse([targetId], this._relations.length - 1, false, onOrigin);
	},
   
	/**
	 * Recursive.
	 * @param [string] ids The IDs to use as origin (walk) or target (moonwalk).
	 * @param integer relationsIndex The index of the CIRelationWalker.Relation in the schema to query against.
	 * @param boolean isIncrement TRUE if walking, FALSE if moonwalking.
	 * @param Function(id) onEnd The listener function call iteratively, if an end-point CI is found.
	 */
	_traverse: function(ids, relationsIndex, isIncrement, onEnd) {
        var relation = this._relations[relationsIndex];
		var relationRecords = new GlideRecord('cmdb_rel_ci');
 	   if (isIncrement) { // for walk()
		    relationRecords.addQuery('parent', ids);
    		relationRecords.addQuery('child.sys_class_name', relation.targetTable);
	    } else { // for moonwalk()
		    relationRecords.addQuery('child', ids);
    		relationRecords.addQuery('parent.sys_class_name', relation.originTable);	    
		}
	   
		if (relation.relationTypeIds !== null && relation.relationTypeIds.length > 0)
		    relationRecords.addQuery('type', relation.relationTypeIds);
		
		relationRecords.query();
	   
		if (this._debugLogger)
			var relationIds = [];
	   
		var nextIds = [];
		while (relationRecords.next()) {
			if (this._debugLogger)
				relationIds.push(''+relationRecords.sys_id);
			   
			nextIds.push(this._getNextId(relationRecords, isIncrement));
		}
	   
		var isEnd = ( ( isIncrement && (relationsIndex + 1) >= this._relations.length ) || ( !isIncrement && (relationsIndex - 1) < 0 ) );
		var index = ( isIncrement ? relationsIndex + 1 : relationsIndex - 1 );
		   
		if (this._debugLogger)
			this._logTraversal(ids, relation, relationIds, nextIds, isEnd);
	   
		// call the listener for end-point CIs if it's time
		if (isEnd) {
			for (var i = 0 , n = nextIds.length; i < n; ++i)
		        onEnd(nextIds[i]);
	   
	        return;
	    }

		this._traverse(nextIds, index, isIncrement, onEnd);
	},

	_logTraversal: function(ids, relation, relationshipIdsFound, cisFound, isEnd) {
		var payload = {
			forCIs: ids,
			relation: relation,
			foundRelationships: relationshipIdsFound,
			foundCIs: cisFound,
			isEnd: isEnd
		};

		this._debugLogger(JSUtil.describeObject(payload, 'debug'), this.type, '_traverse');
	},
   
	/**
	 * Retrieves the child or parent sys id for a relationship record depending on walk() or moonwalk().
	 */
	_getNextId: function(relationshipRecord, isIncrement) {
		return '' + ( isIncrement ? relationshipRecord.child : relationshipRecord.parent );
	},
   
    type: 'CIRelationWalker'
}