<script>
    import { pageTypeHome } from "../Form/store";
    // placeholder for checking pagetypes
    function collect_data(){
        let data = ({
            "pageType": pageTypeHome,    
            }
    )
    console.log('pageType', data)
    }
    collect_data()
</script>