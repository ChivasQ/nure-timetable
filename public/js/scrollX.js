const container = document.getElementById("scroll-x");
let isScrolling;

container.addEventListener("wheel", (event) => {
    event.preventDefault();

    container.scrollLeft += event.deltaY*5;


    window.clearTimeout(isScrolling);
    container.style.scrollSnapType = "none";
    isScrolling = setTimeout(() => {
        container.style.scrollSnapType = "x mandatory";
    }, 60);
});