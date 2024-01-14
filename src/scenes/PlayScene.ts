import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";
import { GameScene } from "./GameScene";
import { PRELOAD_CONFIG } from "..";

class PlayScene extends GameScene {

    player: Player;    
    ground: Phaser.GameObjects.TileSprite;
    obstacles: Phaser.Physics.Arcade.Group;
    gameOverText: Phaser.GameObjects.Image;
    restartText: Phaser.GameObjects.Image;
    startTrigger: SpriteWithDynamicBody;

    gameOverContainer: Phaser.GameObjects.Container;
    spawnInterval: number = 1500;
    spawnTime: number = 0;
    gameSpeed: number = 4;

    constructor(){
        super("PlayScene");
    }

    create(){
        this.createEnvironment();
        this.createPlayer();
        this.createObstacles();
        this.createGameOverContainer();
        this.handleGameStart();
        this.handleObstacleCollisions();
        this.handleGameRestart();
    }

    update(time: number, delta: number): void {
        if(!this.isGameRuninng) { return; }

        this.spawnTime += delta;
        if(this.spawnTime >= this.spawnInterval){
            this.spawnObstacle();
            this.spawnTime = 0;
        }
        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);

            this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody)=>{
                if(obstacle.getBounds().right < 0){
                    this.obstacles.remove(obstacle);
                }
            })
            this.ground.tilePositionX += this.gameSpeed
        
    }

    createPlayer(){
        this.player = new Player(this, 0, this.gameHeight);
        }
    
    createEnvironment(){
        this.ground =    this.add.tileSprite(0, this.gameHeight, 100, 26, "ground")
        .setOrigin(0, 1);
    }
    createObstacles(){
        this.obstacles = this.physics.add.group();

    }
    createGameOverContainer(){

        this.gameOverText = this.add.image(0, -60, "game-over");
        this.restartText = this.add.image(0, 0, "restart").setInteractive();
        this.restartText.scale = 0.75

        this.gameOverContainer = this.add
            .container(this.gameWidth / 2, this.gameHeight / 2 - 30)
            .add([this.gameOverText, this.restartText])
            .setAlpha(0);
    }

    spawnObstacle(){
        const obstacleNumber: number = Math.floor(Math.random() * PRELOAD_CONFIG.cactusesCount) + 1;
        const distance = Phaser.Math.Between(600, 900);
        this.obstacles
            .create(distance, this.gameHeight, `obstacle-${obstacleNumber}`)
            .setOrigin(0, 1)
            .setImmovable();
    }

    handleGameStart(){
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
                        this.isGameRuninng = true;
                    }
                }
            })
        })
    }

    handleGameRestart(){
        this.restartText.on("pointerdown", () => {
            this.physics.resume();
            this.player.setVelocityY(0);

            this.obstacles.clear(true, true);
            this.gameOverContainer.setAlpha(0);
            this.anims.resumeAll();
            
            this.isGameRuninng = true;
        })
    }

    handleObstacleCollisions(){
        this.physics.add.collider(this.player, this.obstacles, () => {
            this.isGameRuninng = false;
            this.physics.pause();
            this.player.die();
            this.gameOverContainer.setAlpha(1);

            this.spawnTime = 0;
            this.gameSpeed = 5;
        })
    }
}

export default PlayScene;