var ArtifactService = Class.create();
ArtifactService.prototype = {
    initialize: function(repo_base_url, repo_username, repo_password) {
		this.repo_base_url = repo_base_url;
		this.repo_username = repo_username;
		this.repo_password = repo_password;
    },
	
	authenticate: function() {
		var responseString = this._get("maven-metadata.xml");
		if (gs.nil(responseString))
			responseString = this._get("");
		var success = !gs.nil(responseString);
		return success;
	},
	
	getArtifacts: function(groupId) {
		var answer = [];	
		var groupPath = "/content" + this._getGroupRelativePath(groupId);
		var candidates = this._getJSON(groupPath).data||[];
		for (var i = 0; i < candidates.length; i++) {
			var item = candidates[i];
			var artifactId = item.text;
			answer.push(artifactId);
		}
		answer.sort();
		return answer;
	},
	
	getArtifactVersions: function(groupId, artifactId) {
		var answer = [];	
		var artifactPath = "/content" + this._getGroupRelativePath(groupId) + "/" + artifactId;
		var metaUrl = artifactPath + "/maven-metadata.xml";
		var responseString = this._get(metaUrl);
		if (gs.nil(responseString))
			return answer;
		
		var metaXml = new XMLDocument2();
		metaXml.parseXML(responseString);
		
		var latestVersion = metaXml.getNodeText('/metadata/versioning/latest');
		if (gs.nil(latestVersion))
			latestVersion = metaXml.getNodeText('/metadata/versioning/release');
		if (gs.nil(latestVersion))
			latestVersion = metaXml.getNodeText('/metadata/versioning/versions/version');
		if (gs.nil(latestVersion))
			return answer;
		
		var version;
		if (latestVersion.endsWith("-SNAPSHOT"))
			version = this._getSnapshotVersion(groupId, artifactId, latestVersion);
		else
			version = this._getReleaseVersion(groupId, artifactId, latestVersion);		
		
		if (version !== null)
			answer.push(version);		
		
		return answer;
	},
	
	_getSnapshotVersion: function(groupId, artifactId, snapshotVersion) {
		var artifactPath = "/content" + this._getGroupRelativePath(groupId) + "/" + artifactId;
		var versionPath = artifactPath + "/" + snapshotVersion + "/maven-metadata.xml";
		var responseString = this._get(versionPath);
		if (gs.nil(responseString))
			return null;
		
		var metaXml = new XMLDocument2();
		metaXml.parseXML(responseString);
				
		// 6.0.0.0-20150131.020405-59
		var snapshotBuild = metaXml.getNodeText('/metadata/versioning/snapshotVersions/snapshotVersion[classifier/text()="app"]/value');
		if (gs.nil(snapshotBuild))
			return null;
		
		var artifactFileName = artifactId + "-" + snapshotBuild + "-app.zip";
		var resourceURI = this._getServiceUrl(artifactPath + "/" + snapshotVersion + "/" + artifactFileName);
		return { text: snapshotVersion + " [" + snapshotBuild + "]", version: snapshotBuild, resourceURI: resourceURI, fileName: artifactFileName };
	},
	
	_getReleaseVersion: function(groupId, artifactId, releaseVersion) {
		var artifactPath = "/content" + this._getGroupRelativePath(groupId) + "/" + artifactId;
		var versionPath = artifactPath + "/" + releaseVersion;
		var releaseItems = this._getJSON(versionPath).data||[];
		
		var resourceURI, lastModified, fileName;
		for (var i = 0; i < releaseItems.length; i++) {
			var releaseItem = releaseItems[i];
			if (releaseItem.text.endsWith("-app.zip")) {
				resourceURI = releaseItem.resourceURI;
				lastModified = releaseItem.lastModified;
				fileName = releaseItem.text;
				break;
			}
		}
		
		if (gs.nil(resourceURI))
			return null;
		
		return { text: releaseVersion + " [" + lastModified + "]", version: releaseVersion, resourceURI: resourceURI, fileName: fileName };
	},
	
	_getGroupRelativePath: function(groupId) {
		if (gs.nil(groupId))
			return "";
		
		var answer = "";
		var parts = groupId.split(".");
		for (var i = 0; i < parts.length; i++)
			answer += "/" + parts[i];
		return answer;
	},
	
	_get: function(relativePath) {
		var url = this._getServiceUrl(relativePath);
		var http = this._createHttpRequest();
		return this._doHttpGet(http, url);
	},
	
	_getJSON: function(relativePath) {
		var url = this._getServiceUrl(relativePath);
		var http = this._createHttpRequest();
		http.addHeader("accept", "application/json");
		var responseString = this._doHttpGet(http, url);
		var obj = gs.nil(responseString) ? {} : new global.JSON().decode(responseString);
		return obj;
	},
	
	_doHttpGet: function(http, url) {
		var answer = null;
		var responseString = http.get(url);
		if (http.getStatusCode() == 200) {
			answer = responseString;
			gs.info("GET " + http.getStatusCode() + " " + url + " >> response length: " + (responseString||'').length);
		} else {
			gs.error("GET " + http.getStatusCode() + " " + url + " >> " + http.getErrorMessage());		
		}
		return answer;
	},
	
	_getServiceUrl: function(relativePath) {
		if (relativePath.startsWith("http"))
			return relativePath;
		
		var url = this.repo_base_url||"https://artifact.devsnc.com";
		if (gs.nil(relativePath))
			return url;
		
		if (!relativePath.startsWith("/"))
			url += "/";
		return url + relativePath;
	},
	
	_createHttpRequest: function() {
		var http = new GlideHTTPUtil();
		http.setBasicAuth(this.repo_username, this.repo_password);
		return http;
	},
	
    type: 'ArtifactService'
};