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

/**
 * それっぽいエンベローブを作成する。
 * アタックの音量とサスティンレベルのは同じになっている。
 *
 * attack: 音の立ち上がりの速さを決める。数値大きいほど早い。
 * releaseStart: 音の消え始める時間を決める。数値が大きいほど早い。0.0 から 1.0 の間で指定する。
 * releaseEnd: 音が消え終わる時間を決める。数値が大きいほど早い。0.0 から releaseStart の間で指定する。
 */
float makeEnvelope(float time, float attack, float releaseStart, float releaseEnd) {
  return min(abs(sin(0.5 * TAU * time) * -attack), 1.0) * smoothstep(releaseEnd, releaseStart, 1.0 - fract(time));
}

/**
 * 音 A を作る。
 *
 * time: 経過した秒数。
 * duration: 音の長さ。
 * volume: 音の大きさ。
 * frequency: 音の高さ（周波数）。
 */
float makeSaundA(float time, float duration, float volume, float frequency){
  /**
   * その秒数における波長の進行度。
   * 最大値は frequency の値。
   */
  float progress = frequency * time;

  /**
   * 基本となる音。
   */
  float baseSound = sin(TAU * progress) * 0.98 + noise(time) * 0.02;

  /**
   * エンベロープ。
   */
  float envelope = makeEnvelope(time / duration, 10.0, 0.8, 0.4);

  return baseSound * envelope * volume;
}

/**
 * 音 B を作る。
 *
 * time: 経過した秒数。
 * duration: 音の長さ。
 * volume: 音の大きさ。
 * frequency: 音の高さ（周波数）。
 */
float makeSaundB(float time, float duration, float volume, float frequency){
  /**
   * その秒数における波長の進行度。
   * 最大値は frequency の値。
   */
  float progress = frequency * time;

  /**
   * 基本となる音。
   */
  float baseSound = sign(0.1 - fract(progress));

  /**
   * エンベロープ。
   */
  float envelope = makeEnvelope(time / duration, 10.0, 0.8, 0.7);

  return baseSound * envelope * volume;
}

/**
 * 音 C を作る。
 *
 * time: 経過した秒数。
 * duration: 音の長さ。
 * volume: 音の大きさ。
 * frequency: 音の高さ（周波数）。
 */
float makeSaundC(float time, float duration, float volume, float frequency){
  /**
   * その秒数における波長の進行度。
   * 最大値は frequency の値。
   */
  float progress = frequency * time;

  /**
   * 基本となる音。
   */
  float baseSound = asin(sin(TAU * progress)) / RIGHT_ANGLE * 0.5 + noise(time) * 0.5;

  /**
   * エンベロープ。
   */
  float envelope = makeEnvelope(time / duration, 20.0, 0.8, 0.2);

  return baseSound * envelope * volume;
}

void main(void){
  float frame = float(gl_VertexID); // 頂点データのインデックスをフレーム数として使う。
  float time = frame / sampleRate; // 経過した秒数。

  float speed = 1.0; // 音の速さ。大きいほど遅くなる。

  // 適当に複数の音を合わせる。
  sound = 
    makeSaundA(time, 1.0 * speed, 1.2, 55.0) +
    makeSaundA(time, 0.4 * speed, 0.4, 110.0) +
    makeSaundA(time, 0.1 * speed, 0.1, 220.0) +
    makeSaundB(time, 0.2 * speed, 0.02, 880.0) +
    makeSaundB(time, 0.4 * speed, 0.03, 440.0) +
    makeSaundC(time, 0.8 * speed, 0.2, 110.0) +
    makeSaundC(time, 0.2 * speed, 0.1, 220.0);
}
`;
