const socket = io.connect('/');

const decorations = [
    {
        min: 10,
        max: Number.MAX_SAFE_INTEGER,
        $obj: $('.light')
    },
    {
        min: 50,
        max: Number.MAX_SAFE_INTEGER,
        $obj: $('.audience1')
    },
    {
        min: 200,
        max: Number.MAX_SAFE_INTEGER,
        $obj: $('.audience2')
    },
    {
        min: 500,
        max: Number.MAX_SAFE_INTEGER,
        $obj: $('#bg')
    },
    {
        min: 100,
        max: 1000,
        $obj: $('.silver')
    },
    {
        min: 1000,
        max: 10000,
        $obj: $('.purple')
    },
    {
        min: 10000,
        max: Number.MAX_SAFE_INTEGER,
        $obj: $('.gold')
    }
];

$(document).on('keydown', function (e) {
    if (e.keyCode == 72) {
        $('#he-button').click();
    }
});

$('#he-button').on('click', function () {
    var count = parseInt($('#he-counter').text(), 10) + 1;
    socket.emit('increment');

    animateButton();
    playSound(count);
    kiriban(count);
    updateCounter(count);
    updateBackground(count);

    window.navigator.vibrate(500);
});

socket.on('join', function (num) {
    updateOthers(num);
});

socket.on('leave', function (num) {
    updateOthers(num);
});

socket.on('increment', function (count) {
    pop();
    playSound(count);
    updateCounter(count);
    updateBackground(count);
});

function playSound(count) {
    var audio = $('.he-sound')[count % 2];
    audio.currentTime = 0;
    audio.play();
}

function kiriban(count) {
    if (isKiriban(count)) {
        $kiriban = $('#kiriban');
        $kiriban.css({ 'visibility': 'visible' });
        setTimeout(function () {
            $kiriban.css({ 'visibility': 'hidden' });
        }, 2000);
    }
}

function updateCounter(count) {
    $('#he-counter').text(count);
}

function updateBackground(count) {
    var duration = 1000 / count;
    $('#stars').css({
        'animation-duration': duration + 's'
    });

    for (let d of decorations) {
        if (d.min <= count && d.$obj.css('display') != 'block') {
            d.$obj.fadeIn();
        }
        if (d.max <= count && d.$obj.css('display') == 'block') {
            d.$obj.fadeOut();
        }
    }
}

function updateOthers(num) {
    while ($('.other-button').length < num - 1) {
        $('#others').append('<div class="other-button"></div>');
    }
    while ($('.other-button').length > num - 1) {
        $('.other-button')[0].remove();
    }
    $('#viewer-counter').text(num - 1);
}

function animateButton() {
    var $button = $('#he-button');
    $button.finish();
    $button.animate({
        'font-size': '240%'
    }, 100, function () {
        $button.animate({
            'font-size': '200%'
        }, 100);
    });
}

function pop() {
    var $buttons = $('.other-button');
    var random = $buttons[Math.floor(Math.random() * $buttons.length)];
    $(random).css({ 'opacity': 1.0 });
    $(random).animate({ 'opacity': 0.5 },500);
}

function isKiriban(num) {
    var str = num.toString(10);
    if (/^[1-9]0{2,}$/.test(str)) {
        return true;
    }
    if (/^([1-9])\\1{2,}$/.test(str)) {
        return true;
    }
    if (num > 100 && str == '123456789'.substr(0, str.length)) {
        return true;
    }
    return false;
}

updateBackground(parseInt($('#he-counter').text(), 10));