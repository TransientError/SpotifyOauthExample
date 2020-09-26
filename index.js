const SpotifyWebApi = require('spotify-web-api-node');
const { prompt } = require('enquirer');
require('dotenv').config();

const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

function randomInt(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    );
}

function generateState(len) {
    var state = [];
    for (let i = 0; i < len; ++i) {
        let char = alphanumeric[randomInt(0, alphanumeric.length)];
        state.push(char);
    }
    return state.join("");
}

async function main() {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: 'https://spotify.com',
    });

    const scopes = ['user-read-email'];
    const state = generateState(100);

    let authnUrl = spotifyApi.createAuthorizeURL(scopes, state);

    console.log(`authorization url: ${authnUrl}`);
    let code = await prompt([{
        type: 'input',
        name: 'url',
        message: 'Enter your url from your browser'
    }]).then(data => {
        console.assert(data.url);
        const url = new URL(data.url);
        let code = url.searchParams.get('code');
        return code;
    });

    await spotifyApi.authorizationCodeGrant(code).then(
        data => {
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
        },
        err => { console.error(`authorizationCodeGrant ${err}`); throw err; }
    );

    const result = await spotifyApi.getMe()
        .catch(err => { console.error(err); throw err; })

    console.log(result);
}

if (require.main === module) {
    main().catch(
        err => { console.error(err); }
    )
}
