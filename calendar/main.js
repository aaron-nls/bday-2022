$(document).ready(function() {

    $('button[data-page]').click(function() {
        var target = $(this).attr('data-page');
        goToPage(target);
    });

});


let bgAudio = null;
let bgAudioPlayer = null;
let soundAudio =  null; 
let soundAudioPlayer = null;

function goToPage(page) {
    $('page:visible').fadeOut();
    const curPage = $('page[id="' + page + '"]');
    const curBackground = $(curPage).data('bg-audio');
    const curBgVolume = $(curPage).data('bg-volume');
    const curSound = $(curPage).data('sound');

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
        bgAudioPlayer.pause();
    }else{
        bgAudioPlayer.volume = bgVolume ?? 0.5;
    }
}

function playSound(newSoundAudio) {
    if(newSoundAudio && newSoundAudio !== soundAudio) {
        soundAudio = newSoundAudio;
        if(soundAudioPlayer) {
            soundAudioPlayer.pause();
        }   
        soundAudioPlayer = new Audio('audio/' + soundAudio + '.mp3');
        soundAudioPlayer.play();
    }

    if(newSoundAudio === null) {
        soundAudio = null;
        soundAudioPlayer.pause();
    }
}