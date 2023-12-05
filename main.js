import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import { OrbitController } from './common/engine/controllers/OrbitController.js';
// import { RotateAnimator } from './common/engine/animators/RotateAnimator.js';
import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';
import { BetterLinearAnimator } from './common/engine/animators/BetterLinearAnimator.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from './common/engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';
import { Map } from './Filip.js'
import { Car } from './Kristjan.js'
import { RotateAnimator } from './common/engine/animators/RotateAnimator.js';
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

// postavitev kamere
const camera = scene.find(node => node.getComponentOfType(Camera));
camera.components[1].far = 1000;
const cameraOffset = [120, 120*Math.sqrt(2), 120]
camera.getComponentOfType(Transform).rotation = quat.fromEuler(quat.create(), -45, -45 + 90, 0);

/* const cameraOffset = [50,120,120]
camera.getComponentOfType(Transform).rotation = [-0.33, 0.2, 0.15, 1]; */

// specifikacije igre

const avto = gltfLoader.loadNode('mustang')

const defaultCarSpeed = 0.3;
const defaultCarTurnSpeed = 5;
const defaultPhi = 0;

var carSpeed = defaultCarSpeed;
var carTurnSpeed = defaultCarTurnSpeed;
var phi = defaultPhi;
const defaultPoraba = 0.025;

var play = false;
var doRender = true;
var gameOver = false;

var timeDriving = 0;
var gasTankMax = 100;
var gasTank = gasTankMax;
var poraba = defaultPoraba;

// zaznavanje trkov

avto.isDynamic = true;

const mapa = avto.parent;
mapa.children.forEach((objekt) => {
    if (objekt != camera && objekt != avto) {
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

//

// game controls: <Space> = pavza, <A> = levo, <D> = desno
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' || event.key === ' ') {
        if (!gameOver) {
            if(play){
                play = false;
                clearInterval(timer);
                blackBackground.style.display = 'block';
                pauseElement.style.display = 'block';
            } else {
                play = true;
                countDrivingTime();
                blackBackground.style.display = 'none';
                pauseElement.style.display = 'none';
            }
        }
    }
    else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        phi += Math.PI / 180 * carTurnSpeed;
    }
    else if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        phi += - Math.PI / 180 * carTurnSpeed;
    } 
});
document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        phi += Math.PI / 180 * carTurnSpeed;
    }
    else if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        phi += - Math.PI / 180 * carTurnSpeed;
    } 
});

//

const playButton = document.querySelector('#playButton');
const gasTankMaxElement = document.querySelector('#gasTankMax');
const gasTankCurrentElement = document.querySelector('#gasTankCurrent');
const timerElement = document.querySelector('#timer');
const blackBackground = document.querySelector('#popup-background');
const pauseElement = document.querySelector('#pause');
const gameOverElement = document.querySelector('#gameOver');
const restartButton = document.querySelector('#restartButton');

playButton.addEventListener('click', () => {
    playButton.style.display = 'none';
    gasTankMaxElement.style.display = 'block';
    timerElement.style.display = 'block';
    blackBackground.style.display = 'none';
    play = true;
    countDrivingTime();
});

restartButton.addEventListener('click', () => {
    carSpeed = defaultCarSpeed;
    carTurnSpeed = defaultCarTurnSpeed;
    phi = defaultPhi;
    timeDriving = 0;
    gasTank = gasTankMax;
    poraba = defaultPoraba;
    gameOver = false;
    avto.getComponentOfType(Transform).translation = [0,0,0];
    play = true;
    countDrivingTime();
    blackBackground.style.display = 'none';
    gameOverElement.style.display = 'none';
    restartButton.style.display = 'none';
});

//

var timer;

Number.prototype.toHHMMSS = function () {
    var minutes = Math.floor(this / 60000).toFixed(0);
    var seconds = ((this % 60000) / 1000).toFixed(0);
    var milliseconds = ((this % 1000) / 10).toFixed(0);
    if (seconds == 60) {
        minutes++;
        seconds = 0;
    }
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ":" + (milliseconds < 10 ? '0' : '') + milliseconds;
}

function countDrivingTime(){
    timer = setInterval(function() {
        timeDriving++;
        gasTank -= poraba;
        if (timeDriving % 1000 == 0) {
            carSpeed += 0.05;
            poraba += 0.005;
            console.log(carSpeed, poraba);
        }
        if (gasTank <= 0) {
            clearInterval(timer);
            gasTank = 0;
            gameOver = true;
            play = false;
            gameOverElement.style.display = 'block';
            blackBackground.style.display = 'block';
            restartButton.style.display = 'block';
        }
        timerElement.innerHTML = '<i class="fa-solid fa-hourglass-end"></i> ' +(timeDriving*10).toHHMMSS();
        gasTankCurrentElement.style.width = ((gasTank / gasTankMax) * 100) + "%";
      }, 10);
}

//

const light = new Node();
light.addComponent(new Light({
    ambient: 1,
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

function getMotionVector(phi) {
    const magnitude = carSpeed;
    const x = magnitude * Math.cos(phi);
    const z = magnitude * Math.sin(phi);

    return vec3.fromValues(x, 0, z);
}

//render() se kliče za vsak izris frejma!
function render() {

    if (!doRender) return; // ob pritisku Space se ustavi

    const pos = avto.getComponentOfType(Transform).translation;

    if (play) {

        // rotacije avta glede phi

        const rotationQuaternion = quat.create(avto.getComponentOfType(Transform).rotation);

        quat.fromEuler(rotationQuaternion, 90, -phi * 180 / Math.PI - 90, 0);
        avto.getComponentOfType(Transform).rotation = rotationQuaternion;

        // premik avta v smeri phi

        const motionVec = getMotionVector(phi);

        vec3.add(pos, pos, motionVec)
        pos[1] = 0;

        avto.getComponentOfType(Transform).translation = pos;

    }

    // premik kamere glede na avto

    camera.getComponentOfType(Transform).translation = pos.map((el, i) => el + cameraOffset[i]);


    // render izris
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
