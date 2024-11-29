import Phaser from 'phaser';
import assets from '../scripts/assets';

export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y,
        {
            texture = assets.btn_purple,
            scaleX = 1,
            scaleY = 1,
            text = '',
            textX = 0,
            textY = 0,
            fontFamily = 'Impact',
            fontSize = '34px',
            color = '#ffffff',
            align = 'center',
            stroke = '#000000',
            strokeThickness = 0,
            iconTexture = '',
            iconX = 0,
            iconY = 0,
        } = {}, onPointerDown) {
        super(scene, x, y);
        scene.add.existing(this);
        this.scene = scene;

        this.btn_image = scene.add.image(0, 0, texture).setScale(scaleX, scaleY);
        this.add(this.btn_image);
        this.btn_image.setInteractive(scene.input.makePixelPerfect())
        this.btn_image.on('pointerover', () => {
            scene.input.setDefaultCursor('pointer');
        })
        this.btn_image.on('pointerout', () => {
            scene.input.setDefaultCursor('default');
        })
        this.btn_image.on('pointerdown', () => {
            scene.input.setDefaultCursor('default');
            this.btn_image.disableInteractive();
            scene.tweens.add({
                targets: this,
                scale: 0.9,
                duration: 100,
                ease: 'Linear',
                yoyo: true,
                onComplete: () => {
                    onPointerDown();
                }
            });
        });

        const btn_text = scene.add.text(
            textX,
            textY,
            text,
            {
                fontFamily: fontFamily,
                fontSize: fontSize,
                align: align,
                color: color,
                stroke: stroke,
                strokeThickness: strokeThickness,
            }
        ).setOrigin(0.5);
        this.add(btn_text);

        if (iconTexture) {
            const icon = scene.add.image(iconX, iconY, iconTexture);
            this.add(icon);
        }
    }
}