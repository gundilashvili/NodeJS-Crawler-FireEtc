const puppeteer = require('puppeteer');
const getProducts = require('./crawler/getProductsByCategories');
const getData = require('./crawler/getData');
const readJson = require('./crawler/helpers/readJson');

let type = 'products';
process.argv.forEach(function (val, index, array) {
  if (val.toString().toLowerCase().includes('categories')) {
    type = 'categories';
  }
});

const app = async () => {
  try {
    const url = 'https://www.fire-etc.com/products/';
    const productsList = await readJson('Products.json');

    // Configure browser
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--enable-automation'],
    });

    // Create page
    const page = await browser.newPage();

    // Launch either categories scraper or data scraper
    if (type === 'categories') {
      getProducts(page, url);
    } else if (type === 'products') {
      getData(page, productsList);
    }
  } catch (e) {
    console.log(e);
  }
};
app();
