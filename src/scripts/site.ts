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

	let currentActiveId: string | null = null;

	const observer = new IntersectionObserver(
		(entries) => {
			// Find the intersecting section with highest intersectionRatio
			let bestEntry: IntersectionObserverEntry | null = null;
			let bestRatio = 0;

			for (const entry of entries) {
				if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
					bestRatio = entry.intersectionRatio;
					bestEntry = entry;
				}
			}

			if (bestEntry) {
				// A section is in the detection zone
				const newActiveId = bestEntry.target.id;
				if (newActiveId !== currentActiveId) {
					// Clear previous, set new
					navAnchors.forEach((a) => a.removeAttribute("aria-current"));
					const match = document.querySelector<HTMLAnchorElement>(`.nav-links a[href="#${newActiveId}"]`);
					match?.setAttribute("aria-current", "page");
					currentActiveId = newActiveId;
				}
			} else if (currentActiveId !== null) {
				// NO section in detection zone — clear active state (top of page or between sections)
				navAnchors.forEach((a) => a.removeAttribute("aria-current"));
				currentActiveId = null;
			}
		},
		{ rootMargin: "-40% 0px -55% 0px" }
	);

	sections.forEach((s) => observer.observe(s));
}

function setupNavScrollState(): void {
	const nav = document.querySelector<HTMLElement>(".site-nav");
	if (!nav) return; // 404 pages render no nav
	let ticking = false;
	const apply = () => {
		nav.classList.toggle("is-scrolled", window.scrollY > 16);
		ticking = false;
	};
	window.addEventListener(
		"scroll",
		() => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(apply);
		},
		{ passive: true }
	);
	apply(); // correct state on refresh mid-page
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

