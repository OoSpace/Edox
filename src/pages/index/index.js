(function () {
    let article = {
        title: '',
        description: '',
        link: '',
        image: '',
        copyright: '',
        mark: [],
        author: "",
        date: ""
    };

    Vue.component('article-list-comp',{
        template:"#rss-articleList",
        props:['article-list','name'],
        data:function () {
            return{
                hide:false
            }
        },
        methods:{
            toggle: function (key) {
                this.hide = !this.hide;
                console.log(this.name +" : hide : "+key.hide)
            },
        }
    });
    let RSS = new Vue({
        el: "#mainPage",
        data:{
            siteList: [],
            title:"上古有大能者 以日为食 以月为饮"
        },
        methods: {
	        /**
             * 初始化页面
	         */
	        initPage: function () {
                this.getRssFeed();
            },
	        /**
             * @获取对应站点feed解析结果
	         */
	        getRssFeed: function () {

                let _this = this;
                let url = "https://raw.githubusercontent.com/OoSpace/database/master/rss.json";


                axios({
                    url: url,
                    timeout: 3000,
                    type: 'get'

                }).then(function (resp) {
                    if (resp) {
                        let data = resp.data;
                        let siteList = data && JSON.parse(decodeURIComponent(data)).siteList || [];
                        _this.siteList = siteList;
                    }
                    _this.parseRssList();

                }).catch(function (error) {
                    _this.parseRssList();
                });

            },
	        /**
             * @desc 解析站点数组
	         */
	        parseRssList: function () {
                for (let i = 0, lg = this.siteList.length; i < lg; i++) {
                    let link = this.siteList[i].feedUrl;

                    this.parseRss(link, i)
                }
            },
	        /**
             * @desc 解析feed
	         * @param link
	         * @param index
	         */
            parseRss: function (link, index) {

                let _CROSS_PROXY = "https://cors-anywhere.herokuapp.com/";
                let _this = this;
                let arr = [];
                let parser = new RSSParser();

                parser.parseURL(_CROSS_PROXY + link, function (err, feed) {

                    try {
                        feed && feed.items && feed.items.forEach(function (entry) {
                            let item = JSON.parse(JSON.stringify(article));
                            item.title = entry.title;
                            item.link = entry.link;
                            item.mark = entry.categories;


                            if (link.indexOf("zhihu") != -1) {
                                item.author = entry.creator && entry.creator._;
                            } else if (link.indexOf("segmentfault") != -1) {
                                item.author = entry.author;
                            } else {
                                item.author = entry.creator;
                            }
                            try {
                                if (link.indexOf("segmentfault") != -1) {
                                    item.date = entry.pubDate.split("T").join(" ").split(".000Z").join("")
                                } else {
                                    item.date = entry.isoDate.split("T").join(" ").split(".000Z").join("")
                                }
                            } catch (e) {
                                item.date = entry.isoDate;
                            }
                            arr.push(item);
                        });

                        _this.siteList[index].articleList = arr;
                        _this.siteList[index].show = true;
                    } catch (r) {
                        feed && feed.items && feed.items.forEach(function (entry) {
                            let item = JSON.parse(JSON.stringify(article));
                            item.title = entry.title;
                            item.link = entry.link;
                            item.mark = entry.categories;

                            if (link.indexOf("zhihu") != -1) {
                                item.author = entry.creator && entry.creator._;
                            } else {
                                item.author = entry.creator;
                            }
                            try {
                                item.date = entry.isoDate.split("T").join(" ").split(".000Z").join("")
                            } catch (e) {
                                item.date = entry.isoDate;
                            }
                            arr.push(item);
                        });

                        _this.siteList[index].articleList = arr;
                    }


                })
            }
        },

    });
    //init
    RSS.initPage();
})()