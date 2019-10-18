enum ControllerButton {
    A = 0x01,
    B = 0x02,
    Left = 0x4,
    Up = 0x08,
    Right = 0x10,
    Down = 0x20
}

/**
 * Blocks to build custom arcade controller
 */
//% color=0xf00f0f
namespace makercontroler {
    const NBUTTONS = 6;
    /**
     * 
     */
    //% fixedInstances
    export class Player {
        private downs: number;
        constructor(public keys: string) {

        }

        /**
         * Sets a button state
         */
        //% blockId=makercontrollerkey block="set %this %button to %event"
        setButton(button: ControllerButton, event: KeyboardKeyEvent) {
            button = button & 0xff;
            switch (event) {
                case KeyboardKeyEvent.Press:
                    // clear downs
                    this.downs = ~(~this.downs | button);
                    // send press commands
                    for (let i = 0; i < NBUTTONS; ++i) {
                        keyboard.key(this.keys[i], KeyboardKeyEvent.Press)
                    }
                    break;
                case KeyboardKeyEvent.Up:
                    // send up commands
                    const cdo = button & this.downs;
                    for (let i = 0; i < NBUTTONS; ++i) {
                        const ci = 1 << i;
                        if (cdo & ci) // it's down
                            keyboard.key(this.keys[i], KeyboardKeyEvent.Up)
                    }
                    // clear state
                    this.downs = ~(~this.downs | button);
                    break;
                case KeyboardKeyEvent.Down:
                    // send up commands
                    const cup = button & ~this.downs;
                    for (let i = 0; i < NBUTTONS; ++i) {
                        const ci = 1 << i;
                        if (cup & ci) // it's not down
                            keyboard.key(this.keys[i], KeyboardKeyEvent.Down)
                    }
                    // clear state
                    this.downs |= button;
                    break;
            }
        }

        /**
         * Reset the state of all controller buttons
         */
        //% blockId=makercontrollerkey block="reset %this buttons"
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
