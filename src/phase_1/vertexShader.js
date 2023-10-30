export const vertexShaderScript = `#version 300 es
precision highp float;

#define TAU 6.28318530718 // 2π
#define RIGHT_ANGLE 1.57079632679 // π/2

uniform float sampleRate;

out float sound;

/**
 * シードを元にノイズ（乱数）を生成する。
 */  
float noise(float seed) {
  return fract(sin(dot(vec2(seed), vec2(12.9898, 78.233))) * 43758.5453123);
}

void main(void){
  float frame = float(gl_VertexID); // 頂点データのインデックスをフレーム数として使う。
  float time = frame / sampleRate; // 経過した秒数。

  // Step 1. 音量（振幅）と周波数（１秒間に発生する波の数）を決める。

  float volume = 0.2; // 音量。
  float frequency = 440.0; // 周波数。Hz（ヘルツ）で指定する。

  /**
   * その秒数における波長の進行度。
   * 最大値は frequency の値。
   */
  float progress = frequency * time;

  // Step 2. 音色を作る。
  // 波の形状で音色が変わる。
  // -1.0 から 1.0 までの値を取る。

  /**
   * 正弦波。
   * \sin(\tau x)
   */
  float baseSound = sin(TAU * progress);

  /**
   * 三角波。
   * \arcsin(\sin(\tau*x))/(0.25*\tau)
   */
  // float baseSound = asin(sin(TAU * progress)) / RIGHT_ANGLE;

  /**
   * 矩形波（デューティ比：0.5）。
   * \operatorname{sgn}\left(0.5-\operatorname{mod}\left(x,1\right)\right)
   */
  // float baseSound = sign(0.5 - fract(progress));

  /**
   * パルス波（デューティ比：0.1）。
   * \operatorname{sgn}\left(0.1-\operatorname{mod}\left(x,1\right)\right)
   */
  // float baseSound = sign(0.1 - fract(progress));

  /**
   * のこぎり波。
   * 1-\operatorname{mod}\left(x,1\right)\cdot2
   */
  // float baseSound = 1.0 - (fract(progress) * 2.0);

  /**
   * ノイズ波。
   * progress だと数値が大きくなりすぎるのか、パターンを感じるため time を使う。
   */
  // float baseSound = noise(time);

  // Step 3. エンベロープを作る。
  // 時間経過により振幅を変化させる。
  // 音色に関連する。
  // 0.0 から 1.0 までの値を取る。

  float envelope = 1.0;

  /**
   * 線形補間エンベロープ。
   * 1-\operatorname{mod}\left(x,1\right)
   */
  // envelope = (1.0 - fract(time));

  /**
   * エルミート補間エンベロープ。
   * f_{saturate}\left(x\right)=\min\left(\max\left(x,0\right),1\right)
   * f_{fractpoint}\left(x\right)=1-\operatorname{mod}\left(x,1\right)
   * t=f_{saturate}\left(\frac{f_{fractpoint}\left(x\right)-a}{b-a}\right)
   * a=0
   * b=1
   * -2t^{3}+3t^{2}
   */
  // envelope = smoothstep(0.0, 1.0, 1.0 - fract(time));

  /**
   * 指数関数エンベロープ。
   * \left(1-\operatorname{mod}\left(x,1\right)\right)\cdot\left(\exp\left(\operatorname{mod}\left(x,\ 1\right)\cdot-5\right)\right)
   */
  // envelope = (1.0 - mod(time, 1.0)) * exp(mod(time, 1.0) * -5.0);

  /**
   * 適当なエンベロープ。
   * \left(1-\operatorname{mod}\left(x,1\right)\right)\cdot\left(\exp\left(\operatorname{mod}\left(x,\ 1\right)\cdot b\right)\right)\cdot\operatorname{abs}\left(\sin\left(0.5\tau x\right)\right)\cdot a
   * a=9.6
   * b=-10
   */
  // envelope = (1.0 - mod(time, 1.0)) * exp(mod(time, 1.0) * -10.0) * abs(sin(0.5 * TAU * progress)) * 9.6;

  // Step 4.最終的に出力される音を作る。
  // 基本の音色にエンベロープと音量を掛け合わせる。
  sound = baseSound * envelope * volume;
}
`;
