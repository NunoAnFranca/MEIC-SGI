import * as THREE from "three";

class MyMenu {
    constructor(app, loader) {
        this.app = app;
        this.loader = loader;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // blimp menu variables
        this.matchTime = null;
        this.currentMatchTime = 0;
        this.lastWindVelocity = null;
        this.currentWindVelocity = "None";
        this.currentGameState = "PREPARATION";
        this.lastGameState = null;
        this.lastLaps = null;
        this.currentLaps = 0;
        this.lastVouchers = null;
        this.currentVouchers = 0;

        // initial menu variables
        this.totalLaps = 1;
        this.penaltySeconds = 1;
        this.playerUsername = "Type here...";
        this.namePlayerBalloon = null;
        this.nameOponentBalloon = null;
        this.writingUsername = false;

        // Game over menu variables
        this.winner = null;
        this.loser = null;
        this.lapsCompleted = null;
        this.winnerTime = null;

        this.loadBlimpMenu();
        this.loadStartMenu();
        this.loadGameOverMenu();
        this.onKeyDown = this.onKeyDown.bind(this);
        window.addEventListener('click', (event) => this.onMouseClick(event));
    }

    loadBlimpMenu() {
        const textTime = "Time: ";
        const textNumbers = String(this.currentMatchTime);
        const textLaps = "Laps: " + this.currentLaps + "/" + this.totalLaps;
        const textWind = "Wind: " + this.currentWindVelocity;
        const textVouchers = "Vouchers: " + this.currentVouchers;
        const textGameStatus = "Status: " + this.currentGameState;

        this.textTimeGroup = new THREE.Group();
        this.textNumbersGroup = new THREE.Group();
        this.textLapsGroup = new THREE.Group();
        this.textWindGroup = new THREE.Group();
        this.textVouchersGroup = new THREE.Group();
        this.textGameStatusGroup = new THREE.Group();

        this.menuGroup = new THREE.Group();

        this.convertTextToSprite(textTime, this.textTimeGroup);
        this.convertTextToSprite(textNumbers, this.textNumbersGroup);
        this.convertTextToSprite(textLaps, this.textLapsGroup);
        this.convertTextToSprite(textWind, this.textWindGroup);
        this.convertTextToSprite(textVouchers, this.textVouchersGroup);
        this.convertTextToSprite(textGameStatus, this.textGameStatusGroup);


        this.textTimeGroup.position.set(0, 11.5, 0);
        this.textNumbersGroup.position.set(1.4 * textTime.length, 11.5, 0);
        this.textLapsGroup.position.set(0, 9, 0);
        this.textWindGroup.position.set(0, 6.5, 0);
        this.textVouchersGroup.position.set(0, 4, 0);
        this.textGameStatusGroup.position.set(0, 1.5, 0);

        this.menuGroup.add(this.textTimeGroup, this.textLapsGroup, this.textWindGroup, this.textVouchersGroup, this.textGameStatusGroup, this.textNumbersGroup);

        this.menuGroup.position.set(69.5, 24, -60.5);
        this.menuGroup.rotation.set(0, - Math.PI / 3, 0);
        this.app.scene.add(this.menuGroup);
    }

