import { VideoView, useVideoPlayer } from "expo-video"

export function VideoPreview({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true
    })

    return (
        <VideoView
            player={player}
            style={{ width: 250, height: 250, borderRadius: 12 }}
            contentFit="cover"
            nativeControls
        />
    )
}