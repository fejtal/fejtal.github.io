<script>
    import { user } from "../Form/store.js"
    import { skuCode, quant, productPrice, productName } from "../Utility/RandomActions/getProductsJSON.js"
    function add_to_cart(){
        let addToCart = ({
            "pageType": "home",
            "event" : "addToCart",
            "email": $user.email,
            "addToCart": {
                sku: skuCode,
                quantity: quant,
                price: productPrice,
                name: productName
            }
    })
    console.log('addToCart', addToCart);
    }
</script>
<button class="px-6 py-2 transition ease-in duration-200 uppercase rounded-full hover:bg-primary hover:text-white border-2 border-gray-900 focus:outline-none" on:click={add_to_cart}>
    Add to cart
</button>