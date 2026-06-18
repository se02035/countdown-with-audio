# Console countdown with audio playback

## Install

### Download audio assets

The project includes sample audio files in `.lyria`, generated using Google's [Lyria Model](https://gemini.google/overview/music-generation/). These are used by default when you run the countdown scripts.

You can also use your own audio files from other sources (e.g. <https://retro.sx/music>, <https://www.zophar.net/music/gameboy-gbs/addams-family-the>) by placing them in a folder and passing that path when running the script.

### Install the countdown component

This countdown is just a script that internally uses [another countdown component](https://github.com/antonmedv/countdown). This needs to be installed separately.

## Run

### Parameters

Both scripts accept the same flags:

| Flag | Values |
|---|---|
| -d | **Duration countdown.** A string value specifying the countdown duration. Examples are 27s, 1m, 2m3s (*default: "1m30s"*) |
| -a | **Duration audio.** A decimal value specifying the duration (in seconds) of the audio playback. Values <= 0 will play the entire audio file. Examples are -1, 5, 10, 300 (*default: -1*) |
| -p | **Audio path.** A string value specifying the location of the audio files (*default: ".lyria"*) |
| -h | **Help.** Show usage |

### Windows

Start countdown with default parameters:

```powershell
.\win\countdown.ps1
```

Other examples:

```powershell
.\win\countdown.ps1 -d 1m

.\win\countdown.ps1 -d 1m -a 10 -p "myfiles"
```

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

Audio playback uses the built-in `afplay` command (no extra audio install needed). The `countdown` binary must be available on your `PATH`.
