const {getTimeline, getLiked, getAvatars} = require("./api");

function addRecord(interactions, screen_name, user_id, type) {
	if (user_id in interactions) interactions[user_id][type] += 1;
	else
		interactions[user_id] = {
			screen_name,
			id: user_id,
			reply: 0,
			retweet: 0,
			like: 0,
			[type]: 1,
		};
}

function countReplies(interactions, timeline, screen_name) {
	for (const post of timeline) {
		if (
			!!post.in_reply_to_user_id_str &&
			post.in_reply_to_screen_name.toLowerCase() !== screen_name
		) {
			addRecord(
				interactions,
				post.in_reply_to_screen_name,
				post.in_reply_to_user_id_str,
				"reply"
			);
		}
	}
}

function countRetweets(interactions, timeline, screen_name) {
	for (const post of timeline) {
		if (
			post.retweeted_status &&
			post.retweeted_status.user &&
			post.retweeted_status.user.screen_name.toLowerCase() !== screen_name
		) {
			addRecord(
				interactions,
				post.retweeted_status.user.screen_name,
				post.retweeted_status.user.id_str,
				"retweet"
			);
		}
	}
}

function countLikes(interactions, likes, screen_name) {
	for (const post of likes) {
		if (post.user.screen_name.toLowerCase() !== screen_name) {
			addRecord(
				interactions,
				post.user.screen_name,
				post.user.id_str,
				"like"
			);
		}
	}
}

module.exports = async function getInteractions(screen_name, layers) {
	const timeline = await getTimeline(screen_name);
	const liked = await getLiked(screen_name);

	const interactions = {};

	countReplies(interactions, timeline, screen_name);
	countRetweets(interactions, timeline, screen_name);
	countLikes(interactions, liked, screen_name);

	const tally = [];

	for (const [key, interaction] of Object.entries(interactions)) {
		let total = 0;
		total += interaction.like;
		total += interaction.reply * 1.1;
		total += interaction.retweet * 1.3;

		tally.push({
			id: interaction.id,
			screen_name: interaction.screen_name,
			total,
		});
	}
	tally.sort((a, b) => b.total - a.total);

	const maxCount = layers.reduce((total, current) => total + current, 0);

	const head = tally.slice(0, maxCount);

	const ids = head.map((u) => u.id);
	const avatars = await getAvatars(ids);
	for (const i of head) {
		i.avatar = avatars[i.id];
	}

	const result = [];
	result.push(head.splice(0, layers[0]));
	result.push(head.splice(0, layers[1]));
	result.push(head.splice(0, layers[2]));

	return result;
};
