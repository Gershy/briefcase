function snackToJson(name, calories) {
	var dict = {};
	dict["Name"] = name;
	dict["Price"] = calories;
	var fs = require("fs");
	var filename = "../snackInfo/".concat(name,".json")
	fs.writeFile(filename, JSON.stringify(dict), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("Snack Added");
});
}

snackToJson("Miss Vickies", 700)

