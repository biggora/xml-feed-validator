var express = require('express');
var router = express.Router();
var feedValidator = require('feed-validator');
var pkg = require('../package.json');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: pkg.name,
        description: pkg.description,
        feed_url: ''
    });
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
            if(typeof data === 'string'){
                try {
                    data = JSON.parse(data);
                } catch (err){}
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

module.exports = router;
