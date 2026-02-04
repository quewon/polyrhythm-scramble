import { draw_particles, update_particles } from "./particle.js";
import { update_keyboard } from "./keyboard.js";
import { draw_beatmap, update_beatmap } from "./beatmap.js";
import "./touch.js";
import ImageSprite from "./ImageSprite.js";

var context = document.querySelector("canvas").getContext("2d", {
    alpha: true,
    desynchronized: true
});
context.imageSmoothingEnabled = false;
var aspect = 3/4;
var game_width;
var game_height;

window.addEventListener("resize", resize);

function resize() {
    context.canvas.width = window.innerWidth * window.devicePixelRatio;
    context.canvas.height = window.innerHeight * window.devicePixelRatio;

    game_width = Math.min(500, window.innerWidth);
    game_height = Math.min(500, window.innerHeight);
    if (game_width / aspect > game_height) {
        game_width = game_height * aspect;
    } else {
        game_height = game_width / aspect;
    }
}

function draw(now) {
    context.resetTransform();
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.translate(context.canvas.width/2, context.canvas.height/2);
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    draw_beatmap(context, now);
    draw_particles(context);
}
function update(delta, now) {
    update_beatmap(delta, now);
    update_particles(delta);
    update_keyboard();
    draw(now);
}

resize();

if (typeof performance === "function") {
    let previousTime = performance.now();
    function performance_update() {
        let now = performance.now();
        let delta = now - previousTime;
        update(delta, now);
        previousTime = now;
        requestAnimationFrame(performance_update);
    }
    performance_update();
} else {
    let previousTime = new Date();
    function normal_update() {
        let now = new Date().getTime();
        let delta = now - previousTime;
        update(delta, now);
        previousTime = now;
        requestAnimationFrame(normal_update);
    }
    normal_update();
}

export { game_width, game_height }