import { useVideoPlayer, VideoView } from "expo-video"
import { View } from "react-native"
import { Play } from "lucide-react-native"

export function PostVideo({ uri }: { uri: string }) {

    const player = useVideoPlayer(uri, (player) => {
        player.loop = true
        player.muted = true
        player.play()
    })

    return (
        <View style={{ width: "100%", height: 300, position: 'relative' }}>
            <VideoView
                player={player}
                style={{ width: "100%", height: "100%" }}
                nativeControls={false}
                contentFit="cover"
            />
            <View className="absolute top-3 right-3 bg-black/60 rounded-full p-2 pointer-events-none">
                <Play size={16} color="#FFF" fill="#FFF" />
            </View>
        </View>
    )
}