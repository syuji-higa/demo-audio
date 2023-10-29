import { vertexShaderScript } from './vertexShader.js?v114'; 
import { fragmentShaderScript } from './fragmentShader.js?v1'; 

window.addEventListener('DOMContentLoaded', main);

function main() {
  // WebGL2コンテキストを取得する。
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl2');

  // 描画をしないのでラスタライザを無効化する。
  gl.enable(gl.RASTERIZER_DISCARD);

  // 頂点シェーダを作成する。
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderScript);
  gl.compileShader(vertexShader);

  // フラグメントシェーダを作成する。
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderScript);
  gl.compileShader(fragmentShader);

  // プログラムを作成して、シェーダに設定する。
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.transformFeedbackVaryings(program, ['sound'], gl.SEPARATE_ATTRIBS);
  gl.linkProgram(program);
  gl.useProgram(program);

  /** オーディオの秒数。 */
  const audioSeconds = 10;
  
  /**
   * サンプリングレート。
   * 1秒ごとにサンプリングする数。
   */
  const sampleRate = 44100;

  /** サンプルの総量。 */
  const sampleLength = sampleRate * audioSeconds;

  // サンプリングレートをシェーダに渡す。
  const uniformLocation = new Array();
  uniformLocation[0] = gl.getUniformLocation(program, 'sampleRate');
  gl.uniform1f(uniformLocation[0], sampleRate);
  
  /** トランスフォームフィードバックの結果を格納するバッファ。 */
  const arrayBuffer = new Float32Array(sampleLength);
  
  // トランスフォームフィードバックを行い、計算結果をバッファに格納する。
  const vertexTransformFeedbackBuffer = gl.createBuffer();
  const transformFeedback = gl.createTransformFeedback();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTransformFeedbackBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sampleLength * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_COPY);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertexTransformFeedbackBuffer);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, sampleLength);
  gl.endTransformFeedback();
  gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, arrayBuffer);

  // オーディオコンテキストを作成する。
  const audioContext = new AudioContext();

  /**
   * オーディオバッファ。
   * 音を鳴らすためのデータを格納する。
   **/
  const audioBuffer = audioContext.createBuffer(2, sampleLength, sampleRate);

  // トランスフォームフィードバックの結果をオーディオバッファに設定する。
  for (let i = 0; i < 2; i++) {
    const bufferring = audioBuffer.getChannelData(i);
    bufferring.set(arrayBuffer);
  }

  // オーディオバッファをもとに音声ソースを作成する。
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.loop = true;

  // ボタンを押すと、音を鳴らすようにする。
  // 次に押すと、音を止めるようにする。
  const playButton = document.getElementById('play');
  playButton.addEventListener('click', () => {
    switch (audioContext.state) {
      case 'running': {
        source.stop();
        break;
      }
      case 'suspended': {
        source.start();
        break;
      }
      default:
        break;
    }
  });
}
