$(document).ready( () => {
	let carousel = $('#carouselMain');
	let callbackForm = $('#callbackForm');
	$('.link-callback').on('click', () => {
		carousel.hide(500);
		callbackForm.show(1000);
	});
	$('.link-close').on('click', () => {
		callbackForm.hide(500);
		carousel.show(1000);
	});
});