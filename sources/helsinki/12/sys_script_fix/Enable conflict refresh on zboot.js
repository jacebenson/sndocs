
    if (pm.isZboot()) {
		gs.setProperty('change.conflict.refresh.scheduled', 'true');
		gs.setProperty('change.conflict.refresh.conflicts', 'true');
		gs.setProperty('change.conflict.mode', 'advanced');
	}
