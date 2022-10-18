const player = document.getElementById('user');
const video = document.getElementById('video');
const audio = document.getElementById('audio');


$(document).ready(function(){
  video.play();
  video.loop = true;
  $('[href^="#"]').click(function(){
    changePage($(this).attr('href'));
  });
  $('.js-enterFullScreen').click(function(){
    enterFullScreen();
  });
  $('.js-exitFullScreen').click(function(){
    exitFullScreen();
  });
});

function changePage(pageID){
  $('.pages section').removeClass('visible');
  $('.pages ' + pageID).addClass('visible');
  window.navigator.vibrate([300, 100, 200, 50, 300]);
}


function enterFullScreen() {
  audio.play();
  changePage('#home');
}

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}