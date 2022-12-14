import { CustomEnricher } from '../customenricher.js';

const tileIcon = {
	normal: 'fa-star',
	broken: 'fa-star-half',
};

const mergedTiles = {
	get(id) {
		for (let scene of game.scenes.values()) {
			const tile = scene.tiles.get(id);
			if (tile) return tile;
		}
	},
};

Hooks.once('ready', () => {
	if (!game.modules.get('monks-active-tiles')) return;

	new CustomEnricher({
		name: 'tile',
		tooltip: 'Trigger Monk Active Tile',
		button: {
			hook: 'getActiveTileConfigHeaderButtons',
			btn: {
				label: 'Link',
				class: 'journal-link',
				icon: 'fas fa-book-open',
				onclick: (config, link) => {
					navigator.clipboard.writeText(link);
					ui.notifications.notify(`Journal link of Active Tile ${config.object.id} copied to clipboard.`);
				},
			},
		},
		collection: mergedTiles,
		linkicon: (tile) => {
			if (!tile) return tileIcon.broken;
			return tileIcon.normal;
		},
		onclick: async (tiles, el) => {
			for (const tile of tiles) tile.trigger?.({ method: 'manual' });
		},
	});
});
