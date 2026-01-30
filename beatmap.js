import { spawn_particle } from "./particle.js";
import { keydown, keypressed } from "./keyboard.js";
import AudioSprite from "./AudioSprite.js";
import ImageSprite from "./ImageSprite.js";
import { context, COMBO_TEXT_COLOR, HIT_OFFSET_CAP, HIT_PERFECT_DISTANCE, grid, rhythm_radius, beat_radius } from "./game.js";

var soundpacks = [
    "sounds/doubles/cheer",
    "sounds/doubles/glass",
]
var beatmap;
var clears = 0;

function abc_blocks(text, cx, cy, t) {
    let w = grid/8;
    let gap = -2;

    let fonts = ["'Times New Roman', serif", "'Arial', 'Helvetica', sans-serif", "'Courier', monospace", "'Select Mono Italic'", "'Comic Sans MS', 'Comic Sans'"];
    let styles = ["", "italic ", "bold "];

    t = t || 0;

    for (let i=0; i<text.length; i++) {
        t++;

        let char = text[i];
        if (char === " ") continue;

        context.save();
        context.translate(
            cx + ((i + 0.5) - text.length/2) * (w + gap),
            cy
        );

        switch (t % 4) {
            case 0:
                char = char.toLowerCase();
                break;
            case 1:
                char = char.toUpperCase();
                break;
            case 2:
            case 3:
                break;
        }
        let random_font = fonts[t % fonts.length];
        let random_style = styles[t % styles.length];
        context.font = random_style + Math.round(w) + "px " + random_font;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.lineWidth = 4;
        context.strokeStyle = "white";
        context.strokeText(char, 0, 0);
        context.fillText(char, 0, 0);

        context.restore();
    }
}

