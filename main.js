import modal from "bootstrap/js/src/modal.js";

let winFlag =false
let overFlag=false;
const characterElm = document
    .querySelector('#character');
const projectilesElm = document
    .querySelector('#projectiles');
const myModal = new bootstrap.Modal(document.getElementById("exampleModal"), {});
const exitGame =document.getElementById("exitButton")
const startAgainGame =document.getElementById("startAgainButton")
const exitGame2 =document.getElementById("exitButton2")
const startAgainGame2 =document.getElementById("startAgainButton2")
function myFnWin() {

    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));

    myModal.show();


return true
}
function myFnGameOver() {

    var myModalOver = new bootstrap.Modal(document.getElementById('gameOverModal'));

    myModalOver.show();


    return true
}

//- Using a function pointer:

const goalElm =document.getElementById("goal");

console.log("bottom "+goalElm.getBoundingClientRect().bottom)
console.log("top "+goalElm.getBoundingClientRect().top)
console.log("left " +goalElm.getBoundingClientRect().left)
console.log("right " +goalElm.getBoundingClientRect().right)


const projectileSpeed = 5;
const enemySpawnInterval = 2000;
const enemyAttackSpeed = 2;
let collisionCount = 0;
const gameStartUi =await new Promise((resolve)=>{
    document.querySelector("#start-screen > button")
        .addEventListener('click', async ()=>{
            await document.querySelector("html").requestFullscreen({
                navigationUI: 'hide'
            });
            document.querySelector("#start-screen").remove();
            resolve();
        });
});
(async ()=>{
await new Promise(function (resolve) {
    createDeathCountElement();
    setInterval(spawnEnemy, enemySpawnInterval);
    const images = ['/image/BG.jpg',
        '/image/tile/Tile (1).png',
        '/image/tile/Tile (2).png',
        '/image/tile/Tile (3).png',
        ...Array(10).fill('/image/character')
            .flatMap((v, i) => [
                `${v}/Jump__00${i}.png`,
                `${v}/Idle__00${i}.png`,
                `${v}/Run__00${i}.png`
            ])
    ];
    for (const image of images) {
        const img = new Image();
        img.src = image;
        img.addEventListener('load', progress);
    }

    const barElm = document.getElementById('bar');
    const totalImages = images.length;

    function progress(){
        images.pop();
        barElm.style.width = `${100 / totalImages * (totalImages - images.length)}%`
        if (!images.length){
            setTimeout(()=>{
                document.getElementById('overlay').classList.add('hide');
                resolve();
            }, 1000);
        }
    }});

})();

let dx = 0;                     // Run
let i = 0;                      // Rendering
let t = 0;
let run = false;
let jump = false;
let angle = 0;
let tmr4Jump;
let tmr4Run;
let previousTouch;
let onPlatform = false;
/* Rendering Function */
setInterval(() => {
    if (jump) {
        characterElm.style.backgroundImage =
            `url('/image/character/Jump__00${i++}.png')`;
        if (i === 10) i = 0;
    } else if (!run) {
        characterElm.style.backgroundImage =
            `url('/image/character/Idle__00${i++}.png')`;
        if (i === 10) i = 0;
    } else {
        characterElm.style.backgroundImage =
            `url('/image/character/Run__00${i++}.png')`;
        if (i === 10) i = 0;
    }
    checkPlatformCollision();

}, 1000 / 30);

// Initially Fall Down
// const tmr4InitialFall = setInterval(() => {
//     const top = characterElm.offsetTop + (t++ * 0.2);
//     if (characterElm.offsetTop >= (innerHeight - 128 - characterElm.offsetHeight)) {
//         clearInterval(tmr4InitialFall);
//         return;
//     }
//     characterElm.style.top = `${top}px`
// }, 20);

// Jump
function doJump() {
    if (tmr4Jump) return;
    i = 0;
    jump = true;
    const initialTop = characterElm.offsetTop;
    tmr4Jump = setInterval(() => {
        const top = initialTop - (Math.sin(toRadians(angle++))) * 150;
        characterElm.style.top = `${top}px`
        if (angle === 181) {
            clearInterval(tmr4Jump);
            tmr4Jump = undefined;
            jump = false;
            angle = 0;
            i = 0;
        }
    }, 1);
}

// Utility Fn (Degrees to Radians)
function toRadians(angle) {
    return angle * Math.PI / 180;
}

