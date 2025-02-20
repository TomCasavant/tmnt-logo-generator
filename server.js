const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Register the custom Turtles font
registerFont(path.join(__dirname, 'Turtles.ttf'), { family: 'Turtles' });

// Serve static files like images or the font
app.use(express.static(path.join(__dirname, 'public')));

// Handle the request to generate the logo
app.get('/generate-logo', (req, res) => {
    const text = req.query.text || 'Teenage Mutant Ninja Turtles'; // default text if none provided

    // Create canvas
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Draw the background (white)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set font styles for "Teenage Mutant Ninja" text
    ctx.fillStyle = 'red';
    ctx.font = '30px Futura, Helvetica, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TEENAGE MUTANT NINJA', canvas.width / 2, 150);
    ctx.fillText('TURTLES', canvas.width / 2, 220);

    // Set font for "Turtles" with a custom Turtles font
    ctx.fillStyle = 'rgb(156,203,64)';
    ctx.font = '120px Turtles';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TURTLES', canvas.width / 2, 400);

    // Create the PNG buffer and send it as a response
    const buffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'attachment; filename="tmnt-logo.png"');
    res.send(buffer);
});

// Serve the main HTML page
app.get('/', (req, res) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Teenage Mutant Ninja Turtles Logo Generator</title>
                <meta name="description" content="Create your own Teenage Mutant Ninja Turtles-style logo" />
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style type="text/css">
                    @font-face {
                        font-family: Turtles;
                        src: url(Turtles.ttf);
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        background-color: white;
                    }
                    h1 {
                        font-family: Helvetica, Arial, sans-serif;
                        font-size: 2rem;
                        text-align: center;
                    }
                    #container {
                        width: 80%;
                        margin: 0 auto;
                        text-align: center;
                        height: 500px;
                        padding-top: 40px;
                        margin-top: 40px;
                    }
                    #logo {
                        margin-top: 100px;
                    }
                    #turtles span, #teenageMutantNinja span {
                        display: inline-block;
                        position: relative;
                        z-index: 1000;
                    }
                    #top {
                        margin-bottom: -30px;    
                        vertical-align: bottom;
                    }
                    #teenageMutantNinja {
                        color: white;
                        text-transform: uppercase;
                        font-family: Futura, Helvetica, Verdana, sans-serif;
                        font-weight: bold;
                        font-size: 30px;
                        background-color: red;
                        display: inline-block;
                        border: 0px solid black;
                        border-width: 6px 0;
                        line-height: 40px;
                        vertical-align: top;
                    }
                    #turtles {
                        font-family: Turtles;
                        color: rgb(156,203,64);
                        font-size: 120px;
                        text-shadow:
                            -6px -6px 0 #000,  
                            6px -6px 0 #000,
                            -6px 6px 0 #000,
                            6px 6px 0 #000;
                         display: inline-block;
                    }
                    #red1, #red2 {
                        background-color: red;
                        display: inline-block;
                        border: 6px solid black;
                        width: 70px;
                        height: 40px;
                        margin-bottom: -15px;
                    }
                    #red1 {
                        transform: skew(30deg);
                        border-right-width: 0;
                        margin-right: -65px;
                    }
                    #red2 {
                        transform: skew(-30deg);
                        border-left-width: 0;
                        margin-left: -65px;
                    }
                    p {
                        font-family: Helvetica, Arial, sans-serif;
                        margin-top: -20px;
                        margin-bottom: 40px;
                        line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <h1>Teenage Mutant Ninja Turtles Logo Generator</h1>
                <div id="container">
                    <p>A Teenage Mutant Ninja Turtles logo maker based on <a href="https://xkcd.com/1412/">this XKCD comic</a>.<br/>
                        Type into the box below to make a logo.<br />
                    </p>
                    <input type="text" id="logo-text" style="width: 400px" value="Teenage Mutant Ninja Turtles" />

                    <div id="logo">
                        <div id="top">
                            <div id="red1"></div>
                            <div id="teenageMutantNinja"></div>
                            <div id="red2"> </div>
                        </div>
                        <div id="turtles"></div>
                    </div>

                    <div style="margin-top: 100px; margin-bottom: 40px;">
                        Share this logo: <input type="text" id="share" style="width: 400px" value="" />
                    </div>
                </div>

                <script src="underscore.min.js"></script>
                <script src="jquery-2.0.2.min.js"></script>
                <script type="text/javascript">

                    if (typeof(Number.prototype.toRad) === "undefined") {
                      Number.prototype.toRad = function() {
                        return this * Math.PI / 180;
                      }
                    }
                    $(document).on('ready', function(evt) {

                        function rotateLetters(text, startAngle, endAngle, makeArc) {
                            var letters = text.split('')

                            // return a list of rotated span elements
                            return _.map(letters, function(letter, i) {
                                // interpolate angle
                                if (letters.length == 1) {
                                    var angle = 0;
                                } else {
                                    var angle = startAngle + i*(endAngle - startAngle)/(letters.length - 1);
                                }

                                return  $('<span>'+ letter +'</span>').css({
                                    'transform': 'rotate('+ angle +'deg)',
                                    'position': 'relative',
                                    width: letter == ' ' ? 8 : 'default',
                                    'top': makeArc ? 270*(1-Math.cos(angle.toRad())) : 0 // play with first termt to change arc height
                                })
                            })
                        }

                        function skewLetters(text, startAngle, endAngle) {
                            var letters = text.split('')

                            // return a list of rotated span elements
                            return _.map(letters, function(letter, i) {
                                // interpolate angle
                                if (i == letters.length - 1) {
                                    var angle = endAngle;
                                } else {
                                    var angle = startAngle + i*(endAngle - startAngle)/letters.length;
                                }

                                if (letter == ' ') {
                                    angle = 0
                                }

                                return  $('<span>'+ letter +'</span>').css({
                                    'transform': 'skew('+ angle +'deg)',
                                    width: letter == ' ' ? 8 : 'default'
                                })
                            })
                        }

                        function toUrlHash(text) {
                            return text.replace(/ /g, '_')
                        }

                        function fromUrlHash(text) {
                            return text.replace(/_/g, ' ')
                        }

                        function render(changeUrl) {
                            var text = $('#logo-text').val()
                            var textArray = text.split(/(\s|-)/) // ['teenage', ' ', 'mutant', ' ', 'ninja', ' ', 'turtles']
                                                             //      0,      1,      2,     3,     4,     5,      6
                            $('#share').val(window.location.href)
                            if (changeUrl && text != ' ') {
                                window.location.hash = toUrlHash(text)
                            }
                            var teenageMutantNinja = textArray.slice(0,6).join('')
                            var turtles = textArray.slice(6,100).join('')

                            // clear out white letters on red background and render new ones
                            $('#teenageMutantNinja *').remove()
                            _.each(skewLetters(teenageMutantNinja, 25, -25), function($span) {
                                $('#teenageMutantNinja').append($span)
                            })


                            // clear out arcing green letters and render new ones
                            $('#turtles').html('')
                            _.each(rotateLetters(turtles, 15, -15, true), function($span) {
                                $('#turtles').append($span)
                            })
                        }

                        render(false) // Initialize page
                        $(window).on('hashchange', function() {
                            var text = fromUrlHash(window.location.hash.slice(1)) // get text from URL hash
                            $('#logo-text').val(text)
                            render(false)
                        })
                        $('#logo-text').on('input', function() {
                            render(true)
                        })
                    })
                </script>
            </body>
        </html>`;

    res.send(htmlContent);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
