let vars = {};
export let lastPageYOffset = null;

vars.$document = $(document);
vars.$window = $(window);
vars.$body = $(document.body);
vars.$html = $(document.documentElement);
vars.$siteContainer = $('.l-wrapper');
vars.$preloader = $('.preloader');
vars.$header = $('.header');
vars.$main = $('.main');
vars.$footer = $('.footer');
vars.isMobile = () => innerWidth <= 1024;
vars.isIE = () => vars.$html.hasClass('is-browser-ie');
vars.isFirefox = () => vars.$html.hasClass('is-browser-firefox');
vars.isChrome = () => vars.$html.hasClass('is-browser-chrome');
vars.isSafari = () => vars.$html.hasClass('is-browser-safari');
vars.winWidth = window.innerWidth;

const debounced = [];
const cancelFunc = (timeout) => () => {
	clearTimeout(timeout);
};

vars.debounce = (fn, wait, ...args) => {
	let d = debounced.find(({funcString}) => funcString === fn.toString());

	if (d) {
		d.cancel();
	} else {
		d = {};
		debounced.push(d);
	}

	d.func = fn;
	d.funcString = fn.toString();
	d.timeout = setTimeout(fn, wait, ...args);
	d.cancel = cancelFunc(d.timeout);
};

vars.saveScrollPosition = () => {
	vars.$html.css('scroll-behavior', 'initial');
	lastPageYOffset = window.pageYOffset || document.documentElement.scrollTop;
};

vars.restoreScrollPosition = () => {
	if (lastPageYOffset !== null) {
		window.scrollTo(window.pageXOffset, lastPageYOffset);
		lastPageYOffset = null;
		vars.$html.css('scroll-behavior', '');
	}
};

// smooth scrolling
vars.scrollTo = ($container, time = 500, offset = 0) => {
	vars.$html.css('scroll-behavior', 'initial');
	$('html, body').animate({
		scrollTop: `${$container.offset().top + offset}`,
	}, time);

	setTimeout(() => {
		vars.$html.css('scroll-behavior', '');
	}, time + 100);
};

let scrollDiv;

vars.getScrollbarWidth = () => {
	const width = window.innerWidth - vars.$html.clientWidth;

	if (width) {
		return width;
	}

	// Document doesn't have a scrollbar, possibly because there is not enough content so browser doesn't show it
	if (!scrollDiv) {
		scrollDiv = document.createElement('div');
		scrollDiv.style.cssText = 'width:100px;height:100px;overflow:scroll !important;position:absolute;top:-9999px';
		document.body.appendChild(scrollDiv);
	}

	return scrollDiv.offsetWidth - scrollDiv.clientWidth;
};

// Медиазапрос на Javascript--------------------------------------------------------------------------------------(2)
// @param mediaQueryString (String) - строка медиа-запроса как в CSS
// @param action(function) - функция, которая выполняется при соблюдении условий медиа-запроса
vars.media = function (mediaQueryString, action) {
	let handleMatchMedia = function (mediaQuery) {
		if (mediaQuery.matches) { // Попадает в запроc
			if (action && typeof action === 'function') {
				action();
			}
		}
	};
	let mql = window.matchMedia(mediaQueryString); // стандартный медиазапрос для смены режима просмотра
	handleMatchMedia(mql);
	mql.addListener(handleMatchMedia);
};

/* Usage:
       media('all and (max-width: 550px)', function(){
       $('.mobile-search-result__item a').addClass('clearfix');
   });
*/

vars.headerScrollTracking = () => {
	const $window = $(window);
	const $header = $('.header');
	const headerHeight = Math.ceil(Number($header.outerHeight()));

	window.onscroll = throttle(() => {
		let currentScroll = $window.scrollTop();
		let headerIsFixed = $header.hasClass('header--fixed');

		if (currentScroll > headerHeight) {
			$header.addClass('header--fixed');
			return true;
		}
		$header.removeClass('header--fixed');
	}, 200);
};

function throttle(func, ms) {
	let isThrottled = false;
	let savedArgs;
	let savedThis;

	function wrapper() {
		if (isThrottled) { // (2)
			savedArgs = arguments;
			savedThis = this;

			return;
		}

		func.apply(this, arguments); // (1)

		isThrottled = true;

		setTimeout(function() {
			isThrottled = false; // (3)

			if (savedArgs) {
				wrapper.apply(savedThis, savedArgs);
				savedArgs = savedThis = null;
			}
		}, ms);
	}

	return wrapper;
}

function hasHoverSupport() {
	let hoverSupport;

	if (vars.isIE && vars.getScrollbarWidth()) {
		// On touch devices scrollbar width is usually 0
		hoverSupport = true;
	} else if (vars.isMobile()) {
		hoverSupport = false;
	} else if (window.matchMedia('(any-hover: hover)').matches || window.matchMedia('(hover: hover)').matches) {
		hoverSupport = true;
	} else if (window.matchMedia('(hover: none)').matches) {
		hoverSupport = false;
	} else {
		hoverSupport = typeof vars.$html.ontouchstart === 'undefined';
	}

	return hoverSupport;
}

if (!hasHoverSupport()) {
	vars.$html.removeClass('has-hover').addClass('no-hover');
} else {
	vars.$html.removeClass('no-hover').addClass('has-hover');
}

function resize() {
	vars.debounce(() => {
		if (vars.winWidth !== window.innerWidth) {
			if (!hasHoverSupport()) {
				vars.$html.removeClass('has-hover').addClass('no-hover');
			} else {
				vars.$html.removeClass('no-hover').addClass('has-hover');
			}

			vars.winWidth = window.innerWidth;
		}
	}, 300);
}

vars.$window.on('resize', resize);

export default vars;
