const $field = $('.js-placeholder-text');

const richTextHandler = (savedLang, data) => {
	$field.each((indexedDB, block) => {
		const $block = $(block);
		const contenName = $block.attr("data-name");
		$block.attr('placeholder', (data[contenName][savedLang]));
	})
};

export default richTextHandler;