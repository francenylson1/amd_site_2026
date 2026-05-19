/* ============================================================
   MÓDULO DE ANIMAÇÕES GPIO — Aluno Maker Digital
   Visualizador interativo de circuitos para RPi5, ESP8266 e ESP32
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   Paleta de cores (pinos por função)
   ────────────────────────────────────────────── */
const PIN_COLORS = {
  power33:  '#c0392b', // 3V3
  power5:   '#e74c3c', // 5V
  gnd:      '#2c2c2c', // GND
  gpio:     '#0066ff', // GPIO genérico
  i2c:      '#8e44ad', // I2C (SDA/SCL)
  spi:      '#f39c12', // SPI
  uart:     '#27ae60', // UART
  adc:      '#16a085', // ADC/analógico
  dac:      '#1abc9c', // DAC
  touch:    '#2980b9', // Touch
  special:  '#95a5a6', // RST, EN, BOOT
};

/* ──────────────────────────────────────────────
   GPIOTemplate — classe base abstrata
   ────────────────────────────────────────────── */
class GPIOTemplate {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.pins = [];
    this._buildPins();
  }

  _buildPins() { /* implementado por subclasse */ }

  render() { /* implementado por subclasse */ }

  highlightPin(pinId, color = '#00e5ff', radius = 8) {
    const pin = this.getPin(pinId);
    if (!pin) return;
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.arc(pin.x, pin.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  getPin(pinId) {
    return this.pins.find(p => p.id === pinId) || null;
  }

  _drawLabel(text, x, y, color = '#e0e8ff', fontSize = 9, align = 'center') {
    const { ctx } = this;
    ctx.save();
    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _drawTitle(text) {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.font = "bold 14px 'Orbitron', monospace";
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, canvas.width / 2, 14);
    ctx.restore();
  }

  _clearCanvas() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this._drawGrid();
  }

  _drawGrid() {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   RPi5Template — Raspberry Pi 5 (40 pinos 2×20)
   ────────────────────────────────────────────── */
class RPi5Template extends GPIOTemplate {
  _buildPins() {
    // Mapa físico → { gpio, função, cor }
    const map = {
      1:  { label: '3V3',       fn: 'power33', color: PIN_COLORS.power33 },
      2:  { label: '5V',        fn: 'power5',  color: PIN_COLORS.power5  },
      3:  { label: 'GPIO2/SDA', fn: 'i2c',     color: PIN_COLORS.i2c    },
      4:  { label: '5V',        fn: 'power5',  color: PIN_COLORS.power5  },
      5:  { label: 'GPIO3/SCL', fn: 'i2c',     color: PIN_COLORS.i2c    },
      6:  { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      7:  { label: 'GPIO4',     fn: 'gpio',    color: PIN_COLORS.gpio   },
      8:  { label: 'GPIO14/TX', fn: 'uart',    color: PIN_COLORS.uart   },
      9:  { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      10: { label: 'GPIO15/RX', fn: 'uart',    color: PIN_COLORS.uart   },
      11: { label: 'GPIO17',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      12: { label: 'GPIO18',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      13: { label: 'GPIO27',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      14: { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      15: { label: 'GPIO22',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      16: { label: 'GPIO23',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      17: { label: '3V3',       fn: 'power33', color: PIN_COLORS.power33 },
      18: { label: 'GPIO24',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      19: { label: 'GPIO10/MOSI',fn:'spi',     color: PIN_COLORS.spi   },
      20: { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      21: { label: 'GPIO9/MISO', fn:'spi',     color: PIN_COLORS.spi   },
      22: { label: 'GPIO25',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      23: { label: 'GPIO11/SCLK',fn:'spi',     color: PIN_COLORS.spi   },
      24: { label: 'GPIO8/CE0', fn: 'spi',     color: PIN_COLORS.spi   },
      25: { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      26: { label: 'GPIO7/CE1', fn: 'gpio',    color: PIN_COLORS.gpio   },
      27: { label: 'GPIO0/ID_SD',fn:'gpio',    color: PIN_COLORS.gpio   },
      28: { label: 'GPIO1/ID_SC',fn:'gpio',    color: PIN_COLORS.gpio   },
      29: { label: 'GPIO5',     fn: 'gpio',    color: PIN_COLORS.gpio   },
      30: { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      31: { label: 'GPIO6',     fn: 'gpio',    color: PIN_COLORS.gpio   },
      32: { label: 'GPIO12',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      33: { label: 'GPIO13',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      34: { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      35: { label: 'GPIO19',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      36: { label: 'GPIO16',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      37: { label: 'GPIO26',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      38: { label: 'GPIO20',    fn: 'gpio',    color: PIN_COLORS.gpio   },
      39: { label: 'GND',       fn: 'gnd',     color: PIN_COLORS.gnd    },
      40: { label: 'GPIO21',    fn: 'gpio',    color: PIN_COLORS.gpio   },
    };

    // Layout 2×20: pinos ímpares = coluna esquerda, pares = coluna direita
    const startX = 130, startY = 60, stepX = 52, stepY = 20;
    for (let row = 0; row < 20; row++) {
      const oddPin  = 2 * row + 1;
      const evenPin = 2 * row + 2;
      const y = startY + row * stepY;
      if (map[oddPin])  this.pins.push({ id: oddPin,  x: startX,          y, ...map[oddPin]  });
      if (map[evenPin]) this.pins.push({ id: evenPin, x: startX + stepX,  y, ...map[evenPin] });
    }
  }

  render() {
    const { ctx } = this;
    this._clearCanvas();
    this._drawTitle('Raspberry Pi 5 — GPIO Header (40 pinos)');

    const radius = 7;
    this.pins.forEach(pin => {
      // círculo do pino
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = pin.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // número do pino
      this._drawLabel(String(pin.id), pin.x, pin.y, '#fff', 7);

      // rótulo lateral
      const isLeft = pin.id % 2 === 1;
      const labelX = isLeft ? pin.x - radius - 4 : pin.x + radius + 4;
      const align  = isLeft ? 'right' : 'left';
      this._drawLabel(pin.label, labelX, pin.y, '#7494b4', 8, align);
    });

    // Corpo do SoC
    this._drawBoard();
  }

  _drawBoard() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#1a2a1a';
    ctx.strokeStyle = '#2d4a2d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(340, 50, 120, 350, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 10px 'Rajdhani', sans-serif";
    ctx.fillStyle = '#4a7a4a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BCM2712', 400, 175);
    ctx.fillText('RPi5', 400, 190);
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   ESP8266Template — NodeMCU (D0-D8 + A0)
   ────────────────────────────────────────────── */
class ESP8266Template extends GPIOTemplate {
  _buildPins() {
    const leftPins = [
      { id: 'D0',  label: 'D0/GPIO16', fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: 'D1',  label: 'D1/SCL',    fn: 'i2c',     color: PIN_COLORS.i2c     },
      { id: 'D2',  label: 'D2/SDA',    fn: 'i2c',     color: PIN_COLORS.i2c     },
      { id: 'D3',  label: 'D3/Boot',   fn: 'special', color: PIN_COLORS.special },
      { id: 'D4',  label: 'D4/LED',    fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: 'D5',  label: 'D5/SCLK',   fn: 'spi',     color: PIN_COLORS.spi    },
      { id: 'D6',  label: 'D6/MISO',   fn: 'spi',     color: PIN_COLORS.spi    },
      { id: 'D7',  label: 'D7/MOSI',   fn: 'spi',     color: PIN_COLORS.spi    },
      { id: 'D8',  label: 'D8/CS',     fn: 'spi',     color: PIN_COLORS.spi    },
      { id: 'GND', label: 'GND',        fn: 'gnd',     color: PIN_COLORS.gnd   },
      { id: '5V',  label: '5V/VIN',    fn: 'power5',  color: PIN_COLORS.power5  },
      { id: '3V3', label: '3V3',        fn: 'power33', color: PIN_COLORS.power33 },
    ];
    const rightPins = [
      { id: 'RST', label: 'RST',   fn: 'special', color: PIN_COLORS.special },
      { id: 'A0',  label: 'A0/ADC',fn: 'adc',     color: PIN_COLORS.adc     },
      { id: 'EN',  label: 'EN',    fn: 'special', color: PIN_COLORS.special },
      { id: 'TX',  label: 'TX',    fn: 'uart',    color: PIN_COLORS.uart    },
      { id: 'RX',  label: 'RX',    fn: 'uart',    color: PIN_COLORS.uart    },
    ];

    const leftX = 120, rightX = 480, startY = 70, stepY = 30;
    leftPins.forEach((p, i) => this.pins.push({ ...p, x: leftX,  y: startY + i * stepY }));
    rightPins.forEach((p, i) => this.pins.push({ ...p, x: rightX, y: startY + i * stepY }));
  }

  render() {
    const { ctx } = this;
    this._clearCanvas();
    this._drawTitle('NodeMCU ESP8266');

    // Módulo
    ctx.save();
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#2a2a5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(155, 55, 300, 370, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 11px 'Rajdhani', sans-serif";
    ctx.fillStyle = '#3a3a7e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ESP8266 NodeMCU', 305, 240);
    ctx.restore();

    const radius = 7;
    this.pins.forEach(pin => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = pin.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      this._drawLabel(pin.id.length <= 3 ? pin.id : pin.id.slice(0,3), pin.x, pin.y, '#fff', 7);

      const isLeft = pin.x < 300;
      const labelX = isLeft ? pin.x - radius - 4 : pin.x + radius + 4;
      const align  = isLeft ? 'right' : 'left';
      this._drawLabel(pin.label, labelX, pin.y, '#7494b4', 8, align);
    });
  }
}

/* ──────────────────────────────────────────────
   ESP32Template — ESP32 DevKit C (38 pinos)
   ────────────────────────────────────────────── */
class ESP32Template extends GPIOTemplate {
  _buildPins() {
    const leftPins = [
      { id: 'EN',   label: 'EN',       fn: 'special', color: PIN_COLORS.special },
      { id: '36',   label: 'GPIO36',   fn: 'adc',     color: PIN_COLORS.adc     },
      { id: '39',   label: 'GPIO39',   fn: 'adc',     color: PIN_COLORS.adc     },
      { id: '34',   label: 'GPIO34',   fn: 'adc',     color: PIN_COLORS.adc     },
      { id: '35',   label: 'GPIO35',   fn: 'adc',     color: PIN_COLORS.adc     },
      { id: '32',   label: 'GPIO32',   fn: 'touch',   color: PIN_COLORS.touch   },
      { id: '33',   label: 'GPIO33',   fn: 'touch',   color: PIN_COLORS.touch   },
      { id: '25',   label: 'GPIO25/DAC',fn:'dac',     color: PIN_COLORS.dac     },
      { id: '26',   label: 'GPIO26/DAC',fn:'dac',     color: PIN_COLORS.dac     },
      { id: '27',   label: 'GPIO27',   fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: '14',   label: 'GPIO14',   fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: '12',   label: 'GPIO12',   fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: 'GND1', label: 'GND',      fn: 'gnd',     color: PIN_COLORS.gnd    },
      { id: '13',   label: 'GPIO13',   fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: 'D2',   label: 'Flash D2', fn: 'special', color: PIN_COLORS.special },
      { id: 'D3',   label: 'Flash D3', fn: 'special', color: PIN_COLORS.special },
      { id: 'CMD',  label: 'CMD',      fn: 'special', color: PIN_COLORS.special },
      { id: '5V',   label: '5V',       fn: 'power5',  color: PIN_COLORS.power5  },
      { id: 'GND2', label: 'GND',      fn: 'gnd',     color: PIN_COLORS.gnd    },
    ];
    const rightPins = [
      { id: '3V3',  label: '3V3',      fn: 'power33', color: PIN_COLORS.power33 },
      { id: 'GND3', label: 'GND',      fn: 'gnd',     color: PIN_COLORS.gnd    },
      { id: '15',   label: 'GPIO15',   fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: '2',    label: 'GPIO2',    fn: 'gpio',    color: PIN_COLORS.gpio    },
      { id: '4',    label: 'GPIO4',    fn: 'touch',   color: PIN_COLORS.touch   },
      { id: '16',   label: 'GPIO16/RX2',fn:'uart',    color: PIN_COLORS.uart    },
      { id: '17',   label: 'GPIO17/TX2',fn:'uart',    color: PIN_COLORS.uart    },
      { id: '5',    label: 'GPIO5/CS', fn: 'spi',     color: PIN_COLORS.spi     },
      { id: '18',   label: 'GPIO18/CLK',fn:'spi',     color: PIN_COLORS.spi     },
      { id: '19',   label: 'GPIO19/MISO',fn:'spi',    color: PIN_COLORS.spi     },
      { id: '21',   label: 'GPIO21/SDA',fn:'i2c',     color: PIN_COLORS.i2c     },
      { id: '3',    label: 'GPIO3/RX0', fn:'uart',    color: PIN_COLORS.uart    },
      { id: '1',    label: 'GPIO1/TX0', fn:'uart',    color: PIN_COLORS.uart    },
      { id: '22',   label: 'GPIO22/SCL',fn:'i2c',     color: PIN_COLORS.i2c     },
      { id: '23',   label: 'GPIO23/MOSI',fn:'spi',    color: PIN_COLORS.spi     },
      { id: 'GND4', label: 'GND',      fn: 'gnd',     color: PIN_COLORS.gnd    },
      { id: 'CLK',  label: 'Flash CLK', fn:'special', color: PIN_COLORS.special },
      { id: 'D0',   label: 'Flash D0', fn: 'special', color: PIN_COLORS.special },
      { id: 'D1',   label: 'Flash D1', fn: 'special', color: PIN_COLORS.special },
    ];

    const leftX = 110, rightX = 490, startY = 55, stepY = 22;
    leftPins.forEach((p, i)  => this.pins.push({ ...p, x: leftX,  y: startY + i * stepY }));
    rightPins.forEach((p, i) => this.pins.push({ ...p, x: rightX, y: startY + i * stepY }));
  }

  render() {
    const { ctx } = this;
    this._clearCanvas();
    this._drawTitle('ESP32 DevKit C — 38 pinos');

    // Módulo
    ctx.save();
    ctx.fillStyle = '#0d1a1a';
    ctx.strokeStyle = '#1a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(140, 45, 320, 420, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 11px 'Rajdhani', sans-serif";
    ctx.fillStyle = '#1a5a5a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ESP32-WROOM-32', 300, 255);
    ctx.restore();

    const radius = 6;
    this.pins.forEach(pin => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = pin.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const shortId = String(pin.id).replace(/^GND\d$/, 'G');
      this._drawLabel(shortId, pin.x, pin.y, '#fff', 6.5);

      const isLeft = pin.x < 300;
      const labelX = isLeft ? pin.x - radius - 4 : pin.x + radius + 4;
      const align  = isLeft ? 'right' : 'left';
      this._drawLabel(pin.label, labelX, pin.y, '#7494b4', 7.5, align);
    });
  }
}

/* ──────────────────────────────────────────────
   AnimationController — play/pause/stop/export
   ────────────────────────────────────────────── */
class AnimationController {
  constructor(canvas, template, animationType, config) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.template = template;
    this.animationType = animationType;
    this.config   = config || {};
    this.state    = 'idle';   // 'idle' | 'running' | 'paused' | 'stopped'
    this.frameId  = null;
    this._startTime = null;
    this._pausedAt  = null;
    this._elapsed   = 0;
    this._frameCount = 0;
    this._lastFps    = 0;
    this._fpsTimer   = 0;
    this._speed      = 1;

    this._animation = this._createAnimation(animationType, config);
  }

  _createAnimation(type, config) {
    switch (type) {
      case 'led':    return new LEDAnimation(config);
      case 'servo':  return new ServoAnimation(config);
      case 'sensor': return new SensorAnimation(config);
      case 'buzzer': return new BuzzerAnimation(config);
      default:       return null;
    }
  }

  setSpeed(value) {
    this._speed = parseFloat(value) || 1;
  }

  play() {
    if (this.state === 'running') return;
    if (this.state === 'paused') {
      this._startTime = performance.now() - this._elapsed;
    } else {
      this._startTime = performance.now();
      this._elapsed   = 0;
    }
    this.state = 'running';
    this._tick();
  }

  pause() {
    if (this.state !== 'running') return;
    this.state     = 'paused';
    this._pausedAt = performance.now();
    this._elapsed  = this._pausedAt - this._startTime;
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  stop() {
    this.state    = 'stopped';
    this._elapsed = 0;
    cancelAnimationFrame(this.frameId);
    this.frameId  = null;
    this._renderFrame(0);
  }

  _tick(timestamp) {
    if (this.state !== 'running') return;
    this.frameId = requestAnimationFrame(ts => this._tick(ts));

    const now    = timestamp || performance.now();
    const dt     = (now - this._startTime) * this._speed;
    this._elapsed = dt;

    // FPS
    this._frameCount++;
    if (now - this._fpsTimer >= 1000) {
      this._lastFps  = this._frameCount;
      this._frameCount = 0;
      this._fpsTimer = now;
      if (this.onFpsUpdate) this.onFpsUpdate(this._lastFps);
    }

    this._renderFrame(dt);
  }

  _renderFrame(dt) {
    const { canvas, ctx, template, _animation } = this;
    template.render();
    if (_animation && template.pins.length) {
      _animation.draw(ctx, canvas, template, dt);
    }
  }

  exportFrame() {
    this._renderFrame(this._elapsed);
    return this.canvas.toDataURL('image/png');
  }

  async exportSequence(frameCount = 24, fps = 12) {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip não carregado');
    }
    const zip = new JSZip();
    const interval = 1000 / fps;

    for (let i = 0; i < frameCount; i++) {
      const dt = i * interval * this._speed;
      this._renderFrame(dt);
      const dataUrl = this.canvas.toDataURL('image/png');
      const base64  = dataUrl.split(',')[1];
      zip.file(`frame-${String(i).padStart(4, '0')}.png`, base64, { base64: true });
      await new Promise(r => setTimeout(r, 0));
    }
    zip.file(
      'README.txt',
      'Frames exportados pelo Aluno Maker Digital — GPIO Visualizer.\n' +
      'Use ffmpeg ou ezgif.com para montar GIF/vídeo a partir dos frames.\n\n' +
      `ffmpeg -r ${fps} -i frame-%04d.png -vf "scale=800:-1" output.gif`
    );
    return zip.generateAsync({ type: 'blob' });
  }
}

/* ──────────────────────────────────────────────
   LEDAnimation
   config: { pin, color, blinkRate (Hz), dutyCycle (0-1) }
   ────────────────────────────────────────────── */
class LEDAnimation {
  constructor(config) {
    this.pin       = config.pin || null;
    this.color     = config.color || '#ff0000';
    this.blinkRate = parseFloat(config.blinkRate) || 1;
    this.dutyCycle = parseFloat(config.dutyCycle) || 0.5;
  }

  draw(ctx, canvas, template, dt) {
    const period = 1000 / this.blinkRate;
    const phase  = (dt % period) / period;
    const on     = phase < this.dutyCycle;
    const alpha  = on ? 1 : 0.15;

    // LED visual no centro do canvas (ou sobre o pino selecionado)
    const pin = this.pin ? template.getPin(this.pin) : null;

    if (pin) {
      // destaca o pino
      template.highlightPin(this.pin, on ? this.color : '#333', 12);
    }

    // LED gráfico
    const ledX = canvas.width * 0.72;
    const ledY = canvas.height * 0.35;
    const ledR = 22;

    ctx.save();
    ctx.globalAlpha = alpha;
    const grad = ctx.createRadialGradient(ledX - 6, ledY - 6, 2, ledX, ledY, ledR);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, this.color);
    grad.addColorStop(1, this.color + '44');
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // halo de brilho
    if (on) {
      ctx.globalAlpha = 0.25;
      const halo = ctx.createRadialGradient(ledX, ledY, ledR, ledX, ledY, ledR + 30);
      halo.addColorStop(0, this.color);
      halo.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(ledX, ledY, ledR + 30, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // resistor simbólico
    this._drawResistor(ctx, ledX, ledY + ledR + 10, ledX, ledY + ledR + 55);

    // rótulo
    ctx.font = "10px 'Inter', sans-serif";
    ctx.fillStyle = '#7494b4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`LED ${on ? 'ON' : 'OFF'} — ${this.blinkRate}Hz / DC:${Math.round(this.dutyCycle * 100)}%`, ledX, ledY + ledR + 62);
    ctx.restore();
  }

  _drawResistor(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const mid = (y1 + y2) / 2;
    const w = 8;
    ctx.lineTo(x1, mid - 12);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(x1 + (i % 2 === 0 ? w : -w), mid - 8 + i * 6);
    }
    ctx.lineTo(x1, mid + 12);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   ServoAnimation
   config: { pin, startAngle, endAngle, speed (deg/s) }
   ────────────────────────────────────────────── */
class ServoAnimation {
  constructor(config) {
    this.pin        = config.pin || null;
    this.startAngle = parseFloat(config.startAngle) ?? 0;
    this.endAngle   = parseFloat(config.endAngle)   ?? 180;
    this.speed      = parseFloat(config.speed)      || 60;
  }

  draw(ctx, canvas, template, dt) {
    const range    = this.endAngle - this.startAngle;
    const duration = Math.abs(range) / this.speed * 1000;
    const phase    = (dt % (duration * 2)) / duration;
    const t        = phase <= 1 ? phase : 2 - phase;
    const angle    = this.startAngle + t * range;
    const rad      = (angle - 90) * Math.PI / 180;

    const cx = canvas.width  * 0.68;
    const cy = canvas.height * 0.42;
    const armLen = 60;

    if (this.pin) template.highlightPin(this.pin, PIN_COLORS.gpio, 12);

    ctx.save();
    // corpo do servo
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 28, cy - 18, 56, 36, 4);
    ctx.fill();
    ctx.stroke();

    // eixo
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#aaa';
    ctx.fill();

    // braço
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + armLen * Math.cos(rad), cy + armLen * Math.sin(rad));
    ctx.stroke();

    // bola no fim do braço
    ctx.beginPath();
    ctx.arc(cx + armLen * Math.cos(rad), cy + armLen * Math.sin(rad), 6, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();

    // arco de percurso
    const startRad = (this.startAngle - 90) * Math.PI / 180;
    const endRad   = (this.endAngle   - 90) * Math.PI / 180;
    ctx.strokeStyle = 'rgba(0,229,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, armLen, Math.min(startRad, endRad), Math.max(startRad, endRad));
    ctx.stroke();

    // ângulo
    ctx.font = "11px 'Orbitron', monospace";
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(angle)}°`, cx, cy + armLen + 24);
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = '#7494b4';
    ctx.fillText(`${this.startAngle}° → ${this.endAngle}° @ ${this.speed}°/s`, cx, cy + armLen + 40);
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   SensorAnimation
   config: { pin, minValue, maxValue, unit }
   ────────────────────────────────────────────── */
class SensorAnimation {
  constructor(config) {
    this.pin      = config.pin      || null;
    this.minValue = parseFloat(config.minValue) ?? 0;
    this.maxValue = parseFloat(config.maxValue) ?? 100;
    this.unit     = config.unit     || '';
  }

  draw(ctx, canvas, template, dt) {
    const period = 4000;
    const t      = (dt % period) / period;
    const value  = this.minValue + Math.abs(Math.sin(t * Math.PI)) * (this.maxValue - this.minValue);
    const norm   = (value - this.minValue) / (this.maxValue - this.minValue);

    if (this.pin) template.highlightPin(this.pin, PIN_COLORS.adc, 12);

    const gx = canvas.width * 0.57, gy = canvas.height * 0.2;
    const gw = 180, gh = 200;

    ctx.save();

    // fundo do gráfico
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 6);
    ctx.fill();
    ctx.stroke();

    // barra de valor
    const barH = gh * 0.7;
    const barY = gy + (gh - barH) / 2;
    const barW = 28;
    const barX = gx + gw / 2 - barW / 2;
    const fillH = barH * norm;

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    const grad = ctx.createLinearGradient(0, barY + barH, 0, barY + barH - fillH);
    grad.addColorStop(0, '#27ae60');
    grad.addColorStop(0.5, '#f39c12');
    grad.addColorStop(1, '#e74c3c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(barX, barY + barH - fillH, barW, fillH, 4);
    ctx.fill();

    // valor numérico
    ctx.font = "bold 16px 'Orbitron', monospace";
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${value.toFixed(1)}`, gx + gw / 2, gy + gh + 20);
    ctx.font = "10px 'Inter', sans-serif";
    ctx.fillStyle = '#7494b4';
    ctx.fillText(this.unit, gx + gw / 2, gy + gh + 36);
    ctx.fillText(`${this.minValue}${this.unit} — ${this.maxValue}${this.unit}`, gx + gw / 2, gy + gh + 50);

    // rótulos min/max
    ctx.font = "8px 'Inter', sans-serif";
    ctx.fillStyle = '#7494b4';
    ctx.textAlign = 'right';
    ctx.fillText(String(this.maxValue), barX - 4, barY + 4);
    ctx.fillText(String(this.minValue), barX - 4, barY + barH - 4);
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   BuzzerAnimation
   config: { pin, frequency (Hz), waveform: 'square'|'sine' }
   ────────────────────────────────────────────── */
class BuzzerAnimation {
  constructor(config) {
    this.pin       = config.pin       || null;
    this.frequency = parseFloat(config.frequency) || 440;
    this.waveform  = config.waveform  || 'square';
  }

  draw(ctx, canvas, template, dt) {
    if (this.pin) template.highlightPin(this.pin, PIN_COLORS.uart, 12);

    const wx = canvas.width  * 0.56;
    const wy = canvas.height * 0.25;
    const ww = 200, wh = 80;
    const cycles = 4;
    const pts = 300;

    ctx.save();

    // ícone buzzer
    const bx = wx + ww / 2, by = wy + wh + 50;
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(bx, by, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 24, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx, by, 32, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // ondas sonoras animadas
    const wavePhase = (dt * this.frequency / 1000) % 1;
    for (let r = 40; r <= 65; r += 12) {
      const alpha = 0.5 - (r - 40) / 50 + 0.1 * Math.sin(wavePhase * Math.PI * 2);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(bx, by, r, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // waveform
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(wx, wy, ww, wh, 4);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const x = wx + (i / pts) * ww;
      const phase = (i / pts) * cycles * Math.PI * 2 + dt * this.frequency * 0.001;
      let y;
      if (this.waveform === 'square') {
        y = wy + wh / 2 + (Math.sin(phase) >= 0 ? -1 : 1) * wh * 0.38;
      } else {
        y = wy + wh / 2 - Math.sin(phase) * wh * 0.38;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.font = "10px 'Orbitron', monospace";
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.frequency} Hz`, wx + ww / 2, wy - 16);
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = '#7494b4';
    ctx.fillText(`Forma de onda: ${this.waveform}`, wx + ww / 2, wy + wh + 8);
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   GPIOVisualizer — controlador da UI
   ────────────────────────────────────────────── */
class GPIOVisualizer {
  constructor() {
    this.canvas     = document.getElementById('gpio-canvas');
    this.ctx        = this.canvas ? this.canvas.getContext('2d') : null;
    this.controller = null;
    this.template   = null;

    if (!this.canvas || !this.ctx) return;
    this._init();
  }

  _init() {
    this._resizeCanvas();
    this._bindControls();
    this._renderInitial();

    window.addEventListener('resize', () => {
      this._resizeCanvas();
      if (this.template) this.template.render();
    });
  }

  _resizeCanvas() {
    const wrapper = this.canvas.parentElement;
    const w = Math.min(wrapper.clientWidth, 800);
    const h = Math.round(w * 0.625); // 800×500 ratio
    this.canvas.width  = w;
    this.canvas.height = h;
  }

  _renderInitial() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "14px 'Rajdhani', sans-serif";
    ctx.fillStyle = '#7494b4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Selecione uma plataforma e um tipo de animação para começar.', canvas.width / 2, canvas.height / 2);
  }

  _bindControls() {
    const get = id => document.getElementById(id);

    // Selects principais
    const selPlatform  = get('gpio-platform');
    const selAnimation = get('gpio-animation');

    if (selPlatform)  selPlatform.addEventListener('change',  () => this._updateConfig());
    if (selAnimation) selAnimation.addEventListener('change', () => this._updateConfig());

    // Configs dinâmicas
    const configInputs = document.querySelectorAll('[data-gpio-config]');
    configInputs.forEach(el => {
      el.addEventListener('input', () => {
        if (el.type === 'range') {
          const display = document.getElementById(el.id + '-val');
          if (display) display.textContent = el.value;
        }
        this._updateConfig();
      });
    });

    // Controles de playback
    const btnPlay  = get('gpio-btn-play');
    const btnPause = get('gpio-btn-pause');
    const btnStop  = get('gpio-btn-stop');

    if (btnPlay)  btnPlay.addEventListener('click',  () => this._play());
    if (btnPause) btnPause.addEventListener('click', () => this._pause());
    if (btnStop)  btnStop.addEventListener('click',  () => this._stop());

    // Velocidade
    const sldSpeed = get('gpio-speed');
    if (sldSpeed) {
      sldSpeed.addEventListener('input', () => {
        const val = get('gpio-speed-val');
        if (val) val.textContent = sldSpeed.value + 'x';
        if (this.controller) this.controller.setSpeed(parseFloat(sldSpeed.value));
      });
    }

    // Exportação
    const btnPng = get('gpio-export-png');
    const btnZip = get('gpio-export-zip');
    if (btnPng) btnPng.addEventListener('click', () => this._exportPNG());
    if (btnZip) btnZip.addEventListener('click', () => this._exportZIP());
  }

  _getConfig() {
    const get = id => document.getElementById(id);
    const val = id => { const el = get(id); return el ? el.value : null; };
    return {
      pin:        val('gpio-pin'),
      color:      val('gpio-led-color')   || '#ff0000',
      blinkRate:  val('gpio-blink-rate')  || '1',
      dutyCycle:  val('gpio-duty-cycle')  || '0.5',
      startAngle: val('gpio-start-angle') || '0',
      endAngle:   val('gpio-end-angle')   || '180',
      speed:      val('gpio-servo-speed') || '60',
      minValue:   val('gpio-min-val')     || '0',
      maxValue:   val('gpio-max-val')     || '100',
      unit:       val('gpio-unit')        || '',
      frequency:  val('gpio-frequency')   || '440',
      waveform:   val('gpio-waveform')    || 'square',
    };
  }

  _updateConfig() {
    const platform  = document.getElementById('gpio-platform')?.value;
    const animation = document.getElementById('gpio-animation')?.value;
    if (!platform || !animation) return;

    this._stop();

    // Mostrar/ocultar seções de configuração
    this._toggleConfigSections(animation);

    // Preencher opções de pinos para a plataforma
    this._populatePins(platform);

    const { canvas, ctx } = this;
    this.template = this._createTemplate(platform, canvas, ctx);
    const config  = this._getConfig();
    this.controller = new AnimationController(canvas, this.template, animation, config);
    this.controller.onFpsUpdate = fps => {
      const el = document.getElementById('gpio-fps');
      if (el) el.textContent = `${fps} FPS`;
    };

    this.template.render();
    this._updateStatusDot('idle');
    this._setButtonStates('idle');
  }

  _toggleConfigSections(animation) {
    const sections = {
      led:    ['config-led'],
      servo:  ['config-servo'],
      sensor: ['config-sensor'],
      buzzer: ['config-buzzer'],
    };
    Object.keys(sections).forEach(type => {
      sections[type].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = (type !== animation);
      });
    });
  }

  _populatePins(platform) {
    const sel = document.getElementById('gpio-pin');
    if (!sel) return;
    sel.innerHTML = '';
    const opts = this._getPinOptions(platform);
    opts.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      sel.appendChild(opt);
    });
  }

  _getPinOptions(platform) {
    if (platform === 'rpi5') {
      return [
        { value: '7',  label: 'Pino 7 — GPIO4'  },
        { value: '11', label: 'Pino 11 — GPIO17' },
        { value: '12', label: 'Pino 12 — GPIO18' },
        { value: '13', label: 'Pino 13 — GPIO27' },
        { value: '15', label: 'Pino 15 — GPIO22' },
        { value: '16', label: 'Pino 16 — GPIO23' },
        { value: '18', label: 'Pino 18 — GPIO24' },
        { value: '22', label: 'Pino 22 — GPIO25' },
        { value: '3',  label: 'Pino 3 — SDA (I2C)' },
        { value: '5',  label: 'Pino 5 — SCL (I2C)' },
        { value: '8',  label: 'Pino 8 — TX (UART)' },
        { value: '10', label: 'Pino 10 — RX (UART)' },
        { value: '19', label: 'Pino 19 — MOSI (SPI)' },
        { value: '21', label: 'Pino 21 — MISO (SPI)' },
        { value: '23', label: 'Pino 23 — SCLK (SPI)' },
      ];
    }
    if (platform === 'esp8266') {
      return [
        { value: 'D0', label: 'D0 — GPIO16' },
        { value: 'D1', label: 'D1 — SCL (I2C)' },
        { value: 'D2', label: 'D2 — SDA (I2C)' },
        { value: 'D3', label: 'D3 — Boot/Flash' },
        { value: 'D4', label: 'D4 — LED onboard / TX1' },
        { value: 'D5', label: 'D5 — SCLK (SPI)' },
        { value: 'D6', label: 'D6 — MISO (SPI)' },
        { value: 'D7', label: 'D7 — MOSI (SPI)' },
        { value: 'D8', label: 'D8 — CS (SPI)' },
        { value: 'A0', label: 'A0 — ADC (0–1V)' },
        { value: 'TX', label: 'TX — UART' },
        { value: 'RX', label: 'RX — UART' },
      ];
    }
    // esp32
    return [
      { value: '2',  label: 'GPIO2 — PWM/Touch' },
      { value: '4',  label: 'GPIO4 — Touch' },
      { value: '5',  label: 'GPIO5 — CS (SPI)' },
      { value: '13', label: 'GPIO13 — Touch/PWM' },
      { value: '14', label: 'GPIO14 — Touch/PWM' },
      { value: '16', label: 'GPIO16 — RX2 (UART)' },
      { value: '17', label: 'GPIO17 — TX2 (UART)' },
      { value: '18', label: 'GPIO18 — CLK (SPI)' },
      { value: '19', label: 'GPIO19 — MISO (SPI)' },
      { value: '21', label: 'GPIO21 — SDA (I2C)' },
      { value: '22', label: 'GPIO22 — SCL (I2C)' },
      { value: '23', label: 'GPIO23 — MOSI (SPI)' },
      { value: '25', label: 'GPIO25 — DAC1' },
      { value: '26', label: 'GPIO26 — DAC2' },
      { value: '27', label: 'GPIO27 — Touch/PWM' },
      { value: '32', label: 'GPIO32 — Touch/ADC' },
      { value: '33', label: 'GPIO33 — Touch/ADC' },
      { value: '34', label: 'GPIO34 — ADC (entrada)' },
      { value: '35', label: 'GPIO35 — ADC (entrada)' },
    ];
  }

  _createTemplate(platform, canvas, ctx) {
    switch (platform) {
      case 'rpi5':    return new RPi5Template(canvas, ctx);
      case 'esp8266': return new ESP8266Template(canvas, ctx);
      case 'esp32':   return new ESP32Template(canvas, ctx);
      default:        return new RPi5Template(canvas, ctx);
    }
  }

  _play() {
    if (!this.controller) return;
    // recria controller com config mais recente
    const platform  = document.getElementById('gpio-platform')?.value;
    const animation = document.getElementById('gpio-animation')?.value;
    if (!platform || !animation) return;
    const config = this._getConfig();
    const { canvas, ctx } = this;
    if (!this.template) {
      this.template = this._createTemplate(platform, canvas, ctx);
    }
    this.controller = new AnimationController(canvas, this.template, animation, config);
    this.controller.setSpeed(parseFloat(document.getElementById('gpio-speed')?.value || '1'));
    this.controller.onFpsUpdate = fps => {
      const el = document.getElementById('gpio-fps');
      if (el) el.textContent = `${fps} FPS`;
    };
    this.controller.play();
    this._updateStatusDot('running');
    this._setButtonStates('running');
  }

  _pause() {
    if (!this.controller) return;
    this.controller.pause();
    this._updateStatusDot('paused');
    this._setButtonStates('paused');
  }

  _stop() {
    if (this.controller) {
      this.controller.stop();
    }
    this._updateStatusDot('stopped');
    this._setButtonStates('stopped');
  }

  _updateStatusDot(state) {
    const dot  = document.getElementById('gpio-status-dot');
    const text = document.getElementById('gpio-status-text');
    if (!dot || !text) return;
    dot.className = 'gpio-status__dot';
    const labels = { idle: 'Aguardando', running: 'Executando', paused: 'Pausado', stopped: 'Parado' };
    if (state !== 'idle') dot.classList.add(`gpio-status__dot--${state}`);
    text.textContent = labels[state] || 'Idle';
  }

  _setButtonStates(state) {
    const btnPlay  = document.getElementById('gpio-btn-play');
    const btnPause = document.getElementById('gpio-btn-pause');
    const btnStop  = document.getElementById('gpio-btn-stop');
    if (!btnPlay) return;
    btnPlay.disabled  = state === 'running';
    btnPause.disabled = state !== 'running';
    btnStop.disabled  = state === 'idle' || state === 'stopped';
  }

  _exportPNG() {
    if (!this.controller) return;
    const link = document.createElement('a');
    link.download = `gpio-frame-${Date.now()}.png`;
    link.href = this.controller.exportFrame();
    link.click();
  }

  async _exportZIP() {
    if (!this.controller) return;
    const btnZip = document.getElementById('gpio-export-zip');
    if (btnZip) { btnZip.disabled = true; btnZip.textContent = 'Gerando...'; }
    try {
      const blob = await this.controller.exportSequence(24, 12);
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `gpio-sequence-${Date.now()}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao gerar ZIP: ' + e.message);
    } finally {
      if (btnZip) { btnZip.disabled = false; btnZip.innerHTML = '<i class="fa-solid fa-file-zipper" aria-hidden="true"></i> ZIP'; }
    }
  }
}

/* ──────────────────────────────────────────────
   Inicialização
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('gpio-canvas')) {
    window._gpioVisualizer = new GPIOVisualizer();
  }
});