function generate_beatmap() {
    let soundpack = soundpacks[soundpacks.length * Math.random() | 0];
    let bpm;
    let pick;
    let keys;

    if (clears < 2) {
        bpm = 60 + Math.round(Math.random() * 20);
    } else if (clears < 4) {
        bpm = 80 + Math.round(Math.random() * 20);
    } else if (clears < 6) {
        bpm = 80 + Math.round(Math.random() * 40);
    } else if (clears < 8) {
        bpm = 100 + Math.round(Math.random() * 40);
    } else if (clears < 10) {
        bpm = 100 + Math.round(Math.random() * 75);
    } else {
        bpm = 100 + Math.round(Math.random() * 100);
    }

    if (clears < 1) {
        pick = [1, 2];
    } else if (clears < 3) {
        pick = [1, 2, 4];
    } else if (clears < 5) {
        pick = [1, 2, 3, 4];
    } else if (clears < 7) {
        pick = [2, 3, 4, 5, 6];
    } else if (clears < 13) {
        pick = [2, 3, 4, 5, 6, 7];
    } else {
        pick = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    
    if (clears < 4) {
        keys = 2;
    } else if (clears < 8) {
        keys = 2 + Math.ceil(Math.random() * 1);
    } else {
        keys = 2 + Math.ceil(Math.random() * 2);
    }

    let measure = 60 / bpm * 4;

    function random_subdivisions() {
        let subdivisions = pick.splice(Math.random() * pick.length | 0, 1)[0];
        let a = [];
        a[Math.random() * subdivisions | 0] = 1;
        for (let i=0; i<subdivisions; i++) {
            if (a[i]) continue;
            if (clears > 2) {
                a[i] = Math.random() * 2 | 0;
            } else {
                a[i] = 1;
            }
        }
        return a;
    }

    beatmap = {
        bpm: bpm,
        spawnTime: 1.2,
        rhythms: [
            {
                spawnTime: measure,
                // measures: 4,
                subdivisions: random_subdivisions(),
                position: [-0.5, 0],
                hitSound: new AudioSprite({ src: soundpack + "/1.wav" }),
                color: "blue",
            },
            {
                spawnTime: measure * 3 + (measure / 4) * Math.floor(Math.random() * 4),
                // measures: 4,
                subdivisions: random_subdivisions(),
                position: [0.5, 0],
                hitSound: new AudioSprite({ src: soundpack + "/2.wav" }),
                color: "red",
            },
        ],
        hitPerfectImage: new ImageSprite({ src: "images/perfect.png" }),
        hitOKImage: new ImageSprite({ src: "images/ok.png" }),
        missImage: new ImageSprite({ src: "images/miss.png" }),
        metronomeSound: new AudioSprite({ src: soundpack + "/metronome.wav" }),
        countinSound: new AudioSprite({ src: soundpack + "/countin.wav" }),
        countdownSounds: [
            new AudioSprite({ src: soundpack + "/countdown/4.wav" }),
            new AudioSprite({ src: soundpack + "/countdown/3.wav" }),
            new AudioSprite({ src: soundpack + "/countdown/2.wav" }),
            new AudioSprite({ src: soundpack + "/countdown/1.wav" }),
        ]
    }
}

function draw_intro(context) {
    context.fillStyle = "black";
    abc_blocks("polyrhythm", 0, -grid/2);
    abc_blocks("scramble", 0, -grid/3, 3);

    context.font = (grid / 10) + "px 'Select Mono Italic'";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("[ANY KEY] TO BEGIN", 0, 0);
}

function draw_score(context) {
    context.font = (grid / 10) + "px 'Select Mono Italic'";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(clears + " ROUND(s) CLEARED", 0, -grid/2);
    context.fillText("[ANY KEY] TO CONTINUE", 0, 0);
}

function draw_grid(context) {
    context.strokeStyle = "lightgray";
    for (
        let x = grid/2 - Math.floor(window.innerWidth / 2 / grid) * grid;
        x < window.innerWidth/2; 
        x += grid
    ) {
        context.beginPath();
        context.moveTo(x, -window.innerHeight/2);
        context.lineTo(x,  window.innerHeight/2);
        context.stroke();
    }
    for (
        let y = grid/2 - Math.floor(window.innerHeight / 2 / grid) * grid;
        y < window.innerHeight/2; 
        y += grid
    ) {
        context.beginPath();
        context.moveTo(-window.innerWidth/2, y);
        context.lineTo( window.innerWidth/2, y);
        context.stroke();
    }
}

function draw_circles(context) {
    for (let rhythm of beatmap.rhythms) {
        let spawnLeadup = 60 / beatmap.bpm * 4;
        if (beatmap.time < beatmap.spawnTime + rhythm.spawnTime - spawnLeadup) continue;

        context.save();

        if (beatmap.time < rhythm.spawnTime) {
            context.globalAlpha = 1 - (beatmap.spawnTime + rhythm.spawnTime - beatmap.time) / spawnLeadup;
        }
        
        if (rhythm.position) {
            context.translate(rhythm.position[0] * grid, rhythm.position[1] * grid);
        }

        context.strokeStyle = "lightgray";
        context.beginPath();
        context.arc(0, 0, rhythm_radius, rhythm_radius, 0, Math.PI * 2);
        context.stroke();

        context.restore();
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
    let measure = 60 / beatmap.bpm * 4;
    return (beatmap.time - rhythm.spawnTime - beatmap.spawnTime) % measure;
}

function beat_length(rhythm) {
    if (rhythm.subdivisions.length === 4) {
        return 60 / beatmap.bpm;
    }
    return 60 / beatmap.bpm * 4 / rhythm.subdivisions.length;
}

function draw_rhythm(rhythm) {
    let spawnLeadup = 60 / beatmap.bpm * 4;
    if (beatmap.time < beatmap.spawnTime + rhythm.spawnTime - spawnLeadup) return;

    context.save();

    if (beatmap.time < beatmap.spawnTime + rhythm.spawnTime) {
        context.globalAlpha = 1 - (beatmap.spawnTime + rhythm.spawnTime - beatmap.time) / spawnLeadup;
    }

    if (rhythm.position) {
        context.translate(rhythm.position[0] * grid, rhythm.position[1] * grid);
    }

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
        context.save();
        context.scale(0.8, 0.8);
        abc_blocks(keyText, 0, 0, rhythm.subdivisions.length + rhythm.combo);
        context.restore();
    }

    let dot_alpha = Math.max(Math.min(1 - (beatmap.spawnTime + rhythm.spawnTime - beatmap.time) / beat_length(rhythm), 1), 0);

    context.lineWidth = window.devicePixelRatio;

    for (
        let i = 0; 
        i < (
            beatmap.time < beatmap.spawnTime + rhythm.spawnTime
            ? rhythm.subdivisions.length - Math.floor((beatmap.spawnTime + rhythm.spawnTime - beatmap.time) / beat_length(rhythm))
            : rhythm.subdivisions.length
        );
        i++
    ) {
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
                context.save();
                    context.strokeStyle = "lightgray";
                    context.globalAlpha = 0.2;
                    context.stroke();
                context.restore();
                context.save();
                    context.globalAlpha = dot_alpha * 0.2;
                    context.strokeStyle = rhythm.color;
                    context.stroke();
                context.restore();
                break;
        }
    }

    let playhead = playhead_position(rhythm);
    context.strokeStyle = rhythm.color;
    let measure = 60 / beatmap.bpm * 4;
    let angle = playhead / measure * Math.PI * 2 - Math.PI / 2;
    let x = rhythm_radius * Math.cos(angle);
    let y = rhythm_radius * Math.sin(angle);
    context.beginPath();
    context.arc(x, y, beat_radius * 2, 0, Math.PI * 2);
    context.stroke();

    context.restore();
}

