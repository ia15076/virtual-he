// ロード完了時にプリロード画面をフェードアウトさせる
$("#loading").text("complete!");
$("#preload").fadeOut();

// gtag.jsスニペット
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-116043944-1');