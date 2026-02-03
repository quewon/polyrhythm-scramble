import { keydown, keypressed, keyreleased } from "./keyboard.js";

var lPointer = null;
var rPointer = null;

document.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    
    if (e.pageX < window.innerWidth/2) {
        if (!lPointer) {
            keydown["LeftTouch"] = true;
            keypressed["LeftTouch"] = true;
            lPointer = e.pointerId;
        }
    } else {
        if (!rPointer) {
            keydown["RightTouch"] = true;
            keypressed["RightTouch"] = true;
            rPointer = e.pointerId;
        }
    }
});

document.addEventListener("pointerup", e => {
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    
    if (lPointer === e.pointerId) {
        keyreleased["LeftTouch"] = true;
        delete keydown["LeftTouch"];
        lPointer = null;
    } else if (rPointer === e.pointerId) {
        keyreleased["RightTouch"] = true;
        delete keydown["RightTouch"];
        rPointer = null;
    }
});

document.addEventListener("pointercancel", e => {
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    
    if (lPointer === e.pointerId) {
        keyreleased["LeftTouch"] = true;
        delete keydown["LeftTouch"];
        lPointer = null;
    } else if (rPointer === e.pointerId) {
        keyreleased["RightTouch"] = true;
        delete keydown["RightTouch"];
        rPointer = null;
    }
});

document.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });