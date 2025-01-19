import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { getTopSongs } from '../Repository'; // Adjust path as needed

export default function Songs({ token }) {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        const fetchTopSongs = async () => {
            try {
                const topSongs = await getTopSongs(token);
                setTracks(topSongs); // Assuming `items` is the array of tracks in the response
            } catch (error) {
                console.error("Error fetching top songs:", error);
            }
        };

        fetchTopSongs();
    }, [token]);

    const handleTrackPress = (url) => {
        if (url) {
            Linking.openURL(url).catch((err) =>
                console.error("Failed to open URL:", err)
            );
        } else {
            alert("No URL available for this track.");
        }
    };

    const renderTrack = ({ item }) => {
        const albumCover = item.album?.images?.[0]?.url; // Album cover image
        const trackName = item.name; // Track name
        const albumName = item.album?.name; // Album name
        const artists = item.artists.map(artist => artist.name).join(', '); // Artist names
        const spotifyUrl = item.external_urls?.spotify; // Spotify track URL

        return (
            <TouchableOpacity onPress={() => handleTrackPress(spotifyUrl)}>
                <View style={styles.trackItem}>
                    {albumCover && <Image source={{ uri: albumCover }} style={styles.albumCover} />}
                    <View style={styles.trackInfo}>
                        <Text style={styles.trackName}>{trackName}</Text>
                        <Text style={styles.albumName}>{albumName}</Text>
                        <Text style={styles.artists}>{artists}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={tracks}
                keyExtractor={(item) => item.id}
                renderItem={renderTrack}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 20,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    albumCover: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    trackInfo: {
        flex: 1,
    },
    trackName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    albumName: {
        fontSize: 14,
        color: '#666',
    },
    artists: {
        fontSize: 12,
        color: '#999',
    },
});
