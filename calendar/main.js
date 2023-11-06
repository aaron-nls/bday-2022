$(document).ready(function() {

    $('button[data-page]').click(function() {
        var target = $(this).attr('data-page');
        goToPage(target);
    });
    $('[data-show]').click(function() {
        var target = $(this).attr('data-show');
        showElement(target);
    });
    $('[data-toggle]').click(function() {
        var target = $(this).attr('data-toggle');
        toggleElement(target);
    });
    $('[data-hide]').click(function() {
        var target = $(this).attr('data-hide');
        hideElement(target);
    });
    $('[data-enable]').click(function() {
        var target = $(this).attr('data-enable');
        enableElement(target);
    });
    $('[data-disable]').click(function() {
        var target = $(this).attr('data-enable');
        disableElement(target);
    });
    $('[data-run]').click(function() {
        var target = $(this).attr('data-run');
        window[target]();
    });
    $('[data-sound-fx]').click(function() {
        var target = $(this).attr('data-sound-fx');
        var enabled = $(this).attr('data-enabled') ?? 'true';
        if(enabled === 'true') {
            playSound(target ?? null);
        }
    });


    var dragStartX, dragStartY, initialTop, initialLeft;
    var draggable = null;
    $('[data-drag-x]').on('touchstart', function(event) {
        event.preventDefault();
        draggable = this;
        var clientX = event.clientX || event.touches[0].clientX;
        var rect = draggable.getBoundingClientRect();
        dragStartX = clientX;
        initialLeft = rect.left;

        document.addEventListener('mousemove', onMoveX);
        document.addEventListener('touchmove', onMoveX);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    });

    $('[data-drag]').on('touchstart', function(event) {
        event.preventDefault();
        draggable = this;
        var clientX = event.clientX || event.touches[0].clientX;
        var clientY = event.clientY || event.touches[0].clientY;
        var rect = draggable.getBoundingClientRect();
        dragStartX = clientX;
        dragStartY = clientY;
        initialLeft = rect.left;
        initialTop = rect.top;

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    });

    function onMove(event) {
        var clientX = event.clientX || event.touches[0].clientX;
        var newLeft = initialLeft + clientX - dragStartX;
        var clientY = event.clientY || event.touches[0].clientY;
        var newTop = initialTop + clientY - dragStartY;
        draggable.style.transform = `translateX(${newLeft}px) translateY(${newTop}px)`;
    }

    function onMoveX(event) {
        var clientX = event.clientX || event.touches[0].clientX;
        var newLeft = initialLeft + clientX - dragStartX;
        draggable.style.transform = `translateX(${newLeft}px)`;
    }
    
    function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);
    }



});


let bgAudio = null;
let bgAudioPlayer = null;
let soundAudio =  null; 
let soundAudioPlayer = null;
let globalInterval = null;

function goToPage(page) {
    $('page:visible').fadeOut();
    const curPage = $('page[id="' + page + '"]');
    const curBackground = $(curPage).data('bg-audio');
    const curBgVolume = $(curPage).data('bg-volume');
    const curSound = $(curPage).data('sound');
    if(globalInterval) clearInterval(globalInterval);
    playSound(curSound ?? null);
    playBackground(curBackground ?? null, curBgVolume ?? 0.5);
    $(curPage).fadeIn();
}

function playBackground(newBgAudio, bgVolume) {
    if(newBgAudio && newBgAudio !== bgAudio) {
        bgAudio = newBgAudio;
        if(bgAudioPlayer) {
            bgAudioPlayer.pause();
        }
        bgAudioPlayer = new Audio('audio/' + bgAudio + '.mp3');
        bgAudioPlayer.play();
        bgAudioPlayer.loop = true;
    }

    if(newBgAudio === null) {
        bgAudio = null;
        if(bgAudioPlayer) bgAudioPlayer.pause();
    }else{
        bgAudioPlayer.volume = bgVolume ?? 0.5;
    }
}

function playSound(newSoundAudio) {
    if(newSoundAudio) {
        soundAudio = newSoundAudio;
        if(soundAudioPlayer) {
            soundAudioPlayer.pause();
        }   
        soundAudioPlayer = new Audio('audio/' + soundAudio + '.mp3');
        soundAudioPlayer.play();
    }

    if(newSoundAudio === null) {
        soundAudio = null;
        if(soundAudioPlayer) soundAudioPlayer.pause();
    }
}

function showElement(element) {
    $('page:visible [data-id="' + element + '"]').fadeIn();
}

function hideElement(element) {
    $('page:visible [data-id="' + element + '"]').fadeOut();
}

function toggleElement(element) {
    $('page:visible [data-id="' + element + '"]').fadeToggle();
}

function enableElement(element) {
    $('page:visible [data-id="' + element + '"]').attr('data-enabled', 'true');
}

function disableElement(element) {
    $('page:visible [data-id="' + element + '"]').attr('data-enabled', 'false');
}

let blurTime;
function windowFocus() {
    window.addEventListener("focus", function(event) {
        const focusTime = new Date();
        const elapsedSeconds = (focusTime - blurTime) / 1000;
        if (elapsedSeconds >= 10) {
            enableElement('present-button');
            hideElement('paper-button');
            hideElement('note');
        }
    }, false);

    window.addEventListener("blur", function(event) {
        blurTime = new Date();
    }, false);
}

var hasGyro = false;
var waterElement = document.querySelector('#door2 .water');
async function waterCycle(event) {
    if(hasGyro==false) {
        $('#door2 .water').removeClass('a-rotating');
        hasGyro = true;
    }
    var alpha = event.alpha; // rotation around z-axis (-180 to 180)

    document.getElementById('waterElement').style.transform = `rotateZ(${alpha}deg)`;
}

function requestGyroscopeAccess(functionToCall) {
    hasGyro = false;
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', (event) => { 
                            window[functionToCall](event);
                        });
                    }
                })
                .catch();
        } else {
            window.addEventListener('deviceorientation', (event) => { 
                window[functionToCall](event);
            });
        }
    }
}

function isDisconnected() {
    globalInterval = setInterval(function() {
        console.log(navigator.onLine);
        if (!navigator.onLine) {
            enableElement('powerbox');
        } else {
            disableElement('powerbox');
        }
    }, 3000); 
}