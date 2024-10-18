let bird;
let birdStartX = 100; // Initial starting X position for the bird
let birdCanMove = true; // Flag to control bird's movement
let waterLevel = 470; // Y-coordinate of the water level
let fishGroup; // Group to store fish objects
let fishSpawnTimer; // Timer for spawning fish
let cursors;
let obstacles;
let score = 0;
let scoreText;
let obstacleTimer;
let currentBackground;
let health = 100; // Initialize health
let healthBar;
let gameActive = true; // Track the game state
let obstacleSpawnRate = 3000; // Initial obstacle spawn rate in milliseconds
let minSpawnRate = 800; // Minimum spawn rate to prevent too frequent obstacles
let speedMultiplier = 1; // Initial speed multiplier for obstacles
let gameStarted = false; // Track if the game has started
let gamePaused = false; // Global flag to track if the game is paused
let difficultyTimer;
let invincibilityTimer;
let isInvincible = false;
let invincibilityCountdown = 10; // Global countdown variable
let obstacleVelocity = -200; // Initial speed of obstacles
let maxFishCount = 10;  // Set the maximum number of fish allowed
let farthestLayer, midgroundLayer, foregroundLayer;
let birdAbsoluteX = 0; // Absolute X position of the bird in the world
let birdAbsoluteY = 0; // Absolute Y position of the bird in the world
const worldWidth = 30000; // Example width of the world in pixels
let birdSpeed = 2; // Bird's movement speed
let birdForward = true; 
const forwardSpeed = 3; // Speed when moving in the direction the bird is facing
const curiseSpeed = 1; // Speed when not actively moving forward/backward
let currentTimeOfDay = "day";  // Start with 'day'
let glideKey; // Declare it globally so it's accessible in other methods
let gameOver; // Declare the gameOver function globally
let highScoreTextObjects = []; // Declare globally to keep track of text objects
let water; // Declare water at the top of the scene so it's globally accessible
let music; // Declare a global variable for the music sound object
let musicVolume = 0.3; // Default music volume
let sfxVolume = 0.4; // Default SFX volume
let moveLeft = false;
let moveRight = false;
let flapUp = false;
let glideDown = false;
let volumeControl = false;
let pauseButton;
let buttonIcons;


class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

preload() {
    this.load.glsl('waterShader', 'Assets/waterShader.frag'); // Load the shader

    // Load the bird sprite sheet
    this.load.spritesheet('bird', 'Assets/bird_spritesheet_uniform.png', {
        frameWidth: 64, // Width of each frame in the bird sprite sheet
        frameHeight: 96 // Height of each frame in the bird sprite sheet
    });

    // Load farthest, mid, and foreground layers for each time of day
    this.load.image('backgroundDayFar', 'Assets/day_farthest.png');
    this.load.image('backgroundDayMid', 'Assets/day_midground.png');
    this.load.image('backgroundDayFore', 'Assets/day_foreground.png');
    
    this.load.image('backgroundSunsetFar', 'Assets/sunset_farthest.png');
    this.load.image('backgroundSunsetMid', 'Assets/sunset_midground.png');
    this.load.image('backgroundSunsetFore', 'Assets/sunset_foreground.png');
    
    this.load.image('backgroundNightFar', 'Assets/night_farthest.png');
    this.load.image('backgroundNightMid', 'Assets/night_midground.png');
    this.load.image('backgroundNightFore', 'Assets/night_foreground.png');

    // Load the fish spritesheet (assuming 3 frames: blue, red, orange)
    this.load.spritesheet('fish_spritesheet', 'Assets/fish_spritesheet_updated.png', { frameWidth: 256, frameHeight: 256 });

    // Load the obstacle spritesheet (assuming 3 frames: earth, fire, ice)
    this.load.spritesheet('obstacles_spritesheet', 'Assets/obstacles_spritesheet_aligned.png', { frameWidth: 256, frameHeight: 256 });

    this.load.spritesheet('buttonIcons', 'Assets/icon_spritesheet.png', { frameWidth: 100, frameHeight: 100});

/*     // Load icons
    this.load.image('pauseIcon', 'Assets/pause.png');
    this.load.image('gearIcon', 'Assets/gear.png');
    this.load.image('arrowIcon', 'Assets/arrow.png');
    this.load.image('glideIcon', 'Assets/glide.png');
    this.load.image('backIcon', 'Assets/back.png');
    this.load.image('plusIcon', 'Assets/plus.png');
    this.load.image('minusIcon', 'Assets/minus.png');
    this.load.image('spActionIcon', 'Assets/special.png');
 */    
    this.load.image('startIcon', 'Assets/start.png');
    this.load.image('restartIcon', 'Assets/restart.png');

    // Load sound effects
    this.load.audio('flap', 'Assets/flap.mp3');
    this.load.audio('splash', 'Assets/splash.mp3');
    this.load.audio('hurt', 'Assets/hurt.mp3');
    this.load.audio('destroy', 'Assets/destroy.mp3');
    this.load.audio('catch', 'Assets/catch.mp3');

    this.load.audio('gameMusic', 'Assets/Flapping Bird Game Music.mp3'); // Load your music file

    // Load WebFont Loader script
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

    // After loading WebFont loader, load the font
    this.load.on('complete', () => {
        WebFont.load({
            google: {
                families: ['Press Start 2P']
            },
            active: () => {
                this.fontLoaded = true; // Set a flag once the font is loaded
                console.log('Font loaded!');
            }
        });
    });
    
}

