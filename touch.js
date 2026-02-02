import { keydown, keypressed } from "./keyboard.js";

document.addEventListener("touchstart", e => {
    if (e.touches) e.preventDefault();
    for (let touch of e.touches) {
        if (touch.pageX < window.innerWidth/2) {
            keydown["LeftTouch"] = true;
            keypressed["LeftTouch"] = true;
        } else if (touch.pageX > window.innerWidth/2) {
            keydown["RightTouch"] = true;
            keypressed["RightTouch"] = true;
        }
    }
})
document.addEventListener("touchmove", e => {
    if (e.touches) e.preventDefault();
})
document.addEventListener("touchend", e => {
    for (let touch of e.touches) {
        if (touch.pageX < window.innerWidth/2) {
            delete keydown["LeftTouch"];
        } else if (touch.pageX > window.innerWidth/2) {
            delete keydown["RightTouch"];
        }
    }
})