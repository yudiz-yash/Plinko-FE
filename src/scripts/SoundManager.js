import assets from "./assets";

export default class SoundManager {
    constructor(oScene) {
        this.oScene = oScene;
        this.isSoundOn = true;

        this.btn_sound = this.oScene.sound.add(assets.btn_sound);
        this.beep_sound = this.oScene.sound.add(assets.beep_sound);
        this.dice_sound = this.oScene.sound.add(assets.dice_sound);
        this.pawn_sound = this.oScene.sound.add(assets.pawn_sound);
        this.game_start_sound = this.oScene.sound.add(assets.game_start_sound);
        this.ladder_sound = this.oScene.sound.add(assets.ladder_sound);
        this.snake_sound = this.oScene.sound.add(assets.snake_sound);
    }
    playSound(key, loop) {
        if (this.isSoundOn) {
            key.play();
            key.loop = loop;
        }
    }
    stopSound(key, loop) {
        key.loop = loop
        key.stop();
    }
}