    loadStartMenu() {
        const textAuthors = "Created by Nuno França & Luis Alves          @FEUP";
        const textUsername = "Username: " + this.playerUsername;
        const textPlayerBalloon = "Player Balloon: " + this.namePlayerBalloon;
        const textOponentBalloon = "Oponent Balloon: " + this.nameOponentBalloon;
        const textNumberOfLaps = "Number of Laps: " + this.totalLaps;
        const textPenalty = "Penalty (seconds): " + this.penaltySeconds;
        const textStartGame = "Start Game!";

        this.createButtonsPenalty();
        this.createButtonsLaps();
        this.createButtonUsername();
        this.createButtonChoosePlayer();
        this.createButtonChooseOponent();
        this.createButtonStartGame();

        this.textAuthorsGroup = new THREE.Group();
        this.textUsernameGroup = new THREE.Group();
        this.textPlayerBalloonGroup = new THREE.Group();
        this.textOponentBalloonGroup = new THREE.Group();
        this.textNumberOfLapsGroup = new THREE.Group();
        this.textPenaltyGroup = new THREE.Group();
        this.textStartGameGroup = new THREE.Group();

        this.startMenuGroup = new THREE.Group();

        this.convertTextToSprite(textAuthors, this.textAuthorsGroup);
        this.convertTextToSprite(textUsername, this.textUsernameGroup);
        this.convertTextToSprite(textPlayerBalloon, this.textPlayerBalloonGroup);
        this.convertTextToSprite(textOponentBalloon, this.textOponentBalloonGroup);
        this.convertTextToSprite(textNumberOfLaps, this.textNumberOfLapsGroup);
        this.convertTextToSprite(textPenalty, this.textPenaltyGroup);
        this.convertTextToSprite(textStartGame, this.textStartGameGroup);

        this.textAuthorsGroup.position.set(0, 0, 0);
        this.textAuthorsGroup.scale.set(0.6, 0.6, 0.6);
        this.textUsernameGroup.position.set(-4, 30, 0);
        this.textPlayerBalloonGroup.position.set(-4, 25, 0);
        this.textOponentBalloonGroup.position.set(-4, 20, 0);
        this.textNumberOfLapsGroup.position.set(-4, 15, 0);
        this.textPenaltyGroup.position.set(-4, 10, 0);
        this.textStartGameGroup.position.set(-4, 5, 0);

        this.startMenuGroup.add(this.textAuthorsGroup, this.textUsernameGroup, this.textPlayerBalloonGroup, this.textOponentBalloonGroup, this.textNumberOfLapsGroup, this.textPenaltyGroup, this.textStartGameGroup);

        this.startMenuGroup.position.set(-70, 11, -78.5);
        this.startMenuGroup.rotation.set(0, Math.PI / 3, 0);
        this.startMenuGroup.scale.set(0.5, 0.5, 0.5);
        this.app.scene.add(this.startMenuGroup);
    }

    loadGameOverMenu() {
        const textWinner = "Winner: " + this.winner;
        const lapsCompleted = "Laps completed: " + this.lapsCompleted;
        const winnerTime = "Winner Time: " + this.winnerTime;
        const textLoser = "Loser: " + this.loser;
        const textRestart = "Restart!";
        const textHomeMenu = "Home Menu! ";


        this.textWinnerGroup = new THREE.Group();
        this.textlapsCompletedGroup = new THREE.Group();
        this.textWinnerTimeGroup = new THREE.Group();
        this.textLoserGroup = new THREE.Group();
        this.textRestartGroup = new THREE.Group();
        this.textHomeMenuGroup = new THREE.Group();

        this.gameOverMenuGroup = new THREE.Group();

        this.convertTextToSprite(textWinner, this.textWinnerGroup);
        this.convertTextToSprite(lapsCompleted, this.textlapsCompletedGroup);
        this.convertTextToSprite(winnerTime, this.textWinnerTimeGroup);
        this.convertTextToSprite(textLoser, this.textLoserGroup);
        this.convertTextToSprite(textRestart, this.textRestartGroup);
        this.convertTextToSprite(textHomeMenu, this.textHomeMenuGroup);


        this.textWinnerGroup.position.set(-12, 0, 0);
        this.textlapsCompletedGroup.position.set(-12, -4, 0);
        this.textWinnerTimeGroup.position.set(-12, -8, 0);
        this.textLoserGroup.position.set(-12, -12, 0);
        this.textRestartGroup.position.set(-12, -20, 0);
        this.textHomeMenuGroup.position.set(-12, -24, 0);

        this.gameOverMenuGroup.add(this.textWinnerGroup, this.textlapsCompletedGroup, this.textWinnerTimeGroup, this.textLoserGroup, this.textRestartGroup, this.textHomeMenuGroup);

        this.gameOverMenuGroup.position.set(72.5,-49,-60);
        this.gameOverMenuGroup.rotation.set(0, Math.PI/2, 0);
        this.gameOverMenuGroup.scale.set(0.6, 0.6, 0.6);
        this.app.scene.add(this.gameOverMenuGroup);
    }

