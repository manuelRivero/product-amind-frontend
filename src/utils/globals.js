export const scrollToTop = (offset = 0) => {
    const element = document.getElementById('main-panel')
    if (element) {
        element.scrollTo({
            top: offset,
            behavior: "smooth"
        });
    }
}