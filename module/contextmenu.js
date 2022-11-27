import { sceneIcon } from './enricher.js';
import { createLink } from './button.js';

Hooks.on('getSceneDirectoryEntryContext', (html, entryOptions) => {
	entryOptions.push({
		name: 'Copy Activate Scene Link',
		icon: `<i class="fa-regular ${sceneIcon.normal}"></i>`,
		callback: (li) => {
			const scene = game.scenes.get(li[0].dataset.documentId);
			const link = createLink(scene.id, 'Scene', 'Activate');
			navigator.clipboard.writeText(link);
			ui.notifications.notify(`Link to activate scene ${scene.id} copied to clipboard.`);
		},
	});
});
