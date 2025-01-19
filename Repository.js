

export const getTopSongs = async (token) => {
    try {
        // Fetch the top songs using the Spotify API
        const songResponse = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        // Check if the response is successful
        if (!songResponse.ok) {
            throw new Error(`Error: ${songResponse.status} ${songResponse.statusText}`);
        }

        // Parse the JSON response
        const songData = await songResponse.json();

       
        return songData.items; // 'items' contains the list of top songs
    } catch (error) {
        console.error("Failed to fetch top songs:", error.message);
        return null; // Return null or handle the error as needed
    }
};

export const getTopAlbums = async (token) => {
    try {
        // Fetch the top albums using the Spotify API
        const albumResponse = await fetch("https://api.spotify.com/v1/me/top/albums?limit=10", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        // Check if the response is successful
        if (!albumResponse.ok) {
            throw new Error(`Error: ${albumResponse.status} ${albumResponse.statusText}`);
        }

        // Parse the JSON response
        const albumData = await albumResponse.json();

        // Return the data or process it
        return albumData.items; // 'items' contains the list of top albums
    } catch (error) {
        console.error("Failed to fetch top albums:", error.message);
        return null; // Return null or handle the error as needed
    }
};

export const fetchTopArtists = async (accessToken) => {
    if (accessToken) {
      try {
        const artistResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const artistData = await artistResponse.json();
        return (artistData.items || []);
      } catch (error) {
        console.error('Error fetching top artists:', error);
      }
    }
  };