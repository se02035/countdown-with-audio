param(
    [Alias("dc")] 
    [string]
    $durationCountdown = "1m30s",

    [Alias("da")] 
    [decimal]
    $durationAudioInSec = -1,

    [Alias("ap")] 
    [string]
    $audioPath = "audio"

    # # only needed for option #1 - npm package
    # [Alias("c")] 
    # [decimal]
    # $cycle = 1000
)

Clear-Host;

# get the mediaplayer instance and store it as a global variable when
# running the countdown multiple times
if (!$global:countdown_mplayer) {
    Add-Type -AssemblyName presentationCore; 
    $global:countdown_mplayer = New-Object system.windows.media.mediaplayer;
}
$mediaPlayer = $global:countdown_mplayer
$mediaPlayer.Stop();

# randomly pick one audio file that should be played at the end of the countdown
$soundfile = Get-ChildItem $audioPath | Get-Random -Count 1 | Select-Object -exp FullName;

# Option #1: npm package https://github.com/machaj/console-countdown 
#countdown -i $cycle -c $durationCountdown;

#option #2: go package https://github.com/antonmedv/countdown
countdown $durationCountdown

# start audio playback
$mediaPlayer.open($soundfile);
$mediaPlayer.Play();

# if configured, stop the audio after x seconds. 
# else the entire audio file will be played
If ($durationAudioInSec -gt 0) {
    Start-Sleep -s $durationAudioInSec
    $mediaPlayer.Stop()
}
