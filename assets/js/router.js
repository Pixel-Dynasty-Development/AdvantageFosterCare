// /assets/js/router.js - Handles URL-based page routing

import {
	renderPublicSite,
	renderLoginScreen,
	renderDashboard,
} from "./main.js";
import {
	isEmployeeAuthenticated,
	isFosterParentAuthenticated,
} from "./main.js";

/**
 * Main router function to render pages based on the current URL path.
 */
export function router() {
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
