// /assets/js/employee-portal.js - Logic for the Employee Portal

/**
 * Fetches and renders the content for a specific employee dashboard page.
 * @param {string} pageName The name of the page to load (e.g., "policies").
 */
export async function loadEmployeePageContent(pageName) {
	const contentArea = document.getElementById("dashboard-content");
	if (!contentArea) return;

	try {
		const response = await fetch(`pages/${pageName}.html`);
		contentArea.innerHTML = await response.text();

		if (pageName === "policies") {
			await fetchAndRenderPolicies();
		}
	} catch (error) {
		console.error("Error loading employee page content:", error);
		contentArea.innerHTML =
			'<p class="text-red-500">Error loading page content.</p>';
	}
}

/**
 * Fetches policy data from Google Sheets and renders it.
 */
async function fetchAndRenderPolicies() {
	const sheetSources = [
		{
			category: "OFOFC",
			url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhMrE4B_PjxoesN7E0_yo5yoD4pKMq7VJWLsOjm9S43UpVbk1MPFMGryYjurDA8TkwRSC9pnnCV0W-/pub?gid=1635401576&single=true&output=csv",
		},
		{
			category: "Group Homes",
			url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhMrE4B_PjxoesN7E0_yo5yoD4pKMq7VJWLsOjm9S43UpVbk1MPFMGryYjurDA8TkwRSC9pnnCV0W-/pub?gid=558865368&single=true&output=csv",
		},
		{
			category: "Behavioral Health",
			url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhMrE4B_PjxoesN7E0_yo5yoD4pKMq7VJWLsOjm9S43UpVbk1MPFMGryYjurDA8TkwRSC9pnnCV0W-/pub?gid=1506264972&single=true&output=csv",
		},
		{
			category: "Foster Care",
			url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhMrE4B_PjxoesN7E0_yo5yoD4pKMq7VJWLsOjm9S43UpVbk1MPFMGryYjurDA8TkwRSC9pnnCV0W-/pub?gid=774533600&single=true&output=csv",
		},
	];

	const policiesContainer = document.getElementById("policies-container");
	if (!policiesContainer) return;

	try {
		const responses = await Promise.all(
			sheetSources.map((source) => fetch(source.url))
		);
		policiesContainer.innerHTML = ""; // Clear loading message

		for (let i = 0; i < responses.length; i++) {
			const response = responses[i];
			const source = sheetSources[i];
			if (!response.ok) continue;

			const csvText = await response.text();
			const subsections = parseCSVWithSubsections(csvText);

			// Code to create and append HTML elements for policies...
			const mainDetails = document.createElement("details");
			mainDetails.className = "bg-white shadow rounded-lg";
			const mainSummary = document.createElement("summary");
			mainSummary.className =
				"p-4 font-bold text-lg cursor-pointer hover:bg-gray-50";
			mainSummary.textContent = source.category;
			mainDetails.appendChild(mainSummary);
			const subsectionContainer = document.createElement("div");
			subsectionContainer.className = "p-4 space-y-3";
			mainDetails.appendChild(subsectionContainer);

			for (const sectionTitle in subsections) {
				const policies = subsections[sectionTitle];
				if (policies.length === 0) continue;
				const subDetails = document.createElement("details");
				subDetails.className = "bg-gray-50 rounded";
				const subSummary = document.createElement("summary");
				subSummary.className =
					"p-3 font-semibold text-md cursor-pointer hover:bg-gray-200";
				subSummary.textContent = sectionTitle;
				const ul = document.createElement("ul");
				ul.className = "p-3 pt-0 divide-y";
				policies.forEach((policy) => {
					const li = document.createElement("li");
					li.className = "py-2 flex justify-between items-center";
					li.innerHTML = `<a href="${policy.Link}" target="_blank" class="text-blue-600 hover:underline text-sm">${policy.PolicyName}</a>`;
					ul.appendChild(li);
				});
				subDetails.appendChild(subSummary);
				subDetails.appendChild(ul);
				subsectionContainer.appendChild(subDetails);
			}
			policiesContainer.appendChild(mainDetails);
		}
	} catch (error) {
		policiesContainer.innerHTML = `<p class="text-red-500">Error loading policies.</p>`;
		console.error("Error fetching sheets:", error);
	}
}

/**
 * Parses CSV text with specific subsection formatting.
 */
function parseCSVWithSubsections(text) {
	const sections = {};
	let currentSection = "Uncategorized";
	const lines = text.trim().split(/\r\n|\n/);
	for (const line of lines) {
		if (line.match(/^[A-Z]\.\s/)) {
			currentSection = line.split(",")[0].trim();
			if (!sections[currentSection]) sections[currentSection] = [];
			continue;
		}
		const lastComma = line.lastIndexOf(",");
		const secondLastComma = line.lastIndexOf(",", lastComma - 1);
		if (lastComma === -1 || secondLastComma === -1) continue;
		const link = line.substring(lastComma + 1).trim();
		const revisionDate = line.substring(secondLastComma + 1, lastComma).trim();
		let policyName = line.substring(0, secondLastComma).trim();
		if (link.startsWith("http") && revisionDate) {
			if (policyName.startsWith('"')) policyName = policyName.substring(1);
			if (policyName.endsWith('"')) policyName = policyName.slice(0, -1);
			policyName = policyName.replace(/^[0-9]+\.\s*/, "").trim();
			if (!sections[currentSection]) sections[currentSection] = [];
			sections[currentSection].push({
				PolicyName: policyName,
				RevisionDate: revisionDate,
				Link: link,
			});
		}
	}
	return sections;
}
