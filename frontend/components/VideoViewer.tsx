import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, AppState, SafeAreaView, Pressable } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { X, Volume2, VolumeX, Play } from 'lucide-react-native';

interface VideoViewerProps {
    uri: string;
    visible: boolean;
    onClose: () => void;
}

export function VideoViewer({ uri, visible, onClose }: VideoViewerProps) {
    if (!visible) return null;
    return <VideoViewerContent uri={uri} onClose={onClose} />;
}

// Extract content into separate component to ensure player resets on remount
function VideoViewerContent({ uri, onClose }: { uri: string; onClose: () => void }) {
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);

    const player = useVideoPlayer(uri, (p) => {
        p.loop = true;
        p.muted = true;
        p.play();
    });

    const safePause = () => {
        try {
            if (player?.playing) {
                player.pause();
            }
        } catch { }
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState !== 'active') {
                safePause();
                setIsPlaying(false);
            }
        });

        return () => {
            subscription.remove();
            safePause(); // Cleanup when unmounted
        };
    }, [player]);


    const handleClose = () => {
        safePause();
        onClose();
    };

    const togglePlayPause = () => {
        if (player.playing) {
            safePause();
            setIsPlaying(false);
        } else {
            player.play();
            setIsPlaying(true);
        }
    };

    const toggleMute = () => {
        const nextMuted = !player.muted;
        player.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    return (
        <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black justify-center items-center">
                <SafeAreaView className="absolute top-0 w-full z-50 flex-row justify-between items-center px-4 pt-4 pointer-events-box-none">
                    <TouchableOpacity onPress={handleClose} className="p-2 bg-black/50 rounded-full" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <X size={24} color="#FFF" />
                    </TouchableOpacity>
                </SafeAreaView>

                <Pressable onPress={togglePlayPause} className="flex-1 w-full justify-center items-center">
                    <VideoView
                        player={player}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="contain"
                        nativeControls={false}
                    />
                    {!isPlaying && (
                        <View className="absolute z-10 bg-black/40 rounded-full p-4 pointer-events-none">
                            <Play size={40} color="#FFF" fill="#FFF" />
                        </View>
                    )}
                </Pressable>

                <SafeAreaView className="absolute bottom-0 w-full pb-8 px-4 z-50 flex-row justify-end pointer-events-box-none">
                    <TouchableOpacity onPress={toggleMute} className="p-3 bg-white/20 rounded-full mb-4 mr-2">
                        {isMuted ? <VolumeX size={24} color="#FFF" /> : <Volume2 size={24} color="#FFF" />}
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </Modal>
    );
}
