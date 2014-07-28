#! /usr/bin/env node

'use strict';

require('shelljs/global');

var format = require('mustache').render;
var findup = require('findup-sync');
var fs = require('fs');
var readline = require('readline');
var path = require('path');
var tilde = require('expand-home-dir');

var userArgs = process.argv;
var host = userArgs[2];

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1 || host === undefined) {
  return console.log('cli help');
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
  return console.log(require('./package').version);
}

var rd = readline.createInterface({
  input: fs.createReadStream(findup('.rsyncrc', {nocase: true})),
  output: process.stdout,
  terminal: false
});

rd.on('line', function(file) {
  if(!file.trim())
    return;

  file = tilde(file).replace(/\s+/g, '\\$&');
  var cmd = format(
    "rsync -auzhio --progress --omit-dir-times --rsync-path='sudo rsync'" +
    " {{#exclude}} --exclude= {{exclude}}{{/exclude}} {{&src}} {{host}}:'{{&dest}}'",
    {
      exclude: '',
      host: host,
      src: file,
      dest: path.dirname(file),
    });

  exec(cmd);
});

rd.on('close', function() {
  process.exit(0);
});
