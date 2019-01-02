current.update();

var url = new RMv2Relationships().planningBoardURL('rm_release', current, 'sys_class_nameINrm_feature,rm_task');
gs.setRedirect(url);
