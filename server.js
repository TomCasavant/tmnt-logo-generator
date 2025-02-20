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
        <form id="textForm">
          <input type="text" id="textInput" name="text" placeholder="Enter text here" required>
          <button type="submit">Update Image</button>
        </form>
        <img id="textImage" src="https://puzzle-veil-joggers.glitch.me/img?text=" alt="Generated Image">
        
        <script>
          document.getElementById('textForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form from submitting normally
            
            const text = document.getElementById('textInput').value;
            const imageUrl = 'https://puzzle-veil-joggers.glitch.me/img?text=' + encodeURIComponent(text);
            
            // Update the image source
            document.getElementById('textImage').src = imageUrl;
          });
        </script>
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
        const letterX = centerX + radius * Math.sin(radian) + 35*i;
        const letterY = centerY - (makeArc ? -1 * radius * (1 - Math.cos(radian)) : 0);

        ctx.save();
        ctx.translate(letterX, letterY);
        ctx.rotate(radian); // Rotate letter around its own position

        // Adjust width for spaces (mimicking original logic)
        if (letters[i] === ' ') {
            ctx.translate(8, 0); // Offset to simulate space width
        }

        ctx.fillText(letters[i], 0, 0);
        ctx.strokeText(letters[i], 0, 0);
        ctx.restore();
    }
}

// Endpoint to generate the canvas image with effects
app.get('/img', (req, res) => {
    const text = req.query.text.toUpperCase() || 'TEENAGE MUTANT NINJA TURTLES';
    const words = text.split(' ');

    const topWords = words.slice(0, 3).join(' '); // First three words
    const bottomWord = words.slice(3).join(' '); // Remaining words

  
    // Calculate letter count for words
    const numLettersTopWords = topWords.replace(/\s+/g, '').length; // Remove spaces for count
    const bottomLettersLength = bottomWord.replace(/\s+/g, '').length; // Remove spaces for bottom word

    // Calculate widths based on letter counts
    const baseWidth = 30;
    const widthTopWords = baseWidth * numLettersTopWords;
    const widthBottomWords = 86 * bottomLettersLength;

    // Choose the larger width
    const width = Math.max(widthTopWords, widthBottomWords);

    const canvasMeas = createCanvas(width, 200);
    const ctxMeas = canvasMeas.getContext('2d');
    ctxMeas.font = 'bold 30px Futura, Helvetica, Verdana, sans-serif'
    const topWidth = ctxMeas.measureText(topWords).width;
    ctxMeas.font = '125px Turtles';
    const bottomWidth = ctxMeas.measureText(bottomWord).width;
  
    const canvas = createCanvas(width, 200);
    const ctx = canvas.getContext('2d');
    
    ctx.fillText(topWidth, 50, 50);
    ctx.fillText(bottomWidth, 50, 90);

    // Trapezoid width and position
    /*const trapezoidWidth = baseWidth * numLettersTopWords;
    const trapezoidStart = 60 + ((bottomLettersLength - 7) * 30);  // Adjust for bottom word length
    const trapezoidEnd = 30 + trapezoidWidth + ((bottomLettersLength - 7) * 36); // Adjust for bottom word length

    // Background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Trapezoid
    ctx.fillStyle = '#ED1C24';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(trapezoidStart, 10);
    ctx.lineTo(trapezoidEnd, 10);
    ctx.lineTo(trapezoidEnd - 35, 60);
    ctx.lineTo(trapezoidStart + 35, 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Skewed Top Words
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Futura, Helvetica, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    skewLetters(ctx, topWords, trapezoidStart + 45, 35, 35, -35, 22, 15);

    // Rotated Bottom Word
    ctx.fillStyle = '#8FD129';
    ctx.font = '125px Turtles';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    rotateLetters(ctx, bottomWord, trapezoidStart + trapezoidWidth / 3.5 - 15, 94, -30, 30, 270, true);
    */
    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
});


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
