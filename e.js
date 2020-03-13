/**
 * Created by NAVER on 2017-04-24.
 */

//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    TilingSprite = PIXI.extras.TilingSprite,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    Graphics = PIXI.Graphics;

//Create a Pixi stage and renderer and add the
//renderer.view to the DOM
var canvas = document.getElementById("game-scene")
var stage = new Container(),

    renderer = new PIXI.CanvasRenderer(512, 384, { view: canvas });

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.view);

// 이렇게 하면 스프라이트 끝부분 깨짐
//     renderer = autoDetectRenderer(
//         512,
//         384,
//         {view: document.getElementById("game-scene")});
// // document.body.appendChild(renderer.view);

loader
    .add([
        "images/bg-far.png",
        "images/bg-mid.png",
        "images/bubble_32x32.png",
        "images/bubble_64x64.png",
        "images/bunny.png"
    ])
    .load(setup);


//Define variables that might be used in more
//than one function

var gameScene, id, bunny, state, far, mid, healthBar, healthPointBar,
    gameOverScene, message, hp, heart, heartIcon, score, scoreValue, strScoreValue;
var ms = 0;
// var currentI;
var numberOfBubbles = 1;
var bubbles = [];
var v = 8; // 토끼 속도


function setup() {
    // console.log("setup() 호출");


    // 배경 추가
    var farTexture = Texture.fromImage("images/bg-far.png");
    far = new TilingSprite(farTexture, farTexture.baseTexture.width, farTexture.baseTexture.height);
    far.position.x = 0;
    far.position.y = 0;
    far.tilePosition.x = 0;
    far.tilePosition.y = 0;
    //stage.addChild(far);

    var midTexture = Texture.fromImage("images/bg-mid.png");
    mid = new TilingSprite(midTexture, midTexture.baseTexture.width, midTexture.baseTexture.height);
    mid.position.x = 0;
    mid.position.y = 128;
    mid.tilePosition.x = 0;
    mid.tilePosition.y = 0;
    //stage.addChild(mid);


    // 게임 스크린 추가
    gameScene = new Container();
    stage.addChild(gameScene);


    // 토끼 추가
    bunny = new Sprite(resources["images/bunny.png"].texture);
    bunny.x = window.innerWidth / 2 - bunny.width / 2;
    bunny.y = window.innerHeight / 2 - bunny.height / 2;
    bunny.vx = 0;
    bunny.vy = 0;
    gameScene.addChild(bunny);

    // 체력 바 만들기
    healthBar = new Container();
    healthBar.position.set(window.innerWidth - 72, 15);
    gameScene.addChild(healthBar);

    healthPointBar = new Container();
    healthPointBar.position.set(20, 3);
    healthBar.addChild(healthPointBar);

    hp = new Text(
        "HP",
        { fontSize: 12, fontFamily: "Futura", fill: "white" }
    );
    hp.x = 0;
    hp.y = 0;
    healthBar.addChild(hp);

    var innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 32, 10);
    innerBar.endFill();
    healthPointBar.addChild(innerBar);

    var outerBar = new Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 32, 10);
    outerBar.endFill();
    healthPointBar.addChild(outerBar);

    healthBar.outer = outerBar; // 나중에 불러다 쓰려고 객체 저장


    // 하트 아이콘 추가
    heartIcon = new Container();
    heartIcon.position.set(window.innerWidth - 30, window.innerHeight - 30);
    gameScene.addChild(heartIcon);

    heart = new Text(
        "♥",
        { fontSize: 23, fontFamily: "Futura", fill: "red" }
    );
    heart.x = 0;
    heart.y = 0;
    heartIcon.addChild(heart);

    score = new Container();
    score.position.set(5, window.innerHeight - 20);
    stage.addChild(score);

    strScoreValue = "score : ";
    scoreValue = new Text(
        strScoreValue + "0",
        { fontSize: 12, fontFamily: "Futura", fill: "white" }
    );
    scoreValue.x = 0;
    scoreValue.y = 0;
    score.addChild(scoreValue);



    // 게임오버 씬
    gameOverScene = new Container();
    stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    //Create the text sprite and add it to the `gameOver` scene
    message = new Text(
        "GAME OVER!",
        { fontSize: 64, fontFamily: "Futura", fill: "white" }
    );
    message.x = renderer.width / 2 - message.width / 2;
    message.y = stage.height / 2 - 32;
    gameOverScene.addChild(message);



    // 키보드 화살표 키 메서드
    keyboardMethodSetup();

    //Set the game state
    state = play;

    //Start the game loop
    gameLoop();

    createBubble();
}

