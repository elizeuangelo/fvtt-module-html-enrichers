import { showDialog } from './show-actor.js';

Hooks.on('getActorSheetHeaderButtons', (config, buttons) => {
	if (game.user.isGM) {
		buttons.unshift({
			label: 'Show Players',
			class: 'share-actor',
			icon: 'fas fa-eye',
			onclick: async (event) => {
				event.preventDefault();
				//await this.submit();
				const match = /(Actor|Token)-(.+)/.exec(event.target.parentElement.parentElement.id);
				let actor;
				if (match[1] === 'Token') {
					const token = canvas.tokens.documentCollection.get(match[2]);
					actor = token.actor;
				} else actor = game.actors.get(match[2]);
				if (actor) return showDialog(actor);
			},
		});
	}
});
