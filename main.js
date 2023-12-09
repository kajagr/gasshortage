import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from './common/engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';
import { vec3 } from './lib/gl-matrix-module.js';
import { quat } from './lib/gl-matrix-module.js';
import { Physics } from './Physics.js';

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from '../../../common/engine/core/MeshUtils.js';

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/scena.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const physics = new Physics(scene);

// postavitev kamere (isometric view)
const camera = scene.find(node => node.getComponentOfType(Camera));
camera.components[1].far = 400;
const cameraOffset = [120, 120*Math.sqrt(2), 120]
camera.getComponentOfType(Transform).rotation = quat.fromEuler(quat.create(), -45, -45 + 90, 0);

// specifikacije igre

var imeAvta = 'mustang'; // default avto

const vehicleOffsetsY = {
    mustang: 0,
    lambo: 0,
    tesla: 0,
    tank: 0.633,
}

const vehicles = {
    mustang: gltfLoader.loadNode('mustang'),
    lambo: gltfLoader.loadNode('lambo'),
    tesla: gltfLoader.loadNode('tesla'),
    tank: gltfLoader.loadNode('tank'),
}

var avto = vehicles[imeAvta];

const podlaga = gltfLoader.loadNode('podlaga')

var gameSpeed = 1;

const defaultCarSpeed = 0.3;
const defaultCarTurnSpeed = 1.6;
const defaultPhi = 0;

var framesPassed = 0;

const startSunAngle = Math.PI / 6;
var sunAngle = startSunAngle;

var carSpeed = defaultCarSpeed;
var carTurnSpeed = defaultCarTurnSpeed;
var phi = defaultPhi;
const defaultPoraba = 0.020;

var play = false;
var inProgress = false;
var doRender = true;
var gameOver = false;

var gasTankMax = 100;
var gasTank = gasTankMax;
var poraba = defaultPoraba;
var maxHP = 100;
var HP = maxHP;
var damage = 20;
var gasCanSize = 20;
var heartSize = 20;
var day = true;
// zaznavanje trkov

// gas cans

var gasCans = [];

for (var i=1; i<30; i++) {
    const gasCan = gltfLoader.loadNode('GasCan.' + (i<10 ? '00' : i<100 ? '0' : '') + i);
    if (gasCan != null) {
        gasCan.isGasCan = true;
        gasCans.push(gasCan);
    }
}

// hearts

var hearts = [];

for (var i=1; i<30; i++) {
    const heart = gltfLoader.loadNode('heart.' + (i<10 ? '00' : i<100 ? '0' : '') + i);
    if (heart != null) {
        heart.isHeart = true;
        hearts.push(heart);
    }
}

const mapa = avto.parent;
mapa.children.forEach((objekt) => {
    if (objekt != camera && objekt != podlaga && Object.values(vehicles).includes(objekt) == false) {
        objekt.isStatic = true;
    }
});

scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }

    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});

// trk avta z objekti in odštevanje HP, ali pa polnjenje goriva in HP

var usedGasCans = [];
var usedHearts = [];

export async function trkAvta(item, tip) {
    if (tip == null) {
        HP -= damage;
        if (HP <= 0) {
            HP = 0;
            gameOver = true;
            inProgress = false;
            play = false;
            gameOverElement.style.display = 'block';
            blackBackground.style.display = 'block';
            restartButton.style.display = 'block';
        }
        HPCurrentElement.style.width = ((HP / maxHP) * 100) + "%";
    } else {
        if (item != null) {
            if (tip == "GasCan") {
                if (!usedGasCans.includes(item)) {
                    usedGasCans.push(item);
                    gasTank += (gasTankMax - gasTank) < gasCanSize ? (gasTankMax - gasTank) : gasCanSize;
                }
            } else if (tip == "heart") {
                if (!usedHearts.includes(item)) {
                    usedHearts.push(item);
                    HP += (maxHP - HP) < heartSize ? (maxHP - HP) : heartSize;
                    HPCurrentElement.style.width = ((HP / maxHP) * 100) + "%";
                }
            }
            const pos = item.getComponentOfType(Transform).translation;
            vec3.add(pos, pos, [0, -10, 0]);
            item.getComponentOfType(Transform).translation = pos
        }
    }
}

