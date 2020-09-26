async function getTimelinePage(screen_name, page, max_id = null) {
	let params = {
		screen_name,
		count: 200,
		...(!!max_id && {max_id}),
	};

	console.log("Fetching Timeline page " + page);
	const res = await globalThis.TwitterClient.get("statuses/user_timeline", params);
	return res;
}

async function getTimeline(screen_name) {
	let page = 1;
	let posts = await getTimelinePage(screen_name, page++);
	let timeline = [...posts];


	while (posts.length > 0 && (!process.env.DEBUG || page <= 1)) {
		timeline = [...timeline, ...posts];
		const max_id = "" + (BigInt(posts[posts.length - 1].id_str) - 1n);
		posts = await getTimelinePage(screen_name, page++, max_id);
	}

	return timeline;
}

async function getLikedPage(screen_name, page, max_id = null) {
	let params = {
		screen_name,
		count: 200,
		...(!!max_id && {max_id}),
	};

	console.log("Fetching Liked page " + page);
	const res = await globalThis.TwitterClient.get("favorites/list", params);
	return res;
}

async function getLiked(screen_name) {
	let page = 1;
	let posts = await getLikedPage(screen_name, page++);
	let timeline = [...posts];

	while (posts.length > 0 && (!process.env.DEBUG || page <= 1)) {
		timeline = [...timeline, ...posts];
		const max_id = "" + (BigInt(posts[posts.length - 1].id_str) - 1n);
		posts = await getLikedPage(screen_name, page++, max_id);
	}

	return timeline;
}

async function getAvatars(ids) {
	let params = {
		user_id: ids,
		include_entities: false,
	};

	console.log("Fetching avatars " + ids.length);

	const res = await globalThis.TwitterClient.get("users/lookup", params);

	return Object.fromEntries(
		res.map((user) => [
			user.id_str,
			user.profile_image_url_https.replace("normal", "400x400"),
		])
	);
}

async function getUser(screen_name) {
	let params = {
		screen_name,
		include_entities: false,
	};

	console.log("Fetching user " + screen_name);
	const res = (await globalThis.TwitterClient.get("users/lookup", params))[0];

	return {
		id: res.id_str,
		screen_name: res.screen_name,
		avatar: res.profile_image_url_https.replace("normal", "400x400"),
	};
}

module.exports = {
	getLiked,
	getTimeline,
	getAvatars,
	getUser
};
