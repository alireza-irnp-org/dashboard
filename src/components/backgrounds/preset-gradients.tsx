import Grainient from "./grainient";

// https://reactbits.dev/tools/background-studio?bg=grainient&color1=68759c&color2=0c003d&color3=594c85&timeSpeed=0&noiseScale=0&grainAmount=0&grainScale=0.2

const darkGrainient = (
  <Grainient
    color1="#68759c"
    color2="#0c003d"
    color3="#594c85"
    timeSpeed={0.25}
    colorBalance={0}
    warpStrength={1}
    warpFrequency={5}
    warpSpeed={2}
    warpAmplitude={50}
    blendAngle={0}
    blendSoftness={0.05}
    rotationAmount={500}
    noiseScale={0}
    grainAmount={0}
    grainScale={2}
    grainAnimated={false}
    contrast={1.5}
    gamma={1}
    saturation={1}
    centerX={0}
    centerY={0}
    zoom={0.9}
  />
);

const lightGrainient = (
  <Grainient
    color1="#d0d7ec"
    color2="#bdbbc3"
    color3="#c6b8f4"
    timeSpeed={0.25}
    colorBalance={0}
    warpStrength={1}
    warpFrequency={5}
    warpSpeed={2}
    warpAmplitude={50}
    blendAngle={0}
    blendSoftness={0.05}
    rotationAmount={500}
    noiseScale={0}
    grainAmount={0}
    grainScale={2}
    grainAnimated={false}
    contrast={1.5}
    gamma={1}
    saturation={1}
    centerX={0}
    centerY={0}
    zoom={0.9}
  />
);
