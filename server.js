const express = require('express');
const { createCanvas } = require('canvas');
const path = require('path');
const app = express();

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
function skewLetters(ctx, text, x, y, startAngle, endAngle) {
    const letters = text.split('');
    const totalLetters = letters.length;

    for (let i = 0; i < totalLetters; i++) {
        let angle = (i === totalLetters - 1) ? endAngle : startAngle + (i * (endAngle - startAngle) / totalLetters);
        if (letters[i] === ' ') angle = 0; // No skew for spaces

        ctx.save();
        ctx.translate(x + i * 30, y); // Adjust spacing
        ctx.transform(1, Math.tan(angle * Math.PI / 180), 0, 1, 0, 0); // Skew transformation
        ctx.fillText(letters[i], 0, 0);
        ctx.restore();
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
        const letterX = centerX + radius * Math.sin(radian);
        const letterY = centerY - (makeArc ? radius * (1 - Math.cos(radian)) : 0);

        ctx.save();
        ctx.translate(letterX, letterY);
        ctx.rotate(radian); // Rotate letter around its own position

        // Adjust width for spaces (mimicking original logic)
        if (letters[i] === ' ') {
            ctx.translate(8, 0); // Offset to simulate space width
        }

        ctx.fillText(letters[i], 0, 0);
        ctx.restore();
    }
}

// Endpoint to generate the canvas image with effects
app.get('/img', (req, res) => {
    const text = req.query.text || 'No Text Provided';
    const words = text.split(' ');

    const topWords = words.slice(0, 3).join(' '); // First three words
    const bottomWord = words.slice(3).join(' '); // Last word

    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Trapezoid
    ctx.fillStyle = 'red';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(100, 150);
    ctx.lineTo(700, 150);
    ctx.lineTo(650, 200);
    ctx.lineTo(150, 200);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Skewed Top Words
    ctx.fillStyle = 'green';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    skewLetters(ctx, topWords, canvas.width / 2 - 300, 180, -10, 10);

    // Rotated Bottom Word
    ctx.fillStyle = 'green';
    //(ctx, text, centerX, centerY, startAngle, endAngle, radius)
   //  rotateLetters(text, startAngle, endAngle, makeArc
    // rotateLetters(turtles, -30, 30, true)
    rotateLetters(ctx, bottomWord, canvas.width / 2, canvas.height - 335, -30, 30, 50, true);

    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
