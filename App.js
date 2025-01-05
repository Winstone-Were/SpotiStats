import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button, View, Text, StyleSheet, Image, FlatList } from 'react-native';
import Constants from 'expo-constants';

import {CLIENT_ID, CLIENT_SECRET} from './secret_keys'

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['user-read-email', 'playlist-modify-public', 'user-top-read'],
      usePKCE: false,
      redirectUri: makeRedirectUri({
        scheme: 'your.app',
        useProxy: true, // Use for Expo Go
      }),
    },
    discovery
  );


  const [accessToken, setAccessToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    const fetchToken = async () => {
      if (response?.type === 'success') {
        const { code } = response.params;
        try {
          const tokenResponse = await fetch(discovery.tokenEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              redirect_uri: makeRedirectUri({ scheme: 'your.app', useProxy: true }),
            }).toString(),
          });

          const tokenData = await tokenResponse.json();
          console.log('Access Token:', tokenData.access_token);
          setAccessToken(tokenData.access_token)
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      }
    };

    fetchToken();
  }, [response]);

  const fetchTopArtists = async () => {
    console.log("I work")
    if (accessToken) {
      try {
        const artistResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const artistData = await artistResponse.json();
        console.log(artistData)
        setTopArtists(artistData.items || []);
      } catch (error) {
        console.error('Error fetching top artists:', error);
      }
    }
  };

  useEffect(() => {
    fetchTopArtists();
  }, [accessToken])

  return (
    <View style={styles.container}>
      {!accessToken ? (
        <Button
          disabled={!request}
          title="Login with Spotify"
          onPress={() => {
            promptAsync();
          }}
        />
      ) : (
        <>
          <Text style={styles.title}>Your Top Artists</Text>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#121212',
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
    color: '#FFFFFF',
  },
});