create() {

    // Automatically trigger full-screen on the first user interaction (click or touch)
    this.input.once('pointerdown', () => {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }
    });

    // Check if the global music object exists and is playing
    if (!music) {
        // Create the background music and set it to loop
        music = this.sound.add('gameMusic', {
            loop: true,
            volume: musicVolume // Use the current music volume
        });

        // Play the music
        music.play();
    } else {
        // If the music already exists, just make sure it's playing and set the correct volume
        if (!music.isPlaying) {
            music.play();
        }
        music.setVolume(musicVolume); // Ensure the volume is correct
    }

    // Create the farthest background layer and scale it to fit 800x600
    farthestLayer = this.add.tileSprite(400, 300, 1024, 1024, 'backgroundDayFar');
    farthestLayer.setDisplaySize(800, 600); // Scale it down to fit the game area
    farthestLayer.setDepth(-3); // Farthest layer

    // Create the midground background layer and scale it to fit 800x600
    midgroundLayer = this.add.tileSprite(400, 300, 1024, 1024, 'backgroundDayMid');
    midgroundLayer.setDisplaySize(800, 600); // Scale it down to fit the game area
    midgroundLayer.setDepth(-2); // Midground layer

    // Create the foreground background layer and scale it to fit 800x600
    foregroundLayer = this.add.tileSprite(400, 300, 1024, 1024, 'backgroundDayFore');
    foregroundLayer.setDisplaySize(800, 600); // Scale it down to fit the game area
    foregroundLayer.setDepth(-1); // Foreground layer

    // Add bird sprite and physics properties
    // Create bird sprite at the starting position
    bird = this.physics.add.sprite(birdStartX, 300, 'bird');
    bird.setCollideWorldBounds(true);

    // Define keyboard inputs
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P); // Add 'P' key for pausing

    cursors = this.input.keyboard.createCursorKeys();
    glideKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // Add "S" key for gliding
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // "A" key for moving left
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // "D" key for moving right
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); // Add "Q" key for flapping
    this.input.keyboard.on('keydown-I', () => {
        if (!bird.flipX) {
            bird.setFlipX(true); // Flip to face left
        } else {
            bird.setFlipX(false); // Flip back to face right
        }
    });
    // Set up input listener for the "P" key to toggle pause
    this.input.keyboard.on('keydown-P', () => {
            togglePause.call(this);
    });

    this.input.keyboard.on('keydown-ESC', () => {
        volumeControl = true; // Trigger volume settings
        this.scene.switch('VolumeMenuScene'); // Switch to volume menu when 'V' is pressed    
    });

    // Set up touch controls for mobile
    setupMobileControls.call(this);    

    // Add sound effects
    this.flapSound = this.sound.add('flap', { volume: sfxVolume  });
    this.splashSound = this.sound.add('splash', { volume: sfxVolume  });
    this.hurtSound = this.sound.add('hurt', { volume: sfxVolume  });
    this.destroySound = this.sound.add('destroy', { volume: sfxVolume  });
    this.catchSound = this.sound.add('catch', { volume: sfxVolume  });

    // Initialize flap sound timer (but don't start it yet)
    this.flapSoundTimer = null;

    // Set initial state based on the bird's starting position
    this.isUnderwater = false; // Assume bird starts above water
    
    // Create bird animations
    this.anims.create({
        key: 'flap',
        frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 2 }), // Adjust based on the number of frames in your spritesheet
        frameRate: 10, // Adjust frame rate as needed
        repeat: -1 // Infinite repeat
    });

    // Play the bird animation
    bird.play('flap');
    bird.setFrame(1); // Set to the first frame for start screen

    // Create obstacles and fish group
    obstacles = this.physics.add.group();
    fishGroup = this.physics.add.group();

    // Set up timed event for spawning obstacles
    obstacleTimer = this.time.addEvent({
        delay: 2000, // Use the initial spawn rate
        callback: spawnObstacle,
        callbackScope: this,
        loop: true,
    });

    // Set up timed event for spawning fish
    fishSpawnTimer = this.time.addEvent({
        delay: 5000, // Spawn fish every 5 seconds
        callback: spawnFish,
        callbackScope: this,
        loop: true,
    });

    // Set up timed event for increasing difficulty over time
    difficultyTimer = this.time.addEvent({
        delay: 5000, // Every 5 seconds
        callback: increaseDifficulty,
        callbackScope: this,
        loop: true,
    });
    
    // Add collision between bird and obstacles
    this.physics.add.collider(bird, obstacles, handleCollision, null, this);

    // Add score text with outline
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '20px',
        fill: '#fff', // Text color
        stroke: '#000', // Outline color (black)
        strokeThickness: 4 // Thickness of the outline
    }); 

    // Define `gameOver` inside `create` so it has access to `this`
    gameOver = (cause) => {

        gameActive = false; // Set the game state to inactive
        // Disable the pause button
        if (pauseButton) {
            pauseButton.disableInteractive(); // Disable interactions with the pause button
        }
            
        // Pause all game elements
        pauseGame.call(this);

        this.input.keyboard.off('keydown-P'); // This will remove the listener for 'keydown-P'

        // Change bird's color to indicate it "died"
        bird.setTint(0xff0000);
        bird.anims.stop();

        // Stop all sounds
        this.sound.stopAll();

        // Display the game-over message based on the cause
        if (cause === 'collision') {
            scoreText.setText('Game Over! Hit a fatal obstacle. Final Score: ' + score);
        } else if (cause === 'drowning') {
            scoreText.setText('Game Over! Health depleted underwater. Final Score: ' + score);
        } else {
            scoreText.setText('Game Over! Final Score: ' + score);
        }

        // Change font size
        scoreText.setStyle({ fontSize: '20px' });

        // Handle high scores (if implemented)
        updateHighScores(score);
        this.displayHighScores = displayHighScores.bind(this);
        this.displayHighScores(); // Now `this` inside displayHighScores will always refer to the scene

        const restartButton = this.add.image(400, 520, 'restartIcon').setInteractive(); // Assuming you have a restart icon loaded
        restartButton.setScale(0.5); // Adjust the scale as needed
        restartButton.on('pointerdown', () => {
            restartButton.destroy(); // Remove the restart button
            restartGame.call(this); // Call the restartGame function
        });


        // Listen for Shift+2 combination to detect the "@" key
        this.input.keyboard.on('keydown', (event) => {
            if (event.shiftKey && event.keyCode === Phaser.Input.Keyboard.KeyCodes.TWO) {
                if (confirm('Are you sure you want to reset all high scores? This cannot be undone.')) {
                    resetHighScores(); // Call the function to reset high scores
                    alert('High scores have been reset!');
                }
            }
        });

        // Function to reset high scores
        function resetHighScores() {
            localStorage.removeItem('highScores'); // Remove high scores from local storage
        }

    };

    // Set up the water shader for the shimmering effect
    this.waterShader = this.add.shader('waterShader', 400, waterLevel + 65, 800, 170);
    this.waterShader.setDepth(-1);  // Ensure it's layered below the bird and other game elements

    // Manually set the resolution for the shader
    this.waterShader.setUniform('resolution.value', [800, 170]);

    // Add collision detection for bird and fish
    this.physics.add.overlap(bird, fishGroup, catchFish, null, this);

    // Bind startInvincibilityCountdown to the current scene
    this.startInvincibilityCountdown = startInvincibilityCountdown.bind(this);

    // Declare countdownText
    this.countdownText = null;

    // --- Health Bar Initialization ---
    // Create the health bar container (gray background)
    this.healthBarContainer = this.add.graphics();
    this.healthBarContainer.fillStyle(0x808080, 1); // Gray color
    this.healthBarContainer.fillRect(16, 50, 104, 24); // Slightly larger than the health bar for a border effect

    // Create the health bar (red bar)
    this.healthBar = this.add.graphics();

    // Bind the updateHealthBar function to the current scene
    this.updateHealthBar = updateHealthBar.bind(this);

    // Draw the initial health bar
    this.updateHealthBar();

    // Set the initial position of the bird
    bird.setPosition(100, 300); // Reset the bird's position to the starting point
    bird.setVelocity(0); // Ensure no initial velocity

    // Pause the game on the first launch
    pauseGame.call(this);

    // Display the start message
    startMessage.call(this);
        
}

