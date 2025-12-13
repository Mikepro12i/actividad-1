// =========================================================
// CONFIGURACIÓN INICIAL (Modificada para inicio directo)
// =========================================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // Usamos las funciones globales para el inicio inmediato
    scene: { preload: preload, create: create, update: update } 
};

const game = new Phaser.Game(config);

// --- Variables Globales ---
let player, cursors, keys;
let worldLayer, waterLayer, grassLayer; 
let slimes, chestsGroup, sword;
let playerHealthBar, uiText, gameOverText, restartButton;

// RPG Stats (Inicialización)
let playerStats = {
    level: 1, currentXp: 0, xpToNextLevel: 100,
    hp: 100, maxHp: 100, damage: 10, defense: 0, speed: 160
};
let inventory = { hasSword: false };
let isAttacking = false;
let isInvincible = false;
let playerLastDirection = 'down';

const MAX_SLIMES = 20; // Nueva cantidad máxima de slimes

// =========================================================
// PRELOAD
// =========================================================
function preload() {
    // 1. Mapa
    this.load.tilemapTiledJSON('skullIsland', 'assets/maps/skullisland.json');

    // 2. Tilesets
    this.load.image('tiles_base', 'assets/tilesets/tiles.png'); 
    this.load.image('surplus_trees', 'assets/tilesets/Surplus Trees.png');
    this.load.image('houses_assets', 'assets/tilesets/houses assets.png');
    this.load.image('houses_outline', 'assets/tilesets/houses assets outline.png');
    this.load.image('tx_stone', 'assets/tilesets/Texture/TX Tileset Stone Ground.png');
    this.load.image('tx_props_extra', 'assets/tilesets/Texture/Extra/TX Props with Shadow.png');
    this.load.image('scene_overview', 'assets/tilesets/Scene Overview.png');
    this.load.image('tx_struct', 'assets/tilesets/Texture/TX Struct.png');

    // 3. Sprites
    this.load.spritesheet('player', 'assets/images/player_sprite.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('slime', 'assets/images/slime.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('espada', 'assets/images/espada.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('cofre', 'assets/images/cofre-espada.png', { frameWidth: 32, frameHeight: 32 });
}

// =========================================================
// CREATE
// =========================================================
function create() {
    // Aseguramos que los stats se reinicien si se llama a scene.restart
    resetPlayerStats(); 
    createAnims(this.anims);

    const map = this.make.tilemap({ key: 'skullIsland' });

    // --- CONEXIÓN DE TILESETS ---
    const t_tiles_base = map.addTilesetImage('tiles', 'tiles_base'); 
    const t_surplus = map.addTilesetImage('Surplus Trees', 'surplus_trees');
    const t_houses = map.addTilesetImage('houses assets', 'houses_assets');
    const t_houses_outline = map.addTilesetImage('houses assets outline', 'houses_outline');
    const t_stone = map.addTilesetImage('TX Tileset Stone Ground', 'tx_stone');
    const t_props = map.addTilesetImage('TX Props', 'tx_props_extra'); 
    const t_scene = map.addTilesetImage('Scene Overview', 'scene_overview');
    const t_struct = map.addTilesetImage('TX Struct', 'tx_struct');

    const allTilesets = [t_tiles_base, t_surplus, t_houses, t_houses_outline, t_stone, t_props, t_scene, t_struct];

    // --- CREACIÓN DE CAPAS ---
    waterLayer = map.createLayer('agua', allTilesets, 0, 0);
    grassLayer = map.createLayer('pasto', allTilesets, 0, 0); 
    const walkableLayer = map.createLayer('terreno_walkable', allTilesets, 0, 0);
    worldLayer = map.createLayer('montañas', allTilesets, 0, 0); 
    const stoneLayer = map.createLayer('suelo_piedra', allTilesets, 0, 0);
    const bossLayer = map.createLayer('jefes', allTilesets, 0, 0);

    // --- COLISIONES DEL MAPA ---
    if(worldLayer) worldLayer.setCollisionByExclusion([-1]);
    if(waterLayer) waterLayer.setCollisionByExclusion([-1]);
    
    // Configurar cámara
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- JUGADOR ---
    const spawnX = 1700; 
    const spawnY = 4000; 
    player = this.physics.add.sprite(spawnX, spawnY, 'player');
    player.setCollideWorldBounds(true);

    // Colisiones del jugador contra el mapa
    if(worldLayer) this.physics.add.collider(player, worldLayer);
    if(waterLayer) this.physics.add.collider(player, waterLayer);

    this.cameras.main.startFollow(player);

    sword = this.add.sprite(0, 0, 'espada').setVisible(false);

    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D'); 

    // --- OBJETOS Y ENEMIGOS ---
    chestsGroup = this.physics.add.staticGroup();
    createSpecificChest(this, spawnX + 50, spawnY - 50, 'sword'); 
    
    slimes = this.physics.add.group();
    
    // Colisiones de enemigos
    if(worldLayer) this.physics.add.collider(slimes, worldLayer);
    if(waterLayer) this.physics.add.collider(slimes, waterLayer);
    this.physics.add.collider(slimes, slimes);

    // Spawn inicial y configuración del re-spawn
    spawnEnemiesSafe(this, map, worldLayer, MAX_SLIMES);
    
    // ** TIMER DE RE-SPAWN CONTINUO (20 Slimes) **
    this.time.addEvent({
        delay: 15000, // Intenta spawnear cada 15 segundos
        callback: () => {
            const currentSlimes = slimes.countActive(true);
            const neededSlimes = MAX_SLIMES - currentSlimes;
            
            if (neededSlimes > 0) {
                spawnEnemiesSafe(this, map, worldLayer, neededSlimes);
            }
        },
        loop: true
    });

    // Interacciones
    this.physics.add.overlap(player, chestsGroup, onChestOverlap, null, this);
    this.physics.add.overlap(player, slimes, onPlayerHitBySlime, null, this);
    this.physics.add.overlap(sword, slimes, onSlimeHitBySword, null, this);

    this.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown() && inventory.hasSword && !isAttacking) {
            attack(this);
        }
    });

    createUI(this);
}

