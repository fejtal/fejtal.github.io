<script>
    import PageType from "./components/Utility/PageType.svelte"
    import Navbar from "./components/Navbars/Navbar.svelte";
    import Breadcrumb from "./components/Breadcrumb/Breadcrumb.svelte";
    import Form from "./components/Form/Form.svelte";
    import Carousel from "./components/Products/Carousel.svelte"
    import Divider from "./components/Utility/Divider.svelte"
    import Footer from "./components/Footers/Footer.svelte";
    import "./styles/tailwind-output.css";
</script>
<!-- <svelte:head>
	<script type="text/javascript" src="//cdn.evgnet.com/beacon/partnercraftwarepl/kczekaj/scripts/evergage.min.js"></script>
</svelte:head> -->
<div class="container mx-auto px-10">
    <PageType/>
    <Navbar/>
    <Breadcrumb/>
    <Form/>
    <Divider/>
    <Carousel/>
    <Divider/>
    <Footer/>
</div>