const { v4: uuidv4 } = require('uuid');
const ImageDownloader = require('./helpers/imageDownloader');
const WriteCsv = require('./helpers/writeCsv');

module.exports = getProducts = async (page, products) => {
  try {
    let outputArr = []; 
    const selectors = {
      title: 'h1[class="productView-title"]',
      price: 'span[data-product-price-without-tax]',
      sku: 'dd[class="productView-info-value"][data-product-sku]',
      weight: 'dd[class="productView-info-value"][data-product-weight]',
      description: 'div[id="tab-description"]',
      options: 'div[class="options-container"] > label',
      optionTitle:
        'label[class="form-label form-label--alternate form-label--inlineSmall"]',
      defaultImage: 'li[class="productView-images is-root"] > figure > img',
      imagesList: 'div[class="slick-slide"] figure',
    };

    function format(str) {
      return str
        .replace(/  /g, '')
        .replace(/\n/g, '')
        .replace(/\t/g, '')
        .replace(/\r/g, '')
        .replace('Product Description', '')
        .trim();
    }

    for (let i = 0; i < products.length; i++) {
      await page.goto(products[i].productUrl, {
        waitUntil: 'networkidle0',
      });

      let obj = {
        Category: products[i].category,
        SubCategory: products[i].subCategory,
        Name: '',
        Price: '',
        SKU: '',
        Weight: '',
        Options: '',
        Description: '',
        ImageUrls: '',
        ImageNames: '',
        Url: products[i].productUrl
      };

      // Get title
      if ((await page.$(selectors.title)) != null) {
        const _value = await page.$eval(selectors.title, (t) => t.textContent);
        obj.Name = format(_value);
      }
      // Get Price
      if ((await page.$(selectors.price)) != null) {
        const _value = await page.$eval(selectors.price, (t) => t.textContent);
        obj.Price = format(_value);
      }
      // Get SKU
      if ((await page.$(selectors.sku)) != null) {
        const _value = await page.$eval(selectors.sku, (t) => t.textContent);
        obj.SKU = format(_value);
      }
      // Get Weight
      if ((await page.$(selectors.weight)) != null) {
        const _value = await page.$eval(selectors.weight, (t) => t.textContent);
        obj.Weight = format(_value);
      }
      // Get Description
      if ((await page.$(selectors.description)) != null) {
        const _value = await page.$eval(
          selectors.description,
          (t) => t.textContent
        );
        obj.Description = format(_value);
      }
      // Get Options
      if ((await page.$(selectors.options)) != null) {
        const list = await page.$$(selectors.options);
        let options = '';
        // get name
        if ((await page.$(selectors.optionTitle)) != null) {
          const value = await page.$eval(
            selectors.optionTitle,
            (el) => el.textContent
          );
          options = format(value);
        }
        // get options
        for (let j = 0; j < list.length; j++) {
          if ((await list[j].$('span')) != null) {
            const value = await list[j].$eval('span', (t) => t.textContent);
            options = options + ` ${format(value.toString())},`;
          }
        }
        obj.Options = options;
      }

      // Get images
      if ((await page.$(selectors.defaultImage)) != null) {
        let imageUrls = '';
        let imageNames = '';
        const defaultImageName = uuidv4();

        const value = await page.$eval(selectors.defaultImage, (el) =>
          el.getAttribute('src')
        );
        if (value) {
          imageUrls = imageUrls + `${value.toString()}, `;

          const isDownloaded = await ImageDownloader(
            value.toString(),
            defaultImageName
          );
          if (isDownloaded) {
            imageNames = imageNames + `${defaultImageName}.png, `;
          }
        }
        if ((await page.$(selectors.imagesList)) != null) {
          const list = await page.$$(selectors.imagesList);
          for (let j = 0; j < list.length; j++) {
            if ((await list[j].$('img')) != null) {
              const url = await list[j].$eval('img', (el) =>
                el.getAttribute('src')
              );
              if (url) {
                const imageName = uuidv4();
                imageUrls = imageUrls + `${url.toString()}, `;
                const isDownloaded = await ImageDownloader(
                  url.toString(),
                  imageName
                );
                if (isDownloaded) {
                  imageNames = imageNames + `${imageName}.png, `;
                }
              }
            }
          }
        }
        obj.ImageUrls = imageUrls;
        obj.ImageNames = imageNames;
      }

      outputArr.push(obj);
      console.log("Remaining products:", products.length - i)
    }

    if (outputArr.length) {
      WriteCsv('Products.csv', outputArr);
    } else {
      console.log('Something went wrong');
    }
  } catch (e) {
    console.log(e);
  }
};