// Run
function doRun(left) {
    if (tmr4Run) return;
    run = true;
    i = 0;
    if (left) {
        dx = -10;
        characterElm.classList.add('rotate');
    } else {
        dx = 10;
        characterElm.classList.remove('rotate');
    }
    tmr4Run = setInterval(() => {
        if (dx === 0) {
            clearInterval(tmr4Run);
            tmr4Run = undefined;
            run = false;
            i = 0;
            return;
        }
        const left = characterElm.offsetLeft + dx;
        if (left + characterElm.offsetWidth >= innerWidth ||
            left <= 0) {
            if (left <= 0){
                characterElm.style.left = '0';
            }else{
                characterElm.style.left = `${innerWidth - characterElm.offsetWidth - 1}px`
            }
            dx = 0;
            return;
        }
        characterElm.style.left = `${left}px`;

    }, 20);
}

// Event Listeners
addEventListener('keydown', (e) => {
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowRight":
            doRun(e.code === "ArrowLeft");
            break;
        case "Space":
            doJump();
            break;
        case "ArrowDown":
            fireProjectile();
    }
});

addEventListener('keyup', (e) => {
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowRight":
            dx = 0;
    }
});

const resizeFn = ()=>{
    characterElm.style.top = `${innerHeight - 128 - characterElm.offsetHeight}px`;
    if (characterElm.offsetLeft < 0){
        characterElm.style.left = '0';
    }else if (characterElm.offsetLeft >= innerWidth ){
        characterElm.style.left = `${innerWidth - characterElm.offsetWidth - 1}px`
    }
}

addEventListener('resize', resizeFn);
/* Fix screen orientation issue in mobile devices */
screen.orientation.addEventListener('change', resizeFn);

characterElm.addEventListener('touchmove', (e)=>{
    if (!previousTouch){
        previousTouch = e.touches.item(0);
        return;
    }
    const currentTouch = e.touches.item(0);
    doRun((currentTouch.clientX - previousTouch.clientX) < 0);
    if (currentTouch.clientY < previousTouch.clientY) doJump();
    previousTouch = currentTouch;
});

characterElm.addEventListener('touchend', (e)=>{
    previousTouch = null;
    dx = 0;
});
// setInterval(spawnEnemy, enemySpawnInterval);
function checkCollision(elm1, elm2) {
    const rect1 = elm1.getBoundingClientRect();
    const rect2 = elm2.getBoundingClientRect();
    return (
        rect1.left < rect2.left + rect2.width &&
        rect1.left + rect1.width > rect2.left &&
        rect1.top < rect2.top + rect2.height &&
        rect1.top + rect1.height > rect2.top
    );
}
function createDeathCountElement() {
    const deathTag = document.createElement('h1');
    deathTag.id = 'death-count';
    deathTag.style.position = 'fixed';

    deathTag.style.top = '50px';
    deathTag.style.left = '50px';
    deathTag.style.color = 'red';
    deathTag.style.fontSize = '24px';
    deathTag.textContent = 'Death count: 0';
    document.body.appendChild(deathTag);
}
function updateDeathCount(collisionCount) {
    const deathTag = document.getElementById('death-count');
    deathTag.textContent = `Death count: ${collisionCount}`;
}
// Function to spawn enemies at regular intervals
function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.width = `150px`;
    enemy.style.height = `150px`;
    enemy.style.backgroundColor = 'none';
    enemy.style.left = `${innerWidth}px`;
    enemy.style.top = `${Math.random() * (innerHeight - 128 - 20)}px`;
    projectilesElm.appendChild(enemy);

    const intervalEnemy = setInterval(() => {
        const newLeft = enemy.offsetLeft - enemyAttackSpeed;
        if (newLeft < 0) {
            enemy.remove();
            clearInterval(intervalEnemy);
            return;
        }
        if (winFlag){
            enemy.remove()
            clearInterval(intervalEnemy)
        }
        if (overFlag){
            enemy.remove()
            clearInterval(intervalEnemy)
        }
        enemy.style.left = `${newLeft}px`;



        // Check collision with player character
        if (checkCollision(characterElm, enemy)) {
            // console.log(characterElm.getBoundingClientRect().left+" " +enemy.getBoundingClientRect().left)

            if ((characterElm.getBoundingClientRect().left===enemy.getBoundingClientRect().left)||(characterElm.getBoundingClientRect().bottom===enemy.getBoundingClientRect().bottom)){
             createDeathElement()
                updateDeathCount(collisionCount)
                if (collisionCount===6){
                    //clearInterval(interval);
                    handleGameOver();

                    overFlag =true
                }
                collisionCount++
            }

        }
    }, 20);
}

function handleGameOver() {
    //alert("over")
 myFnGameOver()
}
function fireProjectile() {
    const projectile = document.createElement('div');
    projectile.className = 'projectile';
    projectile.style.left = `${characterElm.offsetLeft + characterElm.offsetWidth / 2}px`;
    projectile.style.top = `${characterElm.offsetTop + characterElm.offsetHeight / 2}px`;
    projectilesElm.appendChild(projectile);

    const interval = setInterval(() => {
        const newLeft = projectile.offsetLeft + projectileSpeed;
        if (newLeft > innerWidth) {
            projectile.remove();
            clearInterval(interval);
            return;
        }
        projectile.style.left = `${newLeft}px`;

        // Check collision with enemies
        document.querySelectorAll('.enemy').forEach(enemy => {
            if (checkCollision(projectile, enemy)) {
                projectile.remove();
                enemy.remove();
                clearInterval(interval);
            }
        });
    }, 20);
}
// setInterval(plateForm, enemySpawnInterval * 2);
setInterval(()=>{
    plateForm()
},5000)

