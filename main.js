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

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/scena.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const camera = scene.find(node => node.getComponentOfType(Camera));
camera.components[1].far = 1000;
camera.addComponent(new OrbitController(camera, document.body, {
    distance: 50,
}));

// update dvaducata Listopad MMXXIII
//console.log(scene)
const opica = gltfLoader.loadNode('Suzanne')
opica.addComponent(new Transform({
    //translatio: [0,10,100],
    rotation: [0,-1,0, 1]
}))
//linear animator brez "space"
// opica.addComponent(new LinearAnimator(opica, {
//     startPosition: [30, 0, 0],
//     endPosition: [-30, 0, 0],
//     duration: 10,
//     loop: true,
// }));

//trenutna verzija
opica.addComponent(new BetterLinearAnimator(opica, {
    startPosition: [30, 0, 0],
    endPosition: [-30, 0, 0],
    duration: 10,
    loop: true,
}));

//TODO veži rotation animator na levo in desno tipko!
//retardirano, lahko pogledaš kako dela za zabavo, za enkrat ne uporabljamo rotation animatorja
//opica.addComponent(new RotateAnimator(opica, {
//    startRotation: [0,0,0,0],
//     endRotation: [0,0,3,0],
//     duration: 10,
//     loop: true
//}))

var play = true;
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' || event.key === ' ') {
        console.log('Space key pressed!');
        //probi dostopat do linear animatorja drugače kot po indexu, bolj sigurno
        //console.log(opica.components[3])
        if(play){
            opica.components[3].pause();
            play = false;
        } else {
            opica.components[3].play();
            play = true;
        }
    }
});

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

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
