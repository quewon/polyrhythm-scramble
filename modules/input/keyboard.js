var keydown = {};
var keypressed = {};
var keyreleased = {};
var keyvalue = {};

document.addEventListener("keydown", e => {
    if (e.repeat)
        return;
    keydown[e.code] = true;
    keypressed[e.code] = true;
    keyvalue[e.code] = e.key;
    if (e.code === "Space")
        keyvalue[e.code] = "Space";
})
document.addEventListener("keyup", e => {
    keyreleased[e.code] = e.key;
    delete keydown[e.code];
})

function update_keyboard() {
    keyreleased = {};
    keypressed = {};
}

export { keydown, keypressed, keyreleased, keyvalue, update_keyboard };