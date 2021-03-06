var path = require('path');
var grunt = require('grunt');

module.exports.register = function(Handlebars, options) {
  Handlebars.registerHelper('obj_val', function(object, property) {
    return object ? object[property] : property;
  });

  Handlebars.registerHelper('make_keywords', function(keywords) {
    return typeof(keywords) === 'string' ? keywords : keywords.join(', ');
  });

  function strip_yfm(content) {
    return content.replace(/^---(.|\n)*---\n/, '');
  }

  Handlebars.registerHelper('include', function(filename) {
    var dir, file = '', filepath;
    dir = path.dirname(this.page.src);
    filepath = path.join(dir, filename);
    if (grunt.file.exists(filepath)) {
      file = grunt.file.read(filepath);
    }
    file = strip_yfm(file);
    return file;
  });

  Handlebars.registerHelper('find_and_include', function(filename) {
    var dir, file = '', filepath;
    dir = path.dirname(this.page.src);
    filepath = path.join(dir, filename);
    if (grunt.file.exists(filepath)) {
      file = grunt.file.read(filepath);
    } else {
      filepath = path.join(path.dirname(dir), filename);
      if (grunt.file.exists(filepath)) {
        file = grunt.file.read(filepath);
      }
    }
    file = strip_yfm(file);
    return file;
  });

  Handlebars.registerHelper('include_this_or_the_first_html_file', function(filename) {
    var dir, file = '';
    dir = path.dirname(this.page.src);
    if (filename && grunt.file.exists(path.join(dir, filename))) {
      file = grunt.file.read(path.join(dir, filename));
    } else {
      var files = grunt.file.expand({
        cwd: dir
      }, ['*.html']);
      if (files.length > 0) {
        file = grunt.file.read(path.join(dir, files[0]));
      }
    }
    file = strip_yfm(file);
    return file;
  });

  Handlebars.registerHelper('list_all_headers', function() {
    var dir = path.dirname(this.page.src);
    var headers = grunt.file.expand({
      cwd: dir
    }, ['**/header.hbs']);
    var all_headers = '<tr><td>\n<div class="nav">\n';
    var parent = null;
    headers.forEach(function(header) {
      var file = grunt.file.read(path.join(dir, header));
      var title = file.match(/&raquo;(.+?)(\n|<)/);
      var links = file.match(/<a.+?<\/a>/ig);
      if (!title || !title[1]) throw 'no title matched';
      if (!links) throw 'no links matched';
      if (!parent) {
        var _parent = links[0].match(/>(.*)</);
        if (!_parent) throw 'no parent category matched';
        parent = _parent[1];
        all_headers += parent + '\n</div>\n<div class="nav" style="border-bottom: 1px dotted #000;">\n';
      }
      links.splice(0, 1);
      all_headers += '\n<b>' + title[1] + '</b>\n<br>\n';
      all_headers += links.map(function(link){
        return link.replace(/class="subcat"\s?/, '');
      }).join('\n|\n');
      all_headers += '<br>\n';
    });
    all_headers += '</div>\n</td></tr>\n';

    return all_headers;
  });
};
