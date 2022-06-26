<script>
import CarouselItem from "./CarouselItem.svelte";

</script>
<div class="carousel w-full bg-base-200 rounded-box">
  <div id="slide1" class="carousel-item relative w-full">
      <div class="carousel-item mx-20">
          <CarouselItem/>
          <CarouselItem/>
          <CarouselItem/>
          <CarouselItem/>
      </div>
      <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
        <a href="#slide1" class="btn btn-primary">❮</a> 
        <a href="#slide2" class="btn btn-primary">❯</a>
      </div>
  </div>
  <div id="slide2" class="carousel-item relative w-full">
    <div class="carousel-item mx-20">
        <CarouselItem/>
        <CarouselItem/>
        <CarouselItem/>
        <CarouselItem/>
    </div>
    <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
      <a href="#slide1" class="btn btn-primary">❮</a> 
      <a href="#slide1" class="btn btn-primary">❯</a>
    </div>
  </div>
</div>