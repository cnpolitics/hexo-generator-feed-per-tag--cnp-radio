var path = require('path');
var fs = require('fs');
var nunjucks = require('nunjucks');
var env = new nunjucks.Environment();

nunjucks.configure({
    autoescape: false,
    watch: false
});

env.addFilter('uriencode', function(str) {
    return encodeURI(str);
});

var atomTemplateSource = path.join(__dirname, '../atom.xml');
var atomTemplate = nunjucks.compile(fs.readFileSync(atomTemplateSource, 'utf8'), env);
var rss2TemplateSource = path.join(__dirname, '../rss2.xml');
var rss2Template = nunjucks.compile(fs.readFileSync(rss2TemplateSource, 'utf8'), env);

module.exports = function(locals) {
    var hexo = this;
    var config = this.config;

    return locals.tags.reduce(function(results,tag) {
        if(!tag.length) return results;

        var tag_url = config.root + tag.path;
        var feed_url = tag_url + (config.feed.format === "rss2" ? "feed.xml" : "atom.xml");
        var feed_path = tag.path + (config.feed.format === "rss2" ? "feed.xml" : "atom.xml");
        var template = config.feed.format === "rss2" ? rss2Template : atomTemplate;

        var posts = tag.posts.sort("-date");

        if(config.feed.limit) {
            posts = posts.limit(config.feed.limit);
        }

        var url = config.url;
        if (url[url.length - 1] !== '/') url += '/';

        var xml = template.render({
            posts: posts,
            feed_url: feed_url,
            url: url,
            tag_url: tag_url,
            config: config,
            tag: tag
        });

        return results.concat({ data: xml, path: feed_path });
    }, []);
};