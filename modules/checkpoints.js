import ImageSprite from "./video/ImageSprite.js";

const checkpoints = [
    {
        image: new ImageSprite({ src: "res/images/checkpoints/fisher.jpg" }),
        caption: "It's so nice to take a break...",
        draw: (context, width, height) => {
            context.save();
            context.fillStyle = "white";
            context.strokeStyle = "black";
            context.beginPath();
            let x = 280 / 1000;
            let y = 274 / 672;
            let r = 40 / 1000;
            context.arc(-width/2 + width * x, -height/2 + height * y, width * r, 0, Math.PI*2);
            context.fill();
            context.stroke();
            context.restore();
        }
    },
]

export default checkpoints;