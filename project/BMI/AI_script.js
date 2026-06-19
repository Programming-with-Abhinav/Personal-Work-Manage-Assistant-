document.getElementById('trackerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents page from breaking or reloading

    // DOM Inputs elements
    const weightEl = document.getElementById('weight');
    const heightEl = document.getElementById('height');
    const weightUnit = document.getElementById('weightUnit').value;
    const heightUnit = document.getElementById('heightUnit').value;
    const activityLevel = document.getElementById('activity').value;

    // Dynamic UI elements for errors
    const weightError = document.getElementById('weightError');
    const heightError = document.getElementById('heightError');

    // Reset old alerts and errors
    let isValid = true;
    weightError.textContent = "";
    heightError.textContent = "";
    weightEl.removeAttribute('aria-invalid');
    heightEl.removeAttribute('aria-invalid');

    const rawWeight = parseFloat(weightEl.value);
    const rawHeight = parseFloat(heightEl.value);

    // Modern Form Error Validation Checks
    if (isNaN(rawWeight) || rawWeight <= 0) {
        weightError.textContent = "Please provide a valid weight greater than zero.";
        weightEl.setAttribute('aria-invalid', 'true');
        isValid = false;
    }
    if (isNaN(rawHeight) || rawHeight <= 0) {
        heightError.textContent = "Please provide a valid height greater than zero.";
        heightEl.setAttribute('aria-invalid', 'true');
        isValid = false;
    }

    // Stop execution if fields are filled incorrectly
    if (!isValid) return;

    // Comprehensive Units Conversion Logic
    let weightInKg = rawWeight;
    if (weightUnit === "g") {
        weightInKg = rawWeight / 1000;
    } else if (weightUnit === "lbs") {
        weightInKg = rawWeight * 0.45359237; // Exact international pound metric definition
    }

    let heightInMeters = rawHeight;
    if (heightUnit === "cm") {
        heightInMeters = rawHeight / 100; 
    } else if (heightUnit === "in") {
        heightInMeters = rawHeight * 0.0254; // Standard inch translation metric conversion
    }

    // Exponential calculation calculation syntax
    const bmi = weightInKg / (heightInMeters ** 2);
    
    // Core Project Energy Target calculation rule
    let dailyCalories = weightInKg * 24; 
    if (activityLevel === "active") {
        dailyCalories *= 1.3; 
    }

    // Capture Result Output DOM Containers
    const card = document.getElementById('healthCard');
    const bmiResult = document.getElementById('bmiResult');
    const calorieResult = document.getElementById('calorieResult');

    // Clean structural theme tokens safely via classList API
    card.classList.remove('underweight-zone', 'normal-zone', 'overweight-zone');

    // Run conditionals matching assigned zone thresholds
    if (bmi < 18.5) {
        bmiResult.textContent = `Underweight (${bmi.toFixed(2)})`;
        card.classList.add('underweight-zone');
    } else if (bmi >= 18.5 && bmi < 25) {
        bmiResult.textContent = `Normal Weight (${bmi.toFixed(2)})`;
        card.classList.add('normal-zone');
    } else {
        bmiResult.textContent = `Overweight (${bmi.toFixed(2)})`;
        card.classList.add('overweight-zone');
    }

    // Output finalized calculated metrics summary to user screen
    calorieResult.textContent = `${Math.round(dailyCalories)} kcal`;
});
