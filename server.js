const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const app = express();

registerFont('Turtles-zOzL.ttf', { family: 'Turtles' });

// Set up basic Express static file serving for the front-end (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the form at the root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Enter Text for Image</h1>
        <form action="/img" method="get">
          <input type="text" name="text" placeholder="Enter text here" required>
          <button type="submit">Download Image</button>
        </form>
        <img src='https://puzzle-veil-joggers.glitch.me/img?text=TEENAGE+MUTANT+NINJA+TURTLES'></img>
      </body>
    </html>
  `);
});

// Skew Letters Function (for the top 3 words)
function skewLetters(ctx, text, x, y, startAngle, endAngle, letterSpacing = 1, wordSpacing = 10) {
    const letters = text.split('');
    const totalLetters = letters.length;

    let currentX = x; // Start position

    for (let i = 0; i < totalLetters; i++) {
        // Interpolate angle
        let angle = (i === totalLetters - 1) ? endAngle : startAngle + (i * (endAngle - startAngle) / totalLetters);
        if (letters[i] === ' ') angle = 0; // No skew for spaces

        ctx.save();
        ctx.translate(currentX, y); // Move to the correct position
        ctx.transform(1, 0, Math.tan(angle * Math.PI / 180), 1, 0, 0); // Apply skew transformation
        ctx.fillText(letters[i], 0, 0);
        ctx.restore();

        // Adjust spacing dynamically
        currentX += (letters[i] === ' ') ? wordSpacing : letterSpacing;
    }
}

// Rotate Letters Function (for the bottom word)
function rotateLetters(ctx, text, centerX, centerY, startAngle, endAngle, radius, makeArc) {
    const letters = text.split('');
    const totalLetters = letters.length;

    for (let i = 0; i < totalLetters; i++) {
        // Interpolate angle for each letter
        const angle = (totalLetters === 1) ? 0 : startAngle + (i * (endAngle - startAngle) / (totalLetters - 1));
        const radian = angle * Math.PI / 180;

        // Calculate letter position based on circular path
        const letterX = centerX + radius * Math.sin(radian) + 43*i;
        const letterY = centerY - (makeArc ? -1 * radius * (1 - Math.cos(radian)) : 0);

        ctx.save();
        ctx.translate(letterX, letterY);
        ctx.rotate(radian); // Rotate letter around its own position

        // Adjust width for spaces (mimicking original logic)
        if (letters[i] === ' ') {
            ctx.translate(8, 0); // Offset to simulate space width
        }

        ctx.fillText(letters[i], 0, 0);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText(letters[i], 0, 0);
        ctx.restore();
    }
}

// Endpoint to generate the canvas image with effects
app.get('/img', (req, res) => {
    const text = req.query.text.toUpperCase() || 'TEENAGE MUTANT NINJA TURTLES';
    const words = text.split(' ');

    const topWords = words.slice(0, 3).join(' '); // First three words
    const bottomWord = words.slice(3).join(' '); // Last word

    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Trapezoid
    ctx.fillStyle = '#ED1C24';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(130, 150);
    ctx.lineTo(625, 150);
    ctx.lineTo(590, 200);
    ctx.lineTo(165, 200);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Skewed Top Words
    ctx.fillStyle = 'white'; // Sets text color
    ctx.font = 'bold 30px Futura, Helvetica, Verdana, sans-serif'; // Font size, weight, and family
    ctx.textAlign = 'center'; // Centers text horizontally
    ctx.textBaseline = 'middle'; // Centers text vertically

    skewLetters(ctx, topWords, 175, 176, 35, -35, 22, 15);

    // Rotated Bottom Word
    ctx.fillStyle = '#8FD129';
    //(ctx, text, centerX, centerY, startAngle, endAngle, radius)
   //  rotateLetters(text, startAngle, endAngle, makeArc
    // rotateLetters(turtles, -30, 30, true)
    ctx.font = '135px Turtles';
    rotateLetters(ctx, bottomWord, 250, 235, -30, 30, 270, true);

    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
