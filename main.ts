enum ArcadeButton {
    //% block="A"
    A = 0x01,
    //% block="B"
    B = 0x02,
    //% block="A+B"
    AB = 0x03,
    //% block="← left"
    Left = 0x04,
    //% block="←↑ left+up"
    LeftUp = 0x0c,
    //% block="↑ up"
    Up = 0x08,
    //% block="↑→ right+up"
    RightUp = 0x18,
    //% block="→ right"
    Right = 0x10,
    //% block="→↓ right+down"
    RightDown = 0x30,
    //% block="↓ down"
    Down = 0x20,
    //% block="←↓ left+down"
    LeftDown = 0x24
}

enum ArcadeDpadDirection {
    //% block="←→ left/right"
    LeftRight,
    //% block="↓↑ down/up"
    DownUp
}

/**
 * Blocks to build custom arcade controller
 */
//% color=0xe95153 icon="\uf11b"
//% weight=80
//% blockNamespace="Maker Controller"
namespace makerController {
    const NBUTTONS = 6;
    /**
     * A MakeCode Arcade controller
     */
    //% fixedInstances
    export class Player {
        private downs: number;
        private _hpad: pins.LevelDetector;
        private _vpad: pins.LevelDetector;

        constructor(public keys: string) {
            this.downs = 0;
        }

        get hpad(): pins.LevelDetector {
            if (!this._hpad) {
                this._hpad = new pins.LevelDetector(control.allocateNotifyEvent(), -Infinity, Infinity, -250, 250);
                this._hpad.transitionWindow = 0;
                this._hpad.onHigh = () => this.setButton(ArcadeButton.Right, true);
                this._hpad.onLow = () => this.setButton(ArcadeButton.Left, true);
                this._hpad.onNeutral = () => this.setButton(ArcadeButton.Left | ArcadeButton.Right, false)
            }
            return this._hpad;
        }

        get vpad(): pins.LevelDetector {
            if (!this._vpad) {
                this._vpad = new pins.LevelDetector(control.allocateNotifyEvent(), -Infinity, Infinity, -250, 250);
                this._vpad.transitionWindow = 0;
                this._vpad.onHigh = () => this.setButton(ArcadeButton.Up, true);
                this._vpad.onLow = () => this.setButton(ArcadeButton.Down, true)
                this._vpad.onNeutral = () => this.setButton(ArcadeButton.Up | ArcadeButton.Down, false)
            }
            return this._vpad;
        }

        private static normalizeButtons(button: number, down: boolean) {
            button = button & 0xff;
            // left/right cancel each other
            const leftRight = ArcadeButton.Left | ArcadeButton.Right;
            if (down && (button & leftRight) == leftRight)
                button = ~(~button | leftRight);
            // up/down cancel each other
            const upDown = ArcadeButton.Up | ArcadeButton.Down;
            if (down && (button & upDown) == upDown)
                button = ~(~button | upDown);
            return button;
        }

        /**
         * Simulate that the button has been pressed
         */
        //% blockId=makercontrollerpress block="press %this button %buttons"
        press(buttons: ArcadeButton) {
            this.setButton(buttons, true);
            pause(5);
            this.setButton(buttons, false);
        }

        /**
         * Sets a button state to down or up
         */
        //% blockId=makercontrollersetButtonDown block="set %this button %buttons to %down=toggleDownUp"
        //% down.defl=true
        setButton(buttons: ArcadeButton, down: boolean) {
            const button = Player.normalizeButtons(buttons, down);
            if (!button) return; // nothing to do
            if (down) {
                // send up commands
                const cup = button & ~this.downs;
                for (let i = 0; i < NBUTTONS; ++i) {
                    const ci = 1 << i;
                    if (cup & ci) // it's not down
                        keyboard.key(this.keys[i], KeyboardKeyEvent.Down)
                }
                // clear state
                this.downs |= button;
            } else {
                // send up commands
                const cdo = button & this.downs;
                for (let i = 0; i < NBUTTONS; ++i) {
                    const ci = 1 << i;
                    if (cdo & ci) // it's down
                        keyboard.key(this.keys[i], KeyboardKeyEvent.Up)
                }
                // clear state
                this.downs = ~(~this.downs | button);
            }
        }

        /**
         * Converts an analog input to DPad keystrokes
         */
        //% blockId=makercontrolleranalogdpaddir block="set %this analog %direction to %value"
        setAnalogDpad(direction: ArcadeDpadDirection, value: number) {
            const ld = (direction == ArcadeDpadDirection.LeftRight) ? this.hpad : this.vpad;
            ld.level = value;
        }

        /**
         * Sets the threshold values for the analog dpad detector
         */
        //% blockId=makercontrolleranalogsetthreshold block="set %this analog %direction threshold from %low to %high"
        //% low.defl=-1023
        //% high.defl=1023
        setAnalogDpadThreshold(direction: ArcadeDpadDirection, low: number, high: number) {
            const ld = (direction == ArcadeDpadDirection.LeftRight) ? this.hpad : this.vpad;
            ld.setLowThreshold(low);
            ld.setHighThreshold(high);
        }

        /**
         * Reset the state of all controller buttons
         */
        //% blockId=makercontrollerreset block="reset %this buttons"
        reset() {
            for (let i = 0; i < NBUTTONS; ++i) {
                const ci = 1 << i;
                if (this.downs & ci) // it's down
                    keyboard.key(this.keys[i], KeyboardKeyEvent.Up)
            }
            this.downs = 0;

            if (this._hpad)
                this._hpad.reset();
            if (this._vpad)
                this._vpad.reset();
        }
    }

    /**
     * Player 1 keys
     */
    //% fixedInstance whenUsed block="player 1"
    export const player1 = new Player("qeawds");

    /**
     * Player 2 keys
     */
    //% fixedInstance whenUsed block="player 2"
    export const player2 = new Player("uojilk");
}
