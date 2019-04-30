"use strict";

$(document).ready(function () {
  var carouselMain = $('#carouselMain');
  var callbackForm = $('#callbackForm');
  var callbackFormTriggerBtn = $('.link-callback'); //let carouselGalerie = $('#carouselGalerie');
  //let carouselAluschale = $('#carouselAluschale');

  function addBlockToggler(btnTrigger, objTop, objBottom) {
    btnTrigger.on('click', function () {
      objTop.hide();
      objBottom.show();
    });
    objBottom.find('.link-close').on('click', function () {
      objBottom.hide();
      objTop.show();
    });
  }

  addBlockToggler(callbackFormTriggerBtn, carouselMain, callbackForm);
  var baseColor = $('.showcase').data('color');
  var items, n; // subcategory list colors

  items = $('.showcase-subcategories .showcase-item');
  n = items.length;
  items.each(function (i, item) {
    var itemColor = tinycolor(baseColor).spin(-10 * i);
    $(item).css('background-color', itemColor.toString());
  }); // product list colors

  items = $('.showcase.showcase-products .showcase-item');
  n = items.length;
  items.each(function (i, item) {
    var level = Math.round(10 / n * i);
    var itemColor = tinycolor(baseColor).lighten(level);
    $(item).css('background-color', itemColor.toString());
  }); // Plaette buttons in the Design page slider

  $('.palette-buttons li img').on('click', function () {
    var item = $(this).parent();
    if (item.hasClass('active')) return false;
    item.siblings('.active').removeClass('active');
    item.addClass('active');
    item.parent().siblings('.d-block').removeClass('d-block').addClass('d-none');
    var idx = item.index();
    item.parent().siblings('img').eq(idx).removeClass('d-none').addClass('d-block');
  });
  $('.thumbs img').on('click', function () {
    var thumbs = $(this).parent().parent();
    var placeholder = $(this).closest('.carousel-item').find('.viewport-placeholder');
    var caption = $(this).siblings('.caption');
    updateViewportImage(placeholder, $(this), thumbs, caption, true); //$(this).closest('.carousel-item').find('.viewport-placeholder .img0').attr('src', src);

    /*if ( caption.length ) {
    	$(this).closest('.carousel-item').find('.viewport > .caption').text(caption.text());
    }*/
  });
  var vendorFilter = $('.vendor-filter');
  vendorFilter.find('a:not(:last-child)').on('click', function () {
    $(this).toggleClass('active');
  });
  vendorFilter.children().eq(-1).on('click', function () {
    $(this).siblings().removeClass('active');
  });
  var carouselDesign = $('#carouselDesign');
  carouselDesign.on('slide.bs.carousel', function (e) {
    btnNextOrPrevTriggered = carouselDesign.find('.carousel-control-prev:focus-within').length || carouselDesign.find('.carousel-control-next:focus-within').length;
    if (!btnNextOrPrevTriggered) return;
    var dir = e.direction === 'left' ? 1 : -1;
    var currentItem = carouselDesign.find('.carousel-inner .active');
    var buttonsPanel = currentItem.find('.palette-buttons');
    var idx = buttonsPanel.find('.active').index();

    if (dir > 0) {
      if (idx < buttonsPanel.children().length - 1) {
        buttonsPanel.children().eq(idx + dir).find('img').click();
        e.preventDefault();
      }
    } else {
      if (idx > 0) {
        buttonsPanel.children().eq(idx + dir).find('img').click();
        e.preventDefault();
      }
    }
  }); // When the product slider changes slides or the tabSwitcher switches the tab we need to update the viewport
  // Conditions:
  // 1.	Carousel switches product
  // 2.	Tab switcher buttons are clicked
  // What to be updated:
  // 1.	Separate divs for description (.covers) and other tabs (.viewport-placeholder)
  // 2.	Half-height param ('halved') for some images to make them same height as the description
  // 3.	Bugfix for maintaining cover image height (when the carousel switches between smaller images,
  // 		the height is altered due to the nature of flex, I think)

  function refreshViewport(slide, tab) {
    var viewport = $(slide).find('.viewport');
    var tabIdx = $(tab).index();
    var viewportItem;

    if (tabIdx === 0) {
      viewportItem = viewport.children('.covers');
      var activeParamIdx = $(tab).find('.param-switcher li.active').index();
      var img = viewportItem.find('img').eq(activeParamIdx); // img.attr('src', img.attr('src'));

      viewport.children().hide();
      viewportItem.show();
    } else {
      var thumbs = $(slide).find('.product-tabs').children().eq(tabIdx).find('.thumbs');
      var img0 = thumbs.children('li').eq(0).children('img');
      var src = img0.attr('src');
      var placeholder = viewport.find('.viewport-placeholder');
      var caption = img0.siblings('.caption');
      updateViewportImage(placeholder, img0, thumbs, caption, false); //placeholder.find('.img0').attr('src', src);

      /*let halved = thumbs.data('halved');
      if ( halved ) {
      	placeholder.addClass('h-50');
      }
      else placeholder.removeClass('h-50');*/

      viewportItem = placeholder;
      viewport.children().hide();
      viewport.children().not('.covers').show();
    }
  }

  function updateViewportImage(placeholder, img, thumbs, caption) {
    var byClick = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var src = img.attr('src');
    var layer = parseInt(thumbs.data('layer'));
    var img0 = placeholder.find('.img0');
    var captionDiv = placeholder.next();

    if (layer === 0) {
      placeholder.find('img').each(function () {
        $(this).hide();
        captionDiv.text('');
        $(this).attr('data-caption', '');
      });
      img0.attr('src', src);
      img0.show();

      if (caption.length) {
        captionDiv.text(caption.text());
      }
    } else if (layer > 0) {
      img0.hide();
      captionDiv.text('');
      var imgClass = '.img' + layer.toString();
      var imgLayer = placeholder.find(imgClass);

      if (imgLayer.is(":hidden") || byClick) {
        imgLayer.attr('src', src);
        imgLayer.attr('data-caption', caption.text());
        imgLayer.show();
      }

      var captionText = '';
      placeholder.find('div.layers img').not('.img0').each(function () {
        if ($(this).attr('data-caption') != '') {
          //console.log('123');
          if (captionText == '') {
            console.log('111');
            captionText += $(this).attr('data-caption');
          } else {
            captionText += ', ' + $(this).attr('data-caption');
          }
        }
      });
      captionDiv.text(captionText);
    }
  }

  var carouselProduct = $('.carousel-product');
  var productTabSwitcher = carouselProduct.find('.product-tab-switcher');
  productTabSwitcher.children().on('click', function () {
    if ($(this).is('.active')) return;
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    var idx = $(this).index();
    var slide = carouselProduct.find('.carousel-item.active');
    refreshViewport(slide, this);
    var tabsContainer = slide.find('.product-tabs');
    tabsContainer.children('.active').fadeOut(100, function () {
      tabsContainer.children().eq(idx).fadeIn(100, function () {
        $(this).addClass('active');
      });
      $(this).removeClass('active');
    });
  });

  function stripLeadingTabs(text) {
    var cleanText = text.replace(/^(?:\t| )+(?!\n)/gm, '');
    return cleanText;
  } // When the product slider switches slides

  /*carouselProduct.on('slide.bs.carousel', function(e) {
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
  		/*function swapGalleryImages(elementId, imagesList) {
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
  	}*/
  //});


  var paramSwitcher = $('.param-switcher');
  paramSwitcher.find('li').on('click', function () {
    if ($(this).is('.active')) {
      return;
    }

    $(this).siblings('.active').removeClass('active');
    $(this).addClass('active');
    var viewport = carouselProduct.find('.carousel-item.active .viewport');
    var idx = $(this).index();
    viewport.children('.covers').children().hide();
    viewport.children('.covers').children().eq(idx).show().css('display', 'block');
  });

  function is_touch_device() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

    var mq = function mq(query) {
      return window.matchMedia(query).matches;
    };

    if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
      return true;
    } // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH


    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
  }

  var minWidth = 1140;
  $('.dropdown-toggle').on('mouseover', function () {
    if (window.innerWidth >= minWidth && !is_touch_device()) {
      $(this).dropdown('toggle');
    }
  });
  $('.dropdown-toggle').on('click', function (e) {
    // if dropdown has been shown
    if (window.innerWidth >= minWidth && !is_touch_device()) {
      $(this).dropdown('dispose');
      window.location.href = $(this).attr('href');
    } else {
      if ($(this).parent().hasClass('show')) {
        window.location.href = $(this).attr('href');
      }
    }
  });
  $('.dropdown-menu').on('mouseleave', function () {
    if (window.innerWidth >= minWidth) {
      $(this).siblings().dropdown('toggle');
    }
  });
  $('.dropdown-toggle').on('mouseout', function (e) {
    if (window.innerWidth >= minWidth && e.pageX <= $(this).offset().left) {
      $(this).dropdown('toggle');
    }
  });
});