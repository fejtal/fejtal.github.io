<script>
    import { user } from "../Form/store.js"
function console_output(){
    return console.log("signup", $user)
};
</script>

<div class="form-control mt-6">
    <button id="submit-btn" class="btn btn-primary" on:click={console_output}>Sign up</button>
</div>