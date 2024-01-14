import Phaser from "phaser";
import { PRELOAD_CONFIG } from "..";

class PreloadScene extends Phaser.Scene {
    constructor(){
        super("PreloadScene");
    }

    preload(){
        this.load.image("ground", "assets/ground.png");
        this.load.image("dino-idle", "assets/dino-idle-2.png");
        this.load.image("dino-hurt", "assets/dino-hurt.png");
        this.load.image("restart", "assets/restart.png");
        this.load.image("game-over", "assets/game-over.png");


        for( let i = 1; i < PRELOAD_CONFIG.cactusesCount + 1; i++){
            this.load.image(`obstacle-${i}`, `assets/cactuses_${i}.png`)
            console.log("obstacle "+ i + " loaded")
        }


        this.load.spritesheet("dino-run", "assets/dino-run.png",{
            frameWidth: 88,
            frameHeight: 94
        });
    }

    create(){
        this.scene.start("PlayScene");
    }
}

export default PreloadScene;