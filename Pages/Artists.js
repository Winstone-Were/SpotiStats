import { Button, View, Text, StyleSheet, Image, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react'
import {fetchTopArtists} from '../Repository'

export default function Artists({ token }) {

    const [topArtists, setTopArtists] = useState([]);
    useEffect(()=>{
        let artistData = fetchTopArtists(token);
        artistData.then(res=>{
            setTopArtists(res);
        })
    },[token])

    return (
        <View style={styles.container}>
            <FlatList
                data={topArtists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.artistContainer}>
                        <Image
                            source={{ uri: item.images[0]?.url }}
                            style={styles.artistImage}
                        />
                        <Text style={styles.artistName}>{item.name}</Text>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 16,
    },
    artistContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    artistImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
    },
    artistName: {
        fontSize: 18,
    },
});