    updateGameOverMenu(){
        this.winner = this.app.contents.winner;
        this.loser = this.app.contents.loser;
        this.lapsCompleted = this.app.contents.totalLaps;
        this.winnerTime = this.currentMatchTime;

        const textWinner = "Winner: " + this.winner;
        const lapsCompleted = "Laps completed: " + this.lapsCompleted;
        const winnerTime = "Winner Time: " + this.winnerTime;
        const textLoser = "Loser: " + this.loser;

        while (this.textWinnerGroup.children.length > 0) {
            this.textWinnerGroup.remove(this.textWinnerGroup.children[0]);
        }
        while (this.textlapsCompletedGroup.children.length > 0) {
            this.textlapsCompletedGroup.remove(this.textlapsCompletedGroup.children[0]);
        }
        while (this.textWinnerTimeGroup.children.length > 0) {
            this.textWinnerTimeGroup.remove(this.textWinnerTimeGroup.children[0]);
        }
        while (this.textLoserGroup.children.length > 0) {
            this.textLoserGroup.remove(this.textLoserGroup.children[0]);
        }
        this.convertTextToSprite(textWinner, this.textWinnerGroup);
        this.convertTextToSprite(lapsCompleted, this.textlapsCompletedGroup);
        this.convertTextToSprite(winnerTime, this.textWinnerTimeGroup);
        this.convertTextToSprite(textLoser, this.textLoserGroup);


    }

    createButtonsPenalty() {
        this.buttonPenalty1 = new THREE.Group();
        this.buttonPenalty2 = new THREE.Group();

        let buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
        let buttonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
        let buttonGeometry2 = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);

        let buttonMesh1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh2 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh3 = new THREE.Mesh(buttonGeometry2, buttonMaterial);
        let buttonMesh4 = new THREE.Mesh(buttonGeometry2, buttonMaterial);

        this.buttonPenaltyPlus = new THREE.Group();
        this.buttonPenaltyMinus = new THREE.Group();
        this.convertTextToSprite("-", this.buttonPenaltyMinus);
        this.convertTextToSprite("+", this.buttonPenaltyPlus);

        this.buttonPenaltyPlus.position.set(0, 0.5, 0);
        this.buttonPenaltyPlus.scale.set(0.4, 0.4, 0.4);
        this.buttonPenaltyMinus.position.set(0, 0.5, 0);
        this.buttonPenaltyMinus.scale.set(0.4, 0.4, 0.4);

        buttonMesh3.visible = false
        buttonMesh4.visible = false;
        buttonMesh3.position.set(0, 0.5, 0);
        buttonMesh4.position.set(0, 0.5, 0);

        this.buttonPenalty1.add(buttonMesh1, buttonMesh3, this.buttonPenaltyMinus);
        this.buttonPenalty1.position.set(-62.4, 0, -93);
        this.buttonPenalty1.rotation.set(Math.PI / 2, 0, -Math.PI / 3);

        this.buttonPenalty2.add(buttonMesh2, buttonMesh4, this.buttonPenaltyPlus);
        this.buttonPenalty2.position.set(-60.7, 0, -96);
        this.buttonPenalty2.rotation.set(Math.PI / 2, 0, -Math.PI / 3);

        this.buttonsPenaltyGroup = new THREE.Group();
        this.buttonsPenaltyGroup.add(this.buttonPenalty1, this.buttonPenalty2);
        this.buttonsPenaltyGroup.position.set(0, 16, 0);

