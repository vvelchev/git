const $nav = $('.js-nav');

const navTextHandler = (savedLang, data) => {
	$nav.find('ul').html("");
	data.nav.forEach((element) => {
		$nav.find('ul').append(`<li><a href="${element.link}">${element.text[savedLang]}</a></li>`)
	})
};

export default navTextHandler;