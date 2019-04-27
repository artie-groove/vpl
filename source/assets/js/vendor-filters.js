$(document).imagesLoaded( function() {
	
	/**
	Script tests browser features and tells if the Browser is IE10 or IE11
	Target IE 10 with JavaScript and CSS property detection.
	# 2013 by Tim Pietrusky
	# timpietrusky.com
	**/

	// IE 10 only CSS properties
	var ie10Styles = [
	'msTouchAction',
	'msWrapFlow'];

	var ie11Styles = [
	'msTextCombineHorizontal'];

	/*
	* Test all IE only CSS properties
	*/

	var d = document;
	var b = d.body;
	var s = b.style;
	var brwoser = null;
	var property;

	// Tests IE10 properties
	for (var i = 0; i < ie10Styles.length; i++) {
		property = ie10Styles[i];
		if (s[property] != undefined) {
			brwoser = "ie10";
		}
	}

	// Tests IE11 properties
	for (var i = 0; i < ie11Styles.length; i++) {
		property = ie11Styles[i];
		if (s[property] != undefined) {
			brwoser = "ie11";
		}
	}
	 
	 //Grayscale images only on browsers IE10+ since they removed support for CSS grayscale filter
	 if(brwoser == "ie10" || brwoser == "ie11" ){
	 
		//If the browser supports Filters, then we assume that it is Microsoft Edge
		if (Modernizr.cssfilters){
			$('body').addClass('edge'); // Adds Microsoft Edge class to the body
		} else {
			$('body').addClass('ie11'); // Fixes marbin issue on IE10 and IE11 after canvas function on images
			$('.grayscale img').each(function(){
				var el = $(this);
				el.css({"position":"absolute"}).wrap("<div class='img_wrapper' style='display: inline-block'>").clone().addClass('img_grayscale ieImage').css({"position":"absolute","z-index":"5","opacity":"0"}).insertBefore(el).queue(function(){
					var el = $(this);
					el.parent().css({"width":this.width,"height":this.height});
					el.dequeue();
				});
				this.src = grayscaleIe(this.src);
			});
			

			
			// Quick animation on IE10+ 
			// $('.grayscale img').hover(
			// 	function () {
			// 		$(this).parent().find('img:first').stop().animate({opacity:1}, 200);
			// 	}, 
			// 	function () {
			// 		$('.img_grayscale').stop().animate({opacity:0}, 200);
			// 	}
			// );
			
			// Custom grayscale function for IE10 and IE11
			function grayscaleIe(src){
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				var imgObj = new Image();
				imgObj.src = src;
				canvas.width = imgObj.width;
				canvas.height = imgObj.height; 
				ctx.drawImage(imgObj, 0, 0); 
				var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
				for(var y = 0; y < imgPixels.height; y++){
					for(var x = 0; x < imgPixels.width; x++){
						var i = (y * 4) * imgPixels.width + x * 4;
						var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
						imgPixels.data[i] = avg; 
						imgPixels.data[i + 1] = avg; 
						imgPixels.data[i + 2] = avg;
					}
				}
				ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
				return canvas.toDataURL();
			};
		};
	 };

	// If the browser does not support CSS filters filters, we are applying grayscale.js function
	// This part of Grayscale images applies to those browsers that do not support CSS filters
	if (!Modernizr.cssfilters) {
		var $images = $(".grayscale img"), imageCount = $images.length, counter = 0;

		// One instead of on, because it need only fire once per image
		$images.one("load",function(){
			// increment counter every time an image finishes loading
			counter++;
			if (counter == imageCount) {
				// do stuff when all have loaded
				grayscale($('.grayscale img'));
				$(".grayscale img").hover(
					function () {
						grayscale.reset($(this));
					}, 
					function () {
						grayscale($(this));
					}
				);
			}
		}).each(function () {
		if (this.complete) {
			// manually trigger load event in
			// event of a cache pull
				$(this).trigger("load");
			}
		});
	}
});