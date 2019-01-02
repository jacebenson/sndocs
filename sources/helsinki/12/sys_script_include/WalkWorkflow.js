/**
 * Walk the workflow and get the list of successors for each activity along with
 * a shortest path order indicating how deep the activity is in the workflow
 */

/* global 
 *   gs
 */
/* eslint-disable strict 
 */

gs.include("PrototypeServer");

var WalkWorkflow = Class.create();
WalkWorkflow.prototype = {
	MAX_SEQUENCE_COUNT : 2000,
	MAX_SEQUENCE_LENGTH : 100,

	initialize : function(/* GlideRecord */workflowVersion) {
		this.workflowVersion = workflowVersion;
	},

	/**
	 * Walk the workflow and set up the activity shortest path ordering
	 */
	walk : function(/* boolean */fullSequences) {
		this.activities = {};
		this._getDependencyMap();
		this._setShortestPathOrders();
		if (fullSequences)
			this.computeFullSequences();
		else
			this.computeSequences();
	},

	/**
	 * Get all of the activities at the specified shortest path order
	 * 
	 * returns an array of activity sys_ids at the specified order if an empty
	 * array is returned, there are no more activities
	 */
	getActivitiesAtOrder : function(order) {
		var ret = [];
		for ( var id in this.activities) {
			if (this.activities[id].order == order)
				ret.push(id);
		}
		return ret;
	},

	/**
	 * Get the activity sequences as a string of |-terminated comma-separated
	 * lists of activities (walk() must have been called prior to calling this
	 * method)
	 */
	getSequences : function() {
		var seqs = [];
		var len = this.sequences.length;
		for (var i = 0; i < len; i++)
			seqs.push(this._getSequence(this.sequences[i]));

		return seqs.join('|');
	},

	_getSequence : function(seq) {
		var a = [];
		var len = seq.length;
		for (var i = 0; i < len; i++)
			a.push(seq[i]);

		return a.join(",");
	},

	_getDependencyMap : function() {
		this.transitions = {};
		var gr = new GlideRecord('wf_activity');
		gr.addQuery('workflow_version', this.workflowVersion.sys_id);
		gr.addNullQuery('parent');
		gr.query();
		while (gr.next()) {
			var activity = new WalkWorkflowActivity(gr.sys_id.toString(),
					gr.name.toString(), gr.activity_definition.attributes
							.toString());
			this.activities[activity.sys_id] = activity;
		}

		this._getChildren();

		for ( var id in this.activities) {
			var activity = this.activities[id];
			this._getTransitions(activity);
		}
	},

	_getChildren : function() {
		// load up any child activities and associated them with their parent
		var gr = new GlideRecord('wf_activity');
		gr.initialize();
		gr.addQuery('workflow_version', this.workflowVersion.sys_id);
		gr.addNotNullQuery('parent');
		gr.query();
		while (gr.next()) {
			var parent = this.activities[gr.parent.toString()];
			if (!parent)
				continue;

			var activity = new WalkWorkflowActivity(gr.sys_id.toString(),
					gr.name.toString(), gr.activity_definition.attributes
							.toString());
			parent.children.push(activity);
		}
	},

	_getTransitions : function(activity) {
		var sysId = activity.sys_id.toString();
		var gr = new GlideRecord('wf_transition');
		gr.addQuery('from', sysId);
		gr.query();
		while (gr.next()) {
			if (gr.condition.skip_during_generate == true)
				activity.tos[gr.to.toString()] = "skipped";
			else
				activity.tos[gr.to.toString()] = "not_skipped";
		}
	},

	// Set shortest path order to each activity
	_setShortestPathOrders : function() {
		this._setShortestPathOrder(this.workflowVersion.start, 0, {});
	},

	_setShortestPathOrder : function(sysId, order, visited) {
		var activity = this.activities[sysId];
		if (visited[sysId])
			return;

		visited[sysId] = true;
		if (activity.order == 0)
			activity.order = order;

		order++;
		for ( var to in activity.tos) {
			this._setShortestPathOrder(to, order, visited);
		}
	},

	/**
	 * Compute the sequences of activities. All sequences leading up to a join
	 * end at the join and then a single sequence from the join is computed.
	 * This ensures that we can walk all sequences up to a join and then walk
	 * the sequence from the join.
	 * 
	 * For example:
	 * 
	 * Begin -> T1 -> T1.1 -> Join1 -> T3 -> End -> T2 -------------^
	 * 
	 * would result in these sequences:
	 * 
	 * 1. Begin, T1, T1.1, Join1 2. Begin, T2, Join1 3. Join1, T3, End
	 * 
	 * and this:
	 * 
	 * Begin -> T1 -> T1.1 -> Join1 -------> T3 -> Join2 -> T5 -> End -> T2
	 * -------------^ -> T4 -----^
	 * 
	 * would result in these sequences:
	 * 
	 * 1. Begin, T1, T1.1, Join1 2. Begin, T2, Join1 3. Join1, T3, Join2 4.
	 * Join1, T4, Join2 5. Join2, T5, End
	 */
	computeSequences : function() {
		this.visited = {};
		this.sequences = [];
		this.sequenceKeys = {};
		this.joins = [];
		this.sequenceCount = 0;
		this._computeSequence(this.workflowVersion.start, []);

		var joinId;
		this.joinNdx = 0;
		this.joinsVisited = {};
		while ((joinId = this._nextJoin()) != null)
			this._computeSequence(joinId, []);

		if (this.sequenceCount > this.MAX_SEQUENCE_COUNT) {
			gs.print("Workflow " + this.workflowVersion.name
					+ " - expected sequences list too large, not saved");
			this._addSequence([]);
			return;
		}

		this.sequenceKeys = null;
		this.visited = null;
		this.joins = null;
		this.joinsVisited = null;
	},

	_computeSequence : function(id, sequence) {
		if (sequence.length > this.MAX_SEQUENCE_LENGTH)
			return;

		var seq = sequence.slice(0);
		this.visited[id] = true;

		this.sequenceCount++;
		if (this.sequenceCount > this.MAX_SEQUENCE_COUNT)
			return;
		seq.push(id);
		var a = this.activities[id];
		var end = true;
		for ( var tid in a.tos) {
			if (a.tos[tid] == "skipped")
				continue;

			end = false;
			break;
		}
		if (end) {
			this._addSequence(seq);
			return;
		}

		for ( var to in a.tos) {
			if (a.tos[to] == "skipped")
				continue;

			if (this.visited[to]) {
				this._addSequence(seq.slice(0));
				continue;
			}

			var toAct = this.activities[to];
			if (!toAct.isJoin) {
				this._computeSequence(to, seq);
				if (this.sequenceCount > this.MAX_SEQUENCE_COUNT)
					return;
				continue;
			}

			// Add the join to our join list to process at the end
			this.sequenceCount++;
			if (this.sequenceCount > this.MAX_SEQUENCE_COUNT)
				return;
			seq.push(to);
			this._addSequence(seq.slice(0));
			this.joins.push(to);
		}
		return;
	},

	_addSequence : function(seq) {
		// don't add duplicate sequences
		var seqKey = seq.join(',');
		if (this.sequenceKeys[seqKey])
			return;

		this.sequenceKeys[seqKey] = true;
		this.sequences.push(seq);
	},

	_nextJoin : function() {
		while (this.joinNdx < this.joins.length) {
			var joinId = this.joins[this.joinNdx];
			this.joinNdx++;
			if (this.joinsVisited[joinId]) {
				continue;
			}

			this.joinsVisited[joinId] = true;
			return joinId;
		}
		return null;
	},

	computeFullSequences : function() {
		this.sequenceCount = 0;
		this.sequences = [];
		this.sequenceKeys = {};
		this._computeFullSequence(this.workflowVersion.start, []);
		this.sequenceKeys = null;
		if (this.sequenceCount > this.MAX_SEQUENCE_COUNT) {
			gs.print("Workflow " + this.workflowVersion.name
					+ " - full sequences list too large, not saved");
			this._addSequence([]);
		}
	},

	_computeFullSequence : function(id, sequence) {
		if (this.sequenceCount > this.MAX_SEQUENCE_COUNT)
			return;

		if (sequence.length > this.MAX_SEQUENCE_LENGTH)
			return;

		var seq = sequence.slice(0);
		var len = seq.length;
		if (this._exists(seq, id)) {
			// seen this one before on this sequence - do not loop, just save up
			// to here
			this._addSequence(seq);
			return;
		}

		this.sequenceCount++;
		if (this.sequenceCount > this.MAX_SEQUENCE_COUNT)
			return;

		seq.push(id);
		var a = this.activities[id];
		var end = true;
		for ( var tid in a.tos) {
			end = false;
			break;
		}
		if (end) {
			this._addSequence(seq);
			return;
		}

		for ( var to in a.tos) {
			if (this._exists(seq, to)) {
				this._addSequence(seq.slice(0));
				continue;
			}

			this._computeFullSequence(to, seq);
		}
		return;
	},

	// Useful debugging/dumping support

	dump : function() {
		gs.print("Workflow: " + this.workflowVersion.name);
		this.dumpActivities = {};
		this._dump(this.workflowVersion.start, 0);
		this.dumpActivities = null;
		gs.print("");
		gs.print("Sequences:");
		var joins = {};
		this.dumpSequences();
		gs.print("");
		gs.print("Shortest Paths:");
		this.dumpShortestPathOrders();
		gs.print("");
		gs.print("");
	},

	dumpSequences : function() {
		for (var i = 0; i < this.sequences.length; i++)
			this._dumpSequence(this.sequences[i]);
	},

	_dumpSequence : function(seq) {
		var a = [];
		for (var i = 0; i < seq.length; i++)
			a.push(this.activities[seq[i]].name);

		var s = a.join(", ");
		gs.print(s);
	},

	dumpShortestPathOrders : function() {
		var order = 0;
		var ret;
		do {
			ret = this.getActivitiesAtOrder(order);
			for (var i = 0; i < ret.length; i++) {
				var activity = this.activities[ret[i]];
				gs.print(activity.order + ": " + activity.name);
				for (var childNdx = 0; childNdx < activity.children.length; childNdx++)
					gs.print("   : " + activity.children[childNdx].name);
			}
			order++;
		} while (ret.length > 0);
	},

	_dump : function(sysId, order) {
		if (this.dumpActivities[sysId])
			return;

		this.dumpActivities[sysId] = true;
		var activity = this.activities[sysId];
		if (activity.isJoin)
			gs.print("Name: " + activity.name + "*");
		else
			gs.print("Name: " + activity.name);

		order++;
		for ( var to in activity.tos) {
			var toActivity = this.activities[to];
			gs.print("   To: " + toActivity.name);
		}

		for ( var to in activity.tos) {
			this._dump(to, order);
		}
	},

	_exists : function(arr, id) {
		var len = arr.length;
		for (var i = 0; i < len; i++) {
			if (arr[i] == id)
				return true;
		}
		return false;
	},

	type : 'WalkWorkflow'
}

/**
 * This is the activity that is created by the WalkWorkflow class when walking a
 * workflow and ordering the activities
 */
var WalkWorkflowActivity = Class.create();
WalkWorkflowActivity.prototype = {

	initialize : function(sysId, name, attributes) {
		this.sys_id = sysId;
		this.name = name;
		this.attributes = attributes;
		this.tos = {};
		this.order = 0;
		this.children = [];
		this.isJoin = (attributes.indexOf("generate=join") != -1);
	},

	type : 'WalkWorkflowActivity'
}