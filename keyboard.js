var keydown = {};
var keypressed = {};

document.addEventListener("keydown", e => {
    if (e.repeat)
        return;
    keydown[e.code] = true;
    keypressed[e.code] = true;
})
document.addEventListener("keyup", e => {
    delete keydown[e.code];
})

function update_keyboard() {
    keypressed = {};
}

export { keydown, keypressed, update_keyboard };