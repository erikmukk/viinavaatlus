const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class Alko1000Scraper extends Scraper {
    constructor() {
        super("Alko1000", "LV");
        this.baseUrl = "https://alko1000.ee";
        this.categoryPages = [
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/viin/", category: "viin"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/dzinn/", category: "dzinn"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/viski/", category: "viski"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/rumm/", category: "rumm"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/likoor/", category: "likoor"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/tekiila/", category: "tekiila"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/konjak/", category: "konjak"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/kange-alkohol/brandi/", category: "brandi"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/lahja-alkohol/vahuvein/", category: "vahuvein"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/lahja-alkohol/siidrid/", category: "siider"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/lahja-alkohol/vein/", category: "vein"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/lahja-alkohol/olu/", category: "olu"},
            {url: "http://alko1000.ee/alko1000/tootekategooria/lahja-alkohol/long-drink/", category: "long-drink"}

        ];

        super.priceRegex = /([\d,.]*\s€)/;
    }

    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeCategoryPage(category, callback) {
        rp(category.url)
            .then((html) => {
                const $ = cheerio.load(html);
                const $products = $(".tooted").find(".instock");

                let products = [];

                $products.each((index, value) => {
                    const name = $(value).find("h2[class='woocommerce-loop-product__title']").text();

                    const product = {
                        name: this.getCleanName(name),
                        sale: false,
                        originalName: name,
                        storeCounty: this.storeCounty,
                        store: this.storeName,
                        url: $(value).find("a[class='woocommerce-LoopProduct-link woocommerce-loop-product__link']").attr("href"),
                        price: this.getPrice($(value).find("span[class='woocommerce-Price-amount amount']").text()),
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: $(value).find("div[class='archive-img-wrap'] > img").attr("src")
                    };

                    if (product.ml === null) return;
                    products.push(product);
                });
                callback(products);

                const $next = $("a[class='next page-numbers']")
                if ($next.length) {
                    const newCategory = {
                        url: $next.attr("href"),
                        category: category.category
                    };
                    this.scrapeCategoryPage(newCategory, callback)
                }
            })
            .catch((err) => {
                console.error(err);
            });

    }
}

module.exports = Alko1000Scraper;