update(time, delta) {

    if (!gameStarted || !gameActive || gamePaused) {
        return; // Skip the update logic if the game hasn't started or is inactive
    }

    // Update the water shader to animate the shimmering effect
    this.waterShader.setUniform('time.value', this.time.now / 1000);

    if (fishGroup && fishGroup.getChildren().length > 0){
        fishGroup.children.iterate(function(fish) {
            if (!fish || !fish.body) return;
        
            fish.x -= birdSpeed;
    
            // Check if the fish has moved off-screen
            if (Math.abs(fish.x-bird.x) > 1600) {
                fish.destroy(); // Remove the fish when it's 2 screens away from the bird
            }
    
            // Handle random direction changes for the fish
            fish.changeDirectionTime -= delta;
            if (fish.changeDirectionTime <= 0) {
                fish.direction = -fish.direction; // Reverse direction
                let randomSpeed = Phaser.Math.Between(50, 150); // Generate random speed
                fish.setVelocityX(randomSpeed * fish.direction); // Update fish velocity
                fish.setFlipX(fish.direction > 0); // Flip the fish sprite if needed
                fish.changeDirectionTime = Phaser.Math.Between(5000, 8000); // Reset the change direction timer
            }
        });    
    }

    if (obstacles && obstacles.getChildren().length > 0) {
        obstacles.children.iterate(function(obstacle) {
            if (!obstacle || !obstacle.body) return;
    
            // Move the obstacle based on birdSpeed
            obstacle.x -= birdSpeed;
    
            // Check if the obstacle is two screens away from the bird and destroy it
            if (Math.abs(obstacle.x - bird.x) > 1600) {
                obstacle.destroy();  // Remove the obstacle when it's 2 screens away
            }
        });
    }

    // Calculate the bird's "bottom" position using a fixed offset
    let birdBottom = bird.y + 20; // Adjust '20' to match the bird's visual size

    // Check if the bird is entering the water
    if (birdBottom > waterLevel && !this.isUnderwater) {
        // Bird just entered the water
        this.splashSound.play(); // Play splash sound immediately
        this.isUnderwater = true; // Set flag to indicate bird is now underwater
    } 

    // Check if the bird is exiting the water
    else if (birdBottom <= waterLevel && this.isUnderwater) {
        // Bird just exited the water
        this.splashSound.play(); // Play splash sound immediately
        this.isUnderwater = false; // Reset flag to indicate bird is now above water
    }

    // Health decrease while underwater
    if (this.isUnderwater) {
        health -= 0.3; // Decrease health at a moderate rate
        this.updateHealthBar();

        // Check if health is zero or less
        if (health <= 0) {
            gameOver('drowning'); // Specify the cause as drowning
        }
    }

    // "A" and "D" keys change direction
    if (cursors.left.isDown || this.input.keyboard.keys[65].isDown || moveLeft) { // Left arrow or "A" key
        birdForward= false;
        bird.setVelocityX(-forwardSpeed); // Move left at the given speed
        bird.setFlipX(true); // Automatically flip the bird to face left
    }
    else if (cursors.right.isDown || this.input.keyboard.keys[68].isDown || moveRight) { // Right arrow or "D" key
        birdForward= true;
        bird.setVelocityX(forwardSpeed); // Move left at the given speed
        bird.setFlipX(false); // Automatically flip the bird to face left
    } else if (birdForward){
        bird.setVelocityX(curiseSpeed); // Move left at the given speed
    } else {
        bird.setVelocityX(-curiseSpeed); // Move left at the given speed
    }

    // Get the bird's current speed
    birdSpeed = bird.body.velocity.x;

    // Ensure the bird stays within screen bounds (800px width)
    bird.x = Math.max(0, Math.min(800, bird.x + birdSpeed)); // Restrict bird movement between 0 and 800

    // Update the absolute bird position (useful for world calculations)
    birdAbsoluteX += birdSpeed;

    // Move parallax layers 
    farthestLayer.tilePositionX += birdSpeed * 0.0001;  // Farthest layer moves subtly
    midgroundLayer.tilePositionX += birdSpeed * 0.3;    // Mid-ground moves moderately
    foregroundLayer.tilePositionX += birdSpeed * 0.6;   // Foreground moves the fastest


    // Flap upwards when the spacebar is pressed or held down
    if (cursors.space.isDown || this.qKey.isDown || flapUp) {
        bird.setVelocityY(-200);

        // Start flap sound timer if it's not already running
        if (!this.flapSoundTimer) {
            this.flapSound.play(); // Play the sound immediately
            this.flapSoundTimer = this.time.addEvent({
                delay: 300, // Adjust this value to control the flap sound interval
                callback: () => {
                    this.flapSound.play();
                },
                loop: true
            });
        }

        if (bird.anims.currentAnim.key !== 'flap' || !bird.anims.isPlaying) {
            bird.play('flap', true); // Play the flapping animation if not already playing
        }
    } else {
        // Stop the flap sound timer when the spacebar is not pressed
        if (this.flapSoundTimer) {
            this.flapSoundTimer.remove(); // Remove the timer
            this.flapSoundTimer = null;
        }

        if (glideKey.isDown || glideDown) {
            // Apply a slow descent to simulate gliding
            bird.setVelocityY(5);
            bird.setFrame(1); // Set bird to the current gliding image (glide)
        } else {
            // Normal descent due to gravity
            bird.setVelocityY(150);
            bird.setFrame(2); // Set bird to the current gliding image (fall)
        }
    }

    // Tilt the bird based on its velocity for a visual effect
    if (bird.body.velocity.y < 0) {
        bird.angle = -15; // Tilt up when flapping
    } else if (bird.body.velocity.y > 0) {
        bird.angle = 15; // Tilt down when falling or gliding
    }
    
    // Increase score as the game progresses
    scoreText.setText('Score: ' + score);


    // Cycle backgrounds every 500 points, using sunset twice
    let newTimeOfDay;  // Temporary variable to check the new time of day based on the score
    if (score % 2000 >= 0 && score % 2000 < 500) {
        newTimeOfDay = 'day';  // Day from 0 to 500
    } else if (score % 2000 >= 500 && score % 2000 < 1000) {
        newTimeOfDay = 'sunset';  // Sunset from 500 to 1000
    } else if (score % 2000 >= 1000 && score % 2000 < 1500) {
        newTimeOfDay = 'night';  // Night from 1000 to 1500
    } else if (score % 2000 >= 1500 && score % 2000 < 2000) {
        newTimeOfDay = 'sunset';  // Sunset again from 1500 to 2000
    }
    
    if (newTimeOfDay !== currentTimeOfDay) {
        // Change the time of day
        currentTimeOfDay = newTimeOfDay;
        changeBackground.call(this, currentTimeOfDay);    
    }    
}


}

