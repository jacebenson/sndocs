var ArtifactServiceAjax = Class.create();
ArtifactServiceAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	authenticate: function() {
		var svc = this._createArtifactService();
		var authenticated = svc.authenticate();
		return authenticated;
	},
		
	getArtifacts: function() {
		var groupId = this.getParameter("sysparm_group_id");
		var svc = this._createArtifactService();
		var artifacts = svc.getArtifacts(groupId);
		return new global.JSON().encode(artifacts);
	},
	
	getArtifactVersions: function() {
		var groupId = this.getParameter("sysparm_group_id");
		var artifactId = this.getParameter("sysparm_artifact_id");
		var svc = this._createArtifactService();
		var versions = svc.getArtifactVersions(groupId, artifactId);
		return new global.JSON().encode(versions);
	},		
	
	_createArtifactService: function() {
		var repoUrl = this.getParameter("sysparm_repo_url");
		var username = this.getParameter("sysparm_repo_username");
		var password = this.getParameter("sysparm_repo_password");
		return new ArtifactService(repoUrl, username, password);
	},
	
    type: 'ArtifactServiceAjax'
});