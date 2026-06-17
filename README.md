# Console countdown with arcade audio

## Install

### Download audio assets

The project doesn't contain audio assets. But there are many places where you can download audio files e.g. <https://retro.sx/music>, <https://www.zophar.net/music/gameboy-gbs/addams-family-the>, etc

Place downloaded audio files in an `audio` folder at the project root (or pass a custom path when running the script).

### Install the countdown component

This countdown is just a script that internally uses another countdown component. Here the following options have been tested (implementation included):

1. Go package <https://github.com/antonmedv/countdown>
2. NPM package <https://github.com/machaj/console-countdown>

## Run

### Windows

Start countdown with default parameters:

```powershell
.\win\countdown.ps1
```

Other examples:

```powershell
.\win\countdown.ps1 -dc 1m

.\win\countdown.ps1 -dc 1m -da 10 -ap "myfiles"
```

#### Windows parameters

| Name | Values |
|---|---|
| dc | **Duration countdown.** A string value specifying the countdown duration. Examples are 27s, 1m, 2m3s (*default: "1m30s"*) |
| da | **Duration audio.** A decimal value specifying the duration (in seconds) of the audio playback. Values <= 0 will play the entire audio file. Examples are -1, 5, 10, 300 (*default: -1*) |
| ap | **Audio path.** A string value specifying the location of the audio files (*default: "audio"*) |

### macOS

Start countdown with default parameters:

```bash
./mac/countdown.sh
```

Other examples:

```bash
./mac/countdown.sh -d 1m

./mac/countdown.sh -d 1m -a 10 -p myfiles
```

Audio playback uses the built-in `afplay` command (no extra audio install needed). The Go `countdown` binary must be available on your `PATH`.

#### macOS parameters

| Flag | Values |
|---|---|
| -d | **Duration countdown.** A string value specifying the countdown duration. Examples are 27s, 1m, 2m3s (*default: "1m30s"*) |
| -a | **Duration audio.** A decimal value specifying the duration (in seconds) of the audio playback. Values <= 0 will play the entire audio file. Examples are -1, 5, 10, 300 (*default: -1*) |
| -p | **Audio path.** A string value specifying the location of the audio files (*default: "audio"*) |