function spawnObstacle() {
    // Randomly select an obstacle type
    const obstacleTypes = ['earth', 'fire', 'ice'];
    let selectedType = Phaser.Utils.Array.GetRandom(obstacleTypes);

    // Create the obstacle sprite using the obstacles spritesheet
    let obstacleY = Phaser.Math.Between(50, 450);
    let obstacle = obstacles.create(800, obstacleY, 'obstacles_spritesheet');

    // Set the frame based on the selected obstacle type
    if (selectedType === 'earth') {
        obstacle.setFrame(0); // earth is the first frame
        obstacle.obstacleType = 'earth'; // Set the obstacle type
    } else if (selectedType === 'fire') {
        obstacle.setFrame(1); // Fire is the second frame
        obstacle.obstacleType = 'fire'; // Set the obstacle type
    } else if (selectedType === 'ice') {
        obstacle.setFrame(2); // Ice is the third frame
        obstacle.obstacleType = 'ice'; // Set the obstacle type
    }

    // Set obstacle properties
    obstacle.setVelocityX(obstacleVelocity * speedMultiplier); // Use the multiplier to adjust speed
    obstacle.body.allowGravity = false; // Disable gravity for the obstacle
    obstacle.setImmovable(true); // Make the obstacle immovable
    obstacle.setScale(0.3); // Scale down to match the bird's siz
    
    // Adjust the physics body size to match the scaled-down obstacle
    obstacle.body.setSize(obstacle.width * 0.6, obstacle.height * 0.6);

    // Optionally, adjust the offset to center the hitbox within the sprite
    obstacle.body.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);

/*     // Remove the obstacle when it goes off-screen
    obstacle.setCollideWorldBounds(false);
    obstacle.body.checkWorldBounds = true;
    obstacle.body.outOfBoundsKill = true;    */ 

    // Start bobbing effect for obstacles if score is around 1500 or higher
    if (score >= 1500) {
        this.tweens.add({
            targets: obstacle,
            y: obstacle.y + 30, // Moves obstacle 20 pixels up and down
            duration: 1000, // Duration of one bobbing cycle
            yoyo: true, // Make it reverse after reaching the end
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut' // Smooth sine wave movement
        });
    }    

}

