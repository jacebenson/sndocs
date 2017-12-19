//
// Check to see if the user has failed to login too many times
// when the limit is reached, lock the user out of the system
//
var gr = new GlideRecord("sys_user");
gr.addQuery("user_name", event.parm1.toString());
gr.query();
if (gr.next()) {
    gr.failed_attempts += 1;
    if (gr.failed_attempts > 5) {
       gr.locked_out = true;
       gr.update();
       gs.log("User " + event.parm1 + " locked out due to too many invalid login attempts");
   } else {
       gr.update();       
   }
}