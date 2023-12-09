export class Light {

    // constructor({
    //     ambient = 0.7,
    // } = {}) {
    //     this.ambient = ambient;
    // }
    constructor({
        ambient = 0.7,
        direction = [0, 0, -1], // Default spotlight direction (adjust as needed)
        coneAngle = Math.PI,    // Default cone angle (adjust as needed)
    } = {}) {
        this.ambient = ambient;
        this.direction = direction;
        this.coneAngle = coneAngle;
    }

}
