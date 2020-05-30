var fs = require('fs');

console.log("첫번째 기능");

var result = fs.readFileSync('test.txt', 'utf8');

console.log(result);

console.log("3번째 기능");