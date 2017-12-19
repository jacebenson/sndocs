compare2Previous = function() {
    var DH = new DiffHelper();
    var gr = DH.compareRecord(current.sys_id, current.getTableName());
    if (gr != null) 
        action.setRedirectURL(gr.getTableName() + ".do?sys_id=" + gr.sys_id + "&sysparm_stack=" + current.getTableName() + ".do?sys_id=" + current.sys_id);

}