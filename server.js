var http = require('http'),
    async = require('async'),
    xml2js = require('xml2js');

require('http').createServer(function (req, res) {

    function handleError() {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        return res.end('Sorry, there was a problem');
    }

    function makeRequest(options, callback) {
        var newsCount = 10,
            newsStr = '';
        var request = http.get(options, function (response) {
            if (response.statusCode !== 200) {
                handleError();
            }
            var feed = '';
            response.setEncoding('utf8');
            response.on('data', function (data) {
                feed += data;
            });
            response.on('end', function () {
                xml2js.parseString(feed, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    var news = result.rss.channel[0].item.slice(0, newsCount - 1);
                    // console.dir(news);
                    for (var i = 0, l = news.length; i < l; i += 1) {
                        newsStr += '<li><a href="' + news[i].link + '" target="_blank">' + news[i].title + '</a></li>';
                    }
                    // console.log(newsStr);
                    callback(err, newsStr);
                });
            });
        });
        request.end();
    }

    function respond(err, results) {
        if (err) {
            handleError();
        }
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end('<html><head><meta charset="utf-8" /></head><body><h3>BBC News</h3><ul>' + results[0] + '</ul><h3>SKY News</h3><ul>' + results[1] + '</ul></body></html>');
    }

    async.parallel([

    function (next) {
        makeRequest({
            host: "feeds.bbci.co.uk",
            port: 80,
            path: "/news/rss.xml"
        }, next);
    },

    function (next) {
        makeRequest({
            host: "news.sky.com",
            port: 80,
            path: "/feeds/rss/home.xml"
        }, next);
    }], respond);

}).listen(4000);