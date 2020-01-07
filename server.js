'use strict';

const _ = require('koa-route');
const IO = require('koa-socket-2');
const Koa = require('koa');
const koaBody = require('koa-body');
const nanoid = require('nanoid');
const Pug = require('koa-pug');
const serve = require('koa-static');

// 初期化
const app = new Koa();
const io = new IO();
const pug = new Pug({
    app: app,
    viewPath: './views',
    basedir: './views'
});

// ルーム情報が入る変数
const rooms = {};
class Room {
    constructor(title) {
        this.title = title;
        this.count = 0;
        this.viewer = 0;
    }
}

// ルーティングの設定
const routes = {
    // トップページ(get)
    home: (ctx) => {
        ctx.render('home', {'rooms':rooms});
    },

    // ルーム入室後のページ(get)
    room: (ctx, connection) => {
        if (rooms[connection]) {
            // ルームが存在した場合
            ctx.render('room', { 'room': rooms[connection] ,'connection': connection });
        } else {
            // ルームが存在しない場合
            ctx.render('room_not_found');
        }
    },

    // 新しいルームの作成(post)
    create: (ctx) => {
        const title = ctx.request.body.title;
        if (!title) {
            ctx.throw(400);
        } else if (title.length > 100) {
            ctx.throw(400);
        } else {
            const connection = nanoid();
            rooms[connection] = new Room(ctx.request.body.title);
            ctx.redirect('/' + connection);
        }
    }
};

// ソケット通信のイベント設定
const chat = {
    // 入室イベント
    join: (ctx, connection) => {
        if (rooms[connection]) {
            rooms[connection].viewer++; // 参加者数を1加算
            ctx.socket.join(connection);
            io.to(connection).emit('join', rooms[connection].viewer);
        }
    },

    // へぇ数加算イベント
    increment: (ctx) => {
        const connections = ctx.socket.rooms;
        for (let connection in connections) {
            if (rooms[connection]) {
                rooms[connection].count++; // へぇ数を1加算
                ctx.socket.broadcast.to(connection).emit('increment', rooms[connection].count);
            }
        }
    },

    // 退室イベント
    disconnecting: (ctx, reason) => {
        const connections = ctx.socket.rooms;
        for (let connection in connections) {
            if (rooms[connection]) {
                rooms[connection].viewer--; // 参加者数を1減算
                if (rooms[connection].viewer === 0) {
                    // 参加者数が0になったらルームを削除
                    delete rooms[connection];
                } else {
                    io.to(connection).emit('leave', rooms[connection].viewer);
                }
            }
        }
    }
};

// ミドルウェアを設定
app.use(koaBody());
app.use(serve(__dirname + '/public'));

// ルーティングを適用
app.use(_.get('/', routes.home));
app.use(_.post('/', routes.create));
app.use(_.get('/:connection', routes.room));

// ソケット通信のイベントを適用
io.attach(app);
io.on('join', chat.join);
io.on('increment', chat.increment);
io.on('disconnecting', chat.disconnecting);

// サーバを立ち上げ
app.listen(process.env.PORT || 1337);
console.log('listening on port 1337');