import Phaser from "phaser";

import { BaseScene } from "./scenes/BaseScene";
import { GameScene } from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    fps: {
        target: 60,
        forceSetTimeOut: true,
        smoothStep: false,
    },
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: {
        default: "arcade"
    },
    pixelArt: false,
    antialias: true,
    scene: [BaseScene, GameScene],
};

const game = new Phaser.Game(config);