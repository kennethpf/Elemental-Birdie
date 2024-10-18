precision mediump float;

uniform float time;         // Time variable to animate the water
uniform vec2 resolution;    // Resolution (size) of the water area

void main(void) {
    // Normalized coordinates of the fragment (from 0.0 to 1.0)
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Flip the y-coordinate to reverse the rendering vertically
    uv.y = 1.0 - uv.y;

    // Create a wavy effect using sine function based on x coordinate and time
    float wave = sin(uv.x * 10.0 + time * 2.0) * 0.02;  // Adjust amplitude of the wave

    // Combine the wave with the Y-coordinate for a more natural surface effect
    uv.y += wave;

    // Calculate the transparency gradient, making the top (now flipped) more transparent
    float alpha = smoothstep(0.3, 0.4, uv.y);  // Ensure smooth blending at the new surface (flipped)

    // Define the blue component of the water color
    float blue = smoothstep(0.3 + wave, 0.8 + wave, uv.y);

    // Output the final color of the pixel, with a transparency gradient
    gl_FragColor = vec4(0.0, 0.0, blue, alpha * 0.3);  // RGBA with adjustable alpha for transparency
}