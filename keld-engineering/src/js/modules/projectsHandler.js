const $sectionProjects = $('.js-filters')
let sectionActiveFilter = "all";

const projectsHandler = (savedLang, data) => {
	if ($sectionProjects.length == 0) { return };
	const contenName = $sectionProjects.attr("data-name")
	const $projectsFilters = $sectionProjects.find('.filters ul')
	const $projectsList = $sectionProjects.find('.section__body .grid')

	$projectsFilters.html('')
	data[contenName].filters.forEach((item, _) => {
		$projectsFilters.append(`
			<li class="${item.tag.includes(sectionActiveFilter) && 'is-active'}">
				<a href="#${item.tag}">${item.text[savedLang]}</a>
			</li>
		`);
	})

	
	const appendContent = (data, savedLang) => {
		$projectsList.html('')

		data.forEach((item, _) => {
			if(!item.tags.includes(sectionActiveFilter)) return;
	
			$projectsList.append(`
				<div class="grid__col grid__col--6of12" data-filters="${item.tags}">
					<article class="article">
						<div class="grid grid--disable-tablet">
							<div class="grid__col grid__col--6of12">
								<div class="article__media">
									<img src="${item.img}" alt="img">
								</div><!-- /.article__media -->
							</div><!-- /.grid__col -->
							
							<div class="grid__col grid__col--6of12">
								<div class="article__title">
									${item.title[savedLang]}
								</div><!-- /.article__title -->
	
								<div class="article__content">
									${item.content[savedLang]}
								</div><!-- /.article__content -->
							</div><!-- /.grid__col -->
						</div><!-- /.grid__col -->
					</article><!-- /.article -->
				</div><!-- /.grid__col -->
			`);
		})
	}

	appendContent(data[contenName].projects, savedLang);

	$projectsFilters.find('a').on('click', (e) => {
		e.preventDefault();
		const $this = $(e.currentTarget);
		const activeFilter = $this.attr('href').substring(1);
		sectionActiveFilter = activeFilter;

		appendContent(data[contenName].projects, savedLang);

		$this.parent().addClass('is-active').siblings().removeClass('is-active');
	})
};

export default projectsHandler;