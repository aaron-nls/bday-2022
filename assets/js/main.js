const player = document.getElementById('user');
const video = document.getElementById('video');
const bg = document.getElementById('bg');
const winnie = document.getElementById('winnie');
const shade = document.getElementById('shade');
const scream = document.getElementById('scream');
const logo = document.getElementById('logo');
const flame = document.getElementById('flame');

let volumeInterval = null;

$(document).ready(function(){
  video.play();
  bg.play();
  video.loop = true;
  $('[href^="#"]').click(function(){
    changePage($(this).attr('href'));
  });

  $('.fire').click(function(){
    if(!$('body').hasClass('black-flame')){
      winnie.currentTime = 0;
      winnie.play();
    }
    $('body').toggleClass('black-flame');
  });

  winnie.onended = function() {
    $('body').removeClass('black-flame');
  };
  
  $('#logo').click(function(){
    $(this).addClass('animate__bounce');
    shade.currentTime = 0;
    shade.play();
});
$('#queen').click(function(){
    changePage('#home');
});

    
  logo.addEventListener('animationend', () => {
    $(logo).removeClass('animate__bounce');
  });
});
  

function changePage(pageID){
  $('.pages section').removeClass('visible');
  $('.pages ' + pageID).addClass('visible');
  $('body').removeClass('black-flame');

  $('html,body').scrollTop(0);
  if(pageID == '#quiet') {
    $('body').addClass('quiet');
    video.muted = true;
    doBlow();
  }else{
    stopBlow();
    $('body').removeClass('extinguished quiet');

    video.muted = false;
    video.volume=1;
  }
}


function stopBlow() {
  if(volumeInterval !== null) {
    audioContext = null;
    audioSource = null;
    analyser = null;
    volumes = null;
    audioStream.getTracks().forEach(function(track) {
      track.stop();
    });
    clearInterval(volumeInterval);
  }
}

let audioContext = null;
let audioSource = null;
let analyser = null;
let volumes = null;
let audioStream = null;
async function doBlow() {
    
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true
      }
    });

    audioContext = new AudioContext();
    audioSource = audioContext.createMediaStreamSource(audioStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;
    audioSource.connect(analyser);
    volumes = new Uint8Array(analyser.frequencyBinCount);
    
    if(volumeCallback !== null && volumeInterval === null){
      volumeInterval = setInterval(volumeCallback, 100);
    }
  } catch(e) {
    alert('Soz, no mic, no blow!');
  }
}

 
function volumeCallback()  {
  analyser.getByteFrequencyData(volumes);
  let volumeSum = 0;
  for(const volume of volumes)
    volumeSum += volume;
  const averageVolume = volumeSum / volumes.length;
  // Value range: 127 = analyser.maxDecibels - analyser.minDecibels;
  let vol = (averageVolume * 100 / 127);
  console.log(vol);
  flame.style.setProperty('--scale', 1 - (averageVolume / 127) + '');
  if(vol > 70) {
    stopBlow();
    $('body').addClass('extinguished');
    scream.currentTime = 0;
    scream.play();
    $('#quiettime').remove();
  }
}


function enterFullScreen() {
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


