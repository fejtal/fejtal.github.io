<script>
import AddToCart from "../Buttons/AddToCart.svelte";

</script>
<div class="w-80 flex justify-center items-center">
    <div class="w-full p-4">
        <div class="card flex flex-col justify-center p-10 bg-white rounded-lg shadow-2xl">
            <div class="prod-title">
                <p class="text-2xl uppercase text-gray-900 font-bold">
                    Puma Shoes
                </p>
                <p class="uppercase text-sm text-gray-400">
                    The best shoes in the marketplace
                </p>
            </div>
            <div class="prod-img">
                <img src="https://www.tailwind-kit.com/images/object/4.jpg" alt="alt" class="w-full object-cover object-center"/>
            </div>
            <div class="prod-info grid gap-10">
                <div>
                    <ul class="flex flex-row justify-center items-center">
                        <li class="mr-4 last:mr-0">
                            <span class="block p-1 border-2 border-gray-500 rounded-full transition ease-in duration-300">
                                <a href="#blue" class="block w-6 h-6 bg-blue-900 rounded-full">
                                </a>
                            </span>
                        </li>
                        <li class="mr-4 last:mr-0">
                            <span class="block p-1 border-2 border-white hover:border-gray-500 rounded-full transition ease-in duration-300">
                                <a href="#yellow" class="block w-6 h-6 bg-yellow-500 rounded-full">
                                </a>
                            </span>
                        </li>
                        <li class="mr-4 last:mr-0">
                            <span class="block p-1 border-2 border-white hover:border-gray-500 rounded-full transition ease-in duration-300">
                                <a href="#red" class="block w-6 h-6 bg-red-500 rounded-full">
                                </a>
                            </span>
                        </li>
                        <li class="mr-4 last:mr-0">
                            <span class="block p-1 border-2 border-white hover:border-gray-500 rounded-full transition ease-in duration-300">
                                <a href="#green" class="block w-6 h-6 bg-green-500 rounded-full">
                                </a>
                            </span>
                        </li>
                    </ul>
                </div>
                <div class="flex flex-col md:flex-row justify-between items-center text-gray-900">
                    <p class="font-bold text-xl">
                        65 $
                    </p>
                    <AddToCart/>
                </div>
            </div>
        </div>
    </div>
</div>