import { spawn_particle } from "./particle.js";
import { keydown, keypressed, keyreleased } from "./keyboard.js";
import audioContext from "./audioContext.js";
import AudioSprite from "./AudioSprite.js";
import ImageSprite from "./ImageSprite.js";
import { grid, rhythm_radius, beat_radius } from "./game.js";

const HIT_DISTANCE = 150;
const TITLE_FONT_SCALE = 1 / 8;
const INFO_FONT_SCALE = 1 / 12;
const KEY_FONT_SCALE = 1 / 10;
const COMBO_TEXT_COLOR = "lightgray";
const COMBO_FONT_SCALE = 1;
const MISS_PARTICLE_SCALE = 0.7;
const UI_FONT = "'Arial Narrow', 'Babel Sans', sans-serif";
const UI_LINEHEIGHT = 1.5;
const TOP_LEVEL = 10;
const SPARE_MEASURES = 8;
const PADDING = 5;

var clears = 0;
var hiscore = 0;

var soundpacks = [
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/guitar/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/hit.wav" }),
        ],
        sustainSounds: [
            new AudioSprite({ src: "res/packs/doubles/guitar/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/sustain.wav" }),
        ],
        releaseSounds: [
            new AudioSprite({ src: "res/packs/doubles/guitar/1/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/guitar/2/release.wav" })
        ],
        countdownSounds: [
            new AudioSprite({ src: "res/packs/countdown/newyear/4.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/3.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/2.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/1.wav" }),
        ],
        metronomeSound: new AudioSprite({ src: "res/packs/doubles/guitar/metronome.wav" }),
        countinSound: new AudioSprite({ src: "res/packs/doubles/guitar/countin.wav" }),
    },
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/vox/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/2/hit.wav" })
        ],
        sustainSounds: [
            new AudioSprite({ src: "res/packs/doubles/vox/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/vox/2/sustain.wav" })
        ],
        countdownSounds: [
            new AudioSprite({ src: "res/packs/countdown/newyear/4.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/3.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/2.wav" }),
            new AudioSprite({ src: "res/packs/countdown/newyear/1.wav" }),
        ],
        metronomeSound: new AudioSprite({ src: "res/packs/doubles/vox/metronome.wav" }),
        countinSound: new AudioSprite({ src: "res/packs/doubles/vox/countin.wav" }),
    },
    {
        hitSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/1/hit.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/hit.wav" })
        ],
        sustainSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/1/sustain.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/sustain.wav" })
        ],
        releaseSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/1/release.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/2/release.wav" })
        ],
        countdownSounds: [
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/4.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/3.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/2.wav" }),
            new AudioSprite({ src: "res/packs/doubles/glass/countdown/1.wav" }),
        ],
        metronomeSound: new AudioSprite({ src: "res/packs/doubles/glass/metronome.wav" }),
        countinSound: new AudioSprite({ src: "res/packs/doubles/glass/countin.wav" }),
    }
]
var sprites = {
    hitImage: new ImageSprite({ src: "res/images/hit.png" }),
    missImage: new ImageSprite({ src: "res/images/miss.png" }),
    winImage: new ImageSprite({ src: "res/images/win.jpg" })
}
var resources_loaded = false;
var beatmap;

function get_resources_loaded() {
    for (let sprite in sprites) {
        if (!sprites[sprite].loaded) return false;
    }
    for (let soundpack of soundpacks) {
        for (let hitSound of soundpack.hitSounds) {
            if (!hitSound.loaded) return false;
        }
        for (let countdownSound of soundpack.countdownSounds) {
            if (!countdownSound.loaded) return false;
        }
        if (!soundpack.metronomeSound.loaded) return false;
        if (!soundpack.countinSound.loaded) return false;
    }
    return true;
}

function generate_beatmap() {
    let respack = soundpacks[soundpacks.length * Math.random() | 0];
    let bpm;
    let pick;
    let keys;

    if (clears === 0) {
        bpm = 80;
    } else if (clears < 4) {
        bpm = 60 + Math.round(Math.random() * 40);
    } else if (clears < 6) {
        bpm = 60 + Math.round(Math.random() * 60);
    } else if (clears < 8) {
        bpm = 80 + Math.round(Math.random() * 60);
    } else if (clears < 10) {
        bpm = 80 + Math.round(Math.random() * 80);
    } else {
        bpm = 100 + Math.round(Math.random() * 80);
    }

    if (clears < 1) {
        pick = [1, 2];
    } else if (clears < 3) {
        pick = [1, 2, 3, 4];
    } else if (clears < 5) {
        pick = [1, 2, 4, 5];
    } else if (clears < 7) {
        pick = [2, 3, 4, 5, 6]
    } else if (clears < 9) {
        pick = [2, 3, 4, 5, 6, 8];
    } else {
        pick = [2, 3, 4, 5, 6, 7, 8];
    }
    
    if (clears < 4) {
        keys = 2;
    } else if (clears < 8) {
        keys = 2 + Math.ceil(Math.random() * 1);
    } else {
        keys = 2 + Math.ceil(Math.random() * 2);
    }

    let measure = 60 / bpm * 4000;

    function random_subdivisions() {
        let subdivisions = pick.splice(Math.random() * pick.length | 0, 1)[0];
        let a = [];
        a[Math.random() * subdivisions | 0] = 1;
        for (let i=0; i<subdivisions; i++) {
            if (a[i]) continue;
            if (clears > 2) {
                if (i === 0) {
                    a[i] = Math.random() * 2 | 0;
                } else {
                    a[i] = Math.random() * 3 | 0;
                    if (a[i] === 2) {
                        a[i] = 3;
                        let length = i + 1;
                        if (length > 2) {
                            length -= Math.round(Math.random() * (length - 2));
                        }
                        if (a[i - length + 1] !== 2)
                            a[i - length + 1] = 1;
                        for (let j=i-length+2; j<i; j++) {
                            a[j] = 2;
                        }
                    }
                }
            } else if (clears > 1) {
                a[i] = Math.random() * 2 | 0;
            } else {
                a[i] = 1;
            }
        }
        return a;
    }

    beatmap = {
        bpm: bpm,
        spawnTime: 1200,
        respack: respack,
        rhythms: [
            {
                spawnTime: measure,
                subdivisions: random_subdivisions(),
                position: [-0.5, 0],
                color: "blue",
            },
            {
                spawnTime: measure * 3 + (measure / 4) * Math.floor(Math.random() * 4),
                subdivisions: random_subdivisions(),
                position: [0.5, 0],
                color: "red",
            },
        ],
    }
}

