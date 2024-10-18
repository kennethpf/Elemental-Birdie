class VolumeMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VolumeMenuScene' });
    }


    preload() {
        // If you have any assets to load, such as button graphics, preload them here

    }

    create() {
    
        // Create the background and title for the volume menu
        this.add.text(400, 50, 'Settings', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Create the volume bars
        this.createVolumeBars();

        const plusButtonX = 538;
        const minusButtonX = 265;        
        const musicButtonY = 160;
        const sfxButtonY = 210;

        const backButton = this.add.sprite(760, 50, 'buttonIcons',1).setInteractive(); // Assuming you have a back icon loaded
        backButton.setScale(0.4); // Scale the button down to half size
        backButton.setTintFill(0xffffff); // Add a white tint to the button
        backButton.on('pointerdown', () => {
            this.scene.switch('MainScene'); // Switch back to the main game scene
        });

        const musicPlusButton = this.add.sprite(plusButtonX, musicButtonY, 'buttonIcons',7).setInteractive(); // Assuming you have a back icon loaded
        musicPlusButton.setScale(0.3); // Scale the button down to half size
        musicPlusButton.setTintFill(0xffffff); // Add a white tint to the button
        musicPlusButton.on('pointerdown', () => {
            this.setMusicVolume(musicVolume + 0.1); // Increase music volume
        });

        const musicMinusButton = this.add.sprite(minusButtonX, musicButtonY, 'buttonIcons',5).setInteractive(); // Assuming you have a back icon loaded
        musicMinusButton.setScale(0.3); // Scale the button down to half size
        musicMinusButton.on('pointerdown', () => {
            this.setMusicVolume(musicVolume - 0.1); // Decrease music volume        
        });

        const sfxPlusButton = this.add.sprite(plusButtonX, sfxButtonY, 'buttonIcons',7).setInteractive(); // Assuming you have a back icon loaded
        sfxPlusButton.setScale(0.3); // Scale the button down to half size
        sfxPlusButton.setTintFill(0xffffff); // Add a white tint to the button
        sfxPlusButton.on('pointerdown', () => {
            this.setSfxVolume(sfxVolume + 0.1); // Increase SFX volume
        });

        const sfxMinusButton = this.add.sprite(minusButtonX, sfxButtonY, 'buttonIcons',5).setInteractive(); // Assuming you have a back icon loaded
        sfxMinusButton.setScale(0.3); // Scale the button down to half size
        sfxMinusButton.on('pointerdown', () => {
            this.setSfxVolume(sfxVolume - 0.1); // Decrease SFX volume
        });

      
    }

    createVolumeBars() {
        // Create the background for the music volume bar (gray rectangle)
        const musicVolumeBarBg = this.add.graphics();
        musicVolumeBarBg.fillStyle(0x808080, 1); // Gray color
        musicVolumeBarBg.fillRect(300, 150, 200, 20); // Background bar position

        // Create the music volume bar (yellow filled rectangle)
        this.musicVolumeBar = this.add.graphics();
        this.musicVolumeBar.fillStyle(0xffff00, 1); // Yellow color for volume
        this.musicVolumeBar.fillRect(300, 150, 200 * musicVolume, 20); // Fill based on current volume level

        // Create the background for the sound effects (SFX) volume bar
        const sfxVolumeBarBg = this.add.graphics();
        sfxVolumeBarBg.fillStyle(0x808080, 1); // Gray color
        sfxVolumeBarBg.fillRect(300, 200, 200, 20); // Background bar position

        // Create the SFX volume bar (green filled rectangle)
        this.sfxVolumeBar = this.add.graphics();
        this.sfxVolumeBar.fillStyle(0x00ff00, 1); // Green color for SFX volume
        this.sfxVolumeBar.fillRect(300, 200, 200 * sfxVolume, 20); // Fill based on current volume level

        // Add text labels for each bar
        this.add.text(100, 150, 'Music Volume', { fontSize: '18px', fill: '#fff' });
        this.add.text(100, 200, 'SFX Volume', { fontSize: '18px', fill: '#fff' });
    }


    setMusicVolume(newVolume) {
        // Update the global music volume
        musicVolume = Phaser.Math.Clamp(newVolume, 0, 1); // Ensure volume stays within valid range
    
        // Update the volume bar UI
        this.musicVolumeBar.clear();
        this.musicVolumeBar.fillStyle(0xffff00, 1);
        this.musicVolumeBar.fillRect(300, 150, 200 * musicVolume, 20);
    
        // Directly reference the global `music` object
        if (music) {
            music.setVolume(musicVolume); // Adjust the actual music volume immediately
        } else {
            console.warn('Global music object not found');
        }    
    }
    
    setSfxVolume(newVolume) {
        sfxVolume = Phaser.Math.Clamp(newVolume, 0, 1); // Ensure volume stays within valid range
        this.sfxVolumeBar.clear(); // Clear the previous volume bar
        this.sfxVolumeBar.fillStyle(0x00ff00, 1); // Green color for the SFX volume bar
        this.sfxVolumeBar.fillRect(300, 200, 200 * sfxVolume, 20); // Update bar width based on new volume
    
        // Adjust each individual sound effect volume (flap, splash, hurt, etc.)
        this.sound.sounds.forEach(sound => {
            if (sound.key !== 'gameMusic') {  // Ensure we don't adjust music volume here
                sound.setVolume(sfxVolume); // Adjust the volume for each sound effect
            }
        });

    }

}