function keyboardMethodSetup() {
    // console.log("keyboardMethodSetup() 호출");

    //Capture the keyboard arrow keys
    var left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    //Left arrow key `press` method
    left.press = function () {

        //Change the bunny's velocity when the key is pressed
        bunny.vx = -v;
        bunny.vy = 0;
    };

    //Left arrow key `release` method
    left.release = function () {

        //If the left arrow has been released, and the right arrow isn't down,
        //and the bunny isn't moving vertically:
        //Stop the bunny
        if (!right.isDown && bunny.vy === 0) {
            bunny.vx = 0;
        }
    };

    //Up
    up.press = function () {
        bunny.vy = -v;
        bunny.vx = 0;
    };
    up.release = function () {
        if (!down.isDown && bunny.vx === 0) {
            bunny.vy = 0;
        }
    };

    //Right
    right.press = function () {
        bunny.vx = v;
        bunny.vy = 0;
    };
    right.release = function () {
        if (!left.isDown && bunny.vy === 0) {
            bunny.vx = 0;
        }
    };

    //Down
    down.press = function () {
        bunny.vy = v;
        bunny.vx = 0;
    };
    down.release = function () {
        if (!up.isDown && bunny.vx === 0) {
            bunny.vy = 0;
        }
    };
}

function gameLoop() {
    // console.log("gameLoop()");


    //Update the current game state
    state();

    // Render the stage
    renderer.render(stage);
}

function createBubble() {
    // 버블 추가
    numberOfBubbles++;

    // for(var i = 0; i < numberOfBubbles; i++) {

    var bubbleSize = randomInt(1, 2);
    // console.log(bubbleSize);

    var speed = randomInt(4, 9);
    // console.log("i =", i, "speed=", speed);

    // Make a bubble
    if (bubbleSize == 1) {
        var bubble = new Sprite(resources["images/bubble_32x32.png"].texture);
    }
    else {
        var bubble = new Sprite(resources["images/bubble_64x64.png"].texture);
    }

    var x = renderer.width + 64;
    var y = randomInt(0, renderer.height - bubble.height);

    bubble.x = x;
    bubble.y = y;
    bubble.vx = speed;  // 스피드 랜덤
    bubble.vy = 0;

    bubbles.push(bubble);

    gameScene.addChild(bubble);


    setTimeout(function () {
        if (gameScene.visible) {
            // console.log("1초 경과");
            createBubble();
        }
    }, 300 / window.innerHeight * 300);

    // }, 300/window.innerHeight*300*i);
    // }
}

function play() {
    // 배경
    far.tilePosition.x -= 0.128;
    mid.tilePosition.x -= 0.64;

    // bunny가 속도만큼 이동하도록
    bunny.x += bunny.vx;
    bunny.y += bunny.vy;

    // 범위 설정
    contain(bunny, { x: 0, y: 0, width: renderer.width, height: renderer.height });


    var bunnyHit = false;

    bubbles.forEach(function (bubble) {
        // 버블 이동
        bubble.x -= bubble.vx;
        // 범위 설정
        contain(bubble, {
            x: 0 - bubble.width, y: 0 - bubble.height,
            width: renderer.width * 3, height: renderer.height + bubble.height
        });

        if (hitSomething(bunny, bubble)) {
            bunnyHit = true;
        }
    });

    // 토끼가 버블에 닿았을 때
    if (bunnyHit) {
        bunny.alpha = 0.5;
        healthBar.outer.width -= 1;
    }
    else {
        bunny.alpha = 1;
    }

    // 체력 다 떨어졌을 때
    if (healthBar.outer.width < 0) {
        state = end;
    }

    // 토끼가 HP에 닿았을 때,
    if (hitSomething(bunny, healthBar)) {
        healthBar.x = bunny.x - 16;
        healthBar.y = bunny.y - 6;
    }

    // 토끼가 하트 아이콘에 닿았을 때,
    if (hitSomething(bunny, heartIcon)) {
        if (healthBar.outer.width < 32)
            healthBar.outer.width += 1;
    }


    // 스코어 뿌려주기
    ms += 1;
    scoreValue.text = strScoreValue + ms;


    //Loop this function 60 times per second
    requestAnimationFrame(gameLoop);

}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
    gtag('event', '점수', {
        'event_category': '버블 피하기 게임',
        'value': ms
    })
}


function contain(sprite, container) {

    var collision = undefined;

    // 왼
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    // 위
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    // 오
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    // 아래
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    return collision;

}


//The `keyboard` helper function
function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}

//The `randomInt` helper function
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//The `hitTestRectangle` function
function hitSomething(r1, r2) {

    //Define the variables we'll need to calculate
    var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};
