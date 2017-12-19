var url = "sys_update_set_log_list.do?";
url += "sysparm_query=update_set=";
url += current.update_set;
url += "&sysparm_order=status";
gs.setRedirect(url);