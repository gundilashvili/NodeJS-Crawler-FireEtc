const writeJson = require('./helpers/writeJson');

module.exports = getProducts = async (page, url) => {
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });

    let categoriesArr = [];
    let productsArr = [];
    let err_message = '';

    const selectors = {
      categoriesSelector:
        'div[class*="sub-category-visible"] ul[class="navPage-subMenu-list"] > li',
      productsSelector: 'ul[class="productGrid visible"] > li',
      productTitle: 'h4[class="card-title"] a',
      subCategoriesSelector: 'div[class="subcategory-grid"] > ul > li',
      subCategoryUrl: 'a[class="subcategory-link"]',
      subCategoryName: 'a[class="subcategory-link"] > span',
      productsPagination: 'ul[class="pagination-list"] > li',
    };

    // Get all categories names and URLs
    const getCategories = async () => {
      try {
        if ((await page.$(selectors.categoriesSelector)) != null) {
          const lis = await page.$$(selectors.categoriesSelector);
          lis.shift();
          for (let i = 0; i < lis.length; i++) {
            if ((await lis[i].$('a')) != null) {
              const category = await lis[i].$eval('a', (el) => el.textContent);
              const categoryUrl = await lis[i].$eval('a', (el) =>
                el.getAttribute('href')
              );
              categoriesArr.push({ category, categoryUrl });
            }
          }
        } else {
          err_message = `Couldn't find list of categories`;
        }
      } catch (e) {
        console.log(e);
      }
    };

    const listProducts = async (_category, _subCategory) => {
      try {
        if ((await page.$(selectors.productsSelector)) != null) {
          const lis = await page.$$(selectors.productsSelector);
          for (let j = 0; j < lis.length; j++) {
            if ((await lis[j].$(selectors.productTitle)) != null) {
              const productUrl = await lis[j].$eval(
                selectors.productTitle,
                (el) => el.getAttribute('href')
              );
              if (productUrl) {
                productsArr.push({
                  category: _category,
                  subCategory: _subCategory,
                  productUrl: productUrl,
                });
              }
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    // Get product URLs from category page
    const getProductUrls = async (_url, _category, _subCategory) => {
      try {
        await listProducts(_category, _subCategory);
        if ((await page.$(selectors.productsPagination)) != null) {
          const pages = await page.$$(selectors.productsPagination);
          const maxPages = pages.length - 1;
          for (let i = 2; i <= maxPages; i++) {
            const pageUrl = `${_url}?page=${i}`;
            await page.goto(pageUrl, { waitUntil: 'networkidle0' });
            await page.waitForTimeout(2000);
            await listProducts(_category, _subCategory);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    // Loop through each category and get products
    const getProductsFromCategories = async () => {
      try {
        for (let i = 0; i < categoriesArr.length; i++) {
          // for (let i = 11; i < 14; i++) {
          await page.goto(categoriesArr[i].categoryUrl.toString(), {
            waitUntil: 'networkidle0',
          });
          await page.waitForTimeout(2000);

          let subCategoryUrls = [];
          // Loop through each sub category and get product URLs
          if ((await page.$(selectors.subCategoriesSelector)) != null) {
            const lis = await page.$$(selectors.subCategoriesSelector);
            for (let j = 0; j < lis.length; j++) {
              if (
                (await lis[j].$(selectors.subCategoryName)) != null &&
                (await lis[j].$(selectors.subCategoryUrl)) != null
              ) {
                const subCategoryName = await lis[j].$eval(
                  selectors.subCategoryName,
                  (el) => el.textContent
                );
                const subCategoryUrl = await lis[j].$eval(
                  selectors.subCategoryUrl,
                  (el) => el.getAttribute('href')
                );
                subCategoryUrls.push({
                  category: categoriesArr[i].category,
                  subCategory: subCategoryName,
                  subCategoryUrl,
                });
              }
            }
          }

          if (subCategoryUrls.length) {
            // Access each sub category page and get products
            for (let j = 0; j < subCategoryUrls.length; j++) {
              const url = subCategoryUrls[j].subCategoryUrl.toString();
              await page.goto(url, {
                waitUntil: 'networkidle0',
              });
              await page.waitForTimeout(2000);
              await getProductUrls(
                url,
                subCategoryUrls[j].category,
                subCategoryUrls[j].subCategory
              );
            }
          } else {
            // If there is no sub category, get product URLs
            await getProductUrls(
              categoriesArr[i].categoryUrl.toString(),
              categoriesArr[i].category,
              ''
            );
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    await getCategories();
    await getProductsFromCategories();
    if (productsArr.length) {
      writeJson('Products.json', { Products: productsArr });
    } else {
      console.log(err_message);
    }
  } catch (e) {
    console.log(e);
  }
};
