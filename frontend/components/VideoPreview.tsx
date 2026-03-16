import { VideoView, useVideoPlayer } from "expo-video"

export function VideoPreview({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true
    })

    return (
        <VideoView
            player={player}
            className="w-64 h-64 rounded-lg"
            nativeControls
        />
    )
}