function draw_beatmap(context) {
    if (beatmap && 'time' in beatmap) {
        if (!beatmap.done) {
            // draw_grid(context);
    
            draw_circles(context);
            
            for (let rhythm of beatmap.rhythms) {
                draw_rhythm(rhythm);
            }
        } else {
            draw_score(context);
        }
    } else {
        draw_intro(context);
    }
}

function start_beatmap() {
    generate_beatmap();

    beatmap.time = 0;
    beatmap.metronomeTime = -1;
    beatmap.roundCombo = 0;
    beatmap.done = false;
    for (let rhythm of beatmap.rhythms) {
        rhythm.combo = 0;
        rhythm.roundCombo = 0;
        if (!rhythm.subdivisions.includes(1)) {
            rhythm.keyCode = "";
        }
    }
}

function clear_beatmap() {
    beatmap.done = true;
    clears++;
}

function update_beatmap(delta) {
    if (beatmap && 'time' in beatmap) {
        if (!beatmap.done) {
            if (beatmap.roundCombo > 0) {
                if (beatmap.roundCombo >= 4) {
                    clear_beatmap();
                }
            }

            beatmap.time += delta / 1000;
            if (beatmap.time >= beatmap.spawnTime) {
                if (beatmap.metronomeTime === -1) {
                    beatmap.metronomeTime = beatmap.spawnTime - beatmap.time;
                } else {
                    beatmap.metronomeTime += delta/1000;
                }
                if (beatmap.metronomeTime > 60 / beatmap.bpm) {
                    beatmap.metronomeTime = (beatmap.time - beatmap.spawnTime) % (60 / beatmap.bpm);
                    beatmap.metronomeSound.play();
                }
            }

            let allComboReady = true;
        
            for (let rhythm of beatmap.rhythms) {
                let closestBeat = Math.round((beatmap.time - beatmap.spawnTime - rhythm.spawnTime) / beat_length(rhythm));
                let spawnLeadup = 60 / beatmap.bpm * 4;
                let closestSubdivision = closestBeat % rhythm.subdivisions.length;
                let subdivisionTime = closestBeat * beat_length(rhythm) + rhythm.spawnTime + beatmap.spawnTime;

                if (beatmap.time >= beatmap.spawnTime + rhythm.spawnTime - spawnLeadup) {
                    if (!('keyCode' in rhythm)) {
                        let freeKey;
                        search: for (let key in keypressed) {
                            for (let r of beatmap.rhythms) {
                                if (r.keyCode === key)
                                    continue search;
                            }
                            freeKey = key;
                            break;
                        }
            
                        if (freeKey) {
                            rhythm.keyCode = freeKey;
                        }
                    }
                }

                if (beatmap.time < beatmap.spawnTime + rhythm.spawnTime - beat_length(rhythm)/2) {
                    // count them in
                    if (
                        rhythm.subdivisions[closestBeat + rhythm.subdivisions.length] &&
                        rhythm.previousBeat !== closestBeat &&
                        beatmap.time >= subdivisionTime &&
                        closestBeat < 0
                    ) {
                        beatmap.countinSound.play();
                        rhythm.previousBeat = closestBeat;
                    }
                    
                    allComboReady = false;
                    continue;
                }
                
                let distance = Math.abs(beatmap.time - subdivisionTime);
    
                if (
                    (
                        closestBeat > 0 &&
                        closestBeat === rhythm.previousBeat + 1 &&
                        rhythm.subdivisions[rhythm.previousBeat % rhythm.subdivisions.length] &&
                        rhythm.previousHit !== rhythm.previousBeat &&
                        rhythm.previousMiss !== rhythm.previousBeat
                    ) ||
                    (
                        closestBeat >= 0 &&
                        closestBeat === rhythm.previousBeat &&
                        rhythm.subdivisions[closestSubdivision] &&
                        rhythm.previousHit !== closestBeat &&
                        beatmap.time > subdivisionTime &&
                        distance > HIT_OFFSET_CAP &&
                        rhythm.previousMiss !== closestBeat
                    )
                ) {
                    spawn_miss_particle(rhythm, rhythm.previousBeat % rhythm.subdivisions.length);
                    if (closestBeat === rhythm.previousBeat + 1) {
                        rhythm.previousMiss = closestBeat;
                    } else {
                        rhythm.previousMiss = rhythm.previousBeat;
                    }
                    rhythm.combo = 0;
                    rhythm.roundCombo = 0;
                    beatmap.roundCombo = 0;
                }

                if (
                    closestBeat >= 0 &&
                    closestBeat == rhythm.previousBeat &&
                    !rhythm.subdivisions[closestSubdivision] &&
                    rhythm.previousHit !== closestBeat &&
                    rhythm.previousMiss !== closestBeat &&
                    beatmap.time >= subdivisionTime
                ) {
                    rhythm.previousHit = closestBeat;
                    rhythm.combo++;
                    rhythm.roundCombo++;
                    spawn_perfect_particle(rhythm, closestSubdivision);
                }

                if (rhythm.previousHit !== closestBeat) {
                    rhythm.previousHit = null;
                }
        
                if (keypressed[rhythm.keyCode]) {
                    if (rhythm.subdivisions[closestSubdivision] && rhythm.previousHit !== closestBeat && distance < HIT_OFFSET_CAP) {
                        rhythm.hitSound.play();
                        rhythm.previousHit = closestBeat;
                        if (distance < HIT_PERFECT_DISTANCE) {
                            rhythm.combo++;
                            rhythm.roundCombo++;
                            spawn_hit_perfect_particle(rhythm, closestSubdivision);
                        } else {
                            rhythm.combo = 0;
                            rhythm.roundCombo = 0;
                            beatmap.roundCombo = 0;
                            spawn_hit_ok_particle(rhythm, .7);
                        }
                    } else {
                        spawn_miss_particle(rhythm, playhead_position(rhythm) / beat_length(rhythm));
                        rhythm.previousMiss = closestBeat;
                        rhythm.combo = 0;
                        rhythm.roundCombo = 0;
                        beatmap.roundCombo = 0;
                    }
                }

                if (rhythm.roundCombo < rhythm.subdivisions.length) {
                    allComboReady = false;
                }
        
                rhythm.previousBeat = closestBeat;
            }

            if (allComboReady) {
                beatmap.countdownSounds[beatmap.roundCombo].play();
                beatmap.roundCombo++;
                for (let rhythm of beatmap.rhythms) {
                    rhythm.roundCombo -= rhythm.subdivisions.length;
                }
                spawn_roundcombo_particle();
            }
        } else {
            // score screen
            if (Object.keys(keypressed).length > 0) {
                start_beatmap();
            }
        }
    } else {
        if (Object.keys(keypressed).length > 0) {
            start_beatmap();
        }
    }
}

