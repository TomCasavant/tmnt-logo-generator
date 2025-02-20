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
        <h1>TMNT PNG Logo Generator</h1>
        <p><a href='https://xkcd.com/1412/'>XKCD 1412</a></p>
        <p> Based on <a href='http://glench.com/tmnt'>http://glench.com/tmnt</a></p>
        <form id="textForm">
          <input type="text" id="textInput" name="text" placeholder="Enter text here" required>
          <button type="submit">Update Image</button>
        </form>
        <img id="textImage" src="https://tmnt-logo.glitch.me/img?text=" alt="TMNT Logo">
        
        <script>
          document.getElementById('textForm').addEventListener('submit', function(event) {
            event.preventDefault();
            
            const text = document.getElementById('textInput').value;
            const imageUrl = 'https://tmnt-logo.glitch.me/img?text=' + encodeURIComponent(text);
            
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
        let angle = (i === totalLetters - 1) ? endAngle : startAngle + (i * (endAngle - startAngle) / totalLetters);
        if (letters[i] === ' ') angle = 0;

        ctx.save();
        ctx.translate(currentX, y);
        ctx.transform(1, 0, Math.tan(angle * Math.PI / 180), 1, 0, 0); // Apply skew transformation
        ctx.fillText(letters[i], 0, 0);
        ctx.restore();

        // Adjust spacing dynamically
        currentX += (letters[i] === ' ') ? wordSpacing : letterSpacing;
    }
}

// Rotate Letters Function (for the bottom word)
function rotateLetters(ctx, text, centerX, centerY, startAngle, endAngle, radius, makeArc, letter_spacing=35) {
    const letters = text.split('');
    const totalLetters = letters.length;

    for (let i = 0; i < totalLetters; i++) {
        const angle = (totalLetters === 1) ? 0 : startAngle + (i * (endAngle - startAngle) / (totalLetters - 1));
        const radian = angle * Math.PI / 180;

        // Calculate letter position based on circular path
        const letterX = centerX + radius * Math.sin(radian) + letter_spacing*i;
        const letterY = centerY - (makeArc ? -1 * radius * (1 - Math.cos(radian)) : 0);

        ctx.save();
        ctx.translate(letterX, letterY);
        ctx.rotate(radian); // Rotate letter around its own position

        if (letters[i] === ' ') {
            ctx.translate(8, 0);
        }

        ctx.fillText(letters[i], 0, 0);
        ctx.strokeText(letters[i], 0, 0);
        ctx.restore();
    }
}

// Endpoint to generate the canvas image with effects
app.get('/img', (req, res) => {
    const text = req.query.text.toUpperCase() || 'TEENAGE MUTANT NINJA TURTLES';
    const background = req.query.background || 'transparent'
    const words = text.split(' ');

    const topWords = words.slice(0, 3).join(' '); // First three words
    const bottomWord = words.slice(3).join(' '); // Remaining words

  
    const topLettersLength = topWords.length;
    const bottomLettersLength = bottomWord.length;

    const canvasMeas = createCanvas(200, 200);
    const ctxMeas = canvasMeas.getContext('2d');
    ctxMeas.font = 'bold 30px Futura, Helvetica, Verdana, sans-serif'
    const topWidth = ctxMeas.measureText(topWords).width;
    ctxMeas.font = '125px Turtles';
    const bottomWidth = ctxMeas.measureText(bottomWord).width + 2.3*bottomLettersLength;
  
    const height = req.query.height ? parseInt(req.query.height, 10) : 200 + bottomLettersLength * 1.5;
    const width = req.query.width ? parseInt(req.query.width, 10) : bottomWidth;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Trapezoid width and position
    const trapezoidWidth = topWidth+65+ 5 * (topLettersLength/bottomLettersLength);
    const trapezoidStart = bottomWidth/2 - trapezoidWidth/2//0 + (ctxMeas.measureText(bottomWord).width-topWidth*1.05)/4  // Adjust for bottom word length
    const trapezoidEnd = bottomWidth/2 + trapezoidWidth/2; // Adjust for bottom word length

    ctx.fillStyle = background;
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
    skewLetters(ctx, topWords, trapezoidStart+35, 35, 35, -35, 22, 15);

    // Rotated Bottom Word
    ctx.fillStyle = '#8FD129';
    ctx.font = '125px Turtles';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    rotateLetters(ctx, bottomWord, bottomWidth/3.2, 94, -4*bottomLettersLength, 4*bottomLettersLength, 200 + 5*bottomLettersLength, true);
    
    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
});


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
