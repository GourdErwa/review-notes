const myNav = require("./my-nav.js");
const mySidebar = require("./my-sidebar");

module.exports = {
    title: 'technical-notes',
    description: 'Just playing around',
    base: '/review-notes/',
    markdown: {
        lineNumbers: false // 代码块显示行号
    },
    themeConfig: {
        lastUpdated: '最后修改时间', // string | boolean
        smoothScroll: true,
        nav: myNav,
        sidebar: mySidebar
    },
    plugins: ['autobar']
}
;
