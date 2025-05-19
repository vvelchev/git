/**
 * Load SCSS via Vite.
 */
import '/scss/style.scss';

import navTextHandler from "./modules/navTextHandler.js";
import richTextHandler from "./modules/richTextHandler.js";
import placeholderTextHandler from "./modules/placeholderTextHandler.js";
import accordionHandler from "./modules/accordionHandler.js";
import projectsHandler from "./modules/projectsHandler.js";
import loadAjax from "./modules/loadAjax.js";

const $html = $('html');
const $body = $('body');
const $window = $(window);
const $hero = $('.js-hero-content')
const $header = $('.header');
let heroHeight = $hero.outerHeight();
let headerHeight = $header.outerHeight();
let winScroll = $window.scrollTop();
const $navLang = $('.js-nav-lang');
const data = loadAjax('./ajax/data.json')
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
const isTablet = () => window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;

/**
 *  Load Animation
 */
const loadAnimation = () => {
	const $loader = $('.js-loader');
	setTimeout(() => { $loader.addClass('state-1'); }, 1000);
	setTimeout(() => { $loader.addClass('state-2'); }, 3000);
	setTimeout(() => { $loader.addClass('state-3'); }, 4000);
	setTimeout(() => { $loader.addClass('state-4'); }, 5000);
}

/**
 * Update Header Height
 *
 * @returns {Void}
 */
const updateHeaderHeight = () => {
	$html.css('--header-height', $header.outerHeight() + 'px'); // before onload

	const observer = new ResizeObserver(entries => {
		entries.forEach(entry => {
			$html.css('--header-height', $header.outerHeight() + 'px');
			headerHeight = entry.contentRect.height;
		});
	});

	observer.observe($header[0], { box: 'border-box' });
};

/**
 *  Page Scroll States
 */
const pageScrollStates = () => {
	$body.toggleClass('pas-hero', winScroll > (heroHeight - headerHeight ));
}

/**	
 * Animation on page Change
 */

$(document).on('click','a', function (event) { // doc append 
	let href = $(this).attr("href");

	if (!href || href.startsWith("#") || href.startsWith("mailto") || href.startsWith("tel") || $(this).attr("target") === "_blank") return; // No Change page 

	event.preventDefault();
	$body.addClass('animation-page-change')
	
	setTimeout(() => {
		window.location.href = href;
	}, 450); // Задържане преди смяна
});


/**
 * Click Events
 */
$('.js-nav-trigger').on('click', (e) => {
	e.preventDefault();
	$body.toggleClass('is-menu-open')
})

$navLang.find('a').on('click', (e) => {
	e.preventDefault();
	const $this = $(e.currentTarget)
	const selectedLang = $this.attr('href').substring(1);
	localStorage.setItem('lang', selectedLang);
	
	checkLang();
})

updateHeaderHeight();

const checkLang = () => {
	const savedLang = localStorage.getItem('lang') || 'en'; // Вземаме запазения език
	$html.attr("lang", savedLang);
	setLanguage(savedLang);

	$navLang.find(`a[href="#${savedLang}"]`)
		.parent().addClass('is-active')
		.siblings().removeClass('is-active');
}

const setLanguage = (savedLang) => {
	navTextHandler(savedLang, data);
	richTextHandler(savedLang, data);
	placeholderTextHandler(savedLang, data);
	accordionHandler(savedLang, data);
	projectsHandler(savedLang, data);
}

checkLang();
$window.on('load', (e) => {
	loadAnimation();
	$body.addClass('is-loaded');
}).on('load resize', (e) => {
	heroHeight = $hero.outerHeight();
}).on('load scroll', (e) => {
	winScroll = $window.scrollTop();
	pageScrollStates();
})


	
