/*
 * Here's how this class attempts to accomplish...
 * 
 * A. If the MID server agent is up
 *     a. Gather all MID servers (including the original agent) in the load balance clusters that the original agent is part of.
 *                
 * B. If the MID server agent is down
 *     a. If the cluster is load balance, gather the other agents.
 *     b. If the cluster is failover, then gather the next failover agent.
 *  
 * C. Randomly returns the MID server in the final list of MID servers.
*/

var MIDServerCluster = Class.create();

MIDServerCluster.prototype = {

	CLUSTER_MEMBER_M2M: "ecc_agent_cluster_member_m2m",
	CLUSTER_TABLE: "ecc_agent_cluster",
	ECC_AGENT_CAPABILITY_M2M: "ecc_agent_capability_m2m",
	LOAD_BALANCE: "Load Balance",
	FAILOVER: "Failover",
	UP: "up",
	DOWN: "down",

	/*
	 *  @agent: the GlideRecord of the agent at question.
	 */
	initialize: function(agent, clusterType) {
		this.agent = agent;
		this.clusterEventType = clusterType; //This dictates the search type of the cluster
		this.clusters = [];
		this.clusterAgents = [];
		this.debug = JSUtil.toBoolean(gs.getProperty("mid_server.cluster.debug", "false"));
		this.failoverAgent = false;  // indicates if an agent to a failover cluster is UP

		this._findClusters();
		if (this.clusterExists())
			this._getClusterAgentNames();
	},

	clusterExists: function() {
		if (this.clusters.length > 0)
			return true;

		return false;
	},

	/*
	 *  Returns an agent that is randomly selected from the array of cluster agents.
	 */
	getClusterAgent: function() {
		// If there are no available agents, then return the original one.
		if (this.clusterAgents.length == 0) {
			var clusterNames = [];
			for (var i=0; i<this.clusters.length; i++)
				clusterNames.push(this.clusters[i].name+'');

			this._warn("No MID servers are currently available in cluster(s): " + clusterNames.join(", ") + " to help with " + this.agent.name);

			return this.agent.name+'';
		}

		/* TODO: To implement later when capability is specified on a probe.
		 * 
		 * var agent = this._phase1();
		 */
		var agent = this._phase2();
		return agent;
	},

	getClusterAgents: function() {
		return this.clusterAgents;
	},    

	/*
	 * In the case where we know exactly the operation that is needed to load balance or fail over, we look at the available MID servers
	 * capabilities against the operation. 
	 */
	_phase1: function() {
	},

	/*
	 *  In the case where we have no idea the probe we're trying to load balance or fail over, we compare the MID servers capabilities.
	 */
	_phase2: function() {
		var agentCaps = this._getAgentCapabilities(this.agent.name);
		var newClusterAgents = [];
			 
		for (var i=0; i<this.clusterAgents.length; i++) {
			var agent = this.clusterAgents[i];
			var candidateCaps = this._getAgentCapabilities(agent);
			if (this._isSubset(agentCaps, candidateCaps))
				newClusterAgents.push(agent);
		}

		this.clusterAgents = newClusterAgents;
		this._debug("Active MID servers left after checking for capabilities.");
		for (var i=0; i<this.clusterAgents.length; i++)
			this._debug("    MID server name: " + this.clusterAgents[i]);

		if (this.clusterAgents.length == 0) {
			var clusterNames = [];
			for (var i=0; i<this.clusters.length; i++)
				clusterNames.push(this.clusters[i].name+'');

			this._warn("No MID servers found available in cluster(s) " + clusterNames.join(", ") + " are capable of replacing " + this.agent.name);

		return this.agent.name+'';
		}

		var agent = this._getClusterAgent(this.clusterAgents);
		this._debug("MID server selected from the cluster(s): " + agent);
		return agent;
	},

	_getClusterAgent: function(agents) {
		
		// check failoverAgent flag in case no UP agent exists in failover cluster
		if (this.failoverAgent == true && this.clusterEventType == this.FAILOVER)
			return agents[0];
		
		// TO DO: handle special case where failover agents are removed due to missing capabilities
		
			var length = agents.length;
			var num = Math.floor(Math.random()*length)
			return agents[num];
	},

	_getAgentCapabilities: function(agentName) {
		var agentCaps = [];
		var gr = new GlideRecord(this.ECC_AGENT_CAPABILITY_M2M);
		gr.addQuery("agent.name", agentName);
		gr.query();
		while (gr.next()) {
			if (JSUtil.nil(gr.capability.value))
				agentCaps.push(gr.capability.capability+'');
			else
				agentCaps.push(gr.capability.capability+':'+gr.capability.value+'');
		}

		return agentCaps;
	},

	/*
	 *  Determines if array1 is a subset of array2.
	 */
	_isSubset: function(array1, array2) {
		var resArray = new ArrayUtil().intersect(array1, array2);
		if (resArray.length == array1.length)
			return true;

		return false;
	},

	/*
	 * Find the clusters this agent belongs to depending on the type of event.
	 * For Load Balance event, we only want to gather Load Balance clusters
	 * For Failover event, we want to look for both Load Balance and Failover clusters
	 */
	_findClusters: function() {
		var gr = new GlideRecord(this.CLUSTER_MEMBER_M2M);
		gr.addQuery("agent", this.agent.sys_id);
		gr.orderBy("cluster.type");  // get failover clusters first
		gr.query();
		while (gr.next()) {
			var grc = new GlideRecord(this.CLUSTER_TABLE);
			if (!grc.get(gr.cluster)) {
				gs.log("Invalid cluster sys_id: " + gr.cluster)
				continue;       
			} 

		// IF the event is LB, then only look for LB clusters
		if (this.clusterEventType == this.LOAD_BALANCE)       
			if (grc.type != this.LOAD_BALANCE)
				continue;     
		 
				this.clusters.push(grc);
		}

		this._debug((this.clusters.length==0?"No ":"") + "Clusters found based on MID server " + this.agent.name);
		for (var i=0; i<this.clusters.length; i++)
			this._debug("    Cluster Name: " + this.clusters[i].name + " ==> Type: " + this.clusters[i].type);
	},

	/*
	 *  This method gets the agents that resides in the same cluster(s) as the incoming agent. Depending on the cluster type,
	 *  we gather the other agents differently.
	 *  1. If it's a load balance cluster, we get all the other agents that are not down.
	 *  2. If it's a failover cluster, we get the agent we're supposed to fail over to next.
	 */
	_getClusterAgentNames: function() {
		for (var i=0; i<this.clusters.length; i++) {
			var grc = this.clusters[i];

			if (grc.type == this.LOAD_BALANCE)
				this._getLBClusterAgents(grc);
			else if (grc.type == this.FAILOVER)
				this._getFOClusterAgents(grc);
			else // Should never get here.
				gs.log("Invalid cluster type: " + grc.type);
		}

		this._debug("Active MID serves found for " + this.clusterEventType + " cluster");
		for (var i=0; i<this.clusterAgents.length; i++)
			this._debug("    MID server name: " + this.clusterAgents[i]);
	},

	/*
	 *  Find agents in the load balance cluster, but exclude the agent if the agent itself is down,
	 *  or if the agent has not been validated.
	 */
	_getLBClusterAgents: function(grc) {
		var gr = new GlideRecord(this.CLUSTER_MEMBER_M2M);
		gr.addQuery("cluster", grc.sys_id);
		gr.addQuery("agent.status", this.UP);
		gr.addQuery("agent.validated", "true");
		gr.query();
		while (gr.next()) 
			this._addToClusterAgents(gr.agent.name+'');
	},  

	/*
	 *  The idea is that we wanna find the next agent we should fail over to.
	 */
	_getFOClusterAgents: function(grc) {
		var foAgentName;

		var gr = new GlideRecord(this.CLUSTER_MEMBER_M2M);
		gr.addQuery("cluster", grc.sys_id);
		gr.addQuery("agent.status", this.UP);
		gr.addQuery("agent.validated", "true");
		gr.orderBy("order");
		gr.query();
		if (gr.next()) {
			this._addToClusterAgents(gr.agent.name+'');
			this.failoverAgent = true;
		}
	},

	/*
	 *  Make sure we do not add duplicate agents in the array.
	 */
	_addToClusterAgents: function(name) {
		if (!new ArrayUtil().contains(this.clusterAgents, name))
			this.clusterAgents.push(name);
	},

	_debug: function(msg) {
		if (this.debug)
			gs.log("*** MIDServerCluster *** " + msg);
	},

	_warn: function(msg) {
		gs.logWarning(msg, "MIDServerCluster");
	},
}