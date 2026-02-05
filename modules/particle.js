var particles = [];

function spawn_particle(particle) {
    // particle = {
    //     update: function,
    //     draw: function,
    //     lifetime: milliseconds
    // }
    particles.push(particle);
}

function particles_count() {
    return particles.length;
}

function draw_particles(context) {
    for (let particle of particles) {
        if (particle.draw)
            particle.draw(context);
    }
}

function update_particles(delta) {
    for (let particle of particles) {
        if (particle.update)
            particle.update(delta);
        particle.lifetime -= delta;
    }

    for (let i=particles.length-1; i>=0; i--) {
        if (particles[i].lifetime <= 0)
            particles.splice(i, 1);
    }
}

export { particles_count, spawn_particle, draw_particles, update_particles }