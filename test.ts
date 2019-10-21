// tests go here; this will not be compiled when this package is used as a library
input.buttonA.onEvent(ButtonEvent.Click, function () {
    makerController.player1.press(ArcadeButton.A)
})
input.buttonB.onEvent(ButtonEvent.Click, function () {
    makerController.player1.press(ArcadeButton.B)
})
input.buttonsAB.onEvent(ButtonEvent.Click, function () {
    makerController.player1.press(ArcadeButton.AB)
})
makerController.player1.setAnalogThreshold(ArcadeAnalogButton.A, 0, 200)
forever(function () {
    makerController.player1.setAnalog(ArcadeAnalogButton.LeftRight, input.acceleration(Dimension.X))
    makerController.player1.setAnalog(ArcadeAnalogButton.DownUp, input.acceleration(Dimension.Y))
    makerController.player1.setAnalog(ArcadeAnalogButton.A, input.soundLevel())
})
