var particles = [];

function spawn_particle(particle) {
    // particle = {
    //     update: function,
    //     draw: function,
    //     lifetime: milliseconds
    // }
    particles.push(particle)
}

function draw_particles(context) {
    for (let particle of particles) {
        particle.draw(context);
    }
}

function update_particles(delta) {
    var to_delete = [];

    for (let particle of particles) {
        particle.update(delta);
        particle.lifetime -= delta;
        if (particle.lifetime <= 0) {
            to_delete.push(particle);
            continue;
        }
    }

    for (let i=particles.length-1; i>=0; i--) {
        if (to_delete.includes(particles[i]))
            particles.splice(i, 1);
    }
}

export { spawn_particle, draw_particles, update_particles }