function spawn_roundcombo_particle() {
    const lifetime = 1000;
    spawn_particle({
        lifetime: lifetime,
        x: 0,
        y: -grid / 1.5,
        draw: function(context) {
            if (beatmap.roundCombo <= 0) return;

            context.save();
            context.globalAlpha = this.lifetime / lifetime;
            context.fillStyle = COMBO_TEXT_COLOR;
            let subdivisionsSum = 0;
            for (let rhythm of beatmap.rhythms) {
                subdivisionsSum += rhythm.subdivisions.length;
            }
            abc_blocks(5 - beatmap.roundCombo + "", this.x, this.y, beatmap.roundCombo + subdivisionsSum);
            context.restore();
        },
        update: function(delta) {
            this.y -= delta / 100;
        }
    })
}

function spawn_miss_particle(rhythm, subdivision) {
    const lifetime = 60 / beatmap.bpm * 1000;
    let angle = (subdivision * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid + rhythm_radius * Math.cos(angle),
        y: rhythm.position[1] * grid + rhythm_radius * Math.sin(angle),
        imageSize: beat_radius * 8 * .7,
        r: beat_radius * 2 * .7,
        rotation: Math.random() * Math.PI - Math.PI/2,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.lifetime / lifetime * 2;
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            beatmap.missImage.draw(context, 0, 0, this.imageSize, this.imageSize);
            context.restore();
        },
        update: function(delta) { }
    })
}

