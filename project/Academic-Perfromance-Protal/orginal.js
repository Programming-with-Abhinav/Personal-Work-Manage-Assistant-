let marks = [86,57,68,20,19];

let subject = ["Hindi","English","Mathematics","Physics","Chemistry"];

let totalMarks = 0;
let result = {};

for (let i = 0; i < marks.length; i++) {
    totalMarks += marks[i];
    result[subject[i]] = marks[i];
}

let avg = totalMarks / marks.length;

console.log(`
    ======== Student Report ========

    Subject & Marks:
    ${subject.map((sub, i) => `${sub} = ${marks[i]}`).join("\n")}

    --------------------------------------------
    Total Marks : ${totalMarks}
    Average Marks : ${avg.toFixed(2)}
    Result        : ${avg >= 60 ? "Passed" : "Failed"}

    ======================================
`);
