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

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/scena.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

// postavitev kamere
const camera = scene.find(node => node.getComponentOfType(Camera));
camera.components[1].far = 1000;
const cameraOffset = [50,120,120]
camera.getComponentOfType(Transform).rotation = [-0.33, 0.2, 0.15, 1];

// specifikacije igre

const avto = gltfLoader.loadNode('mustang')
var carSpeed = 0.2;
var carTurnSpeed = 5;
var phi = 0;

var play = true;

//

// game controls: <Space> = pavza, <A> = levo, <D> = desno
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' || event.key === ' ') {
        console.log('Stop!');
        //probi dostopat do linear animatorja drugače kot po indexu, bolj sigurno
        console.log(avto.components)
        if(play){
            play = false;
        } else {
            play = true;
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
}

function getMotionVector(phi) {
    const magnitude = carSpeed;
    const x = magnitude * Math.cos(phi);
    const z = magnitude * Math.sin(phi);

    return vec3.fromValues(x, 0, z);
}

//render() se kliče za vsak izris frejma!
function render() {

    if (!play) return; // ob pritisku Space se ustavi

    // rotacije avta glede phi

    const rotationQuaternion = quat.create(avto.getComponentOfType(Transform).rotation);

    quat.fromEuler(rotationQuaternion, 90, -phi * 180 / Math.PI - 90, 0);
    avto.getComponentOfType(Transform).rotation = rotationQuaternion;

    // premik avta v smeri phi

    const motionVec = getMotionVector(phi);

    const pos = vec3.create();

    vec3.add(pos, avto.getComponentOfType(Transform).translation, motionVec)

    avto.getComponentOfType(Transform).translation = pos;

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
