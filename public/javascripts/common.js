var common = {
	setModuleToLoaded: function($module) {
		if(!$module.hasClass('loaded')) $module.addClass('loaded');
	}
}

exports = common;

// module.exports = {
// 	setModuleToLoaded: function($module) {
// 		if(!$module.hasClass('loaded')) $module.addClass('loaded');
// 	}
// }