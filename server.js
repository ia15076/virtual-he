'use strict';

const serve = require('koa-static');
const _ = require('koa-route');
const Koa = require('koa');
const koaBody = require('koa-body');
const IO = require('koa-socket-2');
const Pug = require('koa-pug');
const nanoid = require('nanoid');

const app = new Koa();
const io = new IO();
const pug = new Pug({
    app: app,
    viewPath: './views',
    basedir: './views'
});

var rooms = {};
class Room {
    constructor(title) {
        this.title = title;
        this.count = 0;
        this.viewer = 0;
    }
}

const routes = {
    home: (ctx) => {
        ctx.render('home', {'rooms':rooms});
    },

    room: (ctx, connection) => {
        if (rooms[connection]) {
            ctx.render('room', { 'room': rooms[connection] ,'connection': connection });
        } else {
            ctx.render('room_not_found');
        }
    },

    create: (ctx) => {
        var title = ctx.request.body.title;
        if (!title) {
            ctx.throw(400);
        } else if (title.length > 100) {
            ctx.throw(400);
        } else {
            var connection = nanoid();
            rooms[connection] = new Room(ctx.request.body.title);
            ctx.redirect('/' + connection);
        }
    }
}

const chat = {
    join: (ctx, connection) => {
        if (rooms[connection]) {
            rooms[connection].viewer++;
            ctx.socket.join(connection);
            io.to(connection).emit('join', rooms[connection].viewer);
        }
    },

    increment: (ctx) => {
        var connections = ctx.socket.rooms;
        for (var connection in connections) {
            if (rooms[connection]) {
                rooms[connection].count++;
                ctx.socket.broadcast.to(connection).emit('increment', rooms[connection].count);
            }
        }
    },

    disconnecting: (ctx, reason) => {
        var connections = ctx.socket.rooms;
        for (var connection in connections) {
            if (rooms[connection]) {
                rooms[connection].viewer--;
                if (rooms[connection].viewer == 0) {
                    delete rooms[connection];
                } else {
                    io.to(connection).emit('leave', rooms[connection].viewer);
                }
            }
        }
    }
}

app.use(koaBody());
app.use(serve(__dirname + '/public'));

app.use(_.get('/', routes.home));
app.use(_.post('/', routes.create));
app.use(_.get('/:connection', routes.room));

io.attach(app);
io.on('join', chat.join);
io.on('increment', chat.increment);
io.on('disconnecting', chat.disconnecting);

app.listen(process.env.PORT || 1337);
console.log('listening on port 1337');