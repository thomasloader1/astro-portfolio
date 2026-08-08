// Shared browser scripts — bundled once from Layout.astro via <script>.
// The FOUC theme script stays inline in the layout <head> (must run before paint).

function setupSkipLink(): void {
	const skipLink = document.querySelector<HTMLAnchorElement>(".skip-link");
	if (!skipLink) return;
	skipLink.addEventListener("click", (e) => {
		const target = document.querySelector<HTMLElement>(skipLink.getAttribute("href") ?? "");
		if (!target) return;
		e.preventDefault();
		target.setAttribute("tabindex", "-1");
		target.focus();
		setTimeout(() => target.removeAttribute("tabindex"), 1000);
	});
}

function setupNavToggle(): void {
	const navToggle = document.getElementById("nav-toggle");
	const navLinks = document.getElementById("nav-links");
	if (!navToggle || !navLinks) return;
	navToggle.addEventListener("click", () => {
		const open = navLinks.classList.toggle("open");
		navToggle.setAttribute("aria-expanded", open ? "true" : "false");
	});
	navLinks.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		if (target.tagName === "A") {
			navLinks.classList.remove("open");
			navToggle.setAttribute("aria-expanded", "false");
		}
	});
}

function setupThemeToggle(): void {
	const themeToggle = document.getElementById("theme-toggle");
	themeToggle?.addEventListener("click", () => {
		const isDark = document.documentElement.classList.toggle("dark");
		localStorage.setItem("theme", isDark ? "dark" : "light");
	});
}

function setupScrollTracking(): void {
	const sections = document.querySelectorAll<HTMLElement>("section[id]");
	const navAnchors = document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]');
	if (!sections.length || !navAnchors.length) return;
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				navAnchors.forEach((a) => a.removeAttribute("aria-current"));
				const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
				match?.setAttribute("aria-current", "page");
			});
		},
		{ rootMargin: "-40% 0px -55% 0px" }
	);
	sections.forEach((s) => observer.observe(s));
}

function setupLangToggle(): void {
	const langToggle = document.getElementById("lang-toggle");
	if (!langToggle) return;
	// No client-side i18next instance (SSG) — the URL is the source of truth,
	// same mapping used by the click handler below. Highlights the active
	// language button on load (the is-active class is not rendered server-side).
	const currentLang = window.location.pathname.startsWith("/en/") ? "en" : "es";
	langToggle.querySelectorAll<HTMLElement>(".lang-btn").forEach((btn) => {
		btn.classList.toggle("is-active", btn.getAttribute("data-lang") === currentLang);
	});
	langToggle.addEventListener("click", (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLElement>(".lang-btn");
		if (!btn) return;
		const next = btn.getAttribute("data-lang");
		langToggle.querySelectorAll<HTMLElement>(".lang-btn").forEach((b) => b.classList.remove("is-active"));
		btn.classList.add("is-active");
		window.location.href = next === "en" ? "/en/" : "/";
	});
}

setupSkipLink();
setupNavToggle();
setupThemeToggle();
setupScrollTracking();
setupLangToggle();
