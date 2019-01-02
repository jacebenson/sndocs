(function() {
	//data.output = gs.getProperty("instance_name");
	var gitReposGR = new GlideRecord('x_8821_app_loader_git_endpoints');
	gitReposGR.addQuery('active','true');
	gitReposGR.query();
	data.query = gitReposGR.getEncodedQuery();
	while (gitReposGR.next()) {
		var obj = {
			number: {
				label: gitReposGR.number.getLabel(),
				value: gitReposGR.getValue('number')
			},
			endpoint: {
				label: gitReposGR.endpoint.getLabel(),
				value: gitReposGR.getValue('endpoint')
			},
			username: {
				label: gitReposGR.username.getLabel(),
				value: gitReposGR.getValue('username')
			}
		};
		var a = new x_8821_app_loader.Utility();
		var repoObjs = JSON.parse(a.getRepos(gitReposGR));
		data.repoObjs = repoObjs;
	}
})();