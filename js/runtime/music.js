let instance;

/**
 * 统一的音效管理器
 */
export default class Music {
  bgmAudio = wx.createInnerAudioContext();
  shootAudio = wx.createInnerAudioContext();
  boomAudio = wx.createInnerAudioContext();
  laserAudio = wx.createInnerAudioContext();
  DeadAudio= wx.createInnerAudioContext();

  constructor() {
    if (instance) return instance;

    instance = this;

    this.bgmAudio.loop = true; // 背景音乐循环播放
    this.bgmAudio.autoplay = true; // 背景音乐自动播放
    this.bgmAudio.src = 'https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/bgm.mp3';
    this.shootAudio.src = 'https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/bullet.mp3';
    this.boomAudio.src = 'https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/boom.mp3';
    this.laserAudio.src = 'https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/laser.mp3';
    this.DeadAudio.src='https://relejaln.github.io/REMOTE_SOURCE/Stellaris_Fantasia/audio/DEAD.mp3';
  }

  playShoot() {
    this.shootAudio.currentTime = 0;
    this.shootAudio.volume = 0.1
    this.shootAudio.play();
  }

  playExplosion() {
    this.boomAudio.currentTime = 0;
    this.boomAudio.volume = 0.5;
    this.boomAudio.play();
  }
  playDead() {
    this.DeadAudio.currentTime = 0;
    this.DeadAudio.volume = 0.2;
    this.DeadAudio.play();
  }
  playLaser() {
    this.laserAudio.currentTime = 0;
    this.laserAudio.volume = 0.3;
    this.laserAudio.play();
  }
}
