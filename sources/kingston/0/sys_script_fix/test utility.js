try{
var u = new x_8821_git_app.utility();
//u.initialize();
u.getRepos();
	
	gs.info('\n' + JSON.stringify(u,'','    '));
gs.info(u.arrayOfRepos);
} catch (e){
	gs.info('\n' + JSON.stringify(e,'','    '));
}