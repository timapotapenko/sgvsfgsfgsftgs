// Function to get query parameters
function getQueryParams() {
  const params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
      params[key] = value;
  });
  return params;
}

// Get citylevel from query parameters
const queryParams = getQueryParams();
const citylevel = queryParams.citylevel
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

// general settings
let gamePlaying = false;
const gravity = .5;
const speed = 5.2;
const size = [51, 36];
const jump = -12.5;
const cTenth = (canvas.width / 10);

let index = 0,
    bestScore = 0, 
    flight, 
    flyHeight, 
    currentScore, 
    pipes;

// new variables
let money_collected = 0;
let money_column = 100000;
let tries = 999;
let floatingText = [];

// pipe settings
const pipeWidth = 78;
const pipeGap = 270;
const pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

const setup = () => {
  currentScore = 0;
  flight = jump;

  // set initial flyHeight (middle of screen - size of the bird)
  flyHeight = (canvas.height / 2) - (size[1] / 2);

  // setup first 3 pipes
  pipes = Array(3).fill().map((a, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
}

const render = () => {
  // make the pipe and bird moving 
  index++;

  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background first part 
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
  // background second part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);
  
  // pipe display
  if (gamePlaying){
    pipes.map(pipe => {
      // pipe moving
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
      // bottom pipe
      ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

      // give 1 point & create new pipe
      if(pipe[0] <= -pipeWidth){
        currentScore++;
        // check if it's the best score
        bestScore = Math.max(bestScore, currentScore);
        
        // remove & create new pipe
        pipes = [...pipes.slice(1), [pipes[pipes.length-1][0] + pipeGap + pipeWidth, pipeLoc()]];
      }
    
      // if hit the pipe, end
      if ([pipe[0] <= cTenth + size[0], pipe[0] + pipeWidth >= cTenth, pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]].every(elem => elem)) {
        gamePlaying = false;
        tries--; // reduce tries when the game is over
        setup();
      }

      // if passed between pipes, collect money
      if (pipe[0] + pipeWidth < cTenth && pipe[0] + pipeWidth + speed >= cTenth) {
        money_collected += money_column;
        floatingText.push({text: `+${money_column}`, x: canvas.width / 2, y: canvas.height * 0.25, opacity: 1});
      }
    })
  }

  // draw bird
  if (gamePlaying) {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);
    flyHeight = (canvas.height / 2) - (size[1] / 2);

    ctx.font = "bold 20px 'Press Start 2P', cursive";
    ctx.fillStyle = "black";
    const text = tries > 0 ? `Play(${tries})` : 'Wait for new tries';
    const textWidth = ctx.measureText(text).width;
    const x = (canvas.width / 2) - (textWidth / 2);
    const y = canvas.height * 0.7; // 30% from the bottom

    ctx.fillText(text, x, y);

    // Display money collected when the game is not running
    if (!gamePlaying) {
      ctx.font = "bold 20px 'Press Start 2P', cursive";
      ctx.fillStyle = "black";
      const moneyText = "Money collected:";
      const moneyTextWidth = ctx.measureText(moneyText).width;
      const moneyTextX = (canvas.width / 2) - (moneyTextWidth / 2);
      const moneyTextY = canvas.height * 0.35; // 25% from the top
      ctx.fillText(moneyText, moneyTextX, moneyTextY);

      ctx.font = "bold 20px 'Press Start 2P', cursive";
      ctx.fillStyle = "#FFA721";
      const moneyValue = `+${money_collected}`;
      const moneyValueWidth = ctx.measureText(moneyValue).width;
      const moneyValueX = (canvas.width / 2) - (moneyValueWidth / 2);
      const moneyValueY = canvas.height * 0.4; // 30% from the top
      ctx.fillText(moneyValue, moneyValueX, moneyValueY);
    }
  }

  // draw floating text
  floatingText = floatingText.filter(fText => fText.opacity > 0);
  floatingText.forEach(fText => {
    ctx.font = "bold 25px 'Press Start 2P', cursive";
    ctx.fillStyle = `rgba(255, 167, 33, ${fText.opacity})`;
    const textWidth = ctx.measureText(fText.text).width;
    ctx.fillText(fText.text, fText.x - (textWidth / 2), fText.y);
    fText.y -= 1;
    fText.opacity -= 0.01;
  });

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
}

// launch setup
setup();
img.onload = render;

// start game
document.addEventListener('click', () => {
  if (tries > 0 && !gamePlaying) {
    gamePlaying = true;
    flight = jump; // start jump immediately on click
  }
});
window.onclick = () => {
  if (tries > 0 && gamePlaying) {
    flight = jump;
  }
};

// Prevent double-click zoom
window.addEventListener('dblclick', (e) => {
  e.preventDefault();
});

const backButton = document.getElementById('backButton');
backButton.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent the click event from propagating to the window
  backButtonClicked = true;
});