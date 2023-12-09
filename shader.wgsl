struct VertexInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition : vec4f,
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct FragmentInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct FragmentOutput {
    @location(0) color : vec4f,
}

struct CameraUniforms {
    viewMatrix : mat4x4f,
    projectionMatrix : mat4x4f,
}

struct ModelUniforms {
    modelMatrix : mat4x4f,
    normalMatrix : mat3x3f,
}

struct MaterialUniforms {
    baseFactor : vec4f,
}

struct LightUniforms {
    position : vec3f,
    ambient : f32,
    direction: vec3f,
    coneAngle: f32,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;

@group(1) @binding(0) var<uniform> model : ModelUniforms;

@group(2) @binding(0) var<uniform> material : MaterialUniforms;
@group(2) @binding(1) var baseTexture : texture_2d<f32>;
@group(2) @binding(2) var baseSampler : sampler;

@group(3) @binding(0) var<uniform> light : LightUniforms;

@vertex
fn vertex(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;

    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);

    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;

    return output;
}

@fragment
fn fragment(input : FragmentInput) -> FragmentOutput {
     var output : FragmentOutput;

    let N = normalize(input.normal);
    let L = normalize(light.position - input.position);

    let lambert = max(dot(N, L), 0);


    let materialColor = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;
    let lambertFactor = vec4(vec3(lambert), 1);
    let ambientFactor = vec4(vec3(light.ambient), 1);
    output.color = materialColor * (lambertFactor + ambientFactor);
    //    let ambientFactor = vec4(vec3(light.ambient), 1);
    // output.color = materialColor * ambientFactor;

    return output;
    // var output : FragmentOutput;

    // let N = normalize(input.normal);
    // let L = normalize(light.position - input.position);
    // let lambert = max(dot(N, L), 0.0);

    // var finalColor: vec3<f32>;
    // let materialColor = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;
    // if (light.coneAngle == 360.0) {
    //     // Directional light (360 degrees)

    //     let lambertFactor = vec4(vec3(lambert), 1);
    //     let ambientFactor = vec4(vec3(light.ambient), 1);
        
    //      finalColor = vec3(lambert) * vec3(light.ambient);
    //     //output.color = materialColor * (lambertFactor + ambientFactor);
    // } else {
    //     // Spotlight
    //     let spotDirection = normalize(light.direction);
    //     let spotIntensity = max(dot(-spotDirection, normalize(L)), 0.0);
    //     let spotlightEffect = smoothstep(cos(light.coneAngle), 1.0, spotIntensity);
        
    //     let lambert = max(dot(N, L), 0);
    //     let directionalLighting = vec3(lambert) * spotlightEffect;
        
    //     let ambientLighting = vec3(light.ambient);
        
    //     finalColor = ambientLighting + directionalLighting;
    // }
    // // Calculate spotlight direction and intensity based on the cone angle
    // output.color = vec4(materialColor.rgb * finalColor, 1.0);
    // return output;
}
