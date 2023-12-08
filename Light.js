// export class Light {

//     constructor({
//         ambient = 0,
//     } = {}) {
//         this.ambient = ambient;
//     }

// }
export class Light {

    constructor({
        color = [255, 255, 255],
        intensity = 1,
        attenuation = [0.001, 0, 0.3],
        //ambient = 0.7,
    } = {}) {
        this.color = color;
        this.intensity = intensity;
        this.attenuation = attenuation;
        //this.ambient = ambient;
    }

}