function setupContactModal(): void {
	const modal = document.getElementById("contact-modal") as HTMLDialogElement | null;
	const form = document.getElementById("contact-form") as HTMLFormElement | null;
	const submitBtn = document.querySelector<HTMLButtonElement>("[data-contact-submit]");
	const submitText = document.querySelector<HTMLElement>(".contact-modal__submit-text");
	const submitLoading = document.querySelector<HTMLElement>("[data-contact-loading]");
	const successEl = document.querySelector<HTMLElement>("[data-contact-success]");
	const errorEls = document.querySelectorAll<HTMLElement>("[data-contact-error]");
	const closeBtn = document.querySelector<HTMLButtonElement>("[data-modal-close]");

	if (!modal || !form || !submitBtn || !submitText || !submitLoading || !successEl || !closeBtn) return;

	// i18n translation object (injected by Astro at build time)
	const i18n = (window as any).__i18n ?? {};

	// Guards against double submits while a request is in flight. The submit
	// button stays ENABLED so focus is never dropped to <body> (a11y); the
	// in-flight state is conveyed via aria-busy on the form.
	let inFlight = false;

	// Helper to get translation with fallback
	const t = (key: string, fallback?: string): string => {
		const keys = key.split(".");
		let obj: any = i18n;
		for (const k of keys) {
			obj = obj?.[k];
		}
		return obj ?? fallback ?? key;
	};

	// Update modal text from i18n
	const updateModalI18n = (): void => {
		document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
			const key = el.getAttribute("data-i18n");
			if (key) el.textContent = t(key);
		});
		document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-i18n-label]").forEach((el) => {
			const key = el.getAttribute("data-i18n-label");
			if (key) el.placeholder = t(key);
		});
		document.querySelectorAll<HTMLOptionElement>("option[data-i18n]").forEach((el) => {
			const key = el.getAttribute("data-i18n");
			if (key) el.textContent = t(key);
		});
		closeBtn.setAttribute("aria-label", t("contact.modal.close"));
	};

	// Reset form and UI state
	const resetForm = (): void => {
		form.reset();
		errorEls.forEach((el) => {
			el.textContent = "";
			el.hidden = true;
		});
		successEl.textContent = "";
		successEl.hidden = true;
		submitBtn.disabled = false;
		submitText.hidden = false;
		submitLoading.hidden = true;
	};

	// Show inline error on a specific field
	const showFieldError = (field: string, message: string): void => {
		const errorEl = document.querySelector<HTMLElement>(`[data-contact-error="${field}"]`);
		if (errorEl) {
			errorEl.textContent = message;
			errorEl.hidden = false;
		}
	};

	// Client-side validation
	const validateForm = (formData: FormData): { valid: boolean; errors: Record<string, string> } => {
		const errors: Record<string, string> = {};

		const name = formData.get("name")?.toString().trim() ?? "";
		const email = formData.get("email")?.toString().trim() ?? "";
		const contactType = formData.get("contactType")?.toString() ?? "";
		const message = formData.get("message")?.toString().trim() ?? "";

		if (!name) errors.name = t("contact.modal.form.validation.nameRequired", "Name is required");
		if (!email) {
			errors.email = t("contact.modal.form.validation.emailRequired", "Email is required");
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = t("contact.modal.form.validation.emailInvalid", "Invalid email format");
		}
		if (!contactType) errors.contactType = t("contact.modal.form.validation.typeRequired", "Contact type is required");
		if (!message) errors.message = t("contact.modal.form.validation.messageRequired", "Message is required");

		return { valid: Object.keys(errors).length === 0, errors };
	};

	// Open modal
	const openModal = (): void => {
		updateModalI18n();
		resetForm();
		modal.showModal();
		// Focus first field after modal opens
		setTimeout(() => {
			const nameInput = document.getElementById("contact-name") as HTMLInputElement;
			nameInput?.focus();
		}, 50);
	};

	// Close modal
	const closeModal = (): void => {
		modal.close();
		resetForm();
	};

	// Event delegation for open buttons
	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		const openBtn = target.closest<HTMLButtonElement>("[data-modal=\"contact\"]");
		if (openBtn) {
			e.preventDefault();
			openModal();
		}
	});

	// Close on backdrop click
	modal.addEventListener("click", (e) => {
		const rect = modal.getBoundingClientRect();
		const isInDialog = rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
			rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
		if (!isInDialog) {
			closeModal();
		}
	});

	// Close on Escape key (native dialog handles this, but ensure form reset)
	modal.addEventListener("close", () => {
		resetForm();
	});

	// Close button
	closeBtn.addEventListener("click", () => {
		closeModal();
	});

	// Form submit
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		if (inFlight) return; // guard against double submits
		inFlight = true;
		form.setAttribute("aria-busy", "true");

		const formData = new FormData(form);
		const { valid, errors } = validateForm(formData);

		// Clear previous errors
		errorEls.forEach((el) => {
			el.textContent = "";
			el.hidden = true;
		});

		if (!valid) {
			inFlight = false;
			form.removeAttribute("aria-busy");
			Object.entries(errors).forEach(([field, message]) => showFieldError(field, message));
			return;
		}

		// Loading state (button stays enabled/focused; aria-busy conveys state)
		submitText.hidden = true;
		submitLoading.hidden = false;

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: formData.get("name"),
					email: formData.get("email"),
					contactType: formData.get("contactType"),
					message: formData.get("message"),
				}),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				// Success: reset the form FIRST (resetForm wipes the status
				// element), then show the confirmation so it actually renders.
				resetForm();
				inFlight = false;
				form.removeAttribute("aria-busy");
				successEl.textContent = t("contact.modal.form.success", "Thanks! I'll be in touch within 24 hours.");
				successEl.hidden = false;
				// Auto-close after 2 seconds
				setTimeout(() => closeModal(), 2000);
			} else if (response.status === 400 && data.field) {
				// Validation error from server
				showFieldError(data.field, data.error);
				inFlight = false;
				form.removeAttribute("aria-busy");
				submitText.hidden = false;
				submitLoading.hidden = true;
			} else if (response.status === 429) {
				// Rate limit
				const errorMsg = t("contact.modal.form.errorRateLimit", "Too many requests. Please wait a moment and try again.");
				successEl.textContent = errorMsg;
				successEl.style.color = "var(--accent)";
				successEl.hidden = false;
				inFlight = false;
				form.removeAttribute("aria-busy");
				submitText.hidden = false;
				submitLoading.hidden = true;
			} else {
				// Server error
				const errorMsg = t("contact.modal.form.error", "Something went wrong. Please try again.");
				successEl.textContent = errorMsg;
				successEl.style.color = "var(--accent)";
				successEl.hidden = false;
				inFlight = false;
				form.removeAttribute("aria-busy");
				submitText.hidden = false;
				submitLoading.hidden = true;
			}
		} catch {
			// Network error
			const errorMsg = t("contact.modal.form.error", "Something went wrong. Please try again.");
			successEl.textContent = errorMsg;
			successEl.style.color = "var(--accent)";
			successEl.hidden = false;
			inFlight = false;
			form.removeAttribute("aria-busy");
			submitText.hidden = false;
			submitLoading.hidden = true;
		}
	});

	// Listen for language changes to update modal text
	window.addEventListener("languagechange", updateModalI18n);
	// Also listen for the lang toggle click to update if modal is open
	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		if (target.closest(".lang-btn") && modal.open) {
			// Small delay for Astro navigation or URL change
			setTimeout(updateModalI18n, 100);
		}
	});
}

setupSkipLink();
setupNavToggle();
setupThemeToggle();
setupScrollTracking();
setupNavScrollState();
setupLangToggle();
setupContactModal();
