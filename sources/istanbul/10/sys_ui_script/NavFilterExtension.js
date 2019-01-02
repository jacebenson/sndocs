//**************************************************************************
//* This function is called before default nav filtering is done.
//* If function returns false, default nav filtering happens next.
//* If it returns true, no more nav filtering is done for current keystroke.
//*
//* val is the current content of the nav filter input
//* msg was the initial content of the nav filter input on focus
//**************************************************************************

function navFilterExtension(val, msg) {

//  if (val.endsWith('.dict')) {
//    // example: incident.dict
//    // navigates to Dictionary records for the specified table
//    val = val.replace(/ /g, '');
//    document.getElementById('gsft_main').src = "sys_dictionary_list.do?sysparm_query=name=" + val.replace('.dict','');
//    restoreFilterText(msg);
//    return true;
//  } 

//  if (val.endsWith('?')) {
//    // example: sys_user:nameLIKEbeth?
//    // query specified table using encoded query after the colon
//    val = val.replace(/ /g, '');
//    var table = val.split(":")[0];
//    var query = val.split(":")[1].replace('?','');
//    document.getElementById('gsft_main').src = table + "_list.do?sysparm_query=" + query;
//    restoreFilterText(msg);
//    return true;
//  }

  return false;
}