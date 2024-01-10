import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";

class PlayScene extends Phaser.Scene {

    player: Player;    
    ground: Phaser.GameObjects.TileSprite;
    startTrigger: SpriteWithDynamicBody;

    get gameHeight() {
        return this.game.config.height as number;
    }
    get gameWidth() {
        return this.game.config.width as number;
    }
    constructor(){
        super("PlayScene");
    }

    create(){
        this.createEnvironment();
        this.createPlayer();
        this.startTrigger = this.physics.add.sprite(30, 30, null)
        .setOrigin(0, 0)
        .setAlpha(0);

        this.physics.add.overlap(this.startTrigger, this.player, () => {
            if (this.startTrigger.y === 30){
                this.startTrigger.body.reset(30, this.gameHeight - 2);
                return;
            }
            this.startTrigger.body.reset(9999, 9999);

            const RollOutEvent = this.time.addEvent({
                delay: 1000/60,
                loop: true,
                callback: () => {
                    this.player.playRunAnimation();
                    this.player.setVelocityX(60);
                    this.ground.width +=15;  
                    if(this.ground.width >= this.gameWidth){
                        // we need to cut the excessively generated ground 
                        this.ground.width = this.gameWidth;
                        this.player.setVelocityX(0);
                        RollOutEvent.remove();
                    }
                }
            })
        })
    }

    createPlayer(){
    this.player = new Player(this, 0, this.gameHeight);
    }

    createEnvironment(){
        this.ground =    this.add.tileSprite(0, this.gameHeight, 100, 26, "ground")
        .setOrigin(0, 1);
    }
    update(time: number, delta: number): void {


    }


}

export default PlayScene;