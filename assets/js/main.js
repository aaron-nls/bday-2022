const player = document.getElementById('user');
const video = document.getElementById('video');
const audio = document.getElementById('audio');


$(document).ready(function(){
  window.navigator.vibrate([300, 100, 200, 50, 300]);
  $('[href^="#"]').click(function(){
    changePage($(this).attr('href'));
  });
  $('.js-enterFullScreen').click(function(){
    enterFullScreen();
  });
  $('.js-exitFullScreen').click(function(){
    exitFullScreen();
  });
  $('.js-captureScreenshot').click(function(){
    captureScreenshot();
  });
});

function changePage(pageID){
  $('.pages section').removeClass('visible');
  $('.pages ' + pageID).addClass('visible');
}

function hideVideo() {
  document.body.classList.add('noCamera');
}


function enterFullScreen() {
  video.play();
  audio.play();
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen =
    docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  changePage('#home');
}

function exitFullScreen() {
  video.pause();
  video.currentTime = 0;
  var doc = window.document;

  var cancelFullScreen =
    doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  cancelFullScreen.call(doc);
}

function captureScreenshot(){
    // Define the size of the rectangle that will be filled (basically the entire element)
    var w =player.videoWidth;
    var h = player.videoHeight;
    canvas.width = w;
			canvas.height = h;	
    context.fillRect(0, 0, w, h);
    // Grab the image from the video
    console.log('width: ' +w+ ' - height: ' + h);
    context.drawImage(player, 0, 0, w, h);

    $.post('/assets/php/uploader.php',
    {
        id : 	atob(getParameterByName('uid')) + Date.now(),
        img : canvas.toDataURL("image/png")
    }, function(data) {
        console.log(data);
    });
}

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}