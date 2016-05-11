'use strict';

const fs = require('fs');

/* eslint no-sync: 0 */
module.exports = app => {
  fs.readdirSync(__dirname)
    .forEach(file => {
      if (file[0] !== '.' && file !== 'index.js') {
        require(`./${file}/`)(app);
      }
    });
};
