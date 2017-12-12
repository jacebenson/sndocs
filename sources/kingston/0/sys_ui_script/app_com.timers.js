angular.module("sn.app_common.timers", ['sn.common.util', 'sn.app_common'])
	.constant("TIMER_DEFAULT", {
		DURATION: 5*60*1000,
		SIZE: "70px"
	});