import { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/Player";
import { GameScene } from "./GameScene";
import { PRELOAD_CONFIG } from "..";

class PlayScene extends GameScene {

    player: Player;    
    ground: Phaser.GameObjects.TileSprite;
    obstacles: Phaser.Physics.Arcade.Group;
    clouds: Phaser.GameObjects.Group;
    gameOverText: Phaser.GameObjects.Image;
    restartText: Phaser.GameObjects.Image;
    startTrigger: SpriteWithDynamicBody;
    highScoreText: Phaser.GameObjects.Text;

    scoreText: Phaser.GameObjects.Text;

    gameOverContainer: Phaser.GameObjects.Container;
    score: number = 0;
    scoreInterval: number = 100;
    scoreDeltaTime: number = 0;

    spawnInterval: number = 1500;
    spawnTime: number = 0;
    gameSpeed: number = 4;
    gameSpeedModifier: number = 1;
    progressSound: Phaser.Sound.HTML5AudioSound;


    constructor(){
        super("PlayScene");
    }

    create(){
        this.createEnvironment();
        this.createPlayer();
        this.createObstacles();
        this.createGameOverContainer();
        this.createAnimations();
        this.createScore();
        this.handleGameStart();
        this.handleObstacleCollisions();
        this.handleGameRestart();

        this.progressSound = this.sound.add("progress", {volume: 0.2}) as Phaser.Sound.HTML5AudioSound;

    }

    update(time: number, delta: number): void {
        if(!this.isGameRuninng) { return; }

        this.spawnTime += delta;
        this.scoreDeltaTime += delta;
        if(this.scoreDeltaTime >= this.scoreInterval){
            this.score++
            this.scoreDeltaTime = 0;

            if(this.score % 100 === 0) { 
                this.gameSpeedModifier += 0.1;
                this.progressSound.play();
            
            this.tweens.add({
                targets: this.scoreText,
                duration: 100,
                repeat: 3,
                alpha: 0,
                yoyo: true
            })
        };
        }

        if(this.spawnTime >= this.spawnInterval){
            this.spawnObstacle();
            this.spawnTime = 0;
        }
        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed*this.gameSpeedModifier);
        Phaser.Actions.IncX(this.clouds.getChildren(), -0.5);

        const score = Array.from(String(this.score), Number);
        for(let i =0; i<5 - String(this.score).length; i ++){
            score.unshift(0);
        }
        this.scoreText.setText(score.join(""));

            this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody)=>{
                if(obstacle.getBounds().right < 0){
                    this.obstacles.remove(obstacle);
                }
            });
            this.clouds.getChildren().forEach((cloud: SpriteWithDynamicBody)=>{
                if(cloud.getBounds().right < 0){
                    cloud.x =this.gameWidth + 100;
                }
            });
            this.ground.tilePositionX += (this.gameSpeed*this.gameSpeedModifier)
        
    }

    createPlayer(){
        this.player = new Player(this, 0, this.gameHeight);
        }
    
    createEnvironment(){
        this.ground = this.add.tileSprite(0, this.gameHeight, 100, 26, "ground")
        .setOrigin(0, 1);

        this.clouds = this.add.group();

        this.clouds = this.clouds.addMultiple([
            this.add.image(this.gameWidth / 2, 170, "cloud"),
            this.add.image(this.gameWidth - 80, 80, "cloud"),
            this.add.image(this.gameWidth / 1.3, 100, "cloud")
        ])

        this.clouds.setAlpha(0);
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
    createAnimations(){
        this.anims.create({
            key: "enemy-bird-fly",
            frames: this.anims.generateFrameNumbers("enemy-bird"),
            frameRate: 6,
            repeat: -1
        })
    }

    createScore(){
        this.scoreText = this.add.text(this.gameWidth, 0, "00000", {
            fontFamily: "Arial",
            fontSize: 30,
            color: "#535353",
            resolution: 5
        }).setOrigin(1, 0).setAlpha(0);

        this.highScoreText = this.add.text(this.scoreText.getBounds().left - 20, 0, "00000", {
            fontFamily: "Arial",
            fontSize: 30,
            color: "#535353",
            resolution: 5
        }).setOrigin(1, 0).setAlpha(0);
    }
    spawnObstacle(){
        const obstacleNumber: number = Math.floor(Math.random() * PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount) + 1;
        const distance = Phaser.Math.Between(150, 300);
        let obstacle;

        if(obstacleNumber > PRELOAD_CONFIG.cactusesCount){
            const enemyPossibleHeight = [20, 70];
            const enemyHeigh = enemyPossibleHeight[Math.floor(Math.random() * 2)];
            obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight - enemyHeigh, "enemy-bird")
            obstacle.play("enemy-bird-fly", true);
        }
        else { 
            obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight, `obstacle-${obstacleNumber}`)
        }
        obstacle.setOrigin(0, 1).setImmovable(true);
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
                    this.ground.width +=20;  
                    if(this.ground.width >= this.gameWidth){
                        // we need to cut the excessively generated ground 
                        this.ground.width = this.gameWidth;
                        this.player.setVelocityX(0);
                        RollOutEvent.remove();
                        this.clouds.setAlpha(1);
                        this.scoreText.setAlpha(1);
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
            this.anims.pauseAll();
            this.player.die();
            this.gameOverContainer.setAlpha(1);

            const newHighScore = this.highScoreText.text.substring(this.highScoreText.text.length-5);
            const newScore = Number(this.scoreText.text) > Number(newHighScore) ? this.scoreText.text : newHighScore
            this.highScoreText.setText("HI " + newScore)
            this.highScoreText.setAlpha(1);
            
            this.score = 0;
            this.spawnTime = 0;
            this.scoreDeltaTime = 0;
            this.gameSpeedModifier = 1;
        })
    }
}

export default PlayScene;