function start_beatmap(now) {
    beatmap.measure = 60 / beatmap.bpm * 4000;
    beatmap.spawnLeadup = beatmap.measure;
    beatmap.startTime = now;
    beatmap.localElapsed = 0;
    beatmap.adjustedElapsed = 0;
    beatmap.elapsed = 0;
    beatmap.maxCombo = 0;
    beatmap.totalMisses = 0;
    beatmap.combo = 0;
    beatmap.roundCombo = 0;
    beatmap.spareMeasures = SPARE_MEASURES;
    for (let rhythm of beatmap.rhythms) {
        rhythm.combo = 0;
        rhythm.roundCombo = 0;
        if (!rhythm.subdivisions.includes(1)) {
            rhythm.keyCode = "";
        }
    }
}

function clear_beatmap() {
    if (beatmap.combo > beatmap.maxCombo)
        beatmap.maxCombo = beatmap.combo;
    beatmap.done = true;
    clears++;
    if (beatmap.spareMeasures <= 0) {
        beatmap.score = 0;
    } else {
        let uniquePrimes = [];
        for (let rhythm of beatmap.rhythms) {
            let prime = rhythm.subdivisions.length;
            while (prime !== 2 && prime % 2 === 0) prime /= 2;
            while (prime !== 3 && prime % 3 === 0) prime /= 2;
            while (prime !== 5 && prime % 5 === 0) prime /= 2;
            while (prime !== 7 && prime % 7 === 0) prime /= 2;
            if (!uniquePrimes.includes(prime))
                uniquePrimes.push(prime);
        }
        let product = 1;
        for (let prime of uniquePrimes)
            product *= prime;
        beatmap.score = (beatmap.bpm * product * beatmap.spareMeasures) - (beatmap.bpm * beatmap.totalMisses);
        hiscore += beatmap.score;
    }
    if (!localStorage.getItem("top-clears") || clears > parseInt(localStorage.getItem("top-clears"))) {
        localStorage.setItem("top-clears", clears);
    }
    if (!localStorage.getItem("hiscore") || hiscore > parseInt(localStorage.getItem("hiscore"))) {
        localStorage.setItem("hiscore", hiscore);
    }
}

function abc_blocks(context, text, size, cx, cy, t, noStroke) {
    let fonts = ["'Times New Roman', serif", "'Arial', 'Helvetica', sans-serif", "'Courier', monospace", UI_FONT, "'Papyrus', 'Comic Sans MS'"];
    let styles = ["", "italic ", "bold "];

    t = t || 0;

    for (let i=0; i<text.length; i++) {
        t++;

        let char = text[i];
        if (char === " ") continue;

        context.save();
        context.translate(
            cx + ((i + 0.5) - text.length/2) * size,
            cy
        );

        switch (t % 2) {
            case 0:
                char = char.toLowerCase();
                break;
            case 1:
                char = char.toUpperCase();
                break;
        }
        let random_font = fonts[t % fonts.length];
        let random_style = styles[t % styles.length];
        context.font = random_style + size + "px " + random_font;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.lineWidth = 4;
        if (!noStroke) {
            context.strokeStyle = "white";
            context.strokeText(char, 0, 0);
        }
        context.fillText(char, 0, 0);

        context.restore();
    }
}

let startTime = new Date().getTime();

