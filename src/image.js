const {createCanvas, loadImage} = require("canvas");
const fs = require("fs");

const toRad = (x) => x * (Math.PI / 180);

module.exports = async function render(config) {
	const width = 1000;
	const height = 1000;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#C5EDCE";
	ctx.fillRect(0, 0, width, height);

	for (const [layerIndex, layer] of config.entries()) {
		const {count, radius, distance, users} = layer;

		const angleSize = 360 / count;


		for (let i = 0; i < count; i++) {
			const offset = layerIndex * 30;

			const r = toRad(i * angleSize + offset);

			const centerX = Math.cos(r) * distance + width / 2;
			const centerY = Math.sin(r) * distance + height / 2;

			if (!users[i]) break;

			ctx.save();
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
			ctx.clip();

			const defaultAvatarUrl =
				"https://abs.twimg.com/sticky/default_profile_images/default_profile_200x200.png";
			const avatarUrl = users[i].avatar || defaultAvatarUrl;

			const img = await loadImage(avatarUrl);
			ctx.drawImage(
				img,
				centerX - radius,
				centerY - radius,
				radius * 2,
				radius * 2
			);

			ctx.restore();
		}
	}

	const out = fs.createWriteStream("./circle.png");
	const stream = canvas.createPNGStream();
	stream.pipe(out);
	out.on("finish", () => console.log("Done!"));
};
