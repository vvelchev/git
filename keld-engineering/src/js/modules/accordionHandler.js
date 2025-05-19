const $accordionAppender = $('.js-accordion-appender');

const accordionHandler = (savedLang, data) => {
	if ($accordionAppender.length == 0) { return };
	
	const contenName = $accordionAppender.attr("data-name")
	$accordionAppender.html("");

	data[contenName].forEach((item, index) => {
		$accordionAppender.append(`
			<div class="accordion__section">
				<div class="grid grid--disable-mobile">
					<div class="grid__col grid__col--5of12 grid__col--tablet-3of6">
						<div class="accordion__head">
						${item.title[savedLang]}
						</div><!-- /.accordion__head -->
					</div><!-- /.grid__col -->
					
					<div class="grid__col grid__col--7of12 grid__col--tablet-3of6">
						<div class="accordion__body txt-xl">
							${item.content[savedLang]}
						</div><!-- /.accordion__body -->
					</div><!-- /.grid__col -->
				</div><!-- /.grid -->
			</div><!-- /.accordion__section -->
		`);
	})

	$accordionAppender.find('.accordion__section').on('click', (e) => {
		e.preventDefault();
		const $this = $(e.currentTarget);
		$this.toggleClass('is-expanded').find('.accordion__body').slideToggle()
			.parents('.accordion__section').siblings().removeClass('is-expanded')
			.find('.accordion__body').slideUp();
	})
};

export default accordionHandler;