function draw_intro(context) {
    context.fillStyle = "black";
    context.font = (grid * INFO_FONT_SCALE) + "px " + UI_FONT;

    if (!resources_loaded) {
        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.fillText("LOADING...", 0, 0);
        return;
    }

    const lineheight = grid * INFO_FONT_SCALE * 1.2;
    context.textBaseline = "middle";
    context.textAlign = "center";
    
    let hiscore = localStorage.getItem("hiscore");
    if (hiscore) {
        context.save();
        context.translate(
            -grid/2 + rhythm_radius/3,
            -grid/4 + rhythm_radius/6
        );
        context.strokeStyle = "black";
        context.beginPath();
        context.arc(0, 0, rhythm_radius/1.5, 0, Math.PI*2);
        context.stroke();
        context.fillStyle = "black";
        context.fillText("hiscore", 0, -lineheight/2);
        context.fillText(hiscore, 0, lineheight/2);
        context.restore();
    }

    let topclears = localStorage.getItem("top-clears");
    if (topclears) {
        context.save();
        context.translate(
            grid/2 - rhythm_radius/2,
            grid/4 - rhythm_radius/4
        );
        context.strokeStyle = "black";
        context.beginPath();
        context.moveTo(-rhythm_radius, 0);
        context.lineTo(0, -rhythm_radius);
        context.lineTo(rhythm_radius, 0);
        context.lineTo(0, rhythm_radius);
        context.closePath();
        context.stroke();
        context.fillStyle = "black";
        context.fillText("highest clear", 0, -lineheight/2);
        context.fillText(topclears, 0, lineheight/2);
        context.restore();
    }

    abc_blocks(context, "polyrhythm", grid * TITLE_FONT_SCALE, 0, -grid/1.2, null, true);
    abc_blocks(context, "scramble", grid * TITLE_FONT_SCALE, 0, -grid/1.2 + grid * TITLE_FONT_SCALE + PADDING, 3, true);

    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillText("[ANY KEY] TO BEGIN", 0, grid/1.2);

    if (!hiscore || !topclears) {
        let t = Math.floor((new Date().getTime() - startTime) / 500);
        
        context.beginPath();
        context.strokeStyle = "black";
        let r = grid/3;
        if (t % 4 === 3) {
            context.moveTo(-r, 0);
            context.lineTo(0, -r);
            context.lineTo(r, 0);
            context.lineTo(0, r);
            context.closePath();
        } else if (t % 4 === 2) {
            context.moveTo(0, -r + grid/10);
            context.lineTo(
                Math.cos(Math.PI/2 - Math.PI/3) * r,
                Math.sin(Math.PI/2 - Math.PI/3) * r + grid/15
            );
            context.lineTo(
                Math.cos(Math.PI/2 + Math.PI/3) * r,
                Math.sin(Math.PI/2 + Math.PI/3) * r + grid/15
            );
            context.closePath();
        } else if (t % 4 === 1) {
            let length = Math.sqrt(r * r + r * r);
            context.rect(-length/2, -length/2, length, length);
        } else {
            context.arc(0, 0, r, 0, Math.PI*2);
        }
        context.stroke();
    }
}

function draw_score(context, now) {
    let time = now - (beatmap.elapsed + beatmap.startTime);
    time = Math.min(1000, time);
    let t = time / 1000;
    let lineheight = grid * INFO_FONT_SCALE * UI_LINEHEIGHT;

    if (beatmap.spareMeasures <= 0) {
        sprites.missImage.draw(context, 0, 0, grid, grid);
    } else if (clears === 10) {
        sprites.winImage.draw(context, 0, 0, grid * 3 * t, grid * 3 * (sprites.winImage.height / sprites.winImage.width) * t);
    } else {
        sprites.hitImage.draw(context, grid / 2 * t, 0, grid, grid);
    }

    context.fillStyle = "black";

    context.font = (grid * INFO_FONT_SCALE) + "px " + UI_FONT;
    context.textAlign = "center";
    context.textBaseline = "top";
    if (beatmap.spareMeasures <= 0) {
        context.fillText("GAME OVER", 0, -grid);
    } else if (clears === 10) {
        context.fillText("YOU WIN", 0, -grid);
    } else {
        context.fillText(clears + " ROUND(S) CLEARED", 0, -grid + PADDING);
    }

    context.fillText("SUM SCORE : " + hiscore, 0, -grid + PADDING + lineheight);
    
    if (beatmap.spareMeasures > 0) {
        context.textBaseline = "middle";
        let x = clears === 10 ? 0 : -grid / 2 * t;
        let lines = [
            beatmap.bpm + " BPM",
            beatmap.rhythms[0].subdivisions.length + ":" + beatmap.rhythms[1].subdivisions.length,
            beatmap.spareMeasures + " SPARE MEASURES",
            beatmap.totalMisses + " MISS(ES)",
            beatmap.score + " POINTS"
        ]

        let width = 0;
        let padding = grid / 16;
        let height = lineheight * lines.length;
        for (let i=0; i<lines.length; i++) {
            let mm = context.measureText(lines[i]);
            if (mm.width > width) width = mm.width;
        }
        context.save();
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.beginPath();
        context.rect(x - width/2 - padding, -height/2 - padding, width + padding * 2, height + padding * 2);
        context.fill();
        context.stroke();
        context.restore();
        for (let i=0; i<lines.length; i++) {
            context.fillText(lines[i], x, -height/2 + lineheight * (i + 0.5));
        }
    }

    context.textBaseline = "bottom";
    if (beatmap.spareMeasures <= 0) {
        context.fillText("[ANY KEY] TO RESTART", 0, grid - PADDING);
    } else if (clears === 10) {
        context.fillText("[ANY KEY] TO KEEP GOING", 0, grid - PADDING);
    } else {
        context.fillText("[ANY KEY] TO CONTINUE", 0, grid - PADDING);
    }
}

