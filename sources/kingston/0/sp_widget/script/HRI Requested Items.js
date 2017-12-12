(function() {
    var className = input.table || options.table || $sp.getParameter("table");
    var sys_id = input.sys_id || options.sys_id || $sp.getParameter("sys_id");
    data.sys_id = sys_id;
    data.table = className;
    var gr = new GlideRecord("sc_req_item"); // does ACL checking for us
    if (className == "sc_request") {
        gr.addQuery("request", sys_id);

        if (input.order_direction == "asc" || options.order_direction == "asc")
            gr.orderBy(input.order_by || options.order_by);
        else
            gr.orderByDesc(input.order_by || options.order_by);

        if (input.maximum_entries > 0 || options.maximum_entries > 0)
            gr.setLimit(input.maximum_entries || options.maximum_entries);

        data.filter = "request=" + sys_id;
    } else if (className == "sc_req_item") {
        gr.addQuery("sys_id", sys_id);
        data.filter = "sys_id=" + sys_id;
    } else {
        data.error = true;
        data.errString = gs.getMessage(className + " is not a request");
        return;
    }

    var secondary_fields = input.secondary_fields || options.secondary_fields || "number";
    var display_field = input.display_field || options.display_field || "short_description";
    secondary_fields = secondary_fields.split(",");

    data.actions = [];
    data.list = [];

    gr.query();

    if (gr.getRowCount() <= 0) {
        data.error = true;
        data.errString = gs.getMessage("No items included");
        return;
    }

    while (gr.next()) {
        if (!gr.canRead()) {
            data.error = true;
            data.errString = gs.getMessage("Access Denied");
            continue;
        }

        var record = {};

        record.sys_id = gr.sys_id.getDisplayValue();
        if (input.image_field || options.image_field) {
            var image_field = input.image_field || options.image_field;
            record.image_field = gr.getDisplayValue(image_field);
            if (!record.image_field)
                record.image_field = "/noimage.pngx";
        }
        if (display_field)
            record.display_field = gr.getDisplayValue(display_field);

        record.secondary_fields = [];
        secondary_fields.forEach(function(f) {
            record.secondary_fields.push(getField(gr, f));
        });

        if (input.sp_page_dv || options.sp_page_dv) {
            var pageId = input.sp_page_dv || options.sp_page_dv;
            record.url = "?id=" + pageId + "&table=" + className + "&sys_id=" + record.sys_id + "&view=sp";
        } else
            record.url = "";

        record.stage = gr.getValue("stage");

        // get appropriate Stage choices for this requested item
        var cl = new GlideChoiceList();
        GlideController.putGlobal("answer", cl);
        GlideController.putGlobal("current", gr);
        sc_req_item_stageGetChoices();

        // de-duplicate if sequential stages are identical
        var cl2 = new GlideChoiceList();
        cl2.add(cl.getChoice(0));
        for (var i = 1; i < cl.getSize(); i++) {
            if (cl.getChoice(i).value != cl.getChoice(i - 1).value)
                cl2.add(cl.getChoice(i));
        }
        record.cl = JSON.parse(cl2.toJSON());

        data.list.push(record);
    }

    function getField(gr, name) {
        var f = {};
        f.display_value = gr.getDisplayValue(name);
        f.value = gr.getValue(name);
        var ge = gr.getElement(name);
        f.type = ge.getED().getInternalType();
        f.label = ge.getLabel();
        return f;
    }

})();