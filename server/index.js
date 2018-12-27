const express = require('express')
const consola = require('consola')
const {Nuxt, Builder} = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const cron = require("node-cron");
var request = require('request');

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
    // Init Nuxt.js
    const nuxt = new Nuxt(config)

    // Build only in dev mode
    if (config.dev) {
        const builder = new Builder(nuxt)
        await builder.build()
    }

    // Give nuxt middleware to express
    app.use(nuxt.render)

    // Listen the server
    let server = app.listen(port, host)
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        socket.on('JOIN_CHANEL', function (data) {
            cron.schedule("*/2 * * * * *", function () {
                let url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + data + '&key=AIzaSyBU_oWEIULi3-n96vWKETYCMsldYDAlz2M'
                request(url, function (error, response, body) {
                    socket.emit('ON_TEST', JSON.parse(body))
                })
            });
        })
    });
    consola.ready({
        message: `Server listening on http://${host}:${port}`,
        badge: true
    })
}

start()
