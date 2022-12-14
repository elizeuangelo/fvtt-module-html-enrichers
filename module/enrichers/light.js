import { CustomEnricher } from '../customenricher.js';

const lightIcon = {
	on: 'fa-lightbulb-on',
	off: 'fa-lightbulb',
	broken: 'fa-lightbulb-slash',
};

const mergedLights = {
	get(id) {
		for (let scene of game.scenes.values()) {
			const light = scene.lights.get(id);
			if (light) return light;
		}
	},
};

Hooks.once('ready', () => {
	new CustomEnricher({
		name: 'light',
		tooltip: 'Switch Light',
		defaultLinkName: 'Ambient Light',
		button: {
			hook: 'getAmbientLightConfigHeaderButtons',
			btn: {
				label: 'Link',
				class: 'journal-link',
				icon: 'fas fa-book-open',
				onclick: (config, link) => {
					navigator.clipboard.writeText(link);
					ui.notifications.notify(`Journal link of Ambient Light ${config.object.id} copied to clipboard.`);
				},
			},
		},
		collection: mergedLights,
		linkicon: (light) => {
			if (!light) return lightIcon.broken;
			if (light.hidden) return lightIcon.off;
			return lightIcon.on;
		},
		onclick: async (lights, el) => {
			const light = lights[0];
			const hidden = !light.hidden;

			for (const light of lights) {
				if (light) await light.update({ hidden });
			}

			//await canvas.lighting.documentCollection.documentClass.updateDocuments(changes);

			const remove = hidden ? lightIcon.on : lightIcon.off;
			const add = hidden ? lightIcon.off : lightIcon.on;

			document.querySelectorAll('a.light-link').forEach((a) => {
				if (a.dataset.ids !== el.dataset.ids) return;
				const i = a.firstChild;
				i.classList.remove(remove);
				i.classList.add(add);
			});
		},
	});
});
