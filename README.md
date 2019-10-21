# maker-controller

The extension allows to easily create custom controllers for 
MakeCode Arcade games (https://arcade.makecode.com) running the browser.

Under the hood, the extension uses the **keyboard** extension to generate keyboard key stroke
that emulate one or more players.

## Usage

This repository contains a MakeCode extension. To use it in MakeCode,

* open https://makecode.adafruit.com/beta
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for the URL of this repository

## Button press

Simulate a button press when a button in pressed on your device.

```blocks
input.buttonA.onEvent(ButtonEvent.Click, function () {
    makerController.player1.press(ControllerButton.A)
})
```

## Up, down states

Simulate buttons left and right pressed based on the accelerometer readings.

```blocks
forever(function () {
    if (input.acceleration(Dimension.X) < -300) {
        makerController.player1.setButtonDown(ControllerButton.Right, false)
        makerController.player1.setButtonDown(ControllerButton.Left, true)
        light.photonForward(1)
    } else if (input.acceleration(Dimension.X) > 300) {
        makerController.player1.setButtonDown(ControllerButton.Left, false)
        makerController.player1.setButtonDown(ControllerButton.Right, true)
        light.photonForward(-1)
    } else {
        makerController.player1.reset()
    }
})
```

## Analog buttons

Map analog sensors to dpad buttons.

```blocks
forever(function () {
    makerController.player1.setAnalog(ArcadeAnalogButton.LeftRight, input.acceleration(Dimension.X))
    makerController.player1.setAnalog(ArcadeAnalogButton.DownUp, input.acceleration(Dimension.Y))
})
```

Also map analog sensors to A/B buttons.

```blocks
forever(function () {
    makerController.player1.setAnalog(ArcadeAnalogButton.A, input.soundLevel())
})
```

You can tune the threshold to detect that a button is pressed or not.

```blocks
makerController.player1.setAnalogThreshold(ArcadeAnalogButton.A, 0, 200)
```

## Collaborators

You can invite users to become collaborators to this repository. This will allow multiple users to work on the same project at the same time.
[Learn more...](https://help.github.com/en/articles/inviting-collaborators-to-a-personal-repository)

To edit this repository in MakeCode,

* open https://makecode.adafruit.com/
* click on **Import** then click on **Import URL**
* paste the repository URL and click import

## Supported targets

* for PXT/adafruit
* for PXT/codal
* for PXT/maker

(The metadata above is needed for package search.)