// setInterval(spawnEnemy, enemySpawnInterval);
// Platform Creation
function plateForm() {
    for (let i = 0; i < 1; i++) {
        const stage = document.createElement('div');
        stage.className = 'stage';
        stage.style.width = `150px`; // Fixed width for demonstration
        stage.style.height = `${characterElm.offsetHeight / 4}px`;

        // Set initial position at the bottom of the screen
        const newLeft = Math.random() * (innerWidth - 200); // Adjust for width of the stage
        let newTop = innerHeight - stage.offsetHeight; // Start from the bottom

        stage.style.left = `${newLeft}px`;
        stage.style.top = `${newTop}px`;
        document.body.appendChild(stage);

        let intervalStage = setInterval(() => {
            newTop -= 2; // Move the platform upwards by 2px each interval
            if (newTop < 0) { // If the platform moves out of the screen at the top
                stage.remove();
                clearInterval(intervalStage);
                return;
            }
            if (winFlag){
                stage.remove()
                clearInterval(intervalStage)
            }
            if (overFlag){
                stage.remove()
                clearInterval(intervalStage)
            }

            stage.style.top = `${newTop}px`;
        }, 20); // Adjust interval time for speed control
    }
}

function checkPlatformCollision() {
    const characterRect = characterElm.getBoundingClientRect();
    const platforms = document.querySelectorAll('.stage');

    let onPlatformNow = false;

    platforms.forEach(platform => {
        const platformRect = platform.getBoundingClientRect();
        if (
            characterRect.bottom >= platformRect.top &&
            characterRect.bottom <= platformRect.bottom &&
            characterRect.right >= platformRect.left &&
            characterRect.left <= platformRect.right
        ) {
            onPlatformNow = true;
            onPlatform = true; // Update global onPlatform flag

            // Adjust character position on platform
            let newTop = platformRect.top - characterElm.offsetHeight;
            characterElm.style.top = `${newTop}px`;

            // Clear jumping interval if on platform
            clearInterval(tmr4Jump);
            jump = false;
            angle = 0;
            i = 0;
        }
    });
    console.log("chara left "+characterElm.getBoundingClientRect().left)
winFn(characterElm,goalElm)
    // If not on any platform, apply gravity
    if (!onPlatformNow) {
      //  console.log("character uplift: " +characterElm.getBoundingClientRect().bottom)
        onPlatform = false; // Update global onPlatform flag
        if (characterElm.getBoundingClientRect().bottom>850){

            characterElm.getBoundingClientRect().bottom =50
        }
        gravityFall();
    }else {
     //   console.log("character uplift 2: " +characterElm.getBoundingClientRect().bottom)

        doJump()
    }
}
const tmr4InitialFall = setInterval(gravityFall, 20);

function gravityFall() {
    const top = characterElm.offsetTop + (t++ * 0.1);

    if (!onPlatform && characterElm.offsetTop >= (innerHeight - 128 - characterElm.offsetHeight)) {
        clearInterval(tmr4InitialFall);

        return;
    }

    characterElm.style.top = `${top}px`;

}
function winFn(characterElm,goalElm) {
    const characterWinBottom =characterElm.getBoundingClientRect().bottom
    const characterWinRight =characterElm.getBoundingClientRect().right
    const characterWinLeft =characterElm.getBoundingClientRect().left
    const goalWinBottom =goalElm.getBoundingClientRect().bottom
    const goalWinRight =goalElm.getBoundingClientRect().right
    if ((characterWinBottom<goalWinBottom)&&((characterWinLeft<(window.innerWidth/2)+100)&&(characterWinLeft>(window.innerWidth/2)-100))){
myFnWin()
        winFlag=true
    }
}
// function myFunction() {
//
//     const myModal = document.getElementById('myModal');
//     const myInput = document.getElementById('myInput');
//
//     myModal.addEventListener('shown.bs.modal', function () {
//         myInput.focus()
//     })
//
//
// }
//- Using a function pointer:


//- Using an anonymous function:
exitGame.addEventListener("click",()=>{
    window.close()
})
startAgainGame.addEventListener("click",()=>{
location.reload()
})
exitGame2.addEventListener("click",()=>{
    window.close()
})
startAgainGame2.addEventListener("click",()=>{
    location.reload()
})
function createDeathElement() {


}