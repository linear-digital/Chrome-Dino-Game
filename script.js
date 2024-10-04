
import { updateGround, setupGround } from "./ground.js"
import { updateclouds, setupclouds } from "./clouds.js"
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001
const hiScore = document.getElementById("hi-score")
const worldElem = document.querySelector("[data-world]")
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")
const stopScreenElem = document.querySelector("[data-end-screen]")

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
document.addEventListener("keydown", handleStart, { once: true })



let lastTime
let speedScale
let score
let Highscore
let heights
let userInfo
const getUser = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');
  if (!userId) {
    return document.location.assign('https://www.genzit.xyz/feed/games');
  }

  try {
    const res = await fetch(`https://genzit.linearhub.com/api/user/score/get/${userId}`);
    const data = await res.json();

    if (res.ok) {
      heights = data.score;
      hiScore.innerHTML = Math.floor(heights);
      userInfo = data;  // Cache user data for future use
      return data;
    } else {
      console.error('Failed to fetch user data');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

getUser()

function update(time) {
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }
  const delta = time - lastTime

  updateclouds(delta, speedScale)
  updateGround(delta, speedScale)
  updateDino(delta, speedScale)
  updateCactus(delta, speedScale)
  updateSpeedScale(delta)
  updateScore(delta)
  if (checkLose()) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
}

function checkLose() {
  const dinoRect = getDinoRect()
  return getCactusRects().some(rect => isCollision(rect, dinoRect))
}


function isCollision({ left: l1, top: t1, right: r1, bottom: b1 }, { left: l2, top: t2, right: r2, bottom: b2 }) {
  return l1 < r2 && t1 < b2 && r1 > l2 && b1 > t2;
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE
}

function updateScore(delta) {
  score += delta * 0.01
  scoreElem.textContent = Math.floor(score)

}

function handleStart() {

  lastTime = null
  speedScale = 1
  score = 0
  Highscore = heights

  hiScore.innerHTML = Math.floor(heights)
  setupclouds()
  setupGround()
  setupDino()
  setupCactus()
  startScreenElem.classList.add("hide")
  window.requestAnimationFrame(update)
}
const updateScoreOnSerevr = async (scoreNow) => {
  const user = await getUser()
  const res = await fetch('https://genzit.linearhub.com/api/user/score/update/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      score: scoreNow,
      user: user._id
    })
  })

  const data = await res.json()
  heights = data.score
  hiScore.innerHTML = Math.floor(heights)
}
function handleLose() {
  setDinoLose()

  setTimeout(() => {
    document.addEventListener("keydown", handleStart, { once: true }) // Keeps the keyboard start
    const startButton = document.getElementById("start-button") // Get the button element

    startButton.addEventListener("click", handleStart) // Add click event listener to the start button
    startScreenElem.classList.remove("hide")
    if (score > heights) {
      heights = score
      hiScore.innerHTML = Math.floor(heights)
      updateScoreOnSerevr(score)
    }
  }, 100)

}

if (score > Highscore) {
  Highscore = score;
  hiScore.innerHTML = Math.floor(Highscore);
}

function setPixelToWorldScale() {
  let worldToPixelScale
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT
  }

  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}


document.onkeydown = function (e) {
  // Block F12 key
  if (e.key === 'F12') {
    e.preventDefault();
  }
  console.log(e);
  // Block function keys
  if ([32, 37, 38, 39, 40].includes(e.key)) {
    e.preventDefault();
    return false;
  }

  // Block developer tools shortcuts
  if ('abcdefghijklmnopqrstuvwxyz'.includes(e.key)) {
    e.preventDefault();
    return false;
  }
}
document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});