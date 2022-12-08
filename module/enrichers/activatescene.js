import { CustomEnricher } from '../customenricher.js';

const sceneIcon = {
	normal: 'fa-location-dot',
	broken: 'fa-location-dot-slash',
};

Hooks.once('ready', () => {
	new CustomEnricher({
		name: 'scene',
		action: 'Activate',
		tooltip: 'Activate Scene',
		contextmenu: {
			hook: 'getSceneDirectoryEntryContext',
			entry: {
				name: 'Copy Activate Scene Link',
				icon: `<i class="fa-regular ${sceneIcon.normal}"></i>`,
				callback: (li, link, id) => {
					navigator.clipboard.writeText(link);
					ui.notifications.notify(`Link to activate scene ${id} copied to clipboard.`);
				},
			},
		},
		collection: game.scenes,
		linkicon: (scene) => {
			if (!scene) return sceneIcon.broken;
			return sceneIcon.normal;
		},
		onclick: async (scenes) => {
			const scene = scenes?.[0];
			if (scene && game.user.isGM) scene.activate();
		},
	});
});
