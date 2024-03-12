import Phaser from "phaser";
import Boundary from '../assets/Boundary.png';
import Consul from '../assets/Consul.png';
import Nomad from '../assets/Nomad.png';
import Packer from '../assets/Packer.png';
import Terraform from '../assets/Terraform.png';
import Vagrant from '../assets/Vagrant.png';
import Vault from '../assets/Vault.png';
import Waypoint from '../assets/Waypoint.png';

const avatars = {
    'Boundary': Boundary,
    'Consul': Consul,
    'Nomad': Nomad,
    'Packer': Packer,
    'Terraform': Terraform,
    'Vagrant': Vagrant,
    'Vault': Vault,
    'Waypoint': Waypoint,
};

export class BaseScene extends Phaser.Scene {
    constructor() {
        super({ key: "selector", active: true });
    }

    preload() {
        // preload all images
        Object.keys(avatars).forEach((avatar) => {
            this.load.image(avatar, avatars[avatar]);
        });
    }

    create() {
        this.runScene('gameScene');
    }

    runScene(key: string) {
        this.game.scene.switch("selector", key)
    }

}