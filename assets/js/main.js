// /assets/js/main.js - Main application controller and renderer

import { router } from "./router.js";
import { loadEmployeePageContent } from "./employee-portal.js";

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

// --- RENDER FUNCTIONS ---
export async function renderPublicSite(page) {
	try {
		clearPlaceholders();
		const [navHtml, footerHtml, pageHtml] = await Promise.all([
			fetch("components/nav.html").then((res) => res.text()),
			fetch("components/footer.html").then((res) => res.text()),
			fetch(`pages/${page}.html`).then((res) => res.text()),
		]);

		console.log("NAV HTML CONTENT:", navHtml);

		document.getElementById("nav-placeholder").innerHTML = navHtml;
		document.getElementById("footer-placeholder").innerHTML = footerHtml;
		document.getElementById("page-content").innerHTML = pageHtml;

		setTimeout(setupMobileMenu, 0);
		lucide.createIcons();
	} catch (error) {
		console.error("Failed to render public site:", error);
	}
}

export async function renderLoginScreen(userType) {
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
	}
}

export async function renderDashboard(userType, page) {
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
      </button>`;

		document
			.getElementById(`${userType}-logout`)
			.addEventListener("click", () => handleLogout(userType));
		setupDashboardMenu();
		loadDashboardContent(userType, page); // Pass both userType and page
	} catch (error) {
		console.error("Failed to render dashboard:", error);
	}
}

// --- DATA & CONTENT LOADERS ---
async function loadDashboardContent(userType, pageName) {
	if (userType === "employee") {
		await loadEmployeePageContent(pageName);
	} else if (userType === "foster") {
		const contentArea = document.getElementById("dashboard-content");
		if (!contentArea) return;
		try {
			const response = await fetch(`pages/${pageName}.html`);
			contentArea.innerHTML = await response.text();
		} catch (error) {
			console.error("Error loading foster page content:", error);
			contentArea.innerHTML = '<p class="text-red-500">Error loading page.</p>';
		}
	}
}

// --- EVENT HANDLERS & AUTHENTICATION ---
export function isEmployeeAuthenticated() {
	return localStorage.getItem("employee_authenticated") === "true";
}

export function isFosterParentAuthenticated() {
	return localStorage.getItem("foster_authenticated") === "true";
}

function handleLoginSubmit(event, userType) {
	event.preventDefault();
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	const credentials = {
		employee: { user: "Admin", pass: "admin" },
		foster: { user: "Admin", pass: "admin" },
	};

	const creds = credentials[userType];
	if (creds && username === creds.user && password === creds.pass) {
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

// --- UI HELPERS ---
function clearPlaceholders() {
	document.getElementById("nav-placeholder").innerHTML = "";
	document.getElementById("page-content").innerHTML = "";
	document.getElementById("footer-placeholder").innerHTML = "";
	document.body.className = "bg-brand-light font-sans antialiased";
	document.getElementById("page-content").className = "";
}

function setupMobileMenu() {
	console.log("1. setupMobileMenu() function is running."); // CHECKPOINT 1

	const mobileMenuButton = document.getElementById("mobile-menu-button");
	const mobileMenu = document.getElementById("mobile-menu");

	console.log("2. Finding elements:", { mobileMenuButton, mobileMenu }); // CHECKPOINT 2

	if (mobileMenuButton && mobileMenu) {
		console.log("3. Elements were found! Adding click listener..."); // CHECKPOINT 3

		mobileMenuButton.addEventListener("click", () => {
			console.log("4. CLICK DETECTED! Toggling 'hidden' class."); // CHECKPOINT 4
			mobileMenu.classList.toggle("hidden");
		});

		mobileMenu.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => mobileMenu.classList.add("hidden"));
		});
	} else {
		console.error(
			"ERROR: One or both menu elements were not found in the DOM."
		); // ERROR CHECKPOINT
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
