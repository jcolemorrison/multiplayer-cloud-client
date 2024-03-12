import Phaser from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';

export class GameScene extends Phaser.Scene {
    room: Room;

    currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

    debugFPS: Phaser.GameObjects.Text;

    localRef: Phaser.GameObjects.Rectangle;
    remoteRef: Phaser.GameObjects.Rectangle;

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    inputPayload = {
        left: false,
        right: false,
        up: false,
        down: false,
        tick: undefined,
    };

    elapsedTime = 0;
    fixedTimeStep = 1000 / 60;

    currentTick: number = 0;
    joystick: VirtualJoystick;

    constructor() {
        super({ key: "gameScene" });
    }

    async create() {
        if (this.sys.game.device.os.desktop) {
            this.cursorKeys = this.input.keyboard.createCursorKeys();
        } else {
            this.joystick = new VirtualJoystick(this, {
                x: this.sys.game.config.width as number / 2,
                y: (this.sys.game.config.height as number) - 125,
                radius: 100,
                base: this.add.graphics().lineStyle(2, 0x999999).strokeCircle(0, 0, 60),
                thumb: this.add.circle(0, 0, 30, 0xcccccc),
            });
        }

        // this.debugFPS = this.add.text(4, 4, "", { color: "#ff0000", });

        // connect with the room
        await this.connect();

        this.room.state.players.onAdd((player, sessionId) => {
            const entity = this.physics.add.image(player.x, player.y, player.avatar);
            entity.setCollideWorldBounds(true);
            this.playerEntities[sessionId] = entity;

            // is current player
            if (sessionId === this.room.sessionId) {
                this.currentPlayer = entity;
                this.cameras.main.startFollow(this.currentPlayer, true, 0.15, 0.15);

                // this.localRef = this.add.rectangle(0, 0, entity.width, entity.height);
                // this.localRef.setStrokeStyle(1, 0xffffff, 0.2);

                this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
                this.remoteRef.setStrokeStyle(1, 0xffffff, 0.2);

                player.onChange(() => {
                    this.remoteRef.x = player.x;
                    this.remoteRef.y = player.y;
                });

            } else {
                // listening for server updates
                player.onChange(() => {
                    //
                    // we're going to LERP the positions during the render loop.
                    //
                    entity.setData('serverX', player.x);
                    entity.setData('serverY', player.y);
                });

            }

        });

        // remove local reference when entity is removed from the server
        this.room.state.players.onRemove((player, sessionId) => {
            const entity = this.playerEntities[sessionId];
            if (entity) {
                entity.destroy();
                delete this.playerEntities[sessionId]
            }
        });
    }

    async connect() {
        // add connection status text
        const connectionStatusText = this.add
            .text(0, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(BACKEND_URL);

        try {
            this.room = await client.joinOrCreate("game_room", {});

            // connection successful!
            connectionStatusText.destroy();

            this.room.onStateChange.once((state) => {
                this.physics.world.setBounds(0, 0, state.mapWidth, state.mapHeight);

                // Draw a border around the world's bounds
                const borderWidth = 2;
                const graphics = this.add.graphics();
                graphics.lineStyle(borderWidth, 0xffffff, 1);
                graphics.strokeRect(0, 0, state.mapWidth, state.mapHeight);

                // Set the camera bounds to be slightly larger than the world bounds
                const cameraPadding = 50;
                this.cameras.main.setBounds(-cameraPadding, -cameraPadding, state.mapWidth + 2 * cameraPadding, state.mapHeight + 2 * cameraPadding);
            });

        } catch (e) {
            console.error(e);
            // couldn't connect
            connectionStatusText.text =  "Could not connect with the server.";
        }

    }

    update(time: number, delta: number): void {
        // skip loop if not connected yet.
        if (!this.currentPlayer) { return; }

        this.elapsedTime += delta;
        while (this.elapsedTime >= this.fixedTimeStep) {
            this.elapsedTime -= this.fixedTimeStep;
            this.fixedTick(time, this.fixedTimeStep);
        }

        // this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps}`;
    }

    fixedTick(time, delta) {
        this.currentTick++;

        // const currentPlayerRemote = this.room.state.players.get(this.room.sessionId);
        // const ticksBehind = this.currentTick - currentPlayerRemote.tick;
        // console.log({ ticksBehind });

        const velocity = 2;

        if (this.sys.game.device.os.desktop) {
            this.inputPayload.left = this.cursorKeys.left.isDown;
            this.inputPayload.right = this.cursorKeys.right.isDown;
            this.inputPayload.up = this.cursorKeys.up.isDown;
            this.inputPayload.down = this.cursorKeys.down.isDown;
        } else {
            this.inputPayload.left = this.joystick.left;
            this.inputPayload.right = this.joystick.right;
            this.inputPayload.up = this.joystick.up;
            this.inputPayload.down = this.joystick.down;
        }

        this.inputPayload.tick = this.currentTick;
        this.room.send(0, this.inputPayload);

        const avatarSize = 32;

        if (this.inputPayload.left) {
            this.currentPlayer.x = Math.max(avatarSize / 2, this.currentPlayer.x - velocity);
        } else if (this.inputPayload.right) {
            this.currentPlayer.x = Math.min(this.room.state.mapWidth - avatarSize / 2, this.currentPlayer.x + velocity);
        }
    
        if (this.inputPayload.up) {
            this.currentPlayer.y = Math.max(avatarSize / 2, this.currentPlayer.y - velocity);
        } else if (this.inputPayload.down) {
            this.currentPlayer.y = Math.min(this.room.state.mapHeight - avatarSize / 2, this.currentPlayer.y + velocity);
        }

        // this.localRef.x = this.currentPlayer.x;
        // this.localRef.y = this.currentPlayer.y;

        for (let sessionId in this.playerEntities) {
            // interpolate all player entities
            // (except the current player)
            if (sessionId === this.room.sessionId) {
                continue;
            }
            
            const entity = this.playerEntities[sessionId];
            const { serverX, serverY } = entity.data.values;
            
            entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2);
            entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
        }

    }

}