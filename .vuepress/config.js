const myNav = require("./my-nav.js");
const mySidebar = require("./my-sidebar");

module.exports = {
    title: '复盘笔记（review-notes）',
    description: 'review notes',
    // base: '/review-notes/',
    markdown: {
        lineNumbers: false, // 代码块显示行号
        toc: {includeLevel: [2, 3, 4]}
    },
    themeConfig: {
        displayAllHeaders: false, // 当前活动页面的标题
        lastUpdated: '最后修改时间', // string | boolean
        smoothScroll: true,
        nav: myNav,
        sidebar: mySidebar,

        //----------------git-仓库和编辑链接---------------
        // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
        repo: 'GourdErwa/review-notes',
        // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
        // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
        repoLabel: 'GitHub',
        // =以下为可选的编辑链接选项=
        // 假如你的文档仓库和项目本身不在一个仓库：
        docsRepo: 'GourdErwa/review-notes',
        // 假如文档不是放在仓库的根目录下：
        docsDir: '',
        // 假如文档放在一个特定的分支下：
        docsBranch: 'master',
        // 默认是 false, 设置为 true 来启用
        editLinks: true,
        // 默认为 "Edit this page"
        editLinkText: '帮助我们改善此页面'
    },
    plugins: ['@vuepress/nprogress','@vuepress/medium-zoom',
        '@vuepress/back-to-top',
        '@vuepress/active-header-links', {
            sidebarLinkSelector: '.sidebar-link',
            headerAnchorSelector: '.header-anchor'
        },
        [
            '@vuepress/google-analytics',
            {
                'ga': 'UA-154222368-1' // UA-00000000-0
            }
        ]]
}
;
