/**
 * Created by NAVER on 2017-04-20.
 */

//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite;

var stage = new Container(),
    renderer = autoDetectRenderer(512, 512);
document.body.appendChild(renderer.view);

loader
    .add("treasureHunter.json")
    .load(setup);

var id, explorer, treasure;

function setup() {

    id  = PIXI.loader.resources["treasureHunter.json"].textures;

    treasure = new Sprite(id["treasure.png"]);
    stage.addChild(treasure);

    explorer = new Sprite(id["explorer.png"]);
    stage.addChild(explorer);


    renderer.render(stage);
}