        this.app.scene.add(this.buttonsPenaltyGroup);
    }

    createButtonsLaps() {
        this.buttonLaps1 = new THREE.Group();
        this.buttonLaps2 = new THREE.Group();

        let buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
        let buttonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);

        let buttonMesh1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh2 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh3 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh4 = new THREE.Mesh(buttonGeometry, buttonMaterial);

        this.buttonLapsPlus = new THREE.Group();
        this.buttonLapsMinus = new THREE.Group();
        this.convertTextToSprite("-", this.buttonLapsMinus);
        this.convertTextToSprite("+", this.buttonLapsPlus);

        this.buttonLapsPlus.position.set(0, 0.5, 0);
        this.buttonLapsPlus.scale.set(0.4, 0.4, 0.4);
        this.buttonLapsMinus.position.set(0, 0.5, 0);
        this.buttonLapsMinus.scale.set(0.4, 0.4, 0.4);

        buttonMesh3.visible = false
        buttonMesh4.visible = false;
        buttonMesh3.position.set(0, 0.5, 0);
        buttonMesh4.position.set(0, 0.5, 0);

        this.buttonLaps1.add(buttonMesh1, buttonMesh3, this.buttonLapsMinus);
        this.buttonLaps1.position.set(-62.4, 0, -93);
        this.buttonLaps1.rotation.set(Math.PI / 2, 0, -Math.PI / 3);

        this.buttonLaps2.add(buttonMesh2, buttonMesh4, this.buttonLapsPlus);
        this.buttonLaps2.position.set(-60.7, 0, -96);
        this.buttonLaps2.rotation.set(Math.PI / 2, 0, -Math.PI / 3);

        this.buttonsLapsGroup = new THREE.Group();
        this.buttonsLapsGroup.add(this.buttonLaps1, this.buttonLaps2);
        this.buttonsLapsGroup.position.set(0, 18.5, 0);

        this.app.scene.add(this.buttonsLapsGroup);
    }

    createButtonUsername() {
        this.buttonUsername = new THREE.Group();
        let buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
        let buttonGeometry = new THREE.BoxGeometry(1, 1, 2.5);

        let buttonMesh1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh2 = new THREE.Mesh(buttonGeometry, new THREE.MeshPhongMaterial({ color: 0x0000EE }));

        this.buttonUsernameGroup = new THREE.Group();
        this.convertTextToSprite("<--", this.buttonUsernameGroup);

        buttonMesh2.visible = false;
        buttonMesh2.position.set(1, 0, 0);
        this.buttonUsernameGroup.rotation.set(0, Math.PI / 2, 0);
        this.buttonUsernameGroup.scale.set(0.4, 0.4, 0.4);
        this.buttonUsernameGroup.position.set(0.8, 0, 0.6);

        this.buttonUsername.add(buttonMesh1, buttonMesh2, this.buttonUsernameGroup);
        this.buttonUsername.position.set(-60.7, 26.3, -96);
        this.buttonUsername.rotation.set(0, -Math.PI / 6, 0);

        this.app.scene.add(this.buttonUsername);

    }

    createButtonChoosePlayer() {
        this.buttonPlayer = new THREE.Group();
        let buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
        let buttonGeometry = new THREE.BoxGeometry(1, 1, 2.5);

        let buttonMesh1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh2 = new THREE.Mesh(buttonGeometry, new THREE.MeshPhongMaterial({ color: 0x0000EE }));

        this.buttonPlayerGroup = new THREE.Group();
        this.convertTextToSprite("<--", this.buttonPlayerGroup);

        buttonMesh2.visible = false;
        buttonMesh2.position.set(1, 0, 0);
        this.buttonPlayerGroup.rotation.set(0, Math.PI / 2, 0);
        this.buttonPlayerGroup.scale.set(0.4, 0.4, 0.4);
        this.buttonPlayerGroup.position.set(0.8, 0, 0.6);

        this.buttonPlayer.add(buttonMesh1, buttonMesh2, this.buttonPlayerGroup);
        this.buttonPlayer.position.set(-60.7, 23.8, -96);
        this.buttonPlayer.rotation.set(0, -Math.PI / 6, 0);

        this.app.scene.add(this.buttonPlayer);

    }

    createButtonChooseOponent() {
        this.buttonOponent = new THREE.Group();
        let buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
        let buttonGeometry = new THREE.BoxGeometry(1, 1, 2.5);

        let buttonMesh1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh2 = new THREE.Mesh(buttonGeometry, new THREE.MeshPhongMaterial({ color: 0x0000EE }));

        this.buttonOponentGroup = new THREE.Group();
        this.convertTextToSprite("<--", this.buttonOponentGroup);

        buttonMesh2.visible = false;
        buttonMesh2.position.set(1, 0, 0);
        this.buttonOponentGroup.rotation.set(0, Math.PI / 2, 0);
        this.buttonOponentGroup.scale.set(0.4, 0.4, 0.4);
        this.buttonOponentGroup.position.set(0.8, 0, 0.6);

        this.buttonOponent.add(buttonMesh1, buttonMesh2, this.buttonOponentGroup);
        this.buttonOponent.position.set(-60.7, 21.2, -96);
        this.buttonOponent.rotation.set(0, -Math.PI / 6, 0);

        this.app.scene.add(this.buttonOponent);

    }

    createButtonStartGame() {
        this.buttonStartGame = new THREE.Group();
        let buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
        let buttonGeometry = new THREE.BoxGeometry(1, 1, 2.5);

        let buttonMesh1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh2 = new THREE.Mesh(buttonGeometry, new THREE.MeshPhongMaterial({ color: 0x0000EE }));

        this.buttonStartGameGroup = new THREE.Group();
        this.convertTextToSprite("<--", this.buttonStartGameGroup);

        buttonMesh2.visible = false;
        buttonMesh2.position.set(1, 0, 0);
        this.buttonStartGameGroup.rotation.set(0, Math.PI / 2, 0);
        this.buttonStartGameGroup.scale.set(0.4, 0.4, 0.4);
        this.buttonStartGameGroup.position.set(0.8, 0, 0.6);

        this.buttonStartGame.add(buttonMesh1, buttonMesh2, this.buttonStartGameGroup);
        this.buttonStartGame.position.set(-60.7, 13.2, -96);
        this.buttonStartGame.rotation.set(0, -Math.PI / 6, 0);

        this.app.scene.add(this.buttonStartGame);
    }

    updateTextTime() {
        const textTime = String(this.currentMatchTime);

        while (this.textNumbersGroup.children.length > 0) {
            this.textNumbersGroup.remove(this.textNumbersGroup.children[0]);
        }

        this.convertTextToSprite(textTime, this.textNumbersGroup);
    }

    updateTextWind() {
        const textWind = "Wind: " + this.currentWindVelocity;

        if (this.currentWindVelocity !== this.lastWindVelocity) {
            while (this.textWindGroup.children.length > 0) {
                this.textWindGroup.remove(this.textWindGroup.children[0]);
            }
            this.convertTextToSprite(textWind, this.textWindGroup);
        }

        this.lastWindVelocity = this.currentWindVelocity;
    }

    updateTextVouchers() {
        const textVouchers = "Vouchers: " + this.currentVouchers;

        if (this.currentVouchers !== this.lastVouchers) {
            while (this.textVouchersGroup.children.length > 0) {
                this.textVouchersGroup.remove(this.textVouchersGroup.children[0]);
            }
            this.convertTextToSprite(textVouchers, this.textVouchersGroup);
        }
        this.lastVouchers = this.currentVouchers;
    }

    updateTextLaps() {
        const textLaps = "Laps: " + this.currentLaps + "/" + this.totalLaps;

        if (this.currentLaps !== this.lastLaps) {
            while (this.textLapsGroup.children.length > 0) {
                this.textLapsGroup.remove(this.textLapsGroup.children[0]);
            }
            this.convertTextToSprite(textLaps, this.textLapsGroup);
        }
        this.lastLaps = this.currentLaps;
    }

    updateGameStatus() {
        const textGameStatus = "Status: " + this.currentGameState;

        if (this.currentGameState !== this.lastGameState) {
            while (this.textGameStatusGroup.children.length > 0) {
                this.textGameStatusGroup.remove(this.textGameStatusGroup.children[0]);
            }
            this.convertTextToSprite(textGameStatus, this.textGameStatusGroup);
        }

        this.lastGameState = this.currentGameState;
    }

    updatePlayerBalloon(namePlayerBalloon) {
        this.currentGameState = this.app.contents.currentGameState;
        this.updateGameStatus();

        this.namePlayerBalloon = namePlayerBalloon;
        const textPlayerBalloon = "Player Balloon: " + this.namePlayerBalloon;

        while (this.textPlayerBalloonGroup.children.length > 0) {
            this.textPlayerBalloonGroup.remove(this.textPlayerBalloonGroup.children[0]);
        }
        this.convertTextToSprite(textPlayerBalloon, this.textPlayerBalloonGroup);
    }

    updateOponentBalloon(nameOponentBalloon) {
        this.currentGameState = this.app.contents.currentGameState;
        this.updateGameStatus();

        this.nameOponentBalloon = nameOponentBalloon;
        const textOponentBalloon = "Oponent Balloon: " + this.nameOponentBalloon;

        while (this.textOponentBalloonGroup.children.length > 0) {
            this.textOponentBalloonGroup.remove(this.textOponentBalloonGroup.children[0]);
        }
        this.convertTextToSprite(textOponentBalloon, this.textOponentBalloonGroup);
    }

    updateBlimpMenu() {
        this.updateTextTime();
        this.updateTextWind();
        this.updateTextVouchers();
        this.updateTextLaps();
    }

    onMouseClick(event) {
        const rect = this.app.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.app.activeCamera);

        const intersects = this.raycaster.intersectObjects([
            this.buttonPenalty1,
            this.buttonPenalty2,
            this.buttonLaps1,
            this.buttonLaps2,
            this.buttonUsername,
            this.buttonPlayer,
            this.buttonOponent,
            this.buttonStartGame
        ], true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (this.app.contents.currentGameState === this.app.contents.GAME_STATE.PREPARATION) {
                if (this.buttonPenalty1.children.includes(object)) {
                    this.decreasePenalty();
                } else if (this.buttonPenalty2.children.includes(object)) {
                    this.increasePenalty();
                } else if (this.buttonLaps1.children.includes(object)) {
                    this.decreaseLaps();
                } else if (this.buttonLaps2.children.includes(object)) {
                    this.increaseLaps();
                } else if (this.buttonUsername.children.includes(object)) {
                    this.startTypingUsername();
                } else if (this.buttonPlayer.children.includes(object)) {
                    this.choosePlayerBallon();
                } else if (this.buttonOponent.children.includes(object)) {
                    this.chooseOponentBallon();
                } else if (this.buttonStartGame.children.includes(object)) {
                    this.startGame();
                }
            }
        }
    }

    increasePenalty() {
        if (this.penaltySeconds < 10) {
            this.penaltySeconds += 1;
            this.updatePenaltyText();
        }
    }

    decreasePenalty() {
        if (this.penaltySeconds > 0) {
            this.penaltySeconds -= 1;
            this.updatePenaltyText();
        }
    }

    increaseLaps() {
        if (this.totalLaps < 10) {
            this.totalLaps += 1;
            this.updateLapsTextInitalMenu();
        }
    }

    decreaseLaps() {
        if (this.totalLaps > 1) {
            this.totalLaps -= 1;
            this.updateLapsTextInitalMenu();
        }
    }

    startTypingUsername() {
        if (this.typingUsername) return;

        this.typingUsername = true;
        this.currentTypedUsername = "";
        document.addEventListener("keydown", this.onKeyDown);
        this.writingUsername = true;
    }

    choosePlayerBallon() {
        this.app.contents.currentGameState = this.app.contents.GAME_STATE.CHOOSE_HUMAN_BALLOON;
        this.currentGameState = this.app.contents.currentGameState;
        this.updateGameStatus();
        this.app.contents.setCamera('BalloonAndInitialPositionChoice');
    }

    chooseOponentBallon() {
        this.app.contents.currentGameState = this.app.contents.GAME_STATE.CHOOSE_AI_BALLOON;
        this.currentGameState = this.app.contents.currentGameState;
        this.updateGameStatus();
        this.app.contents.setCamera('BalloonAndInitialPositionChoice');
    }

    startGame() {
        if ((this.writingUsername !== true) &&(this.playerUsername !== "Type here...") && (this.app.contents.players[this.app.contents.PLAYER_TYPE.HUMAN] !== null) && (this.app.contents.players[this.app.contents.PLAYER_TYPE.AI] !== null)) {
            this.app.contents.currentGameState = this.app.contents.GAME_STATE.READY;
            this.currentGameState = this.app.contents.currentGameState;
            this.app.contents.setCamera('Start');
            this.updateGameStatus();
        }
    }

    stopTypingUsername() {
        if (!this.typingUsername) return;

        this.typingUsername = false;
        document.removeEventListener("keydown", this.onKeyDown);
        this.updateUsernameText();
        this.writingUsername = false;
    }

    onKeyDown(event) {
        if (!this.typingUsername) return;

        if (event.key === "Enter") {

            this.playerUsername = this.currentTypedUsername;
            this.stopTypingUsername();
        } else if (event.key === "Escape") {

            this.currentTypedUsername = "Type here...";
            this.stopTypingUsername();
        } else if (event.key === "Backspace") {

            this.currentTypedUsername = this.currentTypedUsername.slice(0, -1);
        } else if (event.key.length === 1) {
            if (this.currentTypedUsername.length < 15)
                this.currentTypedUsername += event.key;
        }

        this.updateUsernameText();
    }

    updatePenaltyText() {
        const textPenalty = "Penalty (seconds): " + this.penaltySeconds;

        while (this.textPenaltyGroup.children.length > 0) {
            this.textPenaltyGroup.remove(this.textPenaltyGroup.children[0]);
        }

        this.app.contents.penaltySeconds = this.penaltySeconds;
        this.convertTextToSprite(textPenalty, this.textPenaltyGroup);
    }

    updateUsernameText() {
        const textUsername = "Username: " + this.currentTypedUsername;

        while (this.textUsernameGroup.children.length > 0) {
            this.textUsernameGroup.remove(this.textUsernameGroup.children[0]);
        }

        this.convertTextToSprite(textUsername, this.textUsernameGroup);

        this.playerUsername = this.currentTypedUsername;
    }

    updateLapsTextInitalMenu() {
        const textNumberOfLaps = "Number of Laps: " + this.totalLaps;
        const textLaps = "Laps: " + this.currentLaps + "/" + this.totalLaps;

        while (this.textNumberOfLapsGroup.children.length > 0) {
            this.textNumberOfLapsGroup.remove(this.textNumberOfLapsGroup.children[0]);
        }

        while (this.textLapsGroup.children.length > 0) {
            this.textLapsGroup.remove(this.textLapsGroup.children[0]);
        }

        this.app.contents.totalLaps = this.totalLaps;

        this.convertTextToSprite(textLaps, this.textLapsGroup);
        this.convertTextToSprite(textNumberOfLaps, this.textNumberOfLapsGroup);
    }

    convertTextToSprite(text, group) {
        let sheet = this.loader.load('images/spritesheet.png');
        const charMap = {
            " ": 0, "!": 1, "#": 3, "$": 4, "%": 5, "&": 6,
            "(": 8, ")": 9, "*": 10, "+": 11, ",": 12, "-": 13, ".": 14,
            "/": 15, "0": 16, "1": 17, "2": 18, "3": 19, "4": 20, "5": 21,
            "6": 22, "7": 23, "8": 24, "9": 25, ":": 26, ";": 27, "<": 28,
            "=": 29, ">": 30, "?": 31, "@": 32, "A": 33, "B": 34, "C": 35,
            "D": 36, "E": 37, "F": 38, "G": 39, "H": 40, "I": 41, "J": 42,
            "K": 43, "L": 44, "M": 45, "N": 46, "O": 47, "P": 48, "Q": 49,
            "R": 50, "S": 51, "T": 52, "U": 53, "V": 54, "W": 55, "X": 56,
            "Y": 57, "Z": 58, "[": 59, "]": 61, "^": 62, "_": 63,
            "Ç": 96
        };

        const columns = 15;
        const rows = 8;
        const spriteWidth = 1 / columns;
        const spriteHeight = 1 / rows;


        let xOffset = 0;

        for (let char of text) {
            const spriteIndex = charMap[char.toUpperCase()];
            if (spriteIndex === undefined) continue; // Skip if character is not in the map

            const x = spriteIndex % columns; // Column of the sprite
            const y = Math.floor(spriteIndex / columns); // Row of the sprite

            // Clone the texture for independent UV mapping
            const charTexture = sheet.clone();
            charTexture.offset.set(x * spriteWidth, 1 - (y + 1) * spriteHeight);
            charTexture.repeat.set(spriteWidth, spriteHeight);

            // Create a new material with the cloned texture
            const charMaterial = new THREE.SpriteMaterial({ map: charTexture });

            // Create a sprite with the new material
            const sprite = new THREE.Sprite(charMaterial);

            // Position the sprite relative to the sentence
            sprite.position.set(xOffset, 0, 0); // Adjust xOffset for spacing
            sprite.scale.set(2, 2, 2);

            // Add the sprite to the group
            group.add(sprite);

            // Update xOffset for the next character
            xOffset += 1.4; // Adjust spacing as needed
        }
    }
}

export { MyMenu };