// game controls: <Space> = pavza, <A> = levo, <D> = desno

var keys = {};

document.addEventListener('keydown', function(event) {
    keys[event.code] = true;
    if (event.code === 'Space' || event.key === ' ') {
        if (!gameOver && inProgress) {
            if(play){
                play = false;
                blackBackground.style.display = 'block';
                pauseElement.style.display = 'block';
            } else {
                play = true;
                blackBackground.style.display = 'none';
                pauseElement.style.display = 'none';
            }
        }
    }
});
document.addEventListener('keyup', function(event) {
    delete keys[event.code];
});

// gumbi in UI elementi

const playButton = document.querySelector('#playButton');
const gasTankMaxElement = document.querySelector('#gasTankMax');
const gasTankCurrentElement = document.querySelector('#gasTankCurrent');
const HPCurrentElement = document.querySelector('#HPCurrent');
const HPMaxElement = document.querySelector('#HPMax');
const scoreElement = document.querySelector('#score');
const blackBackground = document.querySelector('#popup-background');
const pauseElement = document.querySelector('#pause');
const gameOverElement = document.querySelector('#gameOver');
const restartButton = document.querySelector('#restartButton');
const vehicleTableElement = document.querySelector('#vehicleTable');
const vehicleSelect = document.querySelectorAll('.vehIcon');
const gameSpeedSlider = document.querySelector('#gameSpeedSlider');
const gameSpeedElement = document.querySelector('#gameSpeed');
const slideContainerElement = document.querySelector('.slidecontainer');

gameSpeedSlider.addEventListener('input', () => {
    gameSpeed = gameSpeedSlider.value / 1000;
    gameSpeedElement.innerHTML = "Game speed (" + gameSpeed.toFixed(1) + 'x)';
});

// priprava nove igre

function prepareNewGame() {
    // reset vseh spremenljivk
    carSpeed = defaultCarSpeed;
    carTurnSpeed = defaultCarTurnSpeed;
    phi = defaultPhi;
    framesPassed = 0;
    sunAngle = startSunAngle;
    gasTank = gasTankMax;
    poraba = defaultPoraba;
    HP = maxHP;
    HPCurrentElement.style.width = "100%";
    gasCans.forEach((gasCan) => {
        gasCan.getComponentOfType(Transform).translation[1] = -0.99;
        gasCan.used = undefined;
    });
    hearts.forEach((heart) => {
        heart.getComponentOfType(Transform).translation[1] = -0.99;
        heart.used = undefined;
    });
    gameOver = false;
    avto.getComponentOfType(Transform).translation = [0, vehicleOffsetsY[imeAvta], 0]; // reset pozicije avta
    play = true;
    inProgress = true;
    // visible:
    gasTankMaxElement.style.display = 'block';
    HPMaxElement.style.display = 'block';
    scoreElement.style.display = 'block';
    slideContainerElement.style.display = 'block';
    // hidden:
    vehicleTableElement.style.display = 'none';
    blackBackground.style.display = 'none';
    gameOverElement.style.display = 'none';
    restartButton.style.display = 'none';
    playButton.style.display = 'none';
}

// PlayButton -> izbira avta

playButton.addEventListener('click', () => {
    playButton.style.display = 'none';
    vehicleTableElement.style.display = 'block';
});

// RestartButton -> ponastavi vse in začne novo igro

restartButton.addEventListener('click', () => {
    prepareNewGame()
});

// vehicleSelect -> izbere avto in začne igro

vehicleSelect.forEach((vehicleSelectButton) => {
    vehicleSelectButton.addEventListener('click', () => {
        // izbere avto
        imeAvta = vehicleSelectButton.id;
        avto = vehicles[imeAvta];
        avto.isDynamic = true;
        // začne igro
        prepareNewGame()
    });
});

//

// štetje časa, večanje hitrosti, dvigovanje porabe goriva, postavljanje gas can-ov in heart-ov

