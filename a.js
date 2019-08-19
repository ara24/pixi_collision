/**
 * Created by NAVER on 2017-04-19.
 */

    //Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics,
    Text = PIXI.Text;

var stage = new Container(),
    renderer = autoDetectRenderer(320, 320);
renderer.backgroundColor = 0xc9ddff;
renderer.view.style.border = "1px dashed black";
document.body.appendChild(renderer.view);

loader
    .add("animals.json")
    .load(setup);

var cat, box, message, state;
var v = 2;


function setup() {

    box = new Graphics();
    box.lineStyle(4, 0xccff99, 1);
    // box.beginFill(0x02f72f);
    box.drawRect(0, 0, 84, 84);
    // box.endFill();
    box.x = 98;
    box.y = 98;
    stage.addChild(box);

    var id = resources["animals.json"].textures;
    cat = new Sprite(id["cat.png"]);
    cat.vx = 0;
    cat.vy = 0;
    stage.addChild(cat);


    // 키보드
    var left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    // left
    left.press = function() {
        cat.vx = -v;
        cat.vy = 0;

    };
    left.release = function() {
        if (!right.isDown && cat.vy === 0) {
            cat.vx = 0;
        }
    };

    // up
    up.press = function() {
        cat.vx = 0;
        cat.vy = -v;

    };
    up.release = function() {
        if (!down.isDown && cat.vx === 0) {
            cat.vy = 0;
        }
    };

    // right
    right.press = function() {
        cat.vx = v;
        cat.vy = 0;
    };
    right.release = function() {
        if(!left.isDown && cat.vy === 0) {
            cat.vx = 0;
        }
    };

    // down
    down.press = function() {
        cat.vx = 0;
        cat.vy = v;
    };
    down.release = function() {
        if (!up.isDown && cat.vx === 0) {
            cat.vy = 0;
        }
    };


    // 메시지
    message = new Text(
        "No collision...",
        {font: "18px sans-serif", fill: "black"}
    );
    message.position.set(8, 8);
    stage.addChild(message);



    //
    state = play;

    gameLoop();
}

function gameLoop() {

    requestAnimationFrame(gameLoop);

    state();    // x,y 위치값이 셋팅됨

    if(cat.x >= 0 || cat.y >= 0 ) {
        renderer.render(stage); // 그리는 부분
    }


}

function play() {
    if(cat.x < 0) {
        cat.x = 0;
    }
    else if(cat.x > renderer.width-cat.width) {
        cat.x = renderer.width-cat.width;
    }
    else {
        cat.x += cat.vx;
    }

    if(cat.y < 0) {
        cat.y = 0;
    }
    else if(cat.y > renderer.height-cat.height) {
        cat.y = renderer.height-cat.height;
    }
    else {
        cat.y += cat.vy;
    }
    console.log(cat.x, cat.y, box.x, box.y);
    // console.log(hitTestRectangle(cat, box));


    if (hitTestRectangle(cat, box)) {
        message.text = "hit!";
        box.tint = 0xff3300;

        // console.log("within", isKeepingWithinRectangle(cat, box));

        // if(isKeepingWithinRectangle(cat, box)) {
        //     message.text = "네모안에 쏙~!";
        //     box.tint = 0xccff99;
        // }
    }
    else {
        message.text = "No collision...";
        box.tint = 0xccff99;
    }

}

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
            console.log(Math.abs(vx), combinedHalfWidths, "비교");
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

function isKeepingWithinRectangle(obj, rec) {    // 오브젝트, 렉탱글

    var isWithin, differentX, differentY;

    isWithin = false;

    // Find start point
    obj.startX = obj.x;
    obj.startY = obj.y;

    rec.startX = rec.x;
    rec.startY = rec.y;

    differentX = rec.width - obj.width;
    differentY = rec.height - obj.height;

    console.log("?", obj.startX , obj.startY, rec.startX, rec.startY);
    console.log("?", obj.startX - rec.startX, " < " , differentX);


    if(obj.startX - rec.startX < differentX && obj.startY - rec.startY < differentY) {
        isWithin = true;
    }
    else {
        isWithin = false;
    }

    return isWithin;

}

function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    // 다운 핸들러
    key.downHandler = function(event) {
        if (event.keyCode == key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    // 업핸들러
    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            if(key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
    }

    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );

    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}
