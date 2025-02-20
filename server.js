const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const jsdom = require('jsdom');
const html2canvas = require('html2canvas');

const { JSDOM } = jsdom;
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/img', async (req, res) => {
    let nameParam = req.query.name || 'Teenage_Mutant_Ninja_Turtles';
    
    // Ensure exactly 4 words, fill missing ones with empty strings
    let words = nameParam.split('_').slice(0, 4);
    while (words.length < 4) words.push('');

    try {
        // Create a virtual DOM
        const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @font-face { font-family: Turtles; src: url(Turtles.ttf); }
                body { margin: 0; padding: 0; text-align: center; background: transparent; }
                #logo { display: inline-block; padding: 20px; background: transparent; }
                #turtles { font-family: Turtles; font-size: 120px; color: rgb(156,203,64);
                           text-shadow: -6px -6px 0 #000, 6px -6px 0 #000, -6px 6px 0 #000, 6px 6px 0 #000;
                           display: inline-block; }
                #teenageMutantNinja { color: white; text-transform: uppercase; font-weight: bold;
                                      font-size: 30px; background-color: red; display: inline-block;
                                      border: 6px solid black; border-width: 6px 0; line-height: 40px;
                                      padding: 5px 10px; }
                #red1, #red2 { background-color: red; display: inline-block; border: 6px solid black;
                               width: 70px; height: 40px; margin-bottom: -15px; }
                #red1 { transform: skew(30deg); border-right-width: 0; margin-right: -65px; }
                #red2 { transform: skew(-30deg); border-left-width: 0; margin-left: -65px; }
            </style>
        </head>
        <body>
            <div id="logo">
                <div id="top">
                    <div id="red1"></div>
                    <div id="teenageMutantNinja">${words[0]} ${words[1]} ${words[2]}</div>
                    <div id="red2"></div>
                </div>
                <div id="turtles">${words[3]}</div>
            </div>
        </body>
        </html>`, { runScripts: "dangerously" });

        const window = dom.window;
        const document = window.document;

        // Wait for all content to load before rendering the canvas
        await new Promise((resolve) => {
            setTimeout(resolve, 500); // Adding a small delay to let the content render
        });

        // Generate the canvas using html2canvas
        const canvas = await html2canvas(document.querySelector("#logo"));
        const imageBuffer = canvas.toBuffer("image/png");

        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(imageBuffer, 'binary');
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
