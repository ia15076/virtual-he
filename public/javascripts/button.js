// へぇ数に応じた背景の演出の設定
const decorations = [
    {
        min: 10, // 演出を開始するへぇ数
        max: Number.MAX_SAFE_INTEGER, // 演出を終えるへぇ数
        $obj: $('.light') // 演出用オブジェクト
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

// ソケットサーバに接続
const socket = io.connect('/');

// キー押下のイベント
$(document).on('keydown', function (e) {
    if (e.keyCode === 72) {
        // スペースキー押下でへぇボタンをクリックする
        $('#he-button').click();
    }
});

// へぇボタンクリックのイベント
$('#he-button').on('click', function () {
    // へぇ数+1
    const count = parseInt($('#he-counter').text(), 10) + 1;

    // サーバーにincrementイベントを送信
    socket.emit('increment');

    animateButton(); // ボタンを動かす
    playSound(count); // 音声を再生
    kiriban(count); // キリ番イベント
    updateCounter(count); // カウンターを更新
    updateBackground(count); // 背景を更新

    window.navigator.vibrate(500); // 携帯端末ならバイブレーションを発生させる
});

// 他のユーザーが入室したときのイベント
socket.on('join', updateOthers);

// 他のユーザが退室したときのイベント
socket.on('leave', updateOthers);

// 他のユーザーがへぇボタンをクリックしたときのイベント
socket.on('increment', function (count) {
    pop(); // 他ユーザーのへぇボタンのアニメーションを動かす
    playSound(count); // 音声を再生
    updateCounter(count); // カウンターを更新
    updateBackground(count); // 背景を更新
});

// 音声を再生
function playSound(count) {
    // 2つのaudio要素を交互に再生する
    const audio = $('.he-sound')[count % 2];
    audio.currentTime = 0;
    audio.play();
}

// キリ番イベント
function kiriban(count) {
    if (isKiriban(count)) {
        // キリ番なら、「KIRIBAN」の文字列を点滅させる
        const $kiriban = $('#kiriban');
        $kiriban.css({ 'visibility': 'visible' });
        setTimeout(function () {
            $kiriban.css({ 'visibility': 'hidden' });
        }, 2000);
    }
}

// カウンターを更新
function updateCounter(count) {
    $('#he-counter').text(count);
}

// 背景を更新
function updateBackground(count) {
    // いいね数に応じて背景の星の回転数を上げる
    const duration = 1000 / count;
    $('#stars').css({
        'animation-duration': duration + 's'
    });

    // いいね数に応じてdecorationsに設定された演出オブジェクトを表示させたり隠したりする
    for (let d of decorations) {
        if (d.min <= count && d.$obj.css('display') !== 'block') {
            // 表示開始
            d.$obj.fadeIn();
        }
        if (d.max <= count && d.$obj.css('display') === 'block') {
            // 表示終了
            d.$obj.fadeOut();
        }
    }
}

// 他ユーザーのへぇボタンの数、「他の参加者」の数を合わせる
function updateOthers(num) {
    while ($('.other-button').length < num - 1) {
        // ユーザーの数よりへぇボタンが少なければ、増やす
        $('#others').append('<div class="other-button"></div>');
    }
    while ($('.other-button').length > num - 1) {
        // ユーザーの数よりへぇボタンが多ければ、減らす
        $('.other-button')[0].remove();
    }
    // 「他の参加者」の数を合わせる
    $('#viewer-counter').text(num - 1);
}

// へぇボタンクリック時のアニメーション
function animateButton() {
    const $button = $('#he-button'); // へぇボタンの要素を取得
    $button.finish(); // 既に再生中のアニメーションを停止

    // アニメーションを開始
    $button.animate({
        'font-size': '240%'
    }, 100, function () {
        $button.animate({
            'font-size': '200%'
        }, 100);
    });
}

// 他のへぇボタンが押されたときのアニメーション
function pop() {
    // 他のへぇボタンをランダムに1つ選ぶ
    const $buttons = $('.other-button');
    const random = $buttons[Math.floor(Math.random() * $buttons.length)];

    // アニメーションを開始
    $(random).css({ 'opacity': 1.0 });
    $(random).animate({ 'opacity': 0.5 },500);
}

// 数字がキリ番かどうかの判定
function isKiriban(num) {
    const str = num.toString(10);
    if (/^[1-9]0{2,}$/.test(str)) {
        return true;
    } else if (/^([1-9])\\1{2,}$/.test(str)) {
        return true;
    } else if (num > 100 && str == '123456789'.substr(0, str.length)) {
        return true;
    }
    return false;
}

// ページに来た時最初のアニメーションを開始
updateBackground(parseInt($('#he-counter').text(), 10));