var keydown = {};
var keypressed = {};
var keyreleased = {};

document.addEventListener("keydown", e => {
    if (e.repeat)
        return;
    keydown[e.code] = true;
    keypressed[e.code] = true;
})
document.addEventListener("keyup", e => {
    keyreleased[e.code] = true;
    delete keydown[e.code];
})

function update_keyboard() {
    keyreleased = {};
    keypressed = {};
}

export { keydown, keypressed, keyreleased, update_keyboard };