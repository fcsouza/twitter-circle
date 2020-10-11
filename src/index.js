const dotenv = require("dotenv");
const getInteractions = require("./data");
const render = require("./image");
const {getUser} = require("./api");
const {renderText} = require("./text");
const Twitter = require("twitter-lite");

dotenv.config();
async function main() {
	const client = new Twitter({
		consumer_key: process.env.CONSUMER_KEY,
		consumer_secret: process.env.CONSUMER_SECRET,
	});

	const bearer = await client.getBearerToken();

	globalThis.TwitterClient = new Twitter({
		bearer_token: bearer.access_token,
	});

	const user = await getUser("WHATEVER_USERNAME_YOU_WANT");

	const layers = [8, 15, 26];

	const data = await getInteractions(user.screen_name.toLowerCase(), layers);

	await render([
		{distance: 0, count: 1, radius: 110, users: [user]},
		{distance: 200, count: layers[0], radius: 64, users: data[0]},
		{distance: 330, count: layers[1], radius: 58, users: data[1]},
		{distance: 450, count: layers[2], radius: 50, users: data[2]},
	]);

	const shouldRenderText = process.argv.find((arg) => arg === "--text");
	if (shouldRenderText) await renderText(data);
}

// entry point
main();
