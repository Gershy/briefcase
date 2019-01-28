let fs = require('fs');
let path = require('path');
let filepath = path.join(__dirname, 'profiles.csv');
let contents = fs.readFileSync(filepath).toString('utf8');

members = contents.replace(/\r/g,"").split('\n')

let profile_list = '';

for (let i = 0, size=members.length; i<size;i++) {
  let item = members[i].split(',');
  new_prof = `<li class="profile">
      <div class="profile_header">
      ${item[0]}
      <br>
      <img class="profile_picture" src="../assets/profile_pictures/${item[1]}"></img>
    </li>
    `;
  profile_list = profile_list + new_prof;
}



let html_filepath = path.join(__dirname,'info.html');
let html_code = fs.readFileSync(html_filepath).toString('utf8');

console.log(profile_list);

html_code = html_code.replace('{{profiles}}',profile_list);

console.log(html_code);