// =========================================================
// UPDATE
// =========================================================
function update(time, delta) {
    if (playerStats.hp <= 0) return;
    handlePlayerMovement();
    slimes.children.each(slime => {
        if (slime.active) updateSlimeAI(this, slime);
        if (!slime.active && slime.hpBar) slime.hpBar.destroy();
    });
    updateUI();
}


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

function resetPlayerStats() {
    playerStats = {
        level: 1, currentXp: 0, xpToNextLevel: 100,
        hp: 100, maxHp: 100, damage: 10, defense: 0, speed: 160
    };
    inventory = { hasSword: false };
    isAttacking = false;
    isInvincible = false;
    playerLastDirection = 'down';
}

function finishAttack(scene) {
    isAttacking = false;
    sword.setVisible(false);
    scene.physics.world.disable(sword);
}

function attack(scene) {
    if (isAttacking) return;
    
    isAttacking = true;
    player.setVelocity(0);
    
    sword.setVisible(true);
    sword.setPosition(player.x, player.y);

    if (playerLastDirection === 'right') { 
        sword.x += 20; sword.setAngle(0); sword.setFlipX(false); 
    } else if (playerLastDirection === 'left') { 
        sword.x -= 20; sword.setAngle(0); sword.setFlipX(true); 
    } else if (playerLastDirection === 'up') { 
        sword.y -= 20; sword.setAngle(-90); 
    } else { 
        sword.y += 20; sword.setAngle(90); 
    }

    sword.play('sword_swing');
    scene.physics.world.enable(sword);

    sword.once('animationcomplete', () => {
        finishAttack(scene);
    });
    scene.time.delayedCall(400, () => {
        if (isAttacking) finishAttack(scene);
    });
}

/**
 * FUNCIÓN CORREGIDA: Prioriza la capa 'pasto' para el spawn.
 */
function spawnEnemiesSafe(scene, map, collisionLayer, amount) {
    let count = 0;
    let attempts = 0;
    while (count < amount && attempts < 1000) {
        attempts++;
        let x = Phaser.Math.Between(50, map.widthInPixels - 50);
        let y = Phaser.Math.Between(50, map.heightInPixels - 50);
        
        let safe = true;
        let isGrass = false;

        // 1. Verificar si la posición es pasto (Target Layer)
        if (grassLayer) {
            let grassTile = grassLayer.getTileAtWorldXY(x, y);
            if (grassTile && grassTile.index !== -1) {
                isGrass = true;
            }
        }
        
        if (!isGrass) {
            safe = false; 
        }

        // 2. Chequeo de COLISIÓN (Montañas / Paredes / Árboles)
        if (safe && collisionLayer) { 
            let tile = collisionLayer.getTileAtWorldXY(x, y);
            if (tile && tile.index !== -1) {
                safe = false; 
            }
        }
        
        if (safe) {
            let level = Phaser.Math.Between(1, 3); 
            spawnSlime(scene, x, y, level); 
            count++;
        }
    }
}