function draw_rhythm_shape(context, rhythm, rx, ry) {
    if (rhythm.subdivisions.length === 1) {
        context.beginPath();
        context.arc(rx, ry, rhythm_radius, 0, Math.PI * 2);
        return;
    }

    context.beginPath();
    for (let i=0; i<rhythm.subdivisions.length; i++) {
        let angle = (i * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
        let x = rx + rhythm_radius * Math.cos(angle);
        let y = ry + rhythm_radius * Math.sin(angle);
        if (i === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }
    context.closePath();
}

function playhead_position(rhythm) {
    return (beatmap.adjustedElapsed - rhythm.spawnTime) % beatmap.measure;
}

function beat_length(rhythm) {
    if (rhythm.subdivisions.length === 4) {
        return 60 / beatmap.bpm * 1000;
    }
    return 60 / beatmap.bpm * 4000 / rhythm.subdivisions.length;
}

function rhythm_context_save(context, rhythm) {
    if (beatmap.adjustedElapsed < rhythm.spawnTime - beatmap.spawnLeadup) return false;
    context.save();
    if (beatmap.adjustedElapsed < rhythm.spawnTime) {
        context.globalAlpha = 1 - (rhythm.spawnTime - beatmap.adjustedElapsed) / beatmap.spawnLeadup;
    }
    context.translate(rhythm.position[0] * grid, rhythm.position[1] * grid);
    return true;
}

function draw_circles(context) {
    for (let rhythm of beatmap.rhythms) {
        if (!rhythm_context_save(context, rhythm))
            continue;

        context.lineWidth = 2;

        context.strokeStyle = "black";
        context.beginPath();
        context.arc(0, 0, rhythm_radius, rhythm_radius, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = "white";
        context.fill();

        context.restore();
    }
}

function draw_key_text(context, rhythm) {
    if (!rhythm_context_save(context, rhythm)) return;

    let keyText = rhythm.keyCode;
    if (!keyText) {
        for (let compare of beatmap.rhythms) {
            if (!('keyCode' in compare)) {
                if (compare === rhythm)
                    keyText = "[ANY KEY]";
                break;
            }
        }
    } else {
        keyText = keyText.replaceAll("Key", "");
        keyText = keyText.replaceAll("Digit", "");
        keyText = keyText.replaceAll("Control", "Ctrl");
    }
    
    if (keyText) {
        context.fillStyle = rhythm.color;
        if (keyText === "[ANY KEY]") {
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = (grid * KEY_FONT_SCALE) + "px " + UI_FONT;
            context.strokeStyle = "white";
            context.strokeText(keyText, 0, 0);
            context.fillText(keyText, 0, 0);
        } else {
            abc_blocks(context, keyText, grid * KEY_FONT_SCALE, 0, 0, rhythm.subdivisions.length + rhythm.combo);
        }
    }

    context.restore();
}

function draw_rhythm(context, rhythm) {
    if (!rhythm_context_save(context, rhythm)) return;

    let dot_alpha = Math.max(Math.min(1 - (rhythm.spawnTime - beatmap.adjustedElapsed) / beat_length(rhythm), 1), 0);

    context.lineWidth = 2;
    
    let playhead = playhead_position(rhythm);
    let playheadAngle = playhead / beatmap.measure * Math.PI * 2 - Math.PI / 2;

    for (let i=0; i<rhythm.subdivisions.length; i++) {
        if (rhythm.subdivisions[i] !== 3) continue;

        let endAngle = (i * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
        let startIndex = i - 1;
        while (
            startIndex % rhythm.subdivisions.length !== endAngle && 
            rhythm.subdivisions[startIndex % rhythm.subdivisions.length] !== 1
        ) {
            startIndex--;
        }
        let startAngle = (startIndex * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
        if (beatmap.adjustedElapsed < rhythm.spawnTime) {
            if (playheadAngle + Math.PI * 2 < startAngle)
                continue;
            endAngle = Math.min(endAngle, playheadAngle + Math.PI * 2);
        }
        context.save();
        context.beginPath();
        context.arc(0, 0, rhythm_radius, startAngle, endAngle);
        context.lineWidth = beat_radius * 2 - 4;
        context.strokeStyle = "lightgray";
        context.stroke();
        context.globalAlpha = dot_alpha;
        context.strokeStyle = rhythm.color;
        context.stroke();
        context.restore();
    }

    let beats = rhythm.subdivisions.length;
    if (beatmap.adjustedElapsed < rhythm.spawnTime)
        beats = rhythm.subdivisions.length - Math.floor((rhythm.spawnTime - beatmap.adjustedElapsed) / beat_length(rhythm));

    for (let i=0; i<beats; i++) {
        if (rhythm.subdivisions[i] === 2) continue;

        let angle = (i * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
        let x = rhythm_radius * Math.cos(angle);
        let y = rhythm_radius * Math.sin(angle);
        
        context.beginPath();
        context.arc(x, y, beat_radius, 0, Math.PI * 2);

        switch (rhythm.subdivisions[i]) {
            case 1:
                context.fillStyle = "lightgray";
                context.fill();
                context.save();
                    context.globalAlpha = dot_alpha;
                    context.fillStyle = rhythm.color;
                    context.fill();
                context.restore();
                context.strokeStyle = "white";
                context.stroke();
                break;
            default:
                context.strokeStyle = "lightgray";
                context.stroke();
                context.fillStyle = "white";
                context.fill();
                context.save();
                    context.globalAlpha = dot_alpha;
                    context.strokeStyle = rhythm.color;
                    context.stroke();
                context.restore();
                break;
        }
    }

    context.strokeStyle = rhythm.color;
    let x = rhythm_radius * Math.cos(playheadAngle);
    let y = rhythm_radius * Math.sin(playheadAngle);
    context.beginPath();
    context.arc(x, y, beat_radius * 2, 0, Math.PI * 2);
    context.stroke();

    context.restore();

    draw_key_text(context, rhythm);

    // context.save();
    // context.globalAlpha = 0.5;
    // let cap = Math.min(beat_length(rhythm) / 2, HIT_DISTANCE);
    // for (let i=0; i<rhythm.subdivisions.length; i++) {
    //     context.fillStyle = "greenyellow";
    //     let a = (i * beat_length(rhythm) - cap) / beatmap.measure;
    //     let b = (i * beat_length(rhythm) + cap) / beatmap.measure;
    //     context.beginPath();
    //     context.arc(rhythm.position[0] * grid, rhythm.position[1] * grid, rhythm_radius, a * Math.PI*2 - Math.PI/2, b * Math.PI*2 - Math.PI/2);
    //     context.lineTo(rhythm.position[0] * grid, rhythm.position[1] * grid);
    //     context.closePath();
    //     context.fill();
    // }
    // context.restore();
}

function draw_beatmap(context, now) {
    if (beatmap && 'startTime' in beatmap) {
        if (!beatmap.done) {
            if (!('clearTime' in beatmap)) {
                draw_circles(context);
                
                for (let rhythm of beatmap.rhythms) {
                    draw_rhythm(context, rhythm);
                }

                if (beatmap.roundCombo === 0) {
                    context.save();

                    context.font = (grid * INFO_FONT_SCALE) + "px " + UI_FONT;
                    context.textAlign = "right";
                    context.textBaseline = "top";
                    context.fillStyle = "black";
                    context.fillText(beatmap.bpm + " BPM", grid - PADDING, -grid);
                    context.textAlign = "left";
                    context.fillText("LEVEL " + Math.min(clears, TOP_LEVEL), -grid + PADDING, -grid + PADDING);

                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    for (let rhythm of beatmap.rhythms) {
                        context.fillText(rhythm.subdivisions.length, rhythm.position[0] * grid, grid/1.6);
                    }
                    context.fillText(":", 0, grid/1.6)

                    context.restore();
                }

                if (beatmap.roundCombo === 0 || beatmap.adjustedElapsed - beatmap.previousMissTime < beatmap.measure) {
                    context.save();
                    context.fillStyle = "yellow";
                    context.strokeStyle = "black";
                    let fullwidth = (grid - PADDING) * 2;
                    let gap = grid/60;
                    let width = fullwidth / SPARE_MEASURES - gap;
                    let height = grid/16;
                    for (let i=0; i<SPARE_MEASURES; i++) {
                        context.beginPath();
                        context.rect((i - SPARE_MEASURES/2) * (width + gap) + gap/2, grid - height - PADDING, width, height);
                        if (SPARE_MEASURES - i <= beatmap.spareMeasures) {
                            context.fill();
                        }
                        context.stroke();
                    }
                    context.restore();
                }
            }
        } else {
            draw_score(context, now);
        }
    } else {
        draw_intro(context);
    }
}

function handle_miss(rhythm, beat) {
    rhythm.previousMiss = beat;
    if (beatmap.combo > beatmap.maxCombo)
        beatmap.maxCombo = beatmap.combo;
    rhythm.combo = 0;
    beatmap.combo = 0;
    beatmap.roundCombo = 0;
    beatmap.totalMisses++;
    if (!beatmap.previousMissTime || beatmap.adjustedElapsed - beatmap.previousMissTime >= beatmap.measure) {
        beatmap.previousMissTime = beatmap.adjustedElapsed;
        beatmap.spareMeasures--;
        if (beatmap.spareMeasures <= 0) {
            beatmap.clearTime = beatmap.adjustedElapsed;
            for (let sound of beatmap.respack.sustainSounds) {
                sound.stop(0.2);
            }
        }
    }
}

function handle_hit(rhythm, beat) {
    rhythm.previousHit = beat;
    beatmap.previousHitTime = beatmap.adjustedElapsed;
    rhythm.combo++;
    beatmap.combo++;
}

function update_beatmap(delta, now) {
    if (beatmap && 'startTime' in beatmap) {
        if (!beatmap.done) {
            let latency = (audioContext.baseLatency + audioContext.outputLatency) * 1000;
            beatmap.currentTime = now;
            beatmap.elapsed = now - beatmap.startTime;
            beatmap.localElapsed = beatmap.elapsed - beatmap.spawnTime;
            beatmap.adjustedElapsed = beatmap.localElapsed - latency;

            if ('clearTime' in beatmap) {
                if (beatmap.adjustedElapsed - beatmap.clearTime >= beatmap.measure / 2)
                    clear_beatmap();
                return;
            }

            if (beatmap.localElapsed >= 0) {
                let quarter = 60 / beatmap.bpm * 1000;
                let lastMetronomeTime = Math.floor(beatmap.localElapsed / quarter) * quarter;
                if (
                    !beatmap.metronomePlayed ||
                    lastMetronomeTime > beatmap.metronomePlayed
                ) {
                    beatmap.respack.metronomeSound.play();
                    beatmap.metronomePlayed = beatmap.localElapsed;
                }
            }

            let allComboReady = true;

            // key unregistration
            if (keypressed["Escape"]) {
                for (let i=beatmap.rhythms.length-1; i>=0; i--) {
                    let rhythm = beatmap.rhythms[i];
                    if ('keyCode' in rhythm && rhythm.keyCode !== "") {
                        delete rhythm.keyCode;
                        break;
                    }
                }
            }
        
            for (let rhythmIndex=0; rhythmIndex<beatmap.rhythms.length; rhythmIndex++) {
                let rhythm = beatmap.rhythms[rhythmIndex];
                let closestBeat = Math.round((beatmap.adjustedElapsed - rhythm.spawnTime) / beat_length(rhythm));
                let closestSubdivision = closestBeat % rhythm.subdivisions.length;
                let closestBeatTime = closestBeat * beat_length(rhythm) + rhythm.spawnTime;

                let unadjustedBeat = Math.round((beatmap.localElapsed - rhythm.spawnTime) / beat_length(rhythm));
                let unadjustedBeatTime = unadjustedBeat * beat_length(rhythm) + rhythm.spawnTime;
                
                if (beatmap.localElapsed >= rhythm.spawnTime - beatmap.measure) {
                    // key registration
                    if (!('keyCode' in rhythm)) {
                        if (rhythmIndex === 0 && keypressed["LeftTouch"]) {
                            rhythm.keyCode = "LeftTouch";
                            rhythm.keyRegistered = true;
                        } else if (rhythmIndex === 1 && keypressed["RightTouch"]) {
                            rhythm.keyCode = "RightTouch";
                            rhythm.keyRegistered = true;
                        } else {
                            if (beatmap.adjustedElapsed >= rhythm.spawnTime - beatmap.spawnLeadup) {
                                let freeKey;
                                search: for (let key in keypressed) {
                                    if (["Escape", "LeftTouch", "RightTouch"].includes(key)) continue;
                                    for (let r of beatmap.rhythms) {
                                        if (r.keyCode === key)
                                            continue search;
                                    }
                                    freeKey = key;
                                    break;
                                }
                                if (freeKey) {
                                    rhythm.keyCode = freeKey;
                                    rhythm.keyRegistered = true;
                                }
                            }
                        }
                    }
                }

                if (beatmap.localElapsed < rhythm.spawnTime - beat_length(rhythm)/2) {
                    // count them in
                    if (
                        (
                            rhythm.subdivisions[unadjustedBeat + rhythm.subdivisions.length] === 1 ||
                            rhythm.subdivisions[unadjustedBeat + rhythm.subdivisions.length] === 3
                        )
                        &&
                        rhythm.previousBeat !== unadjustedBeat &&
                        beatmap.localElapsed >= unadjustedBeatTime &&
                        unadjustedBeat < 0
                    ) {
                        beatmap.respack.countinSound.play();
                        rhythm.previousBeat = unadjustedBeat;
                    }
                    
                    allComboReady = false;
                    continue;
                }

                if (!('keyCode' in rhythm)) {
                    rhythm.previousBeat = unadjustedBeat;
                    
                    let nextRhythm = beatmap.rhythms[rhythmIndex + 1];
                    if (nextRhythm && !nextRhythm.keyRegistered && beatmap.adjustedElapsed >= nextRhythm.spawnTime - beatmap.measure - beatmap.measure/2) {
                        nextRhythm.spawnTime += beatmap.measure / 2;
                    }

                    allComboReady = false;
                    continue;
                }
                
                // hit judgements
                if (closestBeat >= 0) {
                    // miss/pass detection
                    // miss: player does not hit something, but they should have
                    // pass: player does not hit something, and that's correct

                    let previousBeatTime = rhythm.previousBeat * beat_length(rhythm) + rhythm.spawnTime;
                    let adjustedPreviousBeatTime = previousBeatTime - latency;
                    let adjustedPreviousBeat = Math.round((adjustedPreviousBeatTime - rhythm.spawnTime) / beat_length(rhythm));
                    let adjustedPreviousSubdivision = adjustedPreviousBeat % rhythm.subdivisions.length;
                    let previousBeatWindowPassed = (
                        beatmap.localElapsed > previousBeatTime + Math.min(HIT_DISTANCE, beat_length(rhythm) / 2)
                    );
                    
                    if (
                        previousBeatWindowPassed &&
                        rhythm.previousHit !== adjustedPreviousBeat &&
                        rhythm.previousMiss !== adjustedPreviousBeat &&
                        rhythm.subdivisions[adjustedPreviousSubdivision]
                    ) {
                        handle_miss(rhythm, adjustedPreviousBeat);
                        spawn_miss_particle(rhythm, adjustedPreviousSubdivision);
                    }

                    let closestBeatPointPassed = (
                        closestBeat >= adjustedPreviousBeat &&
                        beatmap.adjustedElapsed >= adjustedPreviousBeatTime
                    );

                    if (
                        closestBeatPointPassed &&
                        rhythm.previousHit !== adjustedPreviousBeat &&
                        rhythm.previousMiss !== closestBeat &&
                        rhythm.subdivisions[closestSubdivision] === 0
                    ) {
                        handle_hit(rhythm, closestBeat);
                        spawn_hit_particle(rhythm, closestSubdivision);
                    }

                    if (
                        closestBeatPointPassed &&
                        rhythm.previousHit !== closestBeat &&
                        rhythm.previousMiss !== closestBeat &&
                        rhythm.subdivisions[closestSubdivision] === 2 &&
                        keydown[rhythm.keyCode]
                    ) {
                        handle_hit(rhythm, closestBeat);
                    }

                    if (rhythm.previousHit !== closestBeat) {
                        rhythm.previousHit = null;
                    }

                    // hit/mistake detection
                    // hit: player hits something, and that's correct
                    // mistake: player hits something, and that's wrong

                    let distance = Math.abs(beatmap.adjustedElapsed - closestBeatTime);
                    let inHitWindow = distance <= Math.min(HIT_DISTANCE, beat_length(rhythm) / 2);
                    let preciseSubdivision = ((beatmap.adjustedElapsed - rhythm.spawnTime) % beatmap.measure) / beat_length(rhythm);

                    if (
                        keydown[rhythm.keyCode] &&
                        rhythm.previousMiss !== closestBeat &&
                        !rhythm.subdivisions[closestSubdivision] &&
                        inHitWindow
                    ) {
                        handle_miss(rhythm, closestBeat);
                        spawn_miss_particle(rhythm, closestSubdivision);
                    }

                    if (
                        rhythm.subdivisions[closestSubdivision] === 1 &&
                        keypressed[rhythm.keyCode]
                    ) {
                        if (inHitWindow && rhythm.previousHit !== closestBeat) {
                            handle_hit(rhythm, closestBeat);
                            spawn_hit_particle(rhythm, preciseSubdivision);
                            beatmap.respack.hitSounds[rhythmIndex].play();

                            let nextSubdivision = (closestSubdivision + 1) % rhythm.subdivisions.length;
                            if (rhythm.subdivisions[nextSubdivision] >= 2) {
                                beatmap.respack.sustainSounds[rhythmIndex].play();
                            }
                        } else {
                            handle_miss(rhythm, closestBeat);
                            spawn_miss_particle(rhythm, preciseSubdivision);
                        }
                    }

                    if (
                        rhythm.subdivisions[closestSubdivision] === 2 &&
                        rhythm.previousHit !== closestBeat &&
                        rhythm.previousMiss !== closestBeat &&
                        (
                            keypressed[rhythm.keyCode] ||
                            keyreleased[rhythm.keyCode]
                        )
                    ) {
                        handle_miss(rhythm, closestBeat);
                        spawn_miss_particle(rhythm, preciseSubdivision);
                    }

                    if (
                        rhythm.subdivisions[closestSubdivision] === 3 &&
                        keyreleased[rhythm.keyCode]
                    ) {
                        if (inHitWindow && rhythm.previousHit !== closestBeat) {
                            handle_hit(rhythm, closestBeat);
                            spawn_hit_particle(rhythm, preciseSubdivision);
                            if (beatmap.respack.releaseSounds)
                                beatmap.respack.releaseSounds[rhythmIndex].play();
                        } else {
                            handle_miss(rhythm, closestBeat);
                            spawn_miss_particle(rhythm, preciseSubdivision);
                        }
                    }

                    if (
                        rhythm.subdivisions[closestSubdivision] === 3 &&
                        keypressed[rhythm.keyCode]
                    ) {
                        handle_miss(rhythm, closestBeat);
                        spawn_miss_particle(rhythm, preciseSubdivision);
                    }

                    if (
                        !rhythm.subdivisions[closestSubdivision] &&
                        keypressed[rhythm.keyCode]
                    ) {
                        handle_miss(rhythm, closestBeat);
                        spawn_miss_particle(rhythm, preciseSubdivision);
                    }
                }

                if (beatmap.respack.sustainSounds[rhythmIndex].playing && !keydown[rhythm.keyCode]) {
                    beatmap.respack.sustainSounds[rhythmIndex].stop(0.01);
                }

                if (rhythm.combo < rhythm.subdivisions.length) {
                    allComboReady = false;
                }
        
                rhythm.previousBeat = unadjustedBeat;
            }

            if (allComboReady) {
                beatmap.respack.countdownSounds[beatmap.roundCombo].play();
                beatmap.roundCombo++;
                for (let rhythm of beatmap.rhythms) {
                    rhythm.combo = rhythm.combo % rhythm.subdivisions.length;
                }
                if (!beatmap.clearTime && beatmap.roundCombo >= 4) {
                    beatmap.clearTime = beatmap.localElapsed;
                    for (let sound of beatmap.respack.sustainSounds) {
                        sound.stop(0.2);
                    }
                }
                beatmap.spareMeasures = Math.min(SPARE_MEASURES, beatmap.spareMeasures + 1);
                spawn_roundcombo_particle();
            }
        } else {
            // press any key to continue
            if (Object.keys(keypressed).length > 0) {
                // restart
                if (beatmap.spareMeasures <= 0) {
                    clears = 0;
                    hiscore = 0;
                }
                
                generate_beatmap();
                start_beatmap(now);
            }
        }
    } else {
        resources_loaded = get_resources_loaded();
        // press any key to begin
        if (resources_loaded && Object.keys(keypressed).length > 0) {
            generate_beatmap();
            start_beatmap(now);
        }
    }
}

function spawn_roundcombo_particle() {
    const image = new OffscreenCanvas(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
    );
    let offscreenContext = image.getContext("2d");

    offscreenContext.translate(image.width/2, image.height/2);
    offscreenContext.scale(window.devicePixelRatio, window.devicePixelRatio);

    for (const rhythm of beatmap.rhythms) {
        let x = (rhythm.position[0] + (Math.random() - 0.5)) * grid;
        let y = (rhythm.position[1] + (Math.random() * 2 - 1)) * grid;
        let scale = 2;

        offscreenContext.save();
        offscreenContext.translate(x, y);
        offscreenContext.scale(scale, scale);
        offscreenContext.globalCompositeOperation = "lighter";
        draw_rhythm_shape(offscreenContext, rhythm, 0, 0);
        if (rhythm.subdivisions.length === 2) {
            offscreenContext.lineWidth = grid / 8;
            offscreenContext.strokeStyle = rhythm.color;
            offscreenContext.stroke();
        } else {
            offscreenContext.fillStyle = rhythm.color;
            offscreenContext.fill();
        }
        offscreenContext.restore();
    }

    offscreenContext.save();
    for (let x=-window.innerWidth/2; x<=window.innerWidth/2; x+=10 + window.devicePixelRatio) {
        offscreenContext.clearRect(x, -window.innerHeight/2, 10, window.innerHeight);
    }
    for (let y=-window.innerHeight/2; y<=window.innerHeight/2; y+=10 + window.devicePixelRatio) {
        offscreenContext.clearRect(-window.innerWidth/2, y, window.innerWidth, 10);
    }
    offscreenContext.restore();

    offscreenContext.save();
    offscreenContext.globalCompositeOperation = "destination-over";
    offscreenContext.fillStyle = COMBO_TEXT_COLOR;
    let subdivisionsSum = 0;
    for (let rhythm of beatmap.rhythms) {
        subdivisionsSum += rhythm.subdivisions.length;
    }
    abc_blocks(offscreenContext, 5 - beatmap.roundCombo + "", grid * COMBO_FONT_SCALE, 0, -grid, beatmap.roundCombo + subdivisionsSum, true);
    offscreenContext.restore();

    spawn_particle({
        lifetime: beatmap.measure / 2,
        draw: function(context) {
            context.save();
            if ('clearTime' in beatmap)
                context.globalAlpha = this.lifetime / (beatmap.measure / 2)
            context.globalCompositeOperation = "destination-over";
            context.drawImage(image, -window.innerWidth/2, -window.innerHeight/2, window.innerWidth, window.innerHeight);
            context.restore();
        },
        update: function(delta) { }
    })
}

function spawn_miss_particle(rhythm, subdivision) {
    const lifetime = 60 / beatmap.bpm * 1000;
    let angle = (subdivision * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;

    // miss image
    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid + rhythm_radius * Math.cos(angle),
        y: rhythm.position[1] * grid + rhythm_radius * Math.sin(angle),
        imageSize: beat_radius * 8 * MISS_PARTICLE_SCALE,
        r: beat_radius * 2 * MISS_PARTICLE_SCALE,
        rotation: Math.random() * Math.PI - Math.PI/2,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.lifetime / lifetime * 2;
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            sprites.missImage.draw(context, 0, 0, this.imageSize, this.imageSize);
            context.restore();
        },
        update: function(delta) { }
    })
}

function spawn_hit_particle(rhythm, subdivision) {
    // shape
    if (rhythm.combo >= rhythm.subdivisions.length) {
        spawn_particle({
            lifetime: beat_length(rhythm),
            x: rhythm.position[0] * grid,
            y: rhythm.position[1] * grid,
            draw: function(context) {
                context.save();
                context.globalAlpha = this.lifetime / beat_length(rhythm);
                context.strokeStyle = rhythm.color;
                context.lineWidth = 2;
                draw_rhythm_shape(context, rhythm, this.x, this.y);
                context.stroke();
                context.restore();
                if (rhythm.subdivisions.length === 2) {
                    draw_key_text(context, rhythm);
                }
            },
            update: function(delta) {
                if ('clearTime' in beatmap)
                    this.lifetime = 0;
            }
        })
    }

    let angle = (subdivision * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
    const lifetime = 60 / beatmap.bpm * 1000;

    // gradient
    var gradient;
    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid,
        y: rhythm.position[1] * grid,
        draw: function(context) {
            if (!gradient) {
                let x = rhythm_radius * Math.cos(angle);
                let y = rhythm_radius * Math.sin(angle);
                gradient = context.createRadialGradient(
                    x, y, 0, x, y, rhythm_radius * 2.5
                );
                gradient.addColorStop(0, rhythm.color);
                gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            }
            
            context.save();
            context.globalAlpha = this.lifetime / lifetime / 4;
            context.fillStyle = gradient;
            context.translate(this.x, this.y);
            context.beginPath();
            context.arc(0, 0, rhythm_radius, 0, Math.PI * 2);
            context.fill();
            context.restore();
        },
        update: function() {
            if ('clearTime' in beatmap)
                this.lifetime = 0;
        }
    })
    
    // hit image
    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid + rhythm_radius * Math.cos(angle),
        y: rhythm.position[1] * grid + rhythm_radius * Math.sin(angle),
        imageSize: beat_radius * 8,
        r: beat_radius * 2,
        rotation: Math.random() * Math.PI - Math.PI/2,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.lifetime / lifetime * 2;
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            sprites.hitImage.draw(context, 0, 0, this.imageSize, this.imageSize);
            context.restore();
        },
        update: function() { }
    })
}

export { draw_beatmap, update_beatmap };