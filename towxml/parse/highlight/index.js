const hljs = require('./highlight');
//@towxml-remove-start dynamic-highlight-languages
const config = require('../../config');
config.highlight.forEach(item => {
    hljs.registerLanguage(item, require(`./languages/${item}`).default);
});
//@towxml-remove-end dynamic-highlight-languages
//@registerLanguage

module.exports = hljs;
