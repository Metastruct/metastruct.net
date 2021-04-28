export default function (to) {
  if (to.hash && to.hash !== "#") {
    const elem = document.getElementById(to.hash.substr(1));
    if (elem) return window.scrollTo({ top: elem.offsetTop, behavior: "smooth" });
  }
  return window.scrollTo({ top: 0, behavior: "smooth" });
}
