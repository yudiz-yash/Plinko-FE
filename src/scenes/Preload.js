import bg from '../assets/images/bg.png';
import logo from '../assets/images/logo.png';
import ball from '../assets/images/ball.png';
import peg from '../assets/images/peg.png';
import multiplier from '../assets/images/multiplier.png';
import blue_base from '../assets/images/blue_base.png';
import rowsCount_base from '../assets/images/rowsCount_base.png';
// buttons 
import arrow from '../assets/images/buttons/arrow.png';
import btn_placeBet from '../assets/images/buttons/btn_placeBet.png';
import btn_purple from '../assets/images/buttons/btn_purple.png';

export default class Preload extends Phaser.Scene {
    constructor() {
        super("Preload");
    }
    editorPreload() {
        this.load.image('bg', bg);
        this.load.image('logo', logo);
        this.load.image('ball', ball);
        this.load.image('peg', peg);
        this.load.image('multiplier', multiplier);
        this.load.image('blue_base', blue_base);
        this.load.image('rowsCount_base', rowsCount_base);

        // buttons
        this.load.image('arrow', arrow);
        this.load.image('btn_placeBet', btn_placeBet);
        this.load.image('btn_purple', btn_purple);
    }
    editorCreate() {
        this.txt_progress = this.add.text(this.game.config.width / 2, this.game.config.height / 2, "0%", { fontSize: '48px' });
        this.txt_progress.setOrigin(0.5, 0.5);
    }
    preload() {

        this.editorCreate();
        this.editorPreload();

        this.load.on(Phaser.Loader.Events.PROGRESS, (progress) => {
            this.txt_progress.setText(`${Math.round(progress * 100)}%`)
        });
        let oGameStates = {
            isNewGame: true,
            isHomeScreen: true,
        }
        this.load.on(Phaser.Loader.Events.COMPLETE, () => this.scene.start("Level", oGameStates));

    }

}