function spawnFish() {

    if (fishGroup.getChildren().length >= maxFishCount) {
        return;  // Don't spawn a new fish if we already have too many
    } 

    // Randomly select a fish type
    const fishTypes = ['blue', 'red', 'orange'];
    let selectedFishType = Phaser.Utils.Array.GetRandom(fishTypes);

    // Randomize initial movement direction (left or right)
    let direction = Phaser.Math.Between(0, 1) === 0 ? 1 : -1;

    // Flip fish horizontally if moving to the left
     if (direction <0){
        var fishX = 1; // Start the fish off the right side of the screen
    } else {
        var fishX = 800; // Start the fish off the right side of the screen
    }

    // Random Y position for the fish within a deeper range
    let initialFishY = Phaser.Math.Between(waterLevel + 20, waterLevel + 80); // Random depth between water surface and deeper in water

    // Create fish using the fish spritesheet
    let fish = fishGroup.create(fishX, initialFishY, 'fish_spritesheet');

    // Set the frame based on the selected fish type
    if (selectedFishType === 'blue') {
        fish.setFrame(0); // Assuming blue fish is the first frame
    } else if (selectedFishType === 'red') {
        fish.setFrame(1); // Assuming red fish is the second frame
    } else if (selectedFishType === 'orange') {
        fish.setFrame(2); // Assuming orange fish is the third frame
    }

    // Assign the selected fish type to the fish's custom property
    fish.fishType = selectedFishType;

    // Scale down the fish sprite to fit on the screen
    fish.setScale(0.2); // Adjust this value as needed

    // Set the horizontal velocity to make the fish scroll left or right
    fish.direction = direction;
    let speed = Phaser.Math.Between(-50, -150);
    fish.setVelocityX(speed * fish.direction); // Adjust the speed as necessary
    fish.setFlipX(fish.direction < 0);

    // Random time interval to change direction (between 2 to 4 seconds)
    fish.changeDirectionTime = Phaser.Math.Between(2000, 4000);

    // Disable gravity for the fish to prevent falling downwards
    fish.body.allowGravity = false;

    // Adjust the collision box size to match the scaled-down fish
    fish.body.setSize(fish.width * 0.5, fish.height * 0.5); // Adjust the size to your needs

    // Add bobbing animation to the fish using tweens
    this.tweens.add({
        targets: fish,
        y: initialFishY + 30, // Bobbing range: fish can move 30 pixels up and down from its initial Y position
        yoyo: true, // Moves up and down
        repeat: -1, // Infinite repetition
        duration: 1000, // Time in milliseconds for one cycle
        ease: 'Sine.easeInOut' // Smooth easing for bobbing effect
    });


}


function handleCollision(bird, obstacle) {
    let obstacleType = obstacle.obstacleType; // Assume obstacle type is stored in a custom property

    // Check if bird has a power that matches the obstacle type
    if ((bird.power === 'blue' && obstacleType === 'fire') ||
        (bird.power === 'red' && obstacleType === 'ice') ||
        (bird.power === 'orange' && obstacleType === 'earth')) {

        // Play the destroy sound
        this.destroySound.play();            

        // Destroy the obstacle and give bonus points
        obstacle.destroy();
        score += 200; // Bonus points
        scoreText.setText('Score: ' + score);
        health += 20;


        // Display bonus message
        let bonusText = this.add.text(bird.x, bird.y - 50, 'Bonus!', { fontSize: '32px', fill: '#ff0' });
        this.time.addEvent({
            delay: 1000,
            callback: () => bonusText.destroy()
        });
    } else {

        // Check if the bird is invincible and has a stored invincibility tint
        let originalTint = bird.tintTopLeft;  // Save current tint (used for invincibility)

        bird.setTint(0xff0000); // Change bird color to indicate collision

        // Apply knock-back and decrease health if the bird doesn't have the correct power
        bird.setVelocityX(-200); // Knock the bird back to the left
        bird.x-=20; // Move bird back
        health -= 20;
        this.updateHealthBar();

        // Play the hurt sound
        this.hurtSound.play();        

        // Check if health is zero or less
        if (health <= 0) {
            gameOver('collision'); // Specify the cause as a collision
        } else {
            // Allow the bird to move again after a short delay
            this.time.delayedCall(500, () => {
                bird.setVelocityX(0); // Stop horizontal movement after knock-back
                birdCanMove = true; // Allow the bird to move again
                // Restore the original tint (if invincible, this ensures invincibility tint remains)
                if (isInvincible) {
                    bird.setTint(originalTint); // Restore invincibility tint
                } else {
                    bird.setTint(0xffffff); // Clear tint if not invincible
                }            }, [], this);
        }

        // Destroy the obstacle regardless of power status
        obstacle.destroy();

    }
}

function startInvincibilityCountdown(fishType) {
    isInvincible = true; // Set the bird to be invincible
    bird.body.immovable = true; // Make the bird immovable

    invincibilityCountdown = 20; // Reset countdown to 20 seconds
    let invincibilityColor; // Color for the invincibility bar

    // Map fish types to the obstacles they can destroy
    let invincibilityType;
    if (fishType === 'blue') {
        bird.setTint(0x87CEFA); // Light blue tint
        invincibilityType = 'Fire';
    } else if (fishType === 'red') {
        bird.setTint(0xff0000); // Red tint
        invincibilityType = 'Ice';
    } else if (fishType === 'orange') {
        bird.setTint(0xffa500); // Orange tint
        invincibilityType = 'Earth';
    }

    // Get the current tint from the bird to use as the color for the invincibility bar
    invincibilityColor = bird.tintTopLeft; // Use bird's current tint value

    // Convert the invincibility color to hex string format for text use
    let invincibilityColorHex = Phaser.Display.Color.IntegerToColor(invincibilityColor).rgba; // Convert to RGBA format

    // If invincibilityBar already exists, destroy it first
    if (this.invincibilityBar) {
        this.invincibilityBar.destroy();
    }

   // Create the invincibility bar (same initial size as health bar)
   this.invincibilityBar = this.add.graphics();
   this.invincibilityBar.fillStyle(invincibilityColor, 1); // Set the fill style to match the invincibility color
   this.invincibilityBar.fillRect(18, 80, 100, 10); // Start with full-length bar (adjust position and size as needed)

    // If countdownText already exists, destroy it first
    if (this.countdownText) {
        this.countdownText.destroy();
    }

    // If there's already an invincibility timer running, remove it before starting a new one
    if (invincibilityTimer) {
        invincibilityTimer.remove();
    }    

    // Create a new countdown text and store it in the scene's context
    this.countdownText = this.add.text(16, 100, `${invincibilityType} Invincibility`, { 
        fontSize: '20px', 
        fill: invincibilityColorHex,  
        stroke: '#000', // Outline color (black)
        strokeThickness: 1 // Thickness of the outline
    });

    // Create the timer event and store it in the global `invincibilityTimer`
    invincibilityTimer = this.time.addEvent({
        delay: 1000, // 1 second
        callback: () => {
            if (!gamePaused && isInvincible) { // Only count down if the game is not paused
                invincibilityCountdown--;

                // Calculate the new width of the invincibility bar based on remaining time
                const invincibilityBarWidth = (invincibilityCountdown / 20) * 100; // Scale bar length by remaining time

                // Clear the previous bar and redraw it with the new width
                this.invincibilityBar.clear();
                this.invincibilityBar.fillStyle(invincibilityColor, 1); // Keep the color
                this.invincibilityBar.fillRect(18, 80, invincibilityBarWidth, 10); // Update bar width

                // When countdown reaches 0, end invincibility
                if (invincibilityCountdown <= 0) {
                    invincibilityTimer.remove();
                    this.countdownText.destroy(); // Destroy the countdown text
                    this.countdownText = null; // Clear the reference
                    this.invincibilityBar.destroy(); // Destroy the invincibility bar
                    bird.setTint(0xffffff); // Reset bird color
                    bird.body.immovable = false; // Make the bird movable again
                    isInvincible = false; // Remove invincibility
                    bird.power = null; // Remove bird's power
                    invincibilityType = null; // Clear the invincibility type
                }
            }
        },
        loop: true
    });
}

