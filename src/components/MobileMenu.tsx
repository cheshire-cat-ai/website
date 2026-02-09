import { useState, useRef, useEffect, useCallback } from 'react';
import navigation from '../content/navigation.json';
import styles from './MobileMenu.module.css';

const base = import.meta.env.BASE_URL;
const resolveHref = (href: string) =>
	href.startsWith('/') ? `${base}${href.slice(1)}` : href;

export default function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
	const menuRef = useRef<HTMLDivElement>(null);
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const closeBtnRef = useRef<HTMLButtonElement>(null);

	const close = useCallback(() => {
		setIsOpen(false);
		hamburgerRef.current?.focus();
	}, []);

	const open = useCallback(() => {
		setIsOpen(true);
	}, []);

	// Focus the close button when the menu opens
	useEffect(() => {
		if (isOpen) {
			closeBtnRef.current?.focus();
		}
	}, [isOpen]);

	// Body scroll lock
	useEffect(() => {
		if (isOpen) {
			document.body.classList.add('menu-open');
		} else {
			document.body.classList.remove('menu-open');
		}
		return () => document.body.classList.remove('menu-open');
	}, [isOpen]);

	// Escape key handler
	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, close]);

	// Focus trap
	const handleMenuKeyDown = (e: React.KeyboardEvent) => {
		if (e.key !== 'Tab' || !menuRef.current) return;
		const focusable = menuRef.current.querySelectorAll<HTMLElement>(
			'button, a[href], [tabindex]:not([tabindex="-1"])'
		);
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	};

	const toggleAccordion = (label: string) => {
		setExpandedSections((prev) => {
			const next = new Set(prev);
			if (next.has(label)) {
				next.delete(label);
			} else {
				next.add(label);
			}
			return next;
		});
	};

	return (
		<>
			<button
				ref={hamburgerRef}
				className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
				aria-label={isOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={isOpen}
				onClick={() => (isOpen ? close() : open())}
			>
				<span className={styles.hamburgerLine} />
				<span className={styles.hamburgerLine} />
				<span className={styles.hamburgerLine} />
			</button>

			<div
				className={`${styles.overlay} ${isOpen ? styles.overlayActive : ''}`}
				aria-hidden="true"
				onClick={close}
			/>

			<div
				ref={menuRef}
				className={`${styles.menu} ${isOpen ? styles.menuActive : ''}`}
				role="dialog"
				aria-label="Navigation menu"
				aria-hidden={!isOpen}
				onKeyDown={handleMenuKeyDown}
			>
				<button
					ref={closeBtnRef}
					className={styles.closeBtn}
					aria-label="Close menu"
					onClick={close}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
						<path
							fill="currentColor"
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
						/>
					</svg>
				</button>

				<div className={styles.socialLinks}>
					{navigation.social.map((social) => (
						<a
							key={social.href}
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={social.label}
						>
							<svg viewBox="0 0 16 16" aria-hidden="true" width="28" height="28">
								<path fill="currentColor" d={social.icon} />
							</svg>
						</a>
					))}
				</div>

				<nav className={styles.nav}>
					{navigation.items.map((item) =>
						item.children ? (
							<div key={item.label} className={styles.accordion}>
								<button
									className={`${styles.accordionToggle} ${expandedSections.has(item.label) ? styles.accordionToggleOpen : ''}`}
									aria-expanded={expandedSections.has(item.label)}
									onClick={() => toggleAccordion(item.label)}
								>
									{item.label}
								</button>
								<div
									className={`${styles.accordionPanel} ${expandedSections.has(item.label) ? styles.accordionPanelOpen : ''}`}
								>
									{item.children.map((link) => (
										<a
											key={link.href}
											href={resolveHref(link.href)}
											{...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
										>
											{link.label}
										</a>
									))}
								</div>
							</div>
						) : (
							<a key={item.href} href={resolveHref(item.href)} className={styles.navLink}>
								{item.label}
							</a>
						)
					)}
				</nav>
			</div>
		</>
	);
}
