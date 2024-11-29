import GameManager from "../scripts/GameManager";
import TweenManager from "../scripts/TweenManager";
import assets from "../scripts/assets";
import config from "../scripts/config";
import Button from "../prefabs/Button";
import _ from "../scripts/helper";

export default class Level extends Phaser.Scene {
    constructor() {
        super({ key: 'Level' });
        this.simulationActive = false;
        this.currentSimX = 0;
        this.simXIncrement = 0;
        this.collisionData = {};
        this.nBalls = 1;
    }

    editorCreate() {
        this.add.image(config.centerX, config.centerY, assets.bg).setAlpha(0.1);
        this.createLeftPanel();
        this.createBoard();
    }

    create() {
        this.oGameManager = new GameManager(this);
        this.oTweenManager = new TweenManager(this);
        this.editorCreate();
        this.setupCollisionHandling();
        // this.createSimulationButton();
        this.matter.world.setBounds(0, 0, config.width, config.height, 100, true, true, false, true);
        // Add labels for boundary bodies
        const bounds = this.matter.world.walls;
        if (bounds) {
            bounds.left.label = 'boundary_left';
            bounds.right.label = 'boundary_right';
            bounds.bottom.label = 'boundary_bottom';
        }
    }

    createLeftPanel() {

        const COLORS = {
            primary: 0x4466ff,    // Bright blue
            secondary: 0x6600ff,  // Purple
            dark: 0x1a1a2e,      // Dark blue
            darker: 0x0f0f1d,    // Darker blue
            highlight: 0x00ffff,  // Cyan
            text: 0xffffff       // White
        };
        const logoContainer = this.add.container(440, 110);

        const logo = this.add.image(0, 0, assets.logo)
            .setScale(0.5)
            .setOrigin(0.5);

        this.tweens.add({
            targets: logo,
            y: {
                from: -5,
                to: 5
            },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        logoContainer.add(logo);



        // Risk Level Section
        const riskY = 340;
        const riskOptions = ['low', 'medium', 'high'];

        // Modern header
        const riskHeader = this.add.container(440, riskY - 50);
        const headerBase = this.add.image(0, 0, assets.blue_base).setScale(1.2);
        riskHeader.add(headerBase);

        // Stylized text with shadow and stroke
        const headerText = this.add.text(0, 0, 'RISK LEVEL', {
            fontSize: '28px',
            fontFamily: 'Impact',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5);

        riskHeader.add([headerBase, headerText]);

        // Card-style risk buttons
        riskOptions.forEach((risk, index) => {
            const y = riskY + 30 + (index * 60);
            const button = this.add.container(440, y);

            // Replace card background with image
            const buttonImage = this.add.image(0, 0, assets.btn_purple);

            const text = this.add.text(0, 0, risk.toUpperCase(), {
                fontSize: '24px',
                fontFamily: 'Impact',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            button.add([buttonImage, text]);

            // Update hover effects for image
            button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)
                .on('pointerover', () => {
                    text.setTint(COLORS.highlight);
                    this.input.setDefaultCursor('pointer');
                })
                .on('pointerout', () => {
                    text.clearTint();
                    this.input.setDefaultCursor('default');
                })
                .on('pointerdown', () => {
                    this.oGameManager.setRisk(risk);
                    this.createBoard();
                });
        });

        // Rows Selection
        const rowsY = 630;

        // Circular container
        const rowsContainer = this.add.container(440, rowsY);

        // Main circle
        const circleBg = this.add.image(0, 0, assets.rowsCount_base).setScale(0.7);

        // Row number display
        const rowsText = this.add.text(0, -10, this.oGameManager.currentRows.toString(), {
            fontSize: '48px',
            fontFamily: 'Impact',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const rowsLabel = this.add.text(0, 30, 'ROWS', {
            fontSize: '24px',
            fontFamily: 'Impact',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Arrow buttons
        const leftBtn = this.add.image(-100, 0, assets.arrow)
            .setFlipX(true);
        const rightBtn = this.add.image(100, 0, assets.arrow);

        rowsContainer.add([circleBg, rowsText, rowsLabel, leftBtn, rightBtn]);

        // Arrow button effects
        [leftBtn, rightBtn].forEach((btn, index) => {
            btn.setInteractive()
                .on('pointerover', () => {
                    this.input.setDefaultCursor('pointer');
                })
                .on('pointerout', () => {
                    this.input.setDefaultCursor('default');
                })
                .on('pointerdown', () => {
                    // Check if changing rows would exceed limits
                    const newRows = this.oGameManager.currentRows + (index === 0 ? -1 : 1);
                    if (newRows < 8 || newRows > 16) return;
                    // Update row number display
                    rowsText.setText(newRows.toString());
                    this.oGameManager.setRows(newRows);
                    this.createBoard();
                });
        });

        // Place Bet Button
        const betButton = this.add.container(440, 820);

        const betButtonBg = this.add.image(0, 0, assets.btn_placeBet);
        betButton.add(betButtonBg);

        // Add hover effects for bet button
        betButton.setInteractive(new Phaser.Geom.Rectangle(-110, -35, 220, 70), Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => {
                this.input.setDefaultCursor('pointer');
            })
            .on('pointerout', () => {
                this.input.setDefaultCursor('default');
            })
            .on('pointerdown', () => {
                this.placeBet();
            });
    }

    createBoard() {
        // Clear existing board and physics bodies
        if (this.boardContainer) {
            // Remove all physics bodies
            const bodies = this.matter.world.localWorld.bodies;
            for (let i = bodies.length - 1; i >= 0; i--) {
                const body = bodies[i];
                if (body.label.includes('multiplier_') || body.label === 'peg') {
                    this.matter.world.remove(body);
                }
            }
            this.boardContainer.destroy();
        }

        // Reset multiplier boxes array
        this.oGameManager.multiplierBoxes = [];

        // Fixed dimensions that won't change regardless of rows
        const BOARD = {
            LEFT: 890,    // Fixed left position
            TOP: 250,     // Fixed top position
            WIDTH: 750,   // Fixed total width
            HEIGHT: 600,  // Fixed total height
            BOTTOM_GAP: 20 // Space for multiplier boxes at bottom
        };

        // Get current game settings
        const rows = this.oGameManager.currentRows;
        const multipliers = this.oGameManager.getCurrentMultipliers();

        // Calculate spacing and peg size based on fixed dimensions
        const verticalPlaySpace = BOARD.HEIGHT - BOARD.BOTTOM_GAP;
        const horizontalSpacing = BOARD.WIDTH / (rows + 2);
        const verticalSpacing = verticalPlaySpace / rows;

        this.boardContainer = this.add.container(0, 0);

        this.pegsContainer = this.add.container(0, 0).setAlpha(0);
        this.boardContainer.add(this.pegsContainer);

        // Create pegs with images instead of graphics
        for (let row = 0; row < rows; row++) {
            const pegsInRow = row + 3;
            const rowWidth = (pegsInRow - 1) * horizontalSpacing;
            const rowStartX = BOARD.LEFT + (BOARD.WIDTH - rowWidth) / 2;

            for (let i = 0; i < pegsInRow; i++) {
                const x = rowStartX + (i * horizontalSpacing);
                const y = BOARD.TOP + (row * verticalSpacing);

                // Main peg image and physics
                const peg = this.matter.add.image(x, y, assets.peg, null, {
                    shape: 'circle',
                    isStatic: true,
                    restitution: 0.5,
                    label: 'peg',
                    collisionFilter: {
                        category: 0x0001
                    }
                }).setScale(0.3 * (10 / rows));
                this.pegsContainer.add(peg);
                this.oGameManager.pegs[`${row}_${i}`] = {
                    peg: peg,
                };
            }
        }

        // Enhanced multiplier boxes with images
        const boxWidth = BOARD.WIDTH / multipliers.length;
        const boxHeight = 40;
        const boxY = BOARD.TOP + BOARD.HEIGHT - (boxHeight / 2);
        this.multiplierContainer = this.add.container(0, 0);
        this.boardContainer.add(this.multiplierContainer);
        multipliers.forEach((multiplier, index) => {
            const boxX = (this.oGameManager.pegs[`${rows - 1}_${index}`].peg.x +
                this.oGameManager.pegs[`${rows - 1}_${index + 1}`].peg.x) / 2;

            // Create container for multiplier box and physics
            const boxContainer = this.add.container(0, 0).setAlpha(0);
            this.multiplierContainer.add(boxContainer);
            const box = this.matter.add.image(boxX, boxY, assets.multiplier, null, {
                isStatic: true,
                label: `multiplier_${index}`,
                collisionFilter: {
                    category: 0x0001
                }
            }).setScale(10 / multipliers.length);
            box.setData({
                multiplier: multiplier
            });
            // Multiplier text with enhanced style
            const text = this.add.text(boxX, boxY, `${multiplier}x`, {
                fontSize: Math.min(24, boxWidth / 3),
                fill: '#00BFFF',
                fontFamily: 'Impact',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            boxContainer.add([box, text]);
            // Physics box (unchanged)

            this.oGameManager.multiplierBoxes.push({
                box: boxContainer,
                multiplier: multiplier,
            });
        });

        // Animate the board to fade in without horizontal movement
        this.tweens.add({
            targets: this.pegsContainer,
            alpha: 1,
            duration: 1000,
            delay: 200,
            ease: 'Quad.easeInOut'
        });
        this.tweens.add({
            targets: this.multiplierContainer.list,
            alpha: 1,
            duration: 1000,
            delay: 200,
            ease: 'Quad.easeInOut'
        });
    }

    placeBet() {
        if (this.oGameManager.userCredits >= this.oGameManager.betAmount) {
            // Find all indices where multiplier is 1.1
            // this.oGameManager.placeBet().then((betData) => {
            const targetMultiplier = 13;
            const targetIndices = this.oGameManager.multiplierBoxes
                .map((box, index) => box.multiplier === targetMultiplier ? index : -1)
                .filter(index => index !== -1);
            const selectedIndex = targetIndices[Math.floor(Math.random() * targetIndices.length)];
            const pathsForIndex = this.oGameManager.multiplierPaths[this.oGameManager.currentRows][selectedIndex];
            const randomPath = pathsForIndex[Math.floor(Math.random() * pathsForIndex.length)];
            const startX = randomPath;
            const startY = 100;
            this.dropBall(startX, startY, targetMultiplier);
            this.oGameManager.userCredits -= this.oGameManager.betAmount;
            // this.totalCreditsText.setText(`TOTAL CREDITS: ${_.appendMoneySymbolFront(_.formatCurrency(this.oGameManager.userCredits))}`)
            // });
        }
    }

    dropBall(x, y, targetMultiplier) {
        const ball = this.matter.add.image(x, y, assets.ball, null, {
            shape: 'circle',
            restitution: 0.5,
            friction: 0.05,
            label: `ball_${this.nBalls}`,
            collisionFilter: {
                category: 0x0002,
                mask: 0x0001,
                group: -1
            },
            density: 0.002,
            frictionAir: 0.001
        }).setScale(0.5 * (10 / this.oGameManager.currentRows));
        console.log(ball);
        this.nBalls++;
    }

    setupCollisionHandling() {
        // Setup collision event
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                // Check if collision is between ball and multiplier box
                if (this.isBallMultiplierCollision(bodyA, bodyB)) {
                    const ballBody = bodyA.label.includes('ball') ? bodyA : bodyB;
                    const ballNumber = parseInt(ballBody.label.split('_')[1]);
                    const multiplierBody = bodyA.label.includes('multiplier') ? bodyA : bodyB;
                    this.matter.world.remove(ballBody);
                    ballBody.gameObject.destroy();

                    const multiplierVisual = multiplierBody.gameObject.parentContainer;
                    if (multiplierVisual) {
                        // Flash animation
                        this.tweens.add({
                            targets: multiplierVisual,
                            y: (box) => box.y + 10,
                            duration: 100,
                            yoyo: true,
                            ease: 'Quad.easeInOut',
                            onComplete: () => {
                                // multiplierVisual.setPosition(multiplierBody.position.x, multiplierBody.position.y);
                                multiplierVisual.setY(0);
                                this.updateHistory(multiplierBody.gameObject.getData('multiplier'));
                            }
                        });
                    }
                }
                if (this.isBallBoundaryCollision(bodyA, bodyB)) {
                    const ballBody = bodyA.label.includes('ball') ? bodyA : bodyB;
                    ballBody.gameObject && ballBody.gameObject.destroy();
                    this.matter.world.remove(ballBody);
                }
            });

        });
    }

    isBallMultiplierCollision(bodyA, bodyB) {
        return (bodyA.label.includes('ball_') && bodyB.label.includes('multiplier_')) ||
            (bodyB.label.includes('ball_') && bodyA.label.includes('multiplier_'));
    }

    isBallBoundaryCollision(bodyA, bodyB) {
        return (bodyA.label.includes('ball') && bodyB.label.includes('boundary')) ||
            (bodyB.label.includes('ball') && bodyA.label.includes('boundary'));
    }
    updateHistory(multiplier) {
        if (!this.historyContainer) {
            this.historyContainer = this.add.container(config.width - 150, 300);
        }
        this.historyContainer.each((item, index) => {
            this.oTweenManager.moveOrScaleTo(item, { y: item.y + 60, duration: 300, ease: 'Power2' });
        });

        const historyItem = new Button(this, 0, 0, { text: `${multiplier}x` });
        this.historyContainer.add(historyItem);
        this.oTweenManager.moveOrScaleTo(historyItem, { scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.easeOut', callback: historyItem.setY(0) });

        if (this.historyContainer.length > 8) {
            const oldest = this.historyContainer.first;
            this.oTweenManager.alphaTo(oldest, { alpha: 0, duration: 200, callback: oldest.destroy() });
        }
    }
    showWinAmount(amount, x, y) {
        const winText = this.add.text(x, y, `+${amount}`, {
            fontSize: '24px',
            fill: '#00ff00',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: winText,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => winText.destroy()
        });
    }

    createWinEffect(x, y) {
        const particles = this.add.particles('flare'); // You'll need to load a particle texture

        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 20
        });

        // Stop the emitter after a short duration
        this.time.delayedCall(500, () => {
            emitter.stop();
            this.time.delayedCall(1000, () => {
                particles.destroy();
            });
        });
    }

    createSimulationButton() {
        const simButton = this.add.rectangle(100, 700, 180, 50, 0x83224b)
            .setInteractive()
            .on('pointerdown', () => {
                if (!this.simulationActive) {
                    this.startSimulation();
                } else {
                    this.stopSimulation();
                }
            });

        const simText = this.add.text(100, 700, 'START SIM', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Hover effect
        simButton.on('pointerover', () => simButton.setFillStyle(0x9e2a5a));
        simButton.on('pointerout', () => simButton.setFillStyle(0x83224b));

        this.simButton = simButton;
        this.simText = simText;
        this.collisionHandler()
    }

    startSimulation() {
        this.simulationActive = true;
        this.simText.setText('STOP SIM');

        // Get first row pegs positions
        const firstRowPegs = this.getFirstRowPegsPositions();
        this.currentSimX = firstRowPegs[0]; // Start from first peg
        this.simXIncrement = 0;  // Reset increment

        // Start the interval
        this.simInterval = setInterval(() => {
            if (this.simulationActive) {
                const newX = this.currentSimX + this.simXIncrement;
                this.dropSimBall(newX);

                // Increment X position by 0.1
                this.simXIncrement += 0.5;

                // Reset if we've gone past the last peg
                if (newX > firstRowPegs[firstRowPegs.length - 1]) {
                    // this.simXIncrement = 0;
                    // this.currentSimX = firstRowPegs[0];
                    this.simulationActive = false;
                    clearInterval(this.simInterval);
                    this.simText.setText('START SIM');
                }
            }
        }, 1000);
    }

    stopSimulation() {
        this.simulationActive = false;
        this.simText.setText('START SIM');
        clearInterval(this.simInterval);
    }

    getFirstRowPegsPositions() {
        // const startX = config.width / 2 + 150;
        // const pegSpacing = 50;
        const firstRowPegs = [];

        for (let i = 0; i < 3; i++) {
            const rawStartX = this.oGameManager.pegs[`${0}_${i}`].peg.x;
            firstRowPegs.push(rawStartX);
        }

        return firstRowPegs;
    }

    dropSimBall(x) {
        // Create ball with collision category and mask
        const ball = this.matter.add.image(x, 100, assets.ball, null, {
            shape: 'circle',
            restitution: 0.5,
            friction: 0.05,
            label: `sim_ball`,
            collisionFilter: {
                category: 0x0002,
                mask: 0x0001,
                group: -1
            },
            density: 0.002,
            frictionAir: 0.001
        }).setScale(0.5 * (10 / this.oGameManager.currentRows));
        ball.initialX = x;
    }
    collisionHandler = () => {
        this.matter.world.on('collisionstart', (event) => {

            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                if ((bodyA.label === 'sim_ball' || bodyB.label === 'sim_ball') &&
                    (bodyA.label.includes('multiplier_') || bodyB.label.includes('multiplier_'))) {

                    const ball = bodyA.label === 'sim_ball' ? bodyA : bodyB;
                    const multiplier = bodyA.label.includes('multiplier_') ? bodyA : bodyB;

                    const multiplierIndex = multiplier.label.split('_')[1];

                    // Store the initial X position for this multiplier
                    if (!this.collisionData[multiplierIndex]) {
                        this.collisionData[multiplierIndex] = [];
                    }
                    this.collisionData[multiplierIndex].push(ball.gameObject.initialX);
                    console.log(this.collisionData);

                    // Remove the ball after collision
                    this.matter.world.remove(ball);
                    ball.gameObject.destroy();
                }
            })
        });
    };
}