function spawn_perfect_particle(rhythm) {
    const lifetime = 60 / beatmap.bpm * 1000;
    let measure = 60 / beatmap.bpm * 4;
    let playhead = playhead_position(rhythm) / measure * Math.PI * 2 - Math.PI / 2;

    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid + rhythm_radius * Math.cos(playhead),
        y: rhythm.position[1] * grid + rhythm_radius * Math.sin(playhead),
        imageSize: beat_radius * 8,
        r: beat_radius * 2,
        rotation: Math.random() * Math.PI - Math.PI/2,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.lifetime / lifetime * 2;
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            beatmap.hitPerfectImage.draw(context, 0, 0, this.imageSize, this.imageSize);
            context.restore();
        },
        update: function() {
            if (beatmap.done)
                this.lifetime = 0;
        }
    })
}

function spawn_hit_perfect_particle(rhythm, subdivision) {
    let angle = (subdivision * Math.PI * 2 / rhythm.subdivisions.length) - Math.PI / 2;
    const lifetime = 60 / beatmap.bpm * 1000;

    const gradient = context.createRadialGradient(
        rhythm_radius * Math.cos(angle),
        rhythm_radius * Math.sin(angle),
        0,
        rhythm_radius * Math.cos(angle),
        rhythm_radius * Math.sin(angle),
        rhythm_radius * 2
    );
    gradient.addColorStop(0, rhythm.color);
    gradient.addColorStop(1, "white");

    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid,
        y: rhythm.position[1] * grid,
        draw: function(context) {
            context.save();
            context.globalCompositeOperation = "screen";
            context.globalAlpha = this.lifetime / lifetime / 4;
            context.fillStyle = gradient;
            context.translate(this.x, this.y);
            context.beginPath();
            context.arc(0, 0, rhythm_radius, 0, Math.PI * 2);
            context.fill();
            context.fill();
            context.restore();
        },
        update: function() {
            if (beatmap.done)
                this.lifetime = 0;
        }
    })

    if (rhythm.combo >= rhythm.subdivisions.length) {
        spawn_particle({
            lifetime: beat_length(rhythm) * 1000,
            x: rhythm.position[0] * grid,
            y: rhythm.position[1] * grid,
            draw: function(context) {
                context.save();
                context.globalCompositeOperation = "destination-over";
                context.globalAlpha = this.lifetime / (beat_length(rhythm) * 1000);
                context.strokeStyle = rhythm.color;
                draw_rhythm_shape(context, rhythm, this.x, this.y);
                context.stroke();
                context.restore();
            },
            update: function(delta) {
                if (beatmap.done && this.lifetime > 500)
                    this.lifetime = 500;
            }
        })
    }

    spawn_perfect_particle(rhythm);
}

function spawn_hit_ok_particle(rhythm, scale = 1) {
    const lifetime = 60 / beatmap.bpm * 1000;
    let measure = 60 / beatmap.bpm * 4;
    let playhead = playhead_position(rhythm) / measure * Math.PI * 2 - Math.PI / 2;

    spawn_particle({
        lifetime: lifetime,
        x: rhythm.position[0] * grid + rhythm_radius * Math.cos(playhead),
        y: rhythm.position[1] * grid + rhythm_radius * Math.sin(playhead),
        imageSize: beat_radius * 8 * scale,
        r: beat_radius * 2 * scale,
        rotation: Math.random() * Math.PI - Math.PI/2,
        draw: function(context) {
            context.save();
            context.globalAlpha = this.lifetime / lifetime * 2;
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            beatmap.hitOKImage.draw(context, 0, 0, this.imageSize, this.imageSize);
            context.restore();
        },
        update: function() {
            if (beatmap.done)
                this.lifetime = 0;
        }
    })

    // if (rhythm.combo > 1) {
    //     spawn_particle({
    //         lifetime: lifetime,
    //         x: rhythm.position[0] * grid + grid/5 + Math.random() * grid/8,
    //         y: rhythm.position[1] * grid - grid/5 + Math.random() * grid/8,
    //         draw: function(context) {
    //             if (rhythm.combo > 1) {
    //                 context.fillStyle = COMBO_TEXT_COLOR;
    //                 context.font = (grid / 8) + "px 'Select Mono Italic'";
    //                 context.fillText(rhythm.combo, this.x, this.y);
    //             }
    //         },
    //         update: function(delta) {
    //             this.y -= delta / 100;
    //             this.x += delta / 100;
    //         }
    //     })
    // }
}

export { draw_beatmap, update_beatmap };