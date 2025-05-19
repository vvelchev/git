
/**
 * Load Ajax
 * 
 * @param {String} filePath
 * @returns {Json}
 */

const loadAjax = (filePath) => {
	return $.ajax({
		async: false,
		global: false,
		url: filePath,
		dataType: "json"
	}).responseJSON;
}

export default loadAjax;