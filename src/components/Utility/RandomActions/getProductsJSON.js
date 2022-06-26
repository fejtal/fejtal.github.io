import products from "./products.json"

const keys = Object.keys(products);
const randIndex = Math.floor(Math.random() * keys.length);
const randKey = keys[randIndex]; // string, randomized
let new_products = JSON.parse(JSON.stringify(products))[randKey];
export let productPrice = new_products['attribute:price'];
export let productName = new_products['attribute:name'];
export let skuCode = new_products['id'];
export let quant = 1;