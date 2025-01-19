import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet, SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CLIENT_ID, CLIENT_SECRET } from './secret_keys';
import Songs from './Pages/Songs';
import Artists from './Pages/Artists';
import { Ionicons } from '@expo/vector-icons';


const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const Tab = createBottomTabNavigator();

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

  useEffect(() => {
    const loadTokens = async () => {
      const savedAccessToken = await SecureStore.getItemAsync('spotifyAccessToken');
      const savedRefreshToken = await SecureStore.getItemAsync('spotifyRefreshToken');

      if (savedAccessToken) {
        setAccessToken(savedAccessToken);
      } else if (savedRefreshToken) {
        refreshAccessToken(savedRefreshToken);
      }
    };

    loadTokens();
  }, []);

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
          const { access_token, refresh_token, expires_in } = tokenData;

          await SecureStore.setItemAsync('spotifyAccessToken', access_token);
          await SecureStore.setItemAsync('spotifyRefreshToken', refresh_token);

          setAccessToken(access_token);
          scheduleTokenRefresh(refresh_token, expires_in);
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      }
    };

    fetchToken();
  }, [response]);

  const refreshAccessToken = async (refreshToken) => {
    try {
      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });

      const tokenData = await tokenResponse.json();
      const { access_token, expires_in } = tokenData;

      await SecureStore.setItemAsync('spotifyAccessToken', access_token);
      setAccessToken(access_token);

      scheduleTokenRefresh(refreshToken, expires_in);
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  const scheduleTokenRefresh = (refreshToken, expiresIn) => {
    const refreshTime = (expiresIn - 60) * 1000;
    setTimeout(() => {
      refreshAccessToken(refreshToken);
    }, refreshTime);
  };

  if (!accessToken) {
    return (
      <View style={styles.container}>
        <Button
          disabled={!request}
          title="Login with Spotify"
          onPress={() => {
            promptAsync();
          }}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Songs"
          component={() => <Songs token={accessToken} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Artists"
          component={() => <Artists token={accessToken} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
