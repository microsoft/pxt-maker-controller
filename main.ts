enum ControllerButton {
    //% block="A"
    A = 0x01,
    //% block="B"
    B = 0x02,
    //% block="left"
    Left = 0x4,
    //% block="up"
    Up = 0x08,
    //% block="right"
    Right = 0x10,
    //% block="down"
    Down = 0x20
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
        constructor(public keys: string) {
            this.downs = 0;
        }

        /**
         * Simulate that the button has been pressed
         */
        //% blockId=makercontrollerpress block="press %this button %button"
        press(button: ControllerButton) {
            button = button & 0xff;
            // clear downs
            this.downs = ~(~this.downs | button);
            // send press commands
            for (let i = 0; i < NBUTTONS; ++i) {
                const ci = 1 << i;
                if (button & ci)
                    keyboard.key(this.keys[i], KeyboardKeyEvent.Press)
            }
        }

        /**
         * Sets a button state to down or up
         */
        //% blockId=makercontrollerkey block="set %this button %button to %down=toggleDownUp"
        //% down.defl=true
        setButtonDown(button: ControllerButton, down: boolean) {
            button = button & 0xff;
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
        }
    }

    /**
     * Player 1 keys
     */
    //% fixedInstance whenUsed block="player 1"
    export const player1 = new Player("EQAWDS");

    /**
     * Player 2 keys
     */
    //% fixedInstance whenUsed block="player 2"
    export const player2 = new Player("OUJILK");
}
