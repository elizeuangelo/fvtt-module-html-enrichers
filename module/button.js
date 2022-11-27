export function createLink(ids, name, type) {
	return `@${type}[${ids}]{${name}}`;
}

Hooks.on('getAmbientLightConfigHeaderButtons', (config, buttons) => {
	buttons.unshift({
		label: 'Link',
		class: 'journal-link',
		icon: 'fas fa-book-open',
		onclick: () => {
			const link = createLink(config.object.id, 'Ambient Light', 'Light');
			navigator.clipboard.writeText(link);
			ui.notifications.notify(`Journal link of Ambient Light ${config.object.id} copied to clipboard.`);
		},
	});
});