function catchFish(bird, fish) {

    // Get the type of fish caught
    let fishType = fish.fishType;

    // Set bird's power and color based on the fish type
    if (fishType === 'blue') {
        bird.setTint(0x87CEEB); // Change bird color to blue
        bird.power = 'blue';
    } else if (fishType === 'red') {
        bird.setTint(0xff0000); // Change bird color to red
        bird.power = 'red';
    } else if (fishType === 'orange') {
        bird.setTint(0xffa500); // Change bird color to orange
        bird.power = 'orange';
    }

    // Remove the fish
    fish.destroy();

    // Increase health (but not beyond the maximum)
    health = Math.min(health + 20, 100);
    this.updateHealthBar();

    // Display "Health Bonus!" text
    let bonusText = this.add.text(bird.x, bird.y - 50, 'Health Bonus!', { fontSize: '24px', fill: '#00ff00' });
    this.time.addEvent({
        delay: 1000, // Display the message for 1 second
        callback: () => bonusText.destroy()
    });    

    // Set invincibility and start countdown
    this.startInvincibilityCountdown(fish.fishType);

    this.catchSound.play();
}

function changeBackground(timeOfDay) {
    let farKey, midKey, foreKey;  // Keys for the background layers
    
    if (timeOfDay === 'day') {
        farKey = 'backgroundDayFar';
        midKey = 'backgroundDayMid';
        foreKey = 'backgroundDayFore';
    } else if (timeOfDay === 'sunset') {
        farKey = 'backgroundSunsetFar';
        midKey = 'backgroundSunsetMid';
        foreKey = 'backgroundSunsetFore';
    } else if (timeOfDay === 'night') {
        farKey = 'backgroundNightFar';
        midKey = 'backgroundNightMid';
        foreKey = 'backgroundNightFore';
    }

    // Cross-fade the parallax layers to the new textures
    this.tweens.add({
        targets: [farthestLayer, midgroundLayer, foregroundLayer],
        alpha: 0,  // Fade out
        duration: 500,  // 1/2 second fade-out
        onComplete: () => {
            // Set the new textures
            farthestLayer.setTexture(farKey);
            midgroundLayer.setTexture(midKey);
            foregroundLayer.setTexture(foreKey);
            
            // Fade them back in
            this.tweens.add({
                targets: [farthestLayer, midgroundLayer, foregroundLayer],
                alpha: 1,  // Fade in
                duration: 500  // 1/2 second fade-in
            });
        }
    });
}

function updateHealthBar() {
    // Debugging
    if (this.healthBar) {
        // Clear the previous health bar
        this.healthBar.clear();

        // Calculate health percentage
        let healthPercentage = health / 100;

        // Draw the health bar (red rectangle)
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(18, 52, 100 * healthPercentage, 20); // Adjust the size and position
    }     
}

function getHighScores() {
    const storedScores = localStorage.getItem('highScores');
    return storedScores ? JSON.parse(storedScores) : [];
}

