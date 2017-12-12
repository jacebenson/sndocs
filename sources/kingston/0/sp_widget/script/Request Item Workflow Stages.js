(function() {
    var req_item_id = JSUtil.nil(options.req_item_id + '') ? '' : options.req_item_id + '';
    if (!req_item_id) {
        req_item_id = JSUtil.nil(input.req_item_id + '') ? '' : input.req_item_id + '';
    }
    if (!req_item_id) {
        data.error = gs.getMessage("Request Item Not Provided");
        return;
    }
    var sc_req_item = new GlideRecord('sc_req_item');
    sc_req_item.get(req_item_id);

    if (!sc_req_item.isValidRecord()) {
        data.error = gs.getMessage("Invalid Request Item ID");
        return;
    }
    var ref = sc_req_item.stage;

    GlideController.putGlobal('sc_req_item', sc_req_item);
    sc_req_item.putCurrent();
    var renderer = RendererFactory.getRenderer(ref, sc_req_item.sys_id);
    var api = new SNC.RendererAPI(renderer);
    data.renderer = renderer + "";
    var worflow_id = sc_req_item.stage;
    var choiceList;
    if (renderer == 'Legacy' || renderer == "SCReqItemRenderer") {
        var clGenerator = new GlideChoiceListGenerator('sc_req_item', 'stage');
        clGenerator.none = false;
        choiceList = clGenerator.get();
        api.internationalizeChoices(choiceList);
        var wfw;
        if (sc_req_item.stage.hasAttribute('icons')) {
            wfw = eval("var ans = new " + sc_req_item.stage.getAttribute('icons') + "('sc_req_item.stage'); ans;");
            choiceList = wfw.process(choiceList);
        } else {
            wfw = new WorkflowIcons('sc_req_item.stage');
            choiceList = wfw.process(choiceList);
        }
        var list = [];
        if (!JSUtil.nil(choiceList)) {
            for (var i = 0; i < choiceList.size(); i++) {
                var choice = choiceList.get(i);
                if (!JSUtil.nil(choice.getValue())) {
                    var temp = {};
                    temp.label = choice.getLabel();
                    temp.title = choice.getParameter('title') || choice.getLabel();
                    if (renderer == 'Legacy') {
						temp.displayValue = temp.title + " (" + temp.label + ")";
					} else {
						temp.displayValue = temp.label;
					}
                    temp.value = choice.getValue();
                    temp.id = choice.getId();
                    temp.selected = choice.getSelected();

                    var imgsrc = choice.image.split(' ');
                    imgsrc = imgsrc.length ? imgsrc[0] : imgsrc;
                    if (!imgsrc)
                        imgsrc = temp.selected ? 'icon-check-circle' : 'icon-empty-circle';
                    temp.image = imgsrc + '.png';
                    list.push(temp);
                }
            }
        }
        data.choiceList = list;
    } else if (renderer == "Linear" || renderer == "Main flow" || renderer == "Workflow-driven") {
        if (renderer == "Linear" || renderer == "Workflow-driven")
            choiceList = api.getAllWorkflowChoices(current, 'sc_req_item.stage');
        else
            choiceList = api.getParentWorkflowChoices(current, 'sc_req_item.stage');
        api.addIconsAndStatus(choiceList);
        var list = [];
        if (!JSUtil.nil(choiceList)) {
            for (var j = 0; j < choiceList.size(); j++) {
                var choice = choiceList.get(j);
                var isVisible = true;
                if (renderer == "Linear" && !api.getOption('showSkipped'))
                    if (choice.getParameter('state') + '' == 'skipped')
                        isVisible = false;

                if (renderer == "Main flow" || renderer == "Workflow-driven") {
                    var isWorkFlow = SNC.WorkflowStageRenderer.isWorkflow('sc_req_item.stage');
                    isVisible = (isWorkFlow == 'false') || ((choice.getParameter('visible') + '') == 'true');
                }
                if (choice.value == '')
                    isVisible = false;

                if (isVisible) {
                    var temp = {};
                    temp.label = choice.getLabel();
                    temp.value = choice.getValue();
                    temp.id = choice.getId();
                    temp.selected = choice.getSelected();
                    temp.title = choice.getParameter('title') || choice.getLabel();
                    temp.displayValue = temp.title + " (" + temp.label + ")"
                    var imgsrc = choice.image.split(' ');
                    imgsrc = imgsrc.length ? imgsrc[0] : imgsrc;
                    if (!imgsrc)
                        imgsrc = temp.selected ? 'icon-check-circle' : 'icon-empty-circle';
                    temp.image = imgsrc + '.png';
                    list.push(temp);
                }
            }
        }
        data.choiceList = list;
    } else if (renderer == "SimpleProgressBar") {
        choiceList = api.getParentWorkflowChoices(current, 'sc_req_item.stage');
        var showValue = api.getOption('showValue') + '';
        var increment = 100.00 / choiceList.getSize();
        var percentComplete = 0;
        var atEnd = true;

        for (var i = 0; choiceList.getSize() > i; i++) {
            percentComplete += increment;
            if (choiceList.getChoice(i).getParameter('state') + '' === 'active') {
                atEnd = false;
                break;
            }
        }
        data.increment = increment;

        percentComplete = atEnd ? 100 : parseInt(percentComplete);
        if (!JSUtil.nil(choiceList)) {
            var list = [];
            for (var j = 0; j < choiceList.size(); j++) {
                var choice = choiceList.get(j);
                var isVisible = true;
                if (!api.getOption('showSkipped'))
                    if (choice.getParameter('state') + '' == 'skipped')
                        isVisible = false;

                if (choice.value == '')
                    isVisible = false;
                if (isVisible) {
                    var temp = {};
                    temp.label = choice.getLabel();
                    temp.value = choice.getValue();
                    temp.id = choice.getId();
                    temp.selected = choice.getSelected();
                    temp.title = choice.getParameter('title') || choice.getLabel();
                    var isVisible = true;
                    temp.isVisible = isVisible;
                    temp.displayValue = temp.label;

                    var imgsrc = 'progress_pctnotdone.gifx';
                    if (choice.getParameter('state') + '' != 'pending')
                        imgsrc = 'progress_pctdone.gifx';
                    temp.image = imgsrc;
                    list.push(temp);
                }
            }
        }
        data.choiceList = list;
    }
    GlideController.removeGlobal('sc_req_item');
    sc_req_item.popCurrent();
})();