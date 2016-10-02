var express = require('express');
var router = express.Router();
var sanitizeHtml = require('sanitize-html');
var feedValidator = require('feed-validator');
var pkg = require('../package.json');

var concatArray = function (arr) {
    return arr instanceof Array ? arr.join('') : arr;
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: pkg.name,
        description: pkg.description,
        feed_url: ''
    });
});

/* GET feed validation page redirect to root. */
router.get('/validate', function (req, res, next) {
    res.redirect('/');
});

/* POST feed validation page. */
router.post('/validate', function (req, res, next) {
    var body = req.body || {};
    if (body.feed_url && body.feed_url !== '') {
        var options = {
            url: body.feed_url,
            suppress: []
        };
        feedValidator.validate(options, function (data) {
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                }
            }
            console.log(data)
            res.render('result', {
                title: pkg.name,
                description: pkg.description,
                feed_url: options.url,
                data: data
            });
        });
    } else {
        res.redirect('/');
    }
});

router.post('/preview', function (req, res, next) {
    var body = req.body || {};
    if (body.feed_url && body.feed_url !== '') {
        var options = {
            url: body.feed_url,
            suppress: []
        };
        feedValidator.validate(options, function (data) {
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                }
            }
            var items = [];
            var feedJson = (((data.feedJson || {}).rss || {}).channel || [])[0] || {};
            (feedJson.item || []).forEach(function (o) {
                var t = {};
                t.title = concatArray(o.title);
                t.description = concatArray(o.description);
                t.author = concatArray(o.author || o['dc:creator'] || '');
                t.link = concatArray(o.link);
                t.pubDate = concatArray(o.pubDate || o.pubdate);
                t.created = new Date(Date.parse(t.pubDate));
                var enclosure = ((o.enclosure || {})[0] || {});
                t.enclosure = enclosure['$'] || enclosure;
                var guid = ((o.guid || [])[0] || {});
                t.imgUrl = (t.enclosure.url || '');
                t.guid = (guid._ || guid);

                if (o.category) {
                    t.category = concatArray(o.category);
                } else {
                    t.category = '';
                }

                t.title = t.title
                    .toString()
                    .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/gi, '');

                t.description = t.description
                    .replace(/\s+/, ' ')
                    .replace(/^\s+|\s+$/, '')
                    .replace(/\r+|\n+/g, '');

                var content = /(<img[^>]*>)/gi.exec(t.description);
                if (content && content[0]) {
                    var src = /src="?([^\s"]+)"?/gi.exec(content[0]);
                    if ((!t.imgUrl || t.imgUrl === '') && (src !== null && src[1] !== null)) {
                        t.imgUrl = src[1];
                    }
                }
                if (!t.imgUrl || t.imgUrl === '' || t.imgUrl.toString().length < 10) {
                    t.imgUrl = 'http://www.randwick.nsw.gov.au/__data/assets/image/0007/14875/Latest-News.jpg';
                } else {
                    t.imgUrl = t.imgUrl
                        .toString()
                        .replace(/^\s+|\s+$/, '')
                        .replace(/"/g, '')
                        .replace(/'/g, '');
                }

                t.description = t.description
                    .replace(/^\s+|\s+$/, '')
                    .replace(/(<img[^>]*>)/gi, '')
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<figure\b[^<]*(?:(?!<\/figure>)<[^<]*)*<\/figure>/gi, '')
                    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                    .replace(/\\/g, "\\\\")
                    .replace(/\$/g, "\\$")
                    .replace(/'/g, "\\'")
                    .replace(/"|«|»/g, "\\\"")
                    .replace(/<br\/?>|<br\s>/gi, '')
                    .replace(/\s+/, ' ');

                t.description = sanitizeHtml(t.description, {
                    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'div', 'span'],
                    parser: {
                        lowerCaseTags: true
                    },
                    allowedAttributes: {
                        //                'a': [ 'href' ]
                    }
                });
                t.description = t.description
                    .replace(/^\s+|\s+$/, '');

                console.log(o);
                console.log(t);
                // t.description
                // console.log('-----', t.imgUrl);
                items.push(t);
            });

            res.render('preview', {
                title: pkg.name,
                description: pkg.description,
                feed_url: options.url,
                data: items
            });
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
