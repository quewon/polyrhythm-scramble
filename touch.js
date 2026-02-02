import { keydown, keypressed } from "./keyboard.js";

const TOUCH_IGNORE_TIME = 70;

var lTouch;
var rTouch;

document.addEventListener("touchstart", e => {
    e.preventDefault();
    for (let touch of e.touches) {
        touch.timestamp = new Date().getTime();
        if (touch.pageX < window.innerWidth/2) {
            if (!lTouch || touch.timestamp - lTouch.timestamp > TOUCH_IGNORE_TIME) {
                keydown["LeftTouch"] = true;
                keypressed["LeftTouch"] = true;
                lTouch = touch;
            }
        } else if (touch.pageX > window.innerWidth/2) {
            if (!rTouch || touch.timestamp - rTouch.timestamp > TOUCH_IGNORE_TIME) {
                keydown["RightTouch"] = true;
                keypressed["RightTouch"] = true;
                rTouch = touch;
            }
        }
    }
})
document.addEventListener("touchmove", e => {
    e.preventDefault();
})
document.addEventListener("touchend", e => {
    e.preventDefault();
    for (let touch of e.touches) {
        if (touch.pageX < window.innerWidth/2) {
            delete keydown["LeftTouch"];
        } else if (touch.pageX > window.innerWidth/2) {
            delete keydown["RightTouch"];
        }
    }
})