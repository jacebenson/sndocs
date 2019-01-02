var agent_name = current.name.replace(/'/g, "\\'");
var midmanage = new MIDServerManage();
midmanage.stop(agent_name);

action.setRedirectURL(current);