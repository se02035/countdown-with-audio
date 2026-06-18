#!/usr/bin/env bash

durationCountdown="1m30s"
durationAudioInSec="-1"
audioPath=".lyria"

usage() {
    cat <<EOF
Usage: $(basename "$0") [-d duration] [-a audio_seconds] [-p audio_path]

  -d  Duration countdown (default: 1m30s). Examples: 27s, 1m, 2m3s
  -a  Duration audio in seconds (default: -1). Values <= 0 play the entire file
  -p  Audio path (default: .lyria)
  -h  Show this help
EOF
}

while getopts "d:a:p:h" opt; do
    case "$opt" in
        d) durationCountdown="$OPTARG" ;;
        a) durationAudioInSec="$OPTARG" ;;
        p) audioPath="$OPTARG" ;;
        h)
            usage
            exit 0
            ;;
        *)
            usage >&2
            exit 1
            ;;
    esac
done

clear

if [[ ! -d "$audioPath" ]]; then
    echo "Error: audio path not found: $audioPath" >&2
    exit 1
fi

soundfile=$(ls "$audioPath"/* 2>/dev/null | sort -R | head -n 1)
if [[ -z "$soundfile" || ! -f "$soundfile" ]]; then
    echo "Error: no audio files found in: $audioPath" >&2
    exit 1
fi

if ! command -v countdown >/dev/null 2>&1; then
    echo "Error: countdown not found on PATH." >&2
    echo "Install the Go package: https://github.com/antonmedv/countdown" >&2
    exit 1
fi

# Option #1: npm package https://github.com/machaj/console-countdown
# countdown -i $cycle -c $durationCountdown

# Option #2: go package https://github.com/antonmedv/countdown
countdown "$durationCountdown"

if awk -v duration="$durationAudioInSec" 'BEGIN { exit !(duration > 0) }'; then
    afplay -t "$durationAudioInSec" "$soundfile"
else
    afplay "$soundfile"
fi
