# Console countdown with arcade audio

## Install

### Download audio assets

The project doesn't contain audio assets. But there are many places where you can download audio files e.g. <https://retro.sx/music>, <https://www.zophar.net/music/gameboy-gbs/addams-family-the>, etc

### Install the countdown component

This countdown is just a script that internally uses another countdown component. Here the following options have been tested (implementation included):

1. Go package <https://github.com/antonmedv/countdown>
2. NPM package <https://github.com/machaj/console-countdown>  

## Run

### Countdown

Start countdown with default parameters:

```powershell
.\countdown.ps1
```

Other examples:

```powershell
.\countdown.ps1 -dc 1m
 
.\countdown.ps1 -dc 1m -da 10 -ap "myfiles"
```

### Parameters

| Name  | Values  |
|---|---|
| dc  | **Duration countdown.** A string value specifying the countdown duration. Examples are 27s, 1m, 2m3s (*default: "1m30"*)  |
| da  | **Duration audio.** A decimal value specifying the duration (in seconds) of the audio playback. Values <= 0 will play the entire audio file. Examples are -1 , 5, 10, 300 (*default: -1*)  |
| ap  | **Audio path.** A string value specifying the location of the audio files (*default: "audio"*)  |