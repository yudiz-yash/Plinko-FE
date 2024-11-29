export default class TweenManager {
    constructor(oScene) {
        this.oScene = oScene;
    }
    moveOrScaleTo = (object, config, callback) => {
        this.oScene.tweens.add({
            targets: object,
            x: config.x ?? object.x,
            y: config.y ?? object.y,
            scaleX: config.scaleX ?? object.scaleX,
            scaleY: config.scaleY ?? object.scaleY,
            duration: config.duration,
            ease: config.ease ?? 'Linear',
            yoyo: config.yoyo ?? false,
            repeat: config.repeat ?? 0,
            onComplete: callback
        })
    }
    alphaTo = (object, config, callback) => {
        this.oScene.tweens.add({
            targets: object,
            alpha: config.alpha ?? object.alpha,
            duration: config.duration,
            ease: config.ease ?? 'Linear',
            yoyo: config.yoyo ?? false,
            repeat: config.repeat ?? 0,
            onComplete: callback
        })
    }
    rotateTo = (object, config, callback) => {
        this.oScene.tweens.add({
            targets: object,
            angle: config.angle,
            duration: config.duration,
            ease: config.ease ?? 'Linear',
            yoyo: config.yoyo ?? false,
            repeat: config.repeat ?? 0,
            onComplete: callback
        })
    }
}