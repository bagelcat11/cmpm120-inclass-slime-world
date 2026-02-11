class Overworld extends Phaser.Scene {
    constructor() {
        super('overworldScene')
    }

    init() {
        this.VEL = 100  // slime velocity constant
    }

    preload() {
        this.load.path = './assets/'
        this.load.spritesheet('slime', 'slime.png', {
            frameWidth: 16,
            frameHeight: 16
        })

        // first load tileset image
        this.load.image("tileset-image", "tileset.png");
        // then load map json
        this.load.tilemapTiledJSON("tilemap-json", "overworld.json");
    }

    create() {
        // create tilemap (key)
        const map = this.add.tilemap("tilemap-json");
        // add image to map (name FROM TILED IN JSON, key)
        const tileset = map.addTilesetImage("tileset", "tileset-image");
        // add layers back to front (Tiled layer name, tileset object)
        const bgLayer = map.createLayer("background", tileset);
        const terrainLayer = map.createLayer("terrain", tileset);
        const treeLayer = map.createLayer("trees", tileset);

        // add slime
        // query map for spawn object from Tiled to get coords
        // (find obj that has name we want from Tiled)
        const slimeSpawn = map.findObject("spawns", (obj) => obj.name === "player-spawn");
        this.slime = this.physics.add.sprite(slimeSpawn.x, slimeSpawn.y, 'slime', 0)
        this.slime.body.setCollideWorldBounds(true)

        // slime animation
        this.anims.create({
            key: "jiggle",
            frameRate: 4,
            repeat: -1,
            frames: this.anims.generateFrameNumbers("slime", {
                start: 0,
                end: 1
            })
        });
        this.slime.play("jiggle");

        // configure camera scroll
        // use widthInPixels since default is tiles
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.slime, true, 0.5, 0.5);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // set up collisions with map
        // we selected all tiles in Tiled and made "collides" property,
        //      then checked it for certain tiles
        terrainLayer.setCollisionByProperty({collides: true});

        // create phaser collider
        // collision boxes are solely squares..
        this.physics.add.collider(this.slime, terrainLayer);

        treeLayer.setCollisionByProperty({collides: true});
        this.physics.add.collider(this.slime, treeLayer);

        // input
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    update() {
        // slime movement
        this.direction = new Phaser.Math.Vector2(0)
        if(this.cursors.left.isDown) {
            this.direction.x = -1
        } else if(this.cursors.right.isDown) {
            this.direction.x = 1
        }

        if(this.cursors.up.isDown) {
            this.direction.y = -1
        } else if(this.cursors.down.isDown) {
            this.direction.y = 1
        }

        this.direction.normalize()
        this.slime.setVelocity(this.VEL * this.direction.x, this.VEL * this.direction.y)
    }
}