function saveHighScores(highScores) {
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function updateHighScores(newScore) {
    let highScores = getHighScores();

    // If the new score qualifies for the top 5, prompt for the player's name
    if (highScores.length < 5 || newScore > highScores[4].score) {
        let playerName = prompt("Congratulations! You made the top 5! Enter your name:");

        // Check if the user canceled the prompt
        if (!playerName) {
            playerName = "Anonymous";  // Default name if canceled
        }

        const newEntry = { name: playerName, score: newScore };

        // Add the new score and sort the list
        highScores.push(newEntry);
        highScores.sort((a, b) => b.score - a.score);

        // Keep only the top 5 scores
        if (highScores.length > 5) {
            highScores = highScores.slice(0, 5);
        }

        // Save the updated high scores
        saveHighScores(highScores);
    }
}

function displayHighScores() {
    
        // Fetch and display high scores in the game over screen
        const highScores = getHighScores();
        let yPosition = 150; // Starting Y position for the first score

        // Create a text style for the high scores
        const textStyle = {
            fontFamily: '"Press Start 2P"', // Custom font
            fontSize: '24px',
            fill: '#FFD700', // Gold color
            stroke: '#000', // Black stroke for better readability
            strokeThickness: 4,
            align: 'center'
        };

        // Animate the high scores
        highScores.forEach((entry, index) => {
            let highScoreTextDisplay = `${index + 1}. ${entry.name} ${entry.score}`;
            
            // Create the text object
            let textObject = this.add.text(400, yPosition, highScoreTextDisplay, textStyle).setOrigin(0.5);

            // Add the text object to the global array for tracking
            highScoreTextObjects.push(textObject);
            
            // Add fade-in and scale animation
            this.tweens.add({
                targets: textObject,
                alpha: { from: 0, to: 1 }, // Fade in
                scale: { from: 0.5, to: 1 }, // Scale up
                duration: 1000, // 1 second duration
                ease: 'Bounce.easeOut', // Smooth easing
                delay: index * 200, // Stagger the animation based on index
                onComplete: () => {
                    textObject.setScale(1); // Ensure the scale resets to 1 after animation
                },
                onCompleteScope: this
            });

            yPosition += 50; // Increase Y position for the next score
        });

}

function increaseDifficulty() {
    // Gradually decrease the spawn rate, but cap it at minSpawnRate
    if (obstacleSpawnRate > minSpawnRate) {
        obstacleSpawnRate -= 100; // Reduce spawn rate by 100ms
        obstacleSpawnRate = Math.max(obstacleSpawnRate, minSpawnRate); // Clamp to minSpawnRate
        obstacleTimer.reset({ delay: obstacleSpawnRate, callback: spawnObstacle, callbackScope: this, loop: true });
    }

    // Gradually increase the speed multiplier, but cap it at a maximum value (e.g., 3)
    speedMultiplier += 0.1; // Increase the multiplier gradually
    speedMultiplier = Math.min(speedMultiplier, 3); // Clamp to a maximum value of 3
}

function restartGame() {

    // Re-enable the pause button
    if (pauseButton) {
        pauseButton.setInteractive(); // Enable interactions with the pause button
    }    

    // Re-enable the "P" key to toggle pause
    this.input.keyboard.on('keydown-P', () => {
        togglePause.call(this);
    });    

    // In restartGame or any function where you want to reset the high scores
    if (highScoreTextObjects.length > 0) {
        highScoreTextObjects.forEach(text => text.destroy());
        highScoreTextObjects = []; // Clear the array after destroying
    }

    // Reset game variables
    gameStarted = false;
    gameActive = true;
    health = 100;
    score = 0;
    isUnderwater = false;
    isInvincible = false;
    bird.power = null;

    // Reset bird properties
    bird.clearTint();
    bird.setPosition(100, 300);
    bird.setVelocity(0, 0);
    bird.anims.play('flap', true);
    bird.setFrame(1); // Set to the first frame (change the frame number if needed)
    bird.flipX = false; // Reset the bird's flip state

    // Update score and health UI
    scoreText.setText('Score: 0');
    this.updateHealthBar();

    // Clear all existing obstacles and fish
    obstacles.clear(true, true);
    fishGroup.clear(true, true);

    // Remove previous timers
    if (obstacleTimer) obstacleTimer.remove();
    if (fishSpawnTimer) fishSpawnTimer.remove();
    if (difficultyTimer) difficultyTimer.remove();
    if (invincibilityTimer) invincibilityTimer.remove();

    // Reset difficulty level and multiplier
    speedMultiplier = 1.0; // Reset to initial speed
    obstacleSpawnRate = 3000; // Reset to initial spawn rate

    // Recreate obstacle spawning timer
    obstacleTimer = this.time.addEvent({
        delay: obstacleSpawnRate,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true,
    });

    // Recreate fish spawning timer
    fishSpawnTimer = this.time.addEvent({
        delay: 3000,
        callback: spawnFish,
        callbackScope: this,
        loop: true,
    });

    // Recreate difficulty timer
    difficultyTimer = this.time.addEvent({
        delay: 5000,
        callback: increaseDifficulty,
        callbackScope: this,
        loop: true,
    });

    // Check if the global music object exists or is playing
    if (!music || !music.isPlaying) {
        // Create the background music and set it to loop
        music = this.sound.add('gameMusic', {
            loop: true,
            volume: musicVolume // Use the current music volume
        });
        music.play(); // Play the music again
    } else {
        // If the music is already playing, just set the volume
        music.setVolume(musicVolume); // Ensure the volume is correctly set
    }

    // Pause everything before showing the start prompt
    pauseGame.call(this);

    startMessage.call(this);
    
    // Clear previous input listeners
    this.input.keyboard.removeAllListeners();

    // Reinitialize pause listener
    this.input.keyboard.on('keydown-P', togglePause, this);

    // Reinitialize the listener for the "I" key to flip the bird
    this.input.keyboard.on('keydown-I', () => {
        bird.setFlipX(!bird.flipX);
    });
 
    // Reinitialize the listener for the "V" key to open the volume menu
    this.input.keyboard.on('keydown-ESC', () => {
        this.scene.switch('VolumeMenuScene');
    });

}

function togglePause() {
    if (!gameStarted) return; // Ignore pause if the game hasn't started

    gamePaused = !gamePaused; // Toggle the pause flag

    if (gamePaused) {

        pauseGame.call(this);

         // Display the pause text
        this.pauseText = this.add.text(400, 300, 'Game Paused', { fontSize: '32px', fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
          });
        this.pauseText.setOrigin(0.5);
        
    } else {

        resumeGame.call(this);

        // Remove the pause text
        if (this.pauseText) this.pauseText.destroy();
    }
}

function pauseGame() {

    gamePaused = true; // Set the game as paused

    // Pause the game physics
    this.physics.pause();

    // Pause bird animation
    bird.anims.pause();

    // Pause all timers
    if (obstacleTimer) obstacleTimer.paused = true;
    if (fishSpawnTimer) fishSpawnTimer.paused = true;
    if (difficultyTimer) difficultyTimer.paused = true;
    if (invincibilityTimer) invincibilityTimer.paused = true;

    // Pause obstacle and fish animations
    obstacles.children.iterate(obstacle => {
        if (obstacle && obstacle.anims) obstacle.anims.pause();
    });

    fishGroup.children.iterate(fish => {
        if (fish && fish.anims) fish.anims.pause();
    });
    
    game.sound.mute = true;        
}

function resumeGame() {

    gamePaused = false; // Set the game as active again

    // Resume the game physics
    this.physics.resume();

    // Resume bird animation
    if (bird && bird.anims) {
        bird.anims.resume();
    }

    // Resume all timers (make sure timers exist before resuming)
    if (obstacleTimer && obstacleTimer.paused) {
        obstacleTimer.paused = false;
    }
    if (fishSpawnTimer && fishSpawnTimer.paused) {
        fishSpawnTimer.paused = false;
    }
    if (difficultyTimer && difficultyTimer.paused) {
        difficultyTimer.paused = false;
    }
    if (invincibilityTimer && invincibilityTimer.paused) {
        invincibilityTimer.paused = false;
    }

    // Check if obstacles is defined before resuming animations
    if (obstacles) {
        const obstacleChildren = obstacles.getChildren ? obstacles.getChildren() : null;
        if (obstacleChildren && obstacleChildren.length > 0) {
            obstacles.children.iterate(obstacle => {
                if (obstacle && obstacle.anims) {
                    obstacle.anims.resume();
                }
            });
        }
    }

    // Check if fishGroup is defined before resuming animations
    if (fishGroup) {
        const fishChildren = fishGroup.getChildren ? fishGroup.getChildren() : null;
        if (fishChildren && fishChildren.length > 0) {
            fishGroup.children.iterate(fish => {
                if (fish && fish.anims) {
                    fish.anims.resume();
                }
            });
        }
    }

    // Unmute the sound
    game.sound.mute = false;
}

function startMessage(){
    // Show the start message
    const startMessage = 'Press to Start';
    const startButton = this.add.image(400, 300, 'startIcon').setInteractive(); // Assuming you have a back icon loaded
    startButton.setScale(0.5); // Adjust the scale as needed
    startButton.on('pointerdown', () => {
        gameStarted = true;
        startText.destroy();
        startButton.destroy();
        resumeGame.call(this);

        // Apply an initial flap to the bird
        bird.setVelocityY(-200);

    });

    const startText = this.add.text(400, 300, startMessage, {
        fontSize: '32px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 5
    });
    startText.setOrigin(0.5);

}


function setupMobileControls() {
    const buttonSize = 50; // Define size of touchable areas
    const halfButtonSize = buttonSize / 2;

    
    // Adjusting button size based on Phaser’s scale manager dimensions
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let buttonScale = isMobile ? 1:0.5; // Smaller on mobile
    

    // --- Movement Controls (Left/Right) ---
    const leftArrow = this.add.sprite(50, 500, 'buttonIcons',0).setInteractive(); // Assumes arrow icon is preloaded
    leftArrow.setTintFill(0xffffff); // Set to red tint
    leftArrow.setAlpha(0.3).setScale(buttonScale); // Smaller and more transparent
    leftArrow.setAngle(180); // Use degrees, 0 is default, 180 is upside down

    const rightArrow = this.add.sprite(200, 500, 'buttonIcons',0).setInteractive(); // Assumes arrow icon is preloaded
    rightArrow.setTintFill(0xffffff); // Set to red tint
    rightArrow.setAlpha(0.3).setScale(buttonScale); // Smaller and more transparent
    
    leftArrow.on('pointerdown', () => { moveLeft = true; });
    leftArrow.on('pointerup', () => { moveLeft = false; });
    leftArrow.on('pointerout', () => { moveLeft = false; }); // Ensure movement stops if pointer leaves button

    rightArrow.on('pointerdown', () => { moveRight = true; });
    rightArrow.on('pointerup', () => { moveRight = false; });
    rightArrow.on('pointerout', () => { moveRight = false; }); // Ensure movement stops if pointer leaves button    

    // --- Flap & Glide Controls ---

    const flapButton = this.add.sprite(720, 450, 'buttonIcons',0).setInteractive(); // Assumes arrow icon is preloaded
    flapButton.setTintFill(0xffffff); // Set to red tint
    flapButton.setAlpha(0.4).setScale(buttonScale); // Smaller and more transparent
    flapButton.setAngle(270); // Use degrees, 0 is default, 180 is upside down

    const glideButton = this.add.image(580, 530, 'buttonIcons',3).setInteractive(); // Assumes glide icon is preloaded
    glideButton.setTintFill(0xffffff); // Set to red tint
    glideButton.setAlpha(0.5).setScale(buttonScale); // Smaller and more transparent

    flapButton.on('pointerdown', () => { flapUp = true; });
    flapButton.on('pointerup', () => { flapUp = false; });
    flapButton.on('pointerout', () => { flapUp = false; }); // Ensure flap stops if pointer leaves button

    glideButton.on('pointerdown', () => { glideDown = true; });
    glideButton.on('pointerup', () => { glideDown = false; });
    glideButton.on('pointerout', () => { glideDown = false; }); // Ensure glide stops if pointer leaves button

    // --- Pause Button ---
    pauseButton = this.add.sprite(705, 50, 'buttonIcons',6).setInteractive(); // Assumes pause icon is preloaded
    pauseButton.setAlpha(0.8).setScale(0.4).setTintFill(0xffffff); // Smaller and more transparent
    pauseButton.on('pointerdown', () => togglePause.call(this));

    // Full-Screen Button (positioned next to pause button)
    let fullscreenButton = this.add.sprite(650, 50, 'buttonIcons',9).setInteractive(); // Assuming frame 9 for full screen icon
    fullscreenButton.setAlpha(0.8).setScale(0.4).setTintFill(0xffffff); // Smaller and more transparent
    fullscreenButton.on('pointerdown', () => {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    });

    // --- Volume Button ---
    const volumeButton = this.add.sprite(760, 50, 'buttonIcons',2).setInteractive(); // Assumes volume icon is preloaded
    volumeButton.setAlpha(0.5).setScale(0.4).setTintFill(0xffffff); // Smaller and more transparent
    volumeButton.on('pointerdown', () => this.scene.switch('VolumeMenuScene')); // Switch to volume settings scene
}

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainScene, VolumeMenuScene], // Add the new scene to the game
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,  // Automatically resize to fit within the window
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game horizontally and vertically
        fullscreenTarget: 'gameCanvas'  // The target element for full-screen mode
    },
    input: {
        activePointers: 3 // Allow up to 3 touch points simultaneously
    }
};

const game = new Phaser.Game(config);

