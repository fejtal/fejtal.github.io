import { writable } from 'svelte/store';

export let pageTypeHome = "home"; // will make a functionality so it's dynamic

export let user = writable({
  email: "",
  pageType: pageTypeHome
})
