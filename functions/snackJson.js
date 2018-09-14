function snackToJson(name, calories) {
	var dict = {};
	dict["Name"] = name;
	dict["Price"] = calories;
	var fs = require("fs");
	fs.writeFile("./object.json", JSON.stringify(sampleObject), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("Snack Added");
});
}