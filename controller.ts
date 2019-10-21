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

enum ArcadeAnalogButton {
    //% block="←→ left/right"
    LeftRight,
    //% block="↓↑ down/up"
    DownUp,
    //% block="A"
    A,
    //% block="B"
    B
}

/**
 * Blocks to build custom arcade controller
 */
//% color=#e95153 icon="\uf11b"
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
        private _apad: pins.LevelDetector;
        private _bpad: pins.LevelDetector;

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

        get apad(): pins.LevelDetector {
            if (!this._apad) {
                this._apad = new pins.LevelDetector(control.allocateNotifyEvent(), -Infinity, Infinity, 0, 128);
                this._apad.transitionWindow = 0;
                this._apad.onHigh = () => this.setButton(ArcadeButton.A, true);
                this._apad.onLow = undefined;
                this._apad.onNeutral = () => this.setButton(ArcadeButton.A, false)
            }
            return this._apad;
        }

        get bpad(): pins.LevelDetector {
            if (!this._bpad) {
                this._bpad = new pins.LevelDetector(control.allocateNotifyEvent(), -Infinity, Infinity, 0, 128);
                this._bpad.transitionWindow = 0;
                this._bpad.onHigh = () => this.setButton(ArcadeButton.B, true);
                this._bpad.onLow = undefined;
                this._bpad.onNeutral = () => this.setButton(ArcadeButton.B, false)
            }
            return this._bpad;
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
            this.setButton(buttons, false);
        }

        /**
         * Sets a button state to down or up
         * @param down true if button is down, false if up
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

        private resolveDetector(direction: ArcadeAnalogButton) {
            let ld: pins.LevelDetector;
            switch (direction) {
                case ArcadeAnalogButton.LeftRight: ld = this.hpad; break;
                case ArcadeAnalogButton.DownUp: ld = this.vpad; break;
                case ArcadeAnalogButton.A: ld = this.apad; break;
                case ArcadeAnalogButton.B: ld = this.bpad; break;
            }
            return ld;
        }

        /**
         * Converts an analog input to DPad keystrokes
         */
        //% blockId=makercontrolleranalogdpaddir block="set %this analog %direction to %value"
        setAnalog(direction: ArcadeAnalogButton, value: number) {
            const ld = this.resolveDetector(direction);
            if (ld)
                ld.level = value;
        }

        /**
         * Sets the threshold values for the analog dpad detector
         */
        //% blockId=makercontrolleranalogsetthreshold block="set %this analog %direction threshold from %low to %high"
        //% low.defl=-1023
        //% high.defl=1023
        setAnalogThreshold(direction: ArcadeAnalogButton, low: number, high: number) {
            const ld = this.resolveDetector(direction);
            if (ld) {
                ld.setLowThreshold(low);
                ld.setHighThreshold(high);
            }
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
            if (this._apad)
                this._apad.reset();
            if (this._bpad)
                this._bpad.reset();
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