async function every1000Frames() {
    carSpeed += 0.01 * gameSpeed;
    poraba += 0.001 * gameSpeed;
    const gasCan = usedGasCans.shift();
    if (gasCan) {
        gasCan.getComponentOfType(Transform).translation[1] = -0.99;
        gasCan.used = undefined;
    }
}

async function every4000Frames() {
    const heart = usedHearts.shift();
    if (heart) {
        heart.getComponentOfType(Transform).translation[1] = -0.99;
        heart.used = undefined;
    }
}

async function changePhi() {
    if (keys['ArrowRight'] || keys['KeyD']) {
        phi += Math.PI / 180 * carTurnSpeed * gameSpeed;
    }
    else if (keys['ArrowLeft'] || keys['KeyA']) {
        phi += - Math.PI / 180 * carTurnSpeed * gameSpeed;
    }
}

// luči

const light = new Node();
light.addComponent(new Transform({
    translation: [600*Math.cos(sunAngle),600*Math.sin(sunAngle), 0]
}));
light.addComponent(new Light({
    ambient: 0.3,
}));
scene.addChild(light);

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    physics.update(time, dt);
}

// funkcija za izračun vektorja premika avta glede na kot phi

function getMotionVector(phi) {
    const magnitude = carSpeed * gameSpeed;
    const x = magnitude * Math.cos(phi);
    const z = magnitude * Math.sin(phi);

    return vec3.fromValues(x, 0, z);
}

// funkcija, ki se kliče za vsak izris frejma, da se izračunajo vse spremenljivke, ampak ne vožnja avta

function everyFrame() {
    framesPassed += gameSpeed;
    gasTank -= poraba * gameSpeed;
    if ( Math.floor(framesPassed) % 1000 == 0) {
        every1000Frames();	
    }
    if (Math.floor(framesPassed) % 4000 == 0) {
        every4000Frames();
    }
    changePhi();
    if (gasTank <= 0) {
        gasTank = 0;
        gameOver = true;
        inProgress = false;
        play = false;
        gameOverElement.style.display = 'block';
        blackBackground.style.display = 'block';
        restartButton.style.display = 'block';
    }
    scoreElement.innerHTML = 'Score: ' + Math.floor(framesPassed);
    gasTankCurrentElement.style.width = ((gasTank / gasTankMax) * 100) + "%";
    
    // dnevno/nočni cikel
    if ((sunAngle % (Math.PI * 2)) < Math.PI) {
        sunAngle += 0.001 * gameSpeed;
        light.getComponentOfType(Transform).translation = [600*Math.cos(sunAngle),600*Math.sin(sunAngle), 0];
        light.getComponentOfType(Light).ambient = 0.15 + 0.15 * Math.sin(sunAngle);
    } else {
        sunAngle += 0.002 * gameSpeed; // noč je krajša
        light.getComponentOfType(Transform).translation = vec3.add(vec3.create(), avto.getComponentOfType(Transform).translation, [0, 8, 0]);
        light.getComponentOfType(Light).ambient = 0.05;
    }
}

//render() se kliče za vsak izris frejma!
function render() {

    if (!doRender) return; // ob pritisku Space se ustavi

    const pos = avto != null ? avto.getComponentOfType(Transform).translation : [0, 0, 0];
    
    if (play) {

        everyFrame();

        // vožnja avta

        // rotacije avta glede phi

        const rotationQuaternion = quat.create(avto.getComponentOfType(Transform).rotation);

        quat.fromEuler(rotationQuaternion, 90, -phi * 180 / Math.PI - 90, 0);
        avto.getComponentOfType(Transform).rotation = rotationQuaternion;
    
        // premik avta v smeri phi

        const motionVec = getMotionVector(phi);

        vec3.add(pos, pos, motionVec)
        pos[1] = vehicleOffsetsY[imeAvta];

        avto.getComponentOfType(Transform).translation = pos;
        
    }

    // premik kamere glede na avto

    camera.getComponentOfType(Transform).translation = pos.map((el, i) => el + cameraOffset[i]);


    // render izris
    renderer.render(scene, camera, light);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();