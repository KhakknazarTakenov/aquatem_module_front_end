window.addEventListener("load", () => {
    document.querySelector(".deal_name_filter_search_icon").addEventListener("click", () => {
        document.getElementById("deal_name").focus();
    })
})
function showDatepicker() {
    document.getElementById("datepicker").focus();
}