const fs = require("fs");


async function renderText(data) {
	let output = "";


	for (let i = 1; i < 4; i++) {
		const layer = data[i - 1];
		output += "---- Circle " + i + " ---- \n";

		for (const user of layer) {
			output += "@" + user.screen_name + "\n";
		}

		output += "\n";
	}

	fs.writeFileSync("users.txt", output);
}

module.exports = {renderText};
