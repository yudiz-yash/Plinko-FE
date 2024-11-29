import config from './scripts/config';
import Phaser from 'phaser';
import Preload from './scenes/Preload';
import Level from './scenes/Level';
import { initiateDiscordSDK } from '../utils/discordSdk';

class Boot extends Phaser.Scene {
  preload() {
    this.load.on(Phaser.Loader.Events.COMPLETE, () => this.scene.start("Preload"));
  }
}

window.addEventListener('load', () => {
  initiateDiscordSDK();
  const game = new Phaser.Game({
    title: 'Plinko',
    version: config.version,
    width: config.width,
    height: config.height,
    type: Phaser.AUTO,
    backgroundColor: '#1a1a2e',
    // transparent: true,
    parent: "game-division",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: {
      disableWebAudio: false
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { y: 0.9807 },
        debug: true
      }
    },
    dom: {
      createContainer: true
    },
    scene: [Boot, Preload, Level],
  });
});