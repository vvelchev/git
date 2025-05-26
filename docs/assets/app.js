(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const style = "";
const $nav = $(".js-nav");
const navTextHandler = (savedLang, data2) => {
  $nav.find("ul").html("");
  data2.nav.forEach((element) => {
    $nav.find("ul").append(`<li><a href="${element.link}">${element.text[savedLang]}</a></li>`);
  });
};
const $field = $(".js-placeholder-text");
const richTextHandler = (savedLang, data2) => {
  $field.each((indexedDB, block) => {
    const $block = $(block);
    const contenName = $block.attr("data-name");
    $block.attr("placeholder", data2[contenName][savedLang]);
  });
};
const $richText = $(".js-rich-text");
const placeholderTextHandler = (savedLang, data2) => {
  $richText.each((indexedDB, block) => {
    const $block = $(block);
    const contenName = $block.attr("data-name");
    $block.html(data2[contenName][savedLang]);
  });
};
const $accordionAppender = $(".js-accordion-appender");
const accordionHandler = (savedLang, data2) => {
  if ($accordionAppender.length == 0) {
    return;
  }
  const contenName = $accordionAppender.attr("data-name");
  $accordionAppender.html("");
  data2[contenName].forEach((item, index) => {
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
  });
  $accordionAppender.find(".accordion__section").on("click", (e) => {
    e.preventDefault();
    const $this = $(e.currentTarget);
    $this.toggleClass("is-expanded").find(".accordion__body").slideToggle().parents(".accordion__section").siblings().removeClass("is-expanded").find(".accordion__body").slideUp();
  });
};
const $sectionProjects = $(".js-filters");
let sectionActiveFilter = "all";
const projectsHandler = (savedLang, data2) => {
  if ($sectionProjects.length == 0) {
    return;
  }
  const contenName = $sectionProjects.attr("data-name");
  const $projectsFilters = $sectionProjects.find(".filters ul");
  const $projectsList = $sectionProjects.find(".section__body .grid");
  $projectsFilters.html("");
  data2[contenName].filters.forEach((item, _) => {
    $projectsFilters.append(`
			<li class="${item.tag.includes(sectionActiveFilter) && "is-active"}">
				<a href="#${item.tag}">${item.text[savedLang]}</a>
			</li>
		`);
  });
  const appendContent = (data3, savedLang2) => {
    $projectsList.html("");
    data3.forEach((item, _) => {
      if (!item.tags.includes(sectionActiveFilter)) {
        return;
      }
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
									${item.title[savedLang2]}
								</div><!-- /.article__title -->
	
								<div class="article__content">
									${item.content[savedLang2]}
								</div><!-- /.article__content -->
							</div><!-- /.grid__col -->
						</div><!-- /.grid__col -->
					</article><!-- /.article -->
				</div><!-- /.grid__col -->
			`);
    });
  };
  appendContent(data2[contenName].projects, savedLang);
  $projectsFilters.find("a").on("click", (e) => {
    e.preventDefault();
    const $this = $(e.currentTarget);
    const activeFilter = $this.attr("href").substring(1);
    sectionActiveFilter = activeFilter;
    appendContent(data2[contenName].projects, savedLang);
    $this.parent().addClass("is-active").siblings().removeClass("is-active");
  });
};
const loadAjax = (filePath) => {
  return $.ajax({
    async: false,
    global: false,
    url: filePath,
    dataType: "json"
  }).responseJSON;
};
const $html = $("html");
const $body = $("body");
const $window = $(window);
const $hero = $(".js-hero-content");
const $header = $(".header");
let heroHeight = $hero.outerHeight();
let headerHeight = $header.outerHeight();
let winScroll = $window.scrollTop();
const $navLang = $(".js-nav-lang");
const data = loadAjax("./ajax/data.json");
const loadAnimation = () => {
  const $loader = $(".js-loader");
  setTimeout(() => {
    $loader.addClass("state-1");
  }, 1e3);
  setTimeout(() => {
    $loader.addClass("state-2");
  }, 3e3);
  setTimeout(() => {
    $loader.addClass("state-3");
  }, 4e3);
  setTimeout(() => {
    $loader.addClass("state-4");
  }, 5e3);
};
const updateHeaderHeight = () => {
  $html.css("--header-height", $header.outerHeight() + "px");
  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      $html.css("--header-height", $header.outerHeight() + "px");
      headerHeight = entry.contentRect.height;
    });
  });
  observer.observe($header[0], { box: "border-box" });
};
const pageScrollStates = () => {
  $body.toggleClass("pas-hero", winScroll > heroHeight - headerHeight);
};
$(document).on("click", "a", function(event) {
  let href = $(this).attr("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto") || href.startsWith("tel") || $(this).attr("target") === "_blank")
    return;
  event.preventDefault();
  $body.addClass("animation-page-change");
  setTimeout(() => {
    window.location.href = href;
  }, 450);
});
$(".js-nav-trigger").on("click", (e) => {
  e.preventDefault();
  $body.toggleClass("is-menu-open");
});
$navLang.find("a").on("click", (e) => {
  e.preventDefault();
  const $this = $(e.currentTarget);
  const selectedLang = $this.attr("href").substring(1);
  localStorage.setItem("lang", selectedLang);
  checkLang();
});
updateHeaderHeight();
const checkLang = () => {
  const savedLang = localStorage.getItem("lang") || "en";
  $html.attr("lang", savedLang);
  setLanguage(savedLang);
  $navLang.find(`a[href="#${savedLang}"]`).parent().addClass("is-active").siblings().removeClass("is-active");
};
const setLanguage = (savedLang) => {
  navTextHandler(savedLang, data);
  richTextHandler(savedLang, data);
  placeholderTextHandler(savedLang, data);
  accordionHandler(savedLang, data);
  projectsHandler(savedLang, data);
};
checkLang();
$window.on("load", (e) => {
  loadAnimation();
  $body.addClass("is-loaded");
}).on("load resize", (e) => {
  heroHeight = $hero.outerHeight();
}).on("load scroll", (e) => {
  winScroll = $window.scrollTop();
  pageScrollStates();
});
