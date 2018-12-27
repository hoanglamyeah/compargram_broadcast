const express = require('express')
const consola = require('consola')
const {Nuxt, Builder} = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const cron = require("node-cron");
var CronJobManager = require('cron-job-manager')
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

    var manager = new CronJobManager();

    io.on('connection', function (socket) {
        let temp = ''

        socket.on('JOIN_CHANEL', function (data) {
            temp = data
            socket.join(data);
            if (!manager.exists(data)) {
                manager.add(data, "*/2 * * * * *", () => {
                    let url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + data + '&key=AIzaSyBU_oWEIULi3-n96vWKETYCMsldYDAlz2M'
                    request(url, function (error, response, body) {
                        io.to(data).emit('ON_TEST', JSON.parse(body));
                    })
                });
                manager.start(data);
            }
        })

        socket.on('disconnect', function() {
            // if (Object.keys(socket.adapter.rooms[temp]).length === 0) {
            //     if (manager.exists(temp)) {
            //         manager.stop(temp)
            //         manager.deleteJob(temp)
            //     }
            // }
            if (io.sockets.adapter.sids[temp] === undefined) {
                if (manager.exists(temp)) {
                    manager.stop(temp)
                    manager.deleteJob(temp)
                }
            }
            console.log(manager.listCrons());
        });
    });

    consola.ready({
        message: `Server listening on http://${host}:${port}`,
        badge: true
    })
}

start()
