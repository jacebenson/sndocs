run();

function run() {
    var gr = new GlideRecord("sys_trigger");
    gr.addQuery("name", "Count Software Licenses");
    gr.query();
    if (!gr.next()) {
        gs.addInfoMessage("Unable to find the scheduled job (Count Software Licenses).");
        return;
    }

    if (gr.state == 0) {
        // we're currently in a ready state
        gr.next_action.setDateNumericValue(0);
        gr.update();

        gs.addInfoMessage("Executing the software license manager.");
    } else {
        gs.addInfoMessage("The software license manager is currently running.");
    }

    action.setRedirectURL(current);
}

