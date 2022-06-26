<script>
  import { user } from "./store.js";
  import Submitform from "../Buttons/Submitform.svelte"
</script>

<div class="hero h-[32rem] bg-white">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class=" text-center lg:text-left">
        <h1 class= "text-5xl font-bold">Stay with us!</h1>
        <p class="py-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et blandit mi. Maecenas fringilla eros eget augue tincidunt feugiat. Donec sit amet auctor nisl. Maecenas varius, felis quis volutpat luctus, enim erat vulputate diam, eget hendrerit magna arcu ac est. Donec scelerisque nisi nec massa euismod lobortis.</p>
      </div>
      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div class="card-body">
          <div class="form-control">
            <label for='form' class="label">
              <span class="label-text">Email</span>
            </label>
            <input id="email-form" type="text" placeholder="email" bind:value={$user.email} class="input input-bordered" />
          </div>
          <Submitform/>
        </div>
      </div>
    </div>
</div>