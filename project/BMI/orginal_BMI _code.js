const physicalmetrics = {
	weightINkg: 70,
	heightInMeters: 1.75,
};

let bmi =
	physicalmetrics["weightINkg"] / physicalmetrics["heightInMeters"] ** 2;

if (bmi < 18.5) {
	console.log("Under Weight =", bmi.toFixed(2));
} else if (bmi >= 18.5 && bmi < 25) {
	console.log("Normal Weight =", bmi.toFixed(2));
} else {
	console.log("Over Weight =", bmi.toFixed(2));
}
