document.addEventListener("DOMContentLoaded", () => {
	// 1. Target Dom Control Nodes
	const timeframeSelect = document.getElementById("timeframe-select");
	const workingDaysInput = document.getElementById("working-days");
	const customerInput = document.getElementById("customer-per-days");
	const profitInput = document.getElementById("profit-per-head");
	const marginInput = document.getElementById("margin-per-head");

	const workingDaysWrapper = document.getElementById("working-days-wrapper");
	const resultsGrid = document.getElementById("calculation-results");

	// 2. Main Processing Function
	function updateCalculations() {
		// Read input values in real-time and safely handle empty fields using fallback || 0
		const selection = timeframeSelect.value;
		const customersPerDay = Number(customerInput.value) || 0;
		const profitPerHead = Number(profitInput.value) || 0;
		const marginPerHead = Number(marginInput.value) || 0;

		let totalDays = 0;

		// Dynamic Timeframe conditional check logic
		if (selection === "custom") {
			workingDaysWrapper.style.display = "flex"; // Show manual days box
			totalDays = Number(workingDaysInput.value) || 0;
		} else {
			workingDaysWrapper.style.display = "none"; // Hide manual days box for fixed presets
			if (selection === "weekly") totalDays = 7;
			else if (selection === "month") totalDays = 30;
			else if (selection === "year") totalDays = 365;
		}

		// Complete Financial Math Matrix Formulas
		let profit = customersPerDay * profitPerHead * totalDays;
		let margin = customersPerDay * marginPerHead * totalDays;
		let gst = margin * 0.2;
		let tax = margin * 0.18;
		let netProfit = margin - (gst + tax);

		let weeklyPresetVal = customersPerDay * 7 * profitPerHead;

		// 3. Inject calculated outputs live onto layout nodes
		resultsGrid.innerHTML = `
            <div class="result-card"><span>Active Operation Context</span><strong>${totalDays} Days</strong></div>
            <div class="result-card"><span>Base Yield Earnings</span><strong>₹${profit.toLocaleString()}</strong></div>
            <div class="result-card"><span>Gross Margin Return</span><strong>₹${margin.toLocaleString()}</strong></div>
            <div class="result-card"><span>Accrued GST Collection (20%)</span><strong>₹${gst.toLocaleString()}</strong></div>
            <div class="result-card"><span>Income Tax Reserve (18%)</span><strong>₹${tax.toLocaleString()}</strong></div>
            <div class="result-card highlight"><span>Net Profit Balance</span><strong>₹${netProfit.toLocaleString()}</strong></div>
            <div class="result-card"><span>Baseline Weekly Yield</span><strong>₹${weeklyPresetVal.toLocaleString()}</strong></div>
        `;
	}

	// 4. Attach Event Listeners to run calculations live on user interaction
	timeframeSelect.addEventListener("change", updateCalculations);
	workingDaysInput.addEventListener("input", updateCalculations);
	customerInput.addEventListener("input", updateCalculations);
	profitInput.addEventListener("input", updateCalculations);
	marginInput.addEventListener("input", updateCalculations);

	// Initial calculation fire on window startup load
	updateCalculations();
});
