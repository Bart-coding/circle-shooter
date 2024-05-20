let smallCircleHelperX, smallCircleHelperY, smallCircleX, smallCircleY, bigCircleX, bigCircleY;
let shottedCircleRadius, smallCircleRadius, bigCircleRadius;
let button, buttonX, buttonY, buttonHelperFactor;
let shottedCircles = [];
let hitsCounter;
let bigCircleColor;
let cleaningMode;
let lastShotFrameCount;
let shotSound, hitSound, currentVolume, mute, muteVarChangedFramesCount, framesToViewMuteInfo;

function preload() {
  shotSound = loadSound("assets/blaster-2-81267.mp3");
  hitSound = loadSound("assets/power-up-sparkle-1-177983.mp3");
  mute = false;
  framesToViewMuteInfo = 20;
  currentVolume = 0.02;
  shotSound.setVolume(currentVolume);
  hitSound.setVolume(currentVolume);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  smallCircleHelperX = random(200,300);
  smallCircleHelperY = random(200,300);
  
  smallCircleX = 0;
  smallCircleY = 0;
  smallCircleRadius = 50;
  
  moveLength = 50;
  bigCircleX = width/2;
  bigCircleY = height/2;
  bigCircleColor = color(255,255,100);
  bigCircleRadius = 150;
  
  shottedCircleRadius = 15;
  hitsCounter = 0;
  lastShotFrameCount = -15;
  
  button = createButton('SWITCH');
  buttonX = 580;
  buttonY = 45;
  button.position(buttonX, buttonY);
  
  cleaningMode = false;
  monoSynth = new p5.MonoSynth();
  button.mousePressed(() => {
    cleaningMode = !cleaningMode;
  });
  buttonHelperFactor = 10;
}

function drawHeader() {
  background(30)
  fill(255);
  textSize(50);
  text("Hits: " + hitsCounter + " | clean mode " + (cleaningMode ? "on" : "off"), 50, 70);
}

function drawShottedCircles() {
  if (mouseIsPressed && lastShotFrameCount + 15 <= frameCount) {
    lastShotFrameCount = frameCount;
    let circle_Color = color(random(50, 200), random(50, 200), random(50, 200));
    fill(circle_Color);
    noStroke();
    circle(smallCircleX, smallCircleY, shottedCircleRadius * 2);
    shottedCircles.push({
      x: smallCircleX,
      y: smallCircleY,
      targetX: mouseX,
      targetY: mouseY,
      circleColor: circle_Color,
      shotted: Date.now()
    });

    if (!mute) shotSound.play();
  }

  for (let i = shottedCircles.length - 1; i >= 0; --i) {
    if (cleaningMode && Date.now() >= shottedCircles[i].shotted + 10000) {
      shottedCircles.splice(i, 1);
      continue;
    }
    
    shottedCircles[i].x = lerp(shottedCircles[i].x, shottedCircles[i].targetX, 0.03);
    shottedCircles[i].y = lerp(shottedCircles[i].y, shottedCircles[i].targetY, 0.03);
    
    fill(shottedCircles[i].circleColor);
    noStroke();
    circle(shottedCircles[i].x, shottedCircles[i].y, shottedCircleRadius * 2);
    
    if (dist(shottedCircles[i].x, shottedCircles[i].y, bigCircleX, bigCircleY) <= bigCircleRadius + shottedCircleRadius) {
      bigCircleColor = shottedCircles[i].circleColor;
      shottedCircles.splice(i, 1);
      hitsCounter++;
	  if (hitsCounter % buttonHelperFactor === 0) {
        button.position((buttonX = buttonX + 25), buttonY);
        buttonHelperFactor *= 10;
      }

	  if (!mute) hitSound.play();
    }
  }
}

function drawBigCircle() {
  fill(bigCircleColor);
  noStroke();
  circle(width/2 + sin(radians(frameCount)) * 20, height/2 + cos(radians(frameCount)) * 20, bigCircleRadius * 2);
}

function drawSmallCircle() {
  let nextMoveHorizontally = random(-moveLength, moveLength);
  let nextMoveVertically = random(-moveLength, moveLength);
  smallCircleHelperX += nextMoveHorizontally;
  smallCircleHelperY += nextMoveVertically;
  
  while (dist(smallCircleHelperX, smallCircleHelperY, bigCircleX, bigCircleY) <= smallCircleRadius + bigCircleRadius + 20) {
    smallCircleHelperX -= nextMoveHorizontally - (nextMoveHorizontally = random(-moveLength, moveLength));
    smallCircleHelperY -= nextMoveVertically - (nextMoveVertically = random(-moveLength, moveLength));
  }
  
  if (smallCircleHelperX <= smallCircleRadius) smallCircleHelperX = smallCircleRadius;
  if (smallCircleHelperY <= smallCircleRadius) smallCircleHelperY = smallCircleRadius;
  if (smallCircleHelperX >= width - smallCircleRadius) smallCircleHelperX = width - smallCircleRadius;
  if (smallCircleHelperY >= height - smallCircleRadius) smallCircleHelperY = height - smallCircleRadius;
  
  let previous_smallCircleX = smallCircleX;
  let previous_smallCircleY = smallCircleY;
  smallCircleX = lerp(smallCircleX, smallCircleHelperX, 0.03); 
  smallCircleY = lerp(smallCircleY, smallCircleHelperY, 0.03);
  if (dist(smallCircleX, smallCircleY, bigCircleX, bigCircleY) <= smallCircleRadius + bigCircleRadius + 20) {
    smallCircleX = previous_smallCircleX;
    smallCircleY = previous_smallCircleY;
  }
    
  fill(20,150,100);
  noStroke();
  circle(smallCircleX, smallCircleY, smallCircleRadius * 2);
}

function drawVolumeInfoText(message) {
  textSize(40);
  fill(255, 200, 0);
  text(message, 55, 120);
}

function modifyVolume() {
  if (keyIsDown(LEFT_ARROW)) {
    currentVolume -= 0.0005;
    if (currentVolume <= 0) {
      currentVolume = 0;
      mute = true;
      muteVarChangedFramesCount = framesToViewMuteInfo;
    }
    shotSound.setVolume(currentVolume);
    hitSound.setVolume(currentVolume);
    drawVolumeInfoText("volume down");
  }

  else if (keyIsDown(RIGHT_ARROW)) {
    if (mute === true) {
      mute = false;
      muteVarChangedFramesCount = framesToViewMuteInfo;
    }
    if (currentVolume <= 0.5) {
      currentVolume += 0.0005;
      shotSound.setVolume(currentVolume);
      hitSound.setVolume(currentVolume);
      drawVolumeInfoText("volume up");
    }
  }

  if (muteVarChangedFramesCount > 0) {
    --muteVarChangedFramesCount;
    if (mute) drawVolumeInfoText("volume muted");
    else drawVolumeInfoText("volume unmuted");
  }
}

function draw() {
  drawHeader();
  drawShottedCircles();
  drawBigCircle();
  drawSmallCircle();
  modifyVolume();
}

function keyPressed() {
  if (key === "m" || key === "M") {
    if (mute === false) {
      mute = true;
      muteVarChangedFramesCount = framesToViewMuteInfo;
      shotSound.stop();
      hitSound.stop();
    }
    else {
      mute = false;
      muteVarChangedFramesCount = framesToViewMuteInfo;
    }
  }
}