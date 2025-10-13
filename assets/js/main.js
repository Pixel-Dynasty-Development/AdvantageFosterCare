// /assets/js/main.js - Main router and controller for the application

// --- INITIALIZATION ---
window.addEventListener("popstate", router);
document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", (e) => {
		if (e.target.matches("a[href^='/']")) {
			e.preventDefault();
			history.pushState(null, "", e.target.href);
			router();
		}
	});
	router();
});

// --- AUTHENTICATION ---
function isEmployeeAuthenticated() {
	return localStorage.getItem("employee_authenticated") === "true";
}

function isFosterParentAuthenticated() {
	return localStorage.getItem("foster_authenticated") === "true";
}

// --- ROUTER ---
function router() {
	const path = window.location.pathname;
	let route = path === "/" ? "home" : path.slice(1);

	const publicPages = ["home", "about", "contact"];
	const employeePages = [
		"employee-dashboard",
		"policies",
		"relias",
		"incident-reporting",
		"carelogic",
		"carelogic-training",
	];
	const fosterPages = [
		"foster-dashboard",
		"training-materials",
		"important-forms",
	];

	if (route === "employee-login") {
		renderLoginScreen("employee");
	} else if (route === "foster-login") {
		renderLoginScreen("foster");
	} else if (employeePages.includes(route)) {
		if (isEmployeeAuthenticated()) {
			renderDashboard("employee", route);
		} else {
			history.pushState(null, "", "/employee-login");
			router();
		}
	} else if (fosterPages.includes(route)) {
		if (isFosterParentAuthenticated()) {
			renderDashboard("foster", route);
		} else {
			history.pushState(null, "", "/foster-login");
			router();
		}
	} else if (publicPages.includes(route)) {
		renderPublicSite(route);
	} else {
		history.pushState(null, "", "/");
		router();
	}
}

// --- RENDER FUNCTIONS ---
function clearPlaceholders() {
	document.getElementById("nav-placeholder").innerHTML = "";
	document.getElementById("page-content").innerHTML = "";
	document.getElementById("footer-placeholder").innerHTML = "";
	document.body.className = "bg-brand-light font-sans antialiased";
	document.getElementById("page-content").className = "";
}

async function renderPublicSite(page) {
	try {
		clearPlaceholders();
		const [navHtml, footerHtml, pageHtml] = await Promise.all([
			fetch("components/nav.html").then((res) => res.text()),
			fetch("components/footer.html").then((res) => res.text()),
			fetch(`pages/${page}.html`).then((res) => res.text()),
		]);

		document.getElementById("nav-placeholder").innerHTML = navHtml;
		document.getElementById("footer-placeholder").innerHTML = footerHtml;
		document.getElementById("page-content").innerHTML = pageHtml;

		setupMobileMenu();
		lucide.createIcons();
	} catch (error) {
		console.error("Failed to render public site:", error);
		window.location.hash = "home";
	}
}

async function renderLoginScreen(userType) {
	try {
		clearPlaceholders();
		const loginPage =
			userType === "employee" ? "employee-login.html" : "foster-login.html";
		const loginHtml = await fetch(`pages/${loginPage}`).then((res) =>
			res.text()
		);
		document.getElementById("page-content").innerHTML = loginHtml;

		const loginForm = document.getElementById(`${userType}-login-form`);
		if (loginForm) {
			loginForm.addEventListener("submit", (e) =>
				handleLoginSubmit(e, userType)
			);
		}
	} catch (error) {
		console.error("Failed to render login screen:", error);
		window.location.hash = "home";
	}
}

async function renderDashboard(userType, page) {
	try {
		clearPlaceholders();
		document.body.className = "bg-gray-100 font-sans";
		const navComponent =
			userType === "employee" ? "employeenav.html" : "fosternav.html";
		const navHtml = await fetch(`components/${navComponent}`).then((res) =>
			res.text()
		);

		const pageContent = document.getElementById("page-content");
		pageContent.className = "relative min-h-screen md:flex";
		pageContent.innerHTML = `
            <div id="sidenav-placeholder" class="sidebar-closed">${navHtml}</div>
            <main id="dashboard-content" class="flex-1 p-8 overflow-y-auto"></main>
      <button id="menu-toggle" class="md:hidden fixed top-4 left-4 bg-gray-800 text-white p-2 rounded-md z-30">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
        `;

		document
			.getElementById(`${userType}-logout`)
			.addEventListener("click", () => handleLogout(userType));
		setupDashboardMenu();
		loadDashboardContent(page);
	} catch (error) {
		console.error("Failed to render dashboard:", error);
		window.location.hash = "home";
	}
}

// --- HELPERS & HANDLERS ---
function handleLoginSubmit(event, userType) {
	event.preventDefault();
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;
	let isAuthenticated = false;

	const employeeCreds = { user: "Admin", pass: "admin" };
	const fosterCreds = { user: "Admin", pass: "admin" };

	if (
		userType === "employee" &&
		username === employeeCreds.user &&
		password === employeeCreds.pass
	) {
		isAuthenticated = true;
	} else if (
		userType === "foster" &&
		username === fosterCreds.user &&
		password === fosterCreds.pass
	) {
		isAuthenticated = true;
	}

	if (isAuthenticated) {
		localStorage.setItem(`${userType}_authenticated`, "true");
		const path =
			userType === "employee" ? "/employee-dashboard" : "/foster-dashboard";
		history.pushState(null, "", path);
		router();
	} else {
		document.getElementById("login-error").classList.remove("hidden");
	}
}

function handleLogout(userType) {
	localStorage.removeItem(`${userType}_authenticated`);
	history.pushState(null, "", "/");
	router();
}

async function loadDashboardContent(pageName) {
	const contentArea = document.getElementById("dashboard-content");
	if (!contentArea) return;

	try {
		const response = await fetch(`pages/${pageName}.html`);
		const pageHtml = await response.text();
		contentArea.innerHTML = pageHtml;

		// If the loaded page is the policies page, run the logic to fetch the data.
		if (pageName === "policies") {
			fetchAndRenderPolicies();
		}
	} catch (error) {
		console.error("Error loading dashboard content:", error);
		contentArea.innerHTML = '<p class="text-red-500">Error loading page.</p>';
	}
}

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

	const parseCSVWithSubsections = (text) => {
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
			const revisionDate = line
				.substring(secondLastComma + 1, lastComma)
				.trim();
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
	};

	try {
		const responses = await Promise.all(
			sheetSources.map((source) => fetch(source.url))
		);
		policiesContainer.innerHTML = ""; // Clear the "Loading..." message

		for (let i = 0; i < responses.length; i++) {
			const response = responses[i];
			const source = sheetSources[i];
			if (!response.ok) continue;

			const csvText = await response.text();
			const subsections = parseCSVWithSubsections(csvText);

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
					li.innerHTML = `
                <a href="${policy.Link}" target="_blank" class="text-blue-600 hover:underline text-sm">${policy.PolicyName}</a>
              `;
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

function setupMobileMenu() {
	const mobileMenuButton = document.getElementById("mobile-menu-button");
	const mobileMenu = document.getElementById("mobile-menu");
	if (mobileMenuButton && mobileMenu) {
		mobileMenuButton.addEventListener("click", () => {
			mobileMenu.classList.toggle("hidden");
		});
	}
}

function setupDashboardMenu() {
	const menuButton = document.getElementById("menu-toggle");
	const sidebar = document.getElementById("sidenav-placeholder");
	if (menuButton && sidebar) {
		menuButton.addEventListener("click", () => {
			sidebar.classList.toggle("sidebar-open");
			sidebar.classList.toggle("sidebar-closed");
		});
	}
}
