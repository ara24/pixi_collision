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
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    Graphics = PIXI.Graphics;

//Create a Pixi stage and renderer and add the
//renderer.view to the DOM
var stage = new Container(),
    renderer = autoDetectRenderer(512, 512);
document.body.appendChild(renderer.view);

loader
    .add("treasureHunter.json")
    .load(setup);

//Define variables that might be used in more
//than one function
var state, explorer, treasure, blobs, chimes, exit, player, dungeon,
    door, healthBar, message, gameScene, gameOverScene, enemies, id;


function setup() {

    // 게임 스크린 추가
    gameScene = new Container();
    stage.addChild(gameScene);

    id = resources["treasureHunter.json"].textures;


    // 던전
    dungeon = new Sprite(id["dungeon.png"]);
    gameScene.addChild(dungeon);

    //  문
    door  = new Sprite(id["door.png"]);
    door.position.set(32, 0);
    gameScene.addChild(door);

    // 탐험가
    explorer = new Sprite(id["explorer.png"]);
    explorer.x = 68;
    explorer.y = gameScene.height/2 - explorer.height/2;
    explorer.vx = 0;
    explorer.vy = 0;
    gameScene.addChild(explorer);

    // 보물
    treasure = new Sprite(id["treasure.png"]);
    treasure.x = gameScene.width - treasure.width - 48;
    treasure.y = gameScene.height/2 - treasure.height/2;
    gameScene.addChild(treasure);

    // 몬스터들 만들기
    var numberOfBlobs = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2,
        direction = 1;

    blobs = [];

    for (var i = 0; i < numberOfBlobs; i++) {
        var blob = new Sprite(id["blob.png"]);

        var x = spacing * i + xOffset;  // 150 위치부터 48 간격만큼 한마리씩 나오도록
        var y = randomInt(0, stage.height-blob.height); // 범위는 이만큼

        blob.x = x;
        blob.y = y;

        blob.vy = speed * direction;    // 스피드 * 방향

        direction *= -1; // 근접하는 몬스터 방향 반대

        blobs.push(blob);

        gameScene.addChild(blob);

    }

    // 체력 바 만들기
    healthBar = new Container();
    healthBar.position.set(stage.width - 170, 6);
    gameScene.addChild(healthBar);

    var innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    var outerBar = new Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar; // 나중에 불러다 쓰려고 객체 저장


    // 게임오버 씬 추가
    gameOverScene = new Container();
    stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    // 메시지
    message = new Text(
        "The End!",
        {font: "64px Futura", fill: "white"}
    );
    message.x = 120;
    message.y = stage.height / 2 - 32;
    gameOverScene.addChild(message);


    //Capture the keyboard arrow keys
    var left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    //Left arrow key `press` method
    left.press = function() {

        //Change the explorer's velocity when the key is pressed
        explorer.vx = -5;
        explorer.vy = 0;
    };

    //Left arrow key `release` method
    left.release = function() {

        //If the left arrow has been released, and the right arrow isn't down,
        //and the explorer isn't moving vertically:
        //Stop the explorer
        if (!right.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };

    //Up
    up.press = function() {
        explorer.vy = -5;
        explorer.vx = 0;
    };
    up.release = function() {
        if (!down.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };

    //Right
    right.press = function() {
        explorer.vx = 5;
        explorer.vy = 0;
    };
    right.release = function() {
        if (!left.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };

    //Down
    down.press = function() {
        explorer.vy = 5;
        explorer.vx = 0;
    };
    down.release = function() {
        if (!up.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };


    //Set the game state
    state = play;

    //Start the game loop
    gameLoop();
}

function gameLoop() {

    //Loop this function 60 times per second
    requestAnimationFrame(gameLoop);

    //Update the current game state
    state();

    //Render the stage
    renderer.render(stage);
}

function play() {

    // 탐험가가 속도만큼 이동하도록
    explorer.x += explorer.vx;
    explorer.y += explorer.vy;

    // 탐험 범위 설정
    contain(explorer, {x: 28, y: 10, width: 438, height:480});

    // 충돌 체크
    var explorerHit = false;

    // 몬스터들 각각 움직이도록
    blobs.forEach(function(blob) {

        // 몬스터 이동
        blob.y += blob.vy;

        // 몬스터 이동 범위 설정
        var blobHitsWall = contain(blob, {x: 28, y: 10, width: 488, height: 480});

        // 끝지점에 도달하면 방향 바뀌도록
        if (blobHitsWall === "top" || blobHitsWall === "bottom") {
            blob.vy *= -1;
        }

        if(hitTestRectangle(explorer, blob)) {
            explorerHit = true;
        }
    });

    // 몬스터와 닿았는지 체크
    if(explorerHit) {
        explorer.alpha = 0.5;
        healthBar.outer.width -= 1;
    }
    else {
        explorer.alpha = 1;
    }

    // 보물이랑 닿았는지 체크
    if (hitTestRectangle(explorer, treasure)) {
        treasure.x = explorer.x + 8;
        treasure.y = explorer.y + 8;
    }

    // 체력 다 떨어졌는지 체크
    if (healthBar.outer.width < 0) {
        state = end;
        message.text = "You lost!";
    }

    // 보물이랑 문이랑 닿았는지 체크
    if (hitTestRectangle(treasure, door)) {
        state = end;
        message.text = "You won!";
    }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
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

//The `hitTestRectangle` function
function hitTestRectangle(r1, r2) {

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


//The `randomInt` helper function
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function(event) {
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





