function spawnSlime(scene, x, y, level) {
    let slime = slimes.create(x, y, 'slime');
    slime.level = level;
    slime.maxHealth = 20 + (level * 10); 
    slime.health = slime.maxHealth;
    slime.damage = 5 + (level * 2);
    
    if (level === 1) slime.setTint(0x55ff55); 
    if (level === 2) { slime.setTint(0x5555ff); slime.setScale(1.1); }
    if (level === 3) { slime.setTint(0xff0000); slime.setScale(1.3); }

    slime.play('slime_jump');
    slime.setCollideWorldBounds(true);
    slime.hpBar = scene.add.graphics();
}

function createSpecificChest(scene, x, y, type) {
    let chest = chestsGroup.create(x, y, 'cofre');
    chest.rewardType = type;
    chest.opened = false;
    chest.body.setSize(30, 30);
    chest.setOffset(1, 1);
}

function onChestOverlap(player, chest) {
    if (chest.opened) return;
    if (chest.rewardType !== 'sword') return;

    chest.opened = true;
    chest.play('chest_open');
    inventory.hasSword = true;
    playerStats.damage += 15;
    
    let txt = chest.scene.add.text(chest.x - 50, chest.y - 40, "¡ESPADA OBTENIDA!", {
        fontSize: '14px', fill: '#ffff00', backgroundColor: '#000'
    });
    chest.scene.time.delayedCall(3000, () => txt.destroy());
    chest.body.enable = false;
}

function onPlayerHitBySlime(player, slime) {
    if (isInvincible || playerStats.hp <= 0) return;
    let damageTaken = slime.damage - playerStats.defense;
    if (damageTaken < 1) damageTaken = 1;
    playerStats.hp -= damageTaken;
    isInvincible = true;
    player.setTint(0xff0000);
    player.scene.tweens.add({
        targets: player, alpha: 0.5, duration: 100, yoyo: true, repeat: 5,
        onComplete: () => { player.clearTint(); player.alpha = 1; isInvincible = false; }
    });
    if (playerStats.hp <= 0) gameOver(player.scene); // Pasar la escena actual
}

function onSlimeHitBySword(sword, slime) {
    if (slime.invulnerable) return;
    slime.health -= playerStats.damage;
    slime.invulnerable = true;
    slime.setTint(0xffffff);
    let angle = Phaser.Math.Angle.Between(player.x, player.y, slime.x, slime.y);
    player.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), 250, slime.body.velocity);

    if (slime.health <= 0) {
        gainXp(slime.level * 25, player.scene); 
        if(slime.hpBar) slime.hpBar.destroy();
        slime.destroy(); 
    } else {
        player.scene.time.delayedCall(300, () => {
             slime.invulnerable = false;
             slime.setVelocity(0); 
             if(slime.level===1) slime.setTint(0x55ff55);
             if(slime.level===2) slime.setTint(0x5555ff);
             if(slime.level===3) slime.setTint(0xff0000);
        });
    }
}

function gainXp(amount, scene) {
    playerStats.currentXp += amount;
    if (playerStats.currentXp >= playerStats.xpToNextLevel) {
        playerStats.level++;
        playerStats.currentXp -= playerStats.xpToNextLevel;
        playerStats.xpToNextLevel = Math.floor(playerStats.xpToNextLevel * 1.5);
        playerStats.maxHp += 20;
        playerStats.hp = playerStats.maxHp;
        playerStats.damage += 5;
        playerStats.defense += 1;
        let txt = scene.add.text(player.x, player.y - 50, "¡NIVEL SUBIDO!", {
            fontSize: '20px', fill: '#00ff00', stroke: '#000', strokeThickness: 4
        }).setDepth(100);
        scene.time.delayedCall(2000, () => txt.destroy());
    }
}

