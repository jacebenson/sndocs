var gu = new GlideURL('std_change_processor.do');
gu.set('sysparm_id', current.getUniqueValue());
gu.set('sysparm_action', 'execute_producer');
gu.set('sysparm_catalog',current.sc_catalog);
action.setNoPop(true);
action.setRedirectURL(gu.toString());