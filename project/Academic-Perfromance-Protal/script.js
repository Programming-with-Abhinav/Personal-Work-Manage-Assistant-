// Constants for Business Logic Metrics
const PASSING_SUBJECT_MIN = 33;
const PASSING_AVG_MIN = 60;

const defaultSubjects = ["Hindi", "English", "Mathematics", "Physics", "Chemistry"];

document.addEventListener("DOMContentLoaded", () => {
    const subjectsContainer = document.getElementById("subjectsContainer");
    const addSubjectBtn = document.getElementById("addSubjectBtn");
    const reportForm = document.getElementById("reportForm");
    const reportCardSection = document.getElementById("reportCardSection");
    const printBtn = document.getElementById("printBtn");

    // Initialize UI with Default Schema
    defaultSubjects.forEach(sub => addSubjectRow(sub));

    // Event Listeners
    addSubjectBtn.addEventListener("click", () => addSubjectRow());
    reportForm.addEventListener("submit", handleFormSubmit);
    printBtn.addEventListener("click", () => window.print());

    // Programmatically append subject input blocks
    function addSubjectRow(subjectName = "") {
        const row = document.createElement("div");
        row.className = "subject-row";
        row.innerHTML = `
            <div class="input-group">
                <input type="text" class="subject-name" required placeholder="Subject Name" value="${subjectName}">
            </div>
            <div class="input-group">
                <input type="number" class="subject-mark" required min="0" max="100" placeholder="Score">
            </div>
            <button type="button" class="btn btn-danger remove-row-btn" aria-label="Delete Row">✕</button>
        `;

        // Validation constraints real-time formatting
        const markInput = row.querySelector(".subject-mark");
        markInput.addEventListener("input", (e) => {
            let val = parseInt(e.target.value, 10);
            if (val > 100) e.target.value = 100;
            if (val < 0) e.target.value = 0;
        });

        row.querySelector(".remove-row-btn").addEventListener("click", () => {
            if (document.querySelectorAll(".subject-row").length > 1) {
                row.remove();
            } else {
                alert("The report card structure requires at least one subject profile.");
            }
        });

        subjectsContainer.appendChild(row);
    }

    // Process submission data metrics safely
    function handleFormSubmit(e) {
        e.preventDefault();

        if (!reportForm.checkValidity()) {
            alert("Please verify all data entries match standard structural rules.");
            return;
        }

        const studentName = document.getElementById("studentName").value.trim();
        const className = document.getElementById("className").value.trim();
        const schoolName = document.getElementById("schoolName").value.trim();

        const subjectRows = document.querySelectorAll(".subject-row");
        let totalMarks = 0;
        let subjectCount = 0;
        let clearAllIndividualBaselines = true;

        const reportTableBody = document.getElementById("reportTableBody");
        reportTableBody.innerHTML = ""; // Flush previous structural renders

        subjectRows.forEach(row => {
            const name = row.querySelector(".subject-name").value.trim();
            const mark = parseInt(row.querySelector(".subject-mark").value, 10);

            totalMarks += mark;
            subjectCount++;

            const subjectPasses = mark >= PASSING_SUBJECT_MIN;
            if (!subjectPasses) {
                clearAllIndividualBaselines = false;
            }

            // Append row item to visual representation
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${name}</strong></td>
                <td class="text-right">${mark}</td>
                <td class="text-right">100</td>
                <td class="text-center">
                    <span class="badge ${subjectPasses ? 'badge-pass' : 'badge-fail'}">
                        ${subjectPasses ? 'Pass' : 'Fail'}
                    </span>
                </td>
            `;
            reportTableBody.appendChild(tr);
        });

        const averageMarks = totalMarks / subjectCount;
        const passedFinalValidation = averageMarks >= PASSING_AVG_MIN && clearAllIndividualBaselines;

        // Render calculated strings to output target nodes
        document.getElementById("outStudentName").textContent = studentName;
        document.getElementById("outClassName").textContent = className;
        document.getElementById("outSchoolName").textContent = schoolName.toUpperCase();
        document.getElementById("outDate").textContent = new Date().toLocaleDateString('en-GB');

        document.getElementById("outTotal").textContent = `${totalMarks} / ${subjectCount * 100}`;
        document.getElementById("outAverage").textContent = `${averageMarks.toFixed(2)}%`;

        const statusCard = document.getElementById("statusCard");
        const outStatus = document.getElementById("outStatus");
        const motivationBanner = document.getElementById("motivationalMessage");

        // Clean out context classifications
        statusCard.className = "summary-box status-box";
        motivationBanner.className = "motivation-banner";

        if (passedFinalValidation) {
            outStatus.textContent = "Passed";
            statusCard.classList.add("status-passed");
            motivationBanner.textContent = "Outstanding Performance! Keep up the excellent work!";
            motivationBanner.classList.add("pass");
            triggerCelebrationEffects();
        } else {
            outStatus.textContent = "Failed";
            statusCard.classList.add("status-failed");
            
            let message = "Try Again! Consistency leads to success.";
            if(!clearAllIndividualBaselines && averageMarks >= PASSING_AVG_MIN) {
                message = "Failed: Average criteria met, but failed single-subject baseline standards. Try Again!";
            }
            motivationBanner.textContent = message;
            motivationBanner.classList.add("fail");
        }

        reportCardSection.classList.remove("hidden");
        reportCardSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Structural animation library calls (Canvas Confetti Pop)
    function triggerCelebrationEffects() {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }
});
