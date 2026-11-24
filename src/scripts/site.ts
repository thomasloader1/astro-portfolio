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

	// Translations for client-side messages. The modal markup itself is already
	// rendered in the page's language; Layout.astro injects only `contact.modal`.
	const i18n = (window as any).__i18n ?? {};

	// Guards against double submits while a request is in flight. The submit
	// button stays ENABLED so focus is never dropped to <body> (a11y); the
	// in-flight state is conveyed via aria-busy on the form.
	let inFlight = false;

	// Looks up a dotted key ("contact.modal.form.error") with a fallback.
	const t = (key: string, fallback?: string): string => {
		let obj: any = i18n;
		for (const k of key.split(".")) obj = obj?.[k];
		return typeof obj === "string" ? obj : fallback ?? key;
	};

	const clearFieldErrors = (): void => {
		errorEls.forEach((el) => {
			el.textContent = "";
			el.hidden = true;
		});
		form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
	};

	// Shows a message in the status area; errors use the accent color.
	const showStatus = (message: string, isError: boolean): void => {
		successEl.textContent = message;
		successEl.style.color = isError ? "var(--accent)" : "";
		successEl.hidden = false;
	};

	// Ends the in-flight state and restores the submit button label.
	const endRequest = (): void => {
		inFlight = false;
		form.removeAttribute("aria-busy");
		submitText.hidden = false;
		submitLoading.hidden = true;
	};

	// Reset form and UI state
	const resetForm = (): void => {
		form.reset();
		clearFieldErrors();
		successEl.textContent = "";
		successEl.style.color = "";
		successEl.hidden = true;
		submitText.hidden = false;
		submitLoading.hidden = true;
	};

	const fieldControl = (field: string): HTMLElement | null => {
		const el = form.elements.namedItem(field);
		return el instanceof HTMLElement ? el : null;
	};

	// Show inline error on a specific field and mark it invalid for AT + styling
	const showFieldError = (field: string, message: string): void => {
		const errorEl = document.querySelector<HTMLElement>(`[data-contact-error="${field}"]`);
		if (errorEl) {
			errorEl.textContent = message;
			errorEl.hidden = false;
		}
		fieldControl(field)?.setAttribute("aria-invalid", "true");
	};

	// Editing a field clears its own error (not the others)
	form.addEventListener("input", (e) => {
		const control = e.target as HTMLElement & { name?: string };
		if (!control.name || control.getAttribute("aria-invalid") !== "true") return;
		control.removeAttribute("aria-invalid");
		const errorEl = document.querySelector<HTMLElement>(`[data-contact-error="${control.name}"]`);
		if (errorEl) {
			errorEl.textContent = "";
			errorEl.hidden = true;
		}
	});

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

	// Open modal. A draft typed earlier is kept (closing never wipes it); only a
	// stale status message from a previous attempt is cleared.
	const openModal = (): void => {
		successEl.textContent = "";
		successEl.style.color = "";
		successEl.hidden = true;
		modal.showModal();
		// Focus first field after modal opens
		setTimeout(() => {
			const nameInput = document.getElementById("contact-name") as HTMLInputElement;
			nameInput?.focus();
		}, 50);
	};

	// Close modal — keeps whatever the visitor typed so a mis-tap or Esc never
	// destroys a message. The form is reset only after a successful send.
	const closeModal = (): void => {
		modal.close();
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

	// Close on backdrop click. The form fills the dialog box, so only a click on
	// the ::backdrop targets the <dialog> itself. (A coordinate check misfires on
	// the synthetic click that pressing Enter dispatches, which reports 0,0.)
	modal.addEventListener("click", (e) => {
		if (e.target === modal) closeModal();
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

		clearFieldErrors();
		successEl.hidden = true;

		if (!valid) {
			endRequest();
			Object.entries(errors).forEach(([field, message]) => showFieldError(field, message));
			// Move focus to the first invalid field so keyboard/SR users land on it
			fieldControl(Object.keys(errors)[0])?.focus();
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

			const data = await response.json().catch(() => ({}));

			if (response.ok && data.success) {
				// Reset the form FIRST (resetForm wipes the status element),
				// then show the confirmation so it actually renders.
				resetForm();
				endRequest();
				// Stays visible until the visitor closes the dialog — no timed dismissal.
				showStatus(t("contact.modal.form.success", "Thanks! I'll be in touch within 24 hours."), false);
			} else if (response.status === 400 && data.field) {
				// Server validation: `error` is an i18n key (see src/pages/api/contact.ts)
				endRequest();
				showFieldError(data.field, t(data.error, t("contact.modal.form.error")));
				fieldControl(data.field)?.focus();
			} else if (response.status === 429) {
				endRequest();
				showStatus(t("contact.modal.form.errorRateLimit", "Too many requests. Please wait a moment and try again."), true);
			} else {
				endRequest();
				showStatus(t("contact.modal.form.error", "Something went wrong. Please try again."), true);
			}
		} catch {
			// Network error
			endRequest();
			showStatus(t("contact.modal.form.error", "Something went wrong. Please try again."), true);
		}
	});
}

// Experience: show the 2 latest roles with the 3rd faded; the toggle reveals all.
function setupTimelineToggle(): void {
	const btn = document.querySelector<HTMLButtonElement>("[data-tl-toggle]");
	const list = btn ? document.getElementById(btn.getAttribute("aria-controls") ?? "") : null;
	if (!btn || !list) return;
	// Hidden and faded roles can't take focus or clicks while collapsed.
	const syncInert = (): void => {
		const collapsed = list.classList.contains("is-collapsed");
		[...list.children].forEach((li, i) => ((li as HTMLElement).inert = collapsed && i >= 2));
	};
	syncInert();
	btn.addEventListener("click", () => {
		const expand = list.classList.contains("is-collapsed");
		list.classList.toggle("is-collapsed", !expand);
		syncInert();
		btn.setAttribute("aria-expanded", expand ? "true" : "false");
		btn.textContent = (expand ? btn.dataset.labelLess : btn.dataset.labelMore) ?? btn.textContent;
		// Collapsing from far down: bring the section back so the reader isn't lost.
		if (!expand) document.getElementById("experience")?.scrollIntoView({ block: "start" });
	});
}

setupSkipLink();
setupTimelineToggle();
setupNavToggle();
setupThemeToggle();
setupScrollTracking();
setupNavScrollState();
setupLangToggle();
setupContactModal();