function handlePlayerMovement() {
    if (isAttacking) return; 
    
    player.setVelocity(0);
    let speed = playerStats.speed;
    
    let movingX = false;
    let movingY = false;
    
    if (keys.A.isDown || cursors.left.isDown) {
        player.setVelocityX(-speed); player.anims.play('right', true); player.setFlipX(true); playerLastDirection = 'left'; movingX = true;
    } else if (keys.D.isDown || cursors.right.isDown) {
        player.setVelocityX(speed); player.anims.play('right', true); player.setFlipX(false); playerLastDirection = 'right'; movingX = true;
    }
    
    if (keys.W.isDown || cursors.up.isDown) {
        player.setVelocityY(-speed); 
        if (!movingX) player.anims.play('up', true); 
        playerLastDirection = 'up'; movingY = true;
    } else if (keys.S.isDown || cursors.down.isDown) {
        player.setVelocityY(speed); 
        if (!movingX) player.anims.play('down', true); 
        playerLastDirection = 'down'; movingY = true;
    }
    
    if (!movingX && !movingY) {
        player.anims.stop();
    }

    player.body.velocity.normalize().scale(speed);
}

function updateSlimeAI(scene, slime) {
    // Código para la barra de vida del Slime
    slime.hpBar.clear(); 
    slime.hpBar.fillStyle(0x000000, 1); 
    slime.hpBar.fillRect(slime.x - 15, slime.y - 25, 30, 4);
    slime.hpBar.fillStyle(0xff0000, 1);
    let hpPercent = slime.health / slime.maxHealth; 
    if(hpPercent < 0) hpPercent = 0;
    slime.hpBar.fillRect(slime.x - 15, slime.y - 25, 30 * hpPercent, 4);
    
    // Código de movimiento del Slime
    let dist = Phaser.Math.Distance.Between(player.x, player.y, slime.x, slime.y);
    if (dist < 200 && !slime.invulnerable) { scene.physics.moveToObject(slime, player, 50 + (slime.level * 10)); }
    else if (!slime.invulnerable) { slime.setVelocity(0); }
}

function createUI(scene) {
    playerHealthBar = scene.add.graphics().setScrollFactor(0);
    uiText = scene.add.text(10, 40, 'Lvl: 1', { fontSize: '16px', fill: '#ffffff', stroke: '#000', strokeThickness: 3 }).setScrollFactor(0);
    gameOverText = scene.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#ff0000', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setVisible(false);
    restartButton = scene.add.text(400, 400, 'REINTENTAR', { fontSize: '32px', fill: '#fff', backgroundColor: '#333' }).setOrigin(0.5).setScrollFactor(0).setInteractive().setVisible(false);
    restartButton.on('pointerdown', () => scene.scene.restart());
}

function updateUI() {
    playerHealthBar.clear(); 
    playerHealthBar.fillStyle(0x000000, 0.5); 
    playerHealthBar.fillRect(10, 10, 200, 20);
    let percent = playerStats.hp / playerStats.maxHp; 
    if (percent < 0) percent = 0;
    playerHealthBar.fillStyle(0xff0000, 1); 
    playerHealthBar.fillRect(10, 10, 200 * percent, 20);
    
    let items = ""; 
    if (inventory.hasSword) items += "⚔️ ";
    
    uiText.setText(`Nivel: ${playerStats.level} | XP: ${playerStats.currentXp}/${playerStats.xpToNextLevel}\nHP: ${playerStats.hp}/${playerStats.maxHp}\nDaño: ${playerStats.damage} | Def: ${playerStats.defense}\nItems: ${items}`);
}

function createAnims(anims) {
    anims.create({ key: 'down', frames: anims.generateFrameNumbers('player', { start: 4, end: 7 }), frameRate: 10, repeat: -1 });
    anims.create({ key: 'up', frames: anims.generateFrameNumbers('player', { start: 8, end: 11 }), frameRate: 10, repeat: -1 });
    anims.create({ key: 'right', frames: anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    anims.create({ key: 'slime_jump', frames: anims.generateFrameNumbers('slime', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    anims.create({ key: 'sword_swing', frames: anims.generateFrameNumbers('espada', { start: 0, end: 1 }), frameRate: 20, repeat: 0 }); 
    anims.create({ key: 'chest_open', frames: anims.generateFrameNumbers('cofre', { start: 0, end: 2 }), frameRate: 8, repeat: 0 });
}

function gameOver(scene) {
    slimes.clear(true, true); 
    player.setTint(0x000000); 
    player.setVelocity(0);
    gameOverText.setVisible(true); 
    restartButton.setVisible(true);
}