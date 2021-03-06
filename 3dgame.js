//#include <iostream>
//#include <vector>
//#include <utility>
//#include <algorithm>
//#include <chrono>
//using namespace std;

//#include <stdio.h>
//#include <Windows.h>

//originally from javidx9
//ported to javascript
//spaghetti


let base = 5;
let nscreenarrWidth = 120; // Console screenarr Size X (columns)
let nscreenarrHeight = 40; // Console screenarr Size Y (rows)
let nMapWidth = 16; // World Dimensions
let nMapHeight = 16;
let fovslider = document.getElementById("fov");

let fPlayerX = 14.7; // Player Start Position
let fPlayerY = 5.09;
let fPlayerA = 0.0; // Player Start Rotation
let fFOV = Math.PI / 4.0; // Field of View
let fDepth = 16.0; // Maximum rendering distance

fovslider.oninput = function() {
  fDepth = this.value;
}
let Screen = document.getElementById("screen");
// Create screenarr Buffer

let screenarr = new Array(nscreenarrWidth * nscreenarrHeight);
// Create Map of world space # = wall block, . = space
let map = "";
tp1 = Date.now()
tp2 = Date.now()
map += "################";
map += "#...#..........#";
map += "#...#..........#";
map += "#...#..........#";
map += "#...#..........#";
map += "#..............#";
map += "#...##...#.....#";
map += "#...#....#.....#";
map += "#...#...##.....#";
map += "#...#..........#";
map += "#...#..........#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "################";
window.onkeypress = event => {
    switch (event.key) {
        case 'a':
            fPlayerA -= .1;
            break;
        case 'd':
            fPlayerA += .1;
            break;
        case 'w':
            fPlayerX += Math.sin(fPlayerA);;
            fPlayerY += Math.cos(fPlayerA);;
            /*if (map[Math.floor(fPlayerX * nMapWidth + Math.floor(fPlayerY))] == '#')
            {
            	fPlayerX -= Math.sin(fPlayerA);;
            	fPlayerY -= Math.cos(fPlayerA);;
            }*/
            break;
        case 's':
            fPlayerX -= Math.sin(fPlayerA);;
            fPlayerY -= Math.cos(fPlayerA);;
            /*if (map[Math.floor(fPlayerX * nMapWidth + Math.floor(fPlayerY))] == '#')
            {
            	fPlayerX += Math.sin(fPlayerA);;
            	fPlayerY += Math.cos(fPlayerA);;
            }*/
    };
}
function MouseEvent(event) {
	fPlayerA += (event.movementX) * .005;
	console.log(event)
}
let frame = 0;
let maxFrame = 0;
let color = 0;
setInterval(() => {
    // We'll need time differential per frame to calculate modification
    // to movement speeds, to ensure consistant movement, as ray-tracing
    // is non-deterministic


    // Handle CCW Rotation

    // Handle CW Rotation

    // Handle Forwards movement & collision


    // Handle backwards movement & collision
    for (let x = 0; x < nscreenarrWidth; x++) {
        // For each column, calculate the projected ray angle into world space
        let fRayAngle = (fPlayerA - fFOV / 2.0) + (x / nscreenarrWidth) * fFOV;

        // Find distance to wall
        let fStepSize = 0.1; // Increment size for ray casting, decrease to increase										
        let fDistanceToWall = 0.0; //                                      resolution

        let bHitWall = false; // Set when ray hits wall block
        let bBoundary = false; // Set when ray hits boundary between two wall blocks

        let fEyeX = Math.sin(fRayAngle); // Unit vector for ray in player space
        let fEyeY = Math.cos(fRayAngle);

        // Incrementally cast ray from player, along ray angle, testing for 
        // intersection with a block
        while (!bHitWall && fDistanceToWall < fDepth) {
            fDistanceToWall += fStepSize;
            let nTestX = Math.floor(fPlayerX + fEyeX * fDistanceToWall);
            let nTestY = Math.floor(fPlayerY + fEyeY * fDistanceToWall);

            // Test if ray is out of bounds
            if (nTestX < 0 || nTestX >= nMapWidth || nTestY < 0 || nTestY >= nMapHeight) {
                bHitWall = true; // Just set distance to maximum depth
                fDistanceToWall = fDepth;
            } else {
                // Ray is inbounds so test to see if the ray cell is a wall block
                if (map[nTestX * nMapWidth + nTestY] == '#') {
                    // Ray has hit wall
                    bHitWall = true;

                    // To highlight tile boundaries, cast a ray from each corner
                    // of the tile, to the player. The more coincident this ray
                    // is to the rendering ray, the closer we are to a tile 
                    // boundary, which we'll shade to add detail to the walls
                    let p = [];

                    // Test each corner of hit tile, storing the distance from
                    // the player, and the calculated dot product of the two rays
                    for (let tx = 0; tx < 2; tx++)
                        for (let ty = 0; ty < 2; ty++) {
                            // Angle of corner to eye
                            let vy = nTestY + ty - fPlayerY;
                            let vx = nTestX + tx - fPlayerX;
                            let d = Math.sqrt(vx * vx + vy * vy);
                            let dot = (fEyeX * vx / d) + (fEyeY * vy / d);
                            p.push([d, dot]);
                        }

                    // Sort Pairs from closest to farthest
                    p.sort(function(a, b) {
                        return a - b;
                    });
                    // First two/three are closest (we will never see all four)
                    let fBound = 0.01;

                    if (Math.acos(p[0][1]) < fBound) bBoundary = true;
                    if (Math.acos(p[1][1]) < fBound) bBoundary = true;
                    if (Math.acos(p[2][1]) < fBound) bBoundary = true;
                }
            }
        }

        // Calculate distance to ceiling and floor
        let nCeiling = (nscreenarrHeight / 2.0) - nscreenarrHeight / fDistanceToWall;
        let nFloor = nscreenarrHeight - nCeiling;

        // Shader walls based on distance
        let nShade = ' ';
        if (fDistanceToWall <= fDepth / 4.0) nShade = String.fromCharCode(0x2588); // Very close	
        else if (fDistanceToWall < fDepth / 3.0) nShade = String.fromCharCode(0x2593);
        else if (fDistanceToWall < fDepth / 2.0) nShade = String.fromCharCode(0x2592);
        else if (fDistanceToWall < fDepth) nShade = String.fromCharCode(0x2591);
        else nShade = ' '; // Too far away

        if (bBoundary) nShade = ' '; // Black it out
        let rooffinal, floorfinal;
        for (let y = 0; y < nscreenarrHeight; y++) {
            // Each Row
            if (y <= nCeiling) {
                screenarr[y * nscreenarrWidth + x] = ' ';
                final = y * nscreenarrWidth + x
            } else if (y > nCeiling && y <= nFloor) {
                screenarr[y * nscreenarrWidth + x] = nShade	;
            } else // Floor
            {
                // Shade floor based on distance
                let b = 1.0 - (y - nscreenarrHeight / 2.0) / (nscreenarrHeight / 2.0);
                if (b < 0.25) nShade = '#';
                else if (b < 0.5) nShade = 'x';
                else if (b < 0.75) nShade = '.';
                else if (b < 0.9) nShade = '-';
                else nShade = ' ';
                screenarr[y * nscreenarrWidth + x] = nShade;
            }
        }
    }

    // Display Stats
    let playerInfo = `X=${Math.floor(fPlayerX)}  Y=${Math.floor(fPlayerY)}  A=${Math.floor(fPlayerA)} FRAME=${frame} MAXFRAME=${maxFrame}`
    Object.assign(screenarr, playerInfo);

    // Display Map
    for (let nx = 0; nx < nMapWidth; nx++) {
        for (let ny = 0; ny < nMapWidth; ny++) {
            screenarr[(ny + 1) * nscreenarrWidth + nx] = map[ny * nMapWidth + nx];
        }
    }
    // Display Frame

    screenarr[(nscreenarrHeight/2)*(nscreenarrWidth)+nscreenarrWidth/2] = '<cursor>+</cursor>'

    for (let i = 0; i < nscreenarrHeight; i++) {
        screenarr[i * nscreenarrWidth + nscreenarrWidth - 1] = '<br>'
    }
    let playerScreenCoorinate = (nscreenarrWidth*(Math.floor(fPlayerY+1)))+Math.floor(fPlayerX)
    if (screenarr[playerScreenCoorinate] == '#') {
    	playerScreenCoorinate += 1
    }
    screenarr[playerScreenCoorinate] = '%'
    Screen.innerHTML = screenarr.join('').replaceAll(', ', '').replaceAll(' ', '&nbsp');
    frame += 1
}, 0)
setInterval(() => {
    maxFrame = frame
    frame = 0
}, 1000)
Screen.onclick = function() {
  Screen.requestPointerLock();
};
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if (document.pointerLockElement === Screen ||
      document.mozPointerLockElement === Screen) {
    Screen.onmousemove = MouseEvent;
  } else {
  	Screen.onmousemove = undefined
  }
}


darkmode = document.getElementById("darkmode");

function setMode(type) {
	if (type == "dark") {
		darkmode.checked = true
		Screen.style.background = "black";
		Screen.style.color = "white";
	}else {
		darkmode.checked = false
		Screen.style.background = "white";
		Screen.style.color = "black";
	}
}

if (localStorage.DARK_MODE != undefined) {
	setMode(localStorage.DARK_MODE)
}else {
	localStorage.DARK_MODE = "white"
}

darkmode.onclick = () => {
	checked = darkmode.checked;
	if (checked) {
		localStorage.DARK_MODE = "dark"
		setMode("dark")
	}else {
		localStorage.DARK_MODE = "white"
		setMode("white")
	}
}
// That's It!! - Jx9