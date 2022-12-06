import { showDialog } from './show-actor.js';

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

Hooks.on('getActorSheetHeaderButtons', (config, buttons) => {
	if (game.user.isGM) {
		buttons.unshift({
			label: 'Show Players',
			class: 'share-actor',
			icon: 'fas fa-eye',
			onclick: async (event, test) => {
				event.preventDefault();
				//await this.submit();
				const id = /Actor-(.+)/.exec(event.target.parentElement.parentElement.id)?.[1];
				const actor = game.actors.get(id);
				if (actor) return showDialog(actor);
			},
		});
	}
});
