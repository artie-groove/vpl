$(document).ready( () => {
	let carouselMain = $('#carouselMain');
	let callbackForm = $('#callbackForm');
	let callbackFormTriggerBtn = $('.link-callback');
	let carouselGalerie = $('#carouselGalerie');
	let carouselAluschale = $('#carouselAluschale');

	function addBlockToggler(btnTrigger, objTop, objBottom) {
		btnTrigger.on('click', () => {
			objTop.hide();
			objBottom.show();
		});
		objBottom.find('.link-close').on('click', () => {
			objBottom.hide();
			objTop.show();
		});
	}

	
	addBlockToggler(callbackFormTriggerBtn, carouselMain, callbackForm);
	

	let baseColor = $('.showcase').data('color');
	let items, n;

	// subcategory list colors
	items = $('.showcase-subcategories .showcase-item');
	n = items.length;
	items.each( (i, item) => {
		let itemColor = tinycolor(baseColor).spin(-10 * i);
		$(item).css('background-color', itemColor.toString());
	});

	// product list colors
	items = $('.showcase.showcase-products .showcase-item');
	n = items.length;
	items.each( (i, item) => {
		let level = Math.round(10 / n * i);
		let itemColor = tinycolor(baseColor).lighten(level);
		$(item).css('background-color', itemColor.toString());
	});

	// Plaette buttons in the Design page slider
	$('.palette-buttons li img').on('click', function() {
		let item = $(this).parent();
		if ( item.hasClass('active') ) return false;
		item.siblings('.active').removeClass('active');
		item.addClass('active');
		item.parent().siblings('.d-block').removeClass('d-block').addClass('d-none');
		let idx = item.index();
		item.parent().siblings('img').eq(idx).removeClass('d-none').addClass('d-block');
	});

	$('.thumbs img').on('click', function() {
		let src = $(this).attr('src');
		$(this).closest('.carousel-item').find('.viewport-placeholder img').attr('src', src);
		let caption = $(this).siblings('.caption');
		if ( caption.length ) {
			$(this).closest('.carousel-item').find('.viewport > .caption').text(caption.text());
		}
	});

	let vendorFilter = $('.vendor-filter');
	vendorFilter.find('a:not(:last-child)').on('click', function() {
		$(this).toggleClass('active');
	});
	vendorFilter.children().eq(-1).on('click', function() {
		$(this).siblings().removeClass('active');
	});

	let carouselDesign = $('#carouselDesign');
	carouselDesign.on('slide.bs.carousel', function(e) {
		btnNextOrPrevTriggered = carouselDesign.find('.carousel-control-prev:focus-within').length
			|| carouselDesign.find('.carousel-control-next:focus-within').length;
		if ( ! btnNextOrPrevTriggered ) return;
		let dir = e.direction === 'left' ? 1 : -1;
		let currentItem = carouselDesign.find('.carousel-inner .active');
		let buttonsPanel = currentItem.find('.palette-buttons');
		let idx = buttonsPanel.find('.active').index();
		if ( dir > 0 ) {
			if ( idx < buttonsPanel.children().length - 1) {
				buttonsPanel.children().eq(idx+dir).find('img').click();
				e.preventDefault();
			}
		}
		else {
			if ( idx > 0 ) {
				buttonsPanel.children().eq(idx+dir).find('img').click();
				e.preventDefault();
			}
		}
	});


	// When the product slider changes slides or the tabSwitcher switches the tab we need to update the viewport
	// Conditions:
	// 1.	Carousel switches product
	// 2.	Tab switcher buttons are clicked
	// What to be updated:
	// 1.	Separate divs for description (.covers) and other tabs (.viewport-placeholder)
	// 2.	Half-height param ('halved') for some images to make them same height as the description
	// 3.	Bugfix for maintaining cover image height (when the carousel switches between smaller images,
	// 		the height is altered due to the nature of flex, I think)
	function refreshViewport(slide, tab) {
		let viewport = $(slide).find('.viewport');
		let tabIdx = $(tab).index();
		let viewportItem;
		if ( tabIdx === 0 ) {
			viewportItem = viewport.children('.covers');
			let activeParamIdx = $(tab).find('.param-switcher li.active').index();
			let img = viewportItem.find('img').eq(activeParamIdx);
			viewport.children().hide();
			viewportItem.show();
		}
		else {
			let thumbs = $(slide).find('.product-tabs').children().eq(tabIdx).find('.thumbs');
			let src = thumbs.children('li').eq(0).children('img').attr('src');
			let placeholder = viewport.find('.viewport-placeholder');
			placeholder.find('img').attr('src', src);
			viewportItem = placeholder;
			viewport.children().hide();
			viewport.children().not('.covers').show();
		}
	}

	let carouselProduct = $('.carousel-product');
	let productTabSwitcher = carouselProduct.find('.product-tab-switcher');
	productTabSwitcher.children().on('click', function() {
		if ( $(this).is('.active') ) return;
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		let idx = $(this).index();
		let slide = carouselProduct.find('.carousel-item.active');
		refreshViewport(slide, this);
		let tabsContainer = slide.find('.product-tabs');
		tabsContainer.children('.active').fadeOut(100, function() {
			tabsContainer.children().eq(idx).fadeIn(100, function() {
				$(this).addClass('active');
			});
			$(this).removeClass('active');
		});
	});

	function stripLeadingTabs(text) {
		let cleanText = text.replace(/^(?:\t| )+(?!\n)/gm, '');
		return cleanText;
	}

	
	// When the product slider switches slides
	carouselProduct.on('slide.bs.carousel', function(e) {
		let target = $(e.relatedTarget); // the new slide (.carousel-item)
		// Switching product tabs content (description, colors, etc.)
		productTabSwitcher.children('.active').removeClass('active');
		productTabSwitcher.children().eq(0).addClass('active');
		let tabsContainer = target.find('.product-tabs');
		tabsContainer.children('.active').removeClass('active').hide();
		let activeTab = tabsContainer.children().eq(0);
		activeTab.addClass('active').show();
		refreshViewport(target, activeTab); // to switch the viewport items (see function description)
		let productName = target.find('.h1').text();
		$('.catalog-breadcrumbs li:last-of-type').text(productName);
		let productData = products[target.index()];

		Object.keys(productData.textBlocks).forEach( (key) => {
			let value = productData.textBlocks[key];
			$(`#${key}`).html( () => {
				let mdData = stripLeadingTabs(value);
				return marked(mdData);
			});
		});

		if ( productData.images ) {
			Object.keys(productData.images).forEach( (key) => {
				let value = productData.images[key];
				$(`#${key}`).attr('src', value);
			});
		}
		
		function swapGalleryImages(elementId, imagesList) {
			let galleryItems = $(elementId).find('.carousel-inner');
			galleryItems.children().remove();
			imagesList.forEach( (src, idx) => {
				let item = $('<div></div>')
					.addClass('carousel-item');
				if ( idx === 0 ) item.addClass('active');
				let img = $('<img />')
					.attr('src', src);
				item.append(img);
				galleryItems.append(item);
			});
		}

		if ( productData.galerie ) {
			swapGalleryImages('#carouselGalerie', productData.galerie);
		}
		else {
			// TODO: hide gallery block
		}

		if ( productData.aluschale ) {
			swapGalleryImages('#carouselAluschale', productData.aluschale);
		}
		else {
			// TODO: hide gallery block
		}
	});

	let paramSwitcher = $('.param-switcher');
	paramSwitcher.find('li').on('click', function() {
		if ( $(this).is('.active') ) return;
		$(this).siblings('.active').removeClass('active');
		$(this).addClass('active');
		let paramSummary = paramSwitcher.children('.param-summary');
		let seals = $(this).data('seals');
		let chambers = $(this).data('chambers');
		paramSummary.find('.seals b').html(seals);
		paramSummary.find('.chambers b').html(chambers);
		let viewport = carouselProduct.find('.carousel-item.active .viewport');
		let idx = $(this).index();
		viewport.children('.covers').children().hide();
		viewport.children('.covers').children().eq(idx).show().css('display', 'block');
	});

	function is_touch_device() {
	  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	  var mq = function(query) {
	    return window.matchMedia(query).matches;
	  }

	  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
	    return true;
	  }

	  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
	  // https://git.io/vznFH
	  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	  return mq(query);
	}

	const minWidth = 1140;

	$('.dropdown-toggle').on('mouseover', function() {
		if ( window.innerWidth >= minWidth && !is_touch_device() ) {
			$(this).dropdown('toggle');
		}
	});

	$('.dropdown-toggle').on('click', function(e) {
		// if dropdown has been shown
		if ( window.innerWidth >= minWidth && !is_touch_device() ) {
			$(this).dropdown('dispose');
			window.location.href = $(this).attr('href');
		}
		else {
			if ( $(this).parent().hasClass('show') ) {
				window.location.href = $(this).attr('href');
			}
		}
	});

	$('.dropdown-menu').on('mouseleave', function() {
		if ( window.innerWidth >= minWidth ) {
			$(this).siblings().dropdown('toggle');
		}
	});

	$('.dropdown-toggle').on('mouseout', function(e) {
		if ( window.innerWidth >= minWidth && e.pageX <= $(this).offset().left ) {
			$(this).dropdown('toggle');
		}
	});

});