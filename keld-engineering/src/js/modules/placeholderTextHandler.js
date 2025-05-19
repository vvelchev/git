const $richText = $('.js-rich-text');

const placeholderTextHandler = (savedLang, data) => {
	$richText.each((indexedDB, block) => {
		const $block = $(block);
		const contenName = $block.attr("data-name");
		$block.html(data[contenName][savedLang])
	})
};

export default placeholderTextHandler;