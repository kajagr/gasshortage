import { Transform } from '../core.js';
import { vec3, quat } from '../../../lib/gl-matrix-module.js';

export class BetterLinearAnimator {

    constructor(node, {
        startPosition = [0, 0, 0],
        endPosition = [0, 0, 0],
        startTime = 0,
        duration = 1,
        loop = false,
    } = {}) {
        this.node = node;

        this.startPosition = startPosition;
        this.originalStartPosition = startPosition;
        this.endPosition = endPosition;

        this.distanceVector = vec3.fromValues(Math.abs(this.endPosition[0]), Math.abs(this.endPosition[1]), Math.abs(this.endPosition[2]));

        this.startTime = startTime;
        this.duration = duration;
        this.originalDuration = duration;
        this.loop = loop;

        this.playing = true;

        this.currentPosition = this.startPosition;
        this.lastStopPosition = this.startPosition;
        this.elapsedTime = 0; // Track elapsed time when paused
        this.time = 0;
    }

    play() {
        this.playing = true;
        this.startTime = this.time - this.elapsedTime;
        this.duration = this.originalDuration;
    }

    pause() {
        this.playing = false;
        console.log(this.currentPosition, '\n', this.lastStopPosition);
        this.lastStopPosition = this.currentPosition;
        this.elapsedTime = this.time - this.startTime;
    }

    update(t, dt) { // dt je razlika me trenutnim in prejšnjit framom
        this.time = t;
        if (!this.playing) {
            return;
        }

        const linearInterpolation = (t - this.startTime) / this.duration;
        const clampedInterpolation = Math.min(Math.max(linearInterpolation, 0), 1);
        const loopedInterpolation = ((linearInterpolation % 1) + 1) % 1;
        

        if (this.loop && linearInterpolation >= 1) {
            this.startTime = t;
            this.elapsedTime = 0;
            //spodaj zakomentiraj, če nočes da loopa na mestu ampka se premika naprej
            this.startPosition = this.endPosition; 
            
            const tmp = vec3.fromValues(this.endPosition[0], this.endPosition[1],this.endPosition[2]);
            const rez = vec3.create();
            //vec3.scale(rez, tmp, 2); //mogoče uporabno za neko pospeševanje?'
            vec3.add(rez, tmp, this.distanceVector);
            this.endPosition = rez;
            

            console.log("Loop completed at:", t, "on x=",this.endPosition[0],"y=",this.endPosition[1],"z=",this.endPosition[2]); 
        }


        this.updateNode(this.loop ? loopedInterpolation : clampedInterpolation);
        this.elapsedTime = t - this.startTime; // Store elapsed time, for stop
    }

    updateNode(interpolation) {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        //ROTACIJA
        // const rotationAngle = Math.PI * 2 * interpolation*50; // Full rotation during the animation
        // quat.fromEuler(transform.rotation, 0, rotationAngle, 0);
        
        //ostanki kode
        // transform.translation[0] = radius * Math.cos(rotationAngle);
        // transform.translation[1] = 0; // Keep the Y-coordinate constant (you can change this if needed)
        // transform.translation[2] = radius * Math.sin(rotationAngle);
        // const radius = 0.5;
        // const time = this.duration / 1000;
        // const frequency = 0.5;
        // const x = radius * Math.cos(frequency * time * 2 * Math.PI);
        // const y = radius * Math.sin(frequency * time * 2 * Math.PI);
        // quat.identity(transform.rotation);
        // // quat.rotateX(transform.rotation, transform.rotation, time);
        // // quat.rotateY(transform.rotation, transform.rotation, time);
        // quat.fromEuler(transform.rotation, 0, x, 0);

        // premikanje naporej
        this.currentPosition = vec3.lerp(transform.translation, this.startPosition, this.endPosition, interpolation);
    }

}
