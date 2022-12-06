import { NAME } from './settings.js';

export async function showDialog(doc) {
	if (doc.documentName !== 'Actor') return;
	if (!doc.isOwner) return ui.notifications.error('JOURNAL.ShowBadPermissions', { localize: true });
	if (game.users.size < 2) return ui.notifications.warn('JOURNAL.ShowNoPlayers', { localize: true });

	const users = game.users.filter((u) => u.id !== game.userId);
	const ownership = Object.entries(CONST.DOCUMENT_OWNERSHIP_LEVELS);
	if (!doc.isEmbedded) ownership.shift();
	const levels = [
		{ level: CONST.DOCUMENT_META_OWNERSHIP_LEVELS.NOCHANGE, label: 'OWNERSHIP.NOCHANGE' },
		...ownership.map(([name, level]) => ({ level, label: `OWNERSHIP.${name}` })),
	];
	const isImage = doc instanceof JournalEntryPage && doc.type === 'image';
	const html = await renderTemplate('templates/journal/dialog-show.html', { users, levels, isImage });

	return Dialog.prompt({
		title: game.i18n.format('JOURNAL.ShowEntry', { name: doc.name }),
		label: game.i18n.localize('JOURNAL.ActionShow'),
		content: html,
		render: (html) => {
			const form = html.querySelector('form');
			form.elements.allPlayers.addEventListener('change', (event) => {
				const checked = event.currentTarget.checked;
				form.querySelectorAll('[name="players"]').forEach((i) => {
					i.checked = checked;
					i.disabled = checked;
				});
			});
		},
		callback: async (html) => {
			const form = html.querySelector('form');
			const fd = new FormDataExtended(form).object;
			const users = fd.allPlayers
				? game.users.filter((u) => !u.isSelf)
				: fd.players.reduce((arr, id) => {
						const u = game.users.get(id);
						if (u && !u.isSelf) arr.push(u);
						return arr;
				  }, []);
			if (!users.length) return;
			const userIds = users.map((u) => u.id);
			if (fd.ownership > -2) {
				const ownership = doc.ownership;
				if (fd.allPlayers) ownership.default = fd.ownership;
				for (const id of userIds) {
					if (fd.allPlayers) {
						if (id in ownership && ownership[id] <= fd.ownership) delete ownership[id];
						continue;
					}
					if (ownership[id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE) ownership[id] = fd.ownership;
					ownership[id] = Math.max(ownership[id] ?? -Infinity, fd.ownership);
				}
				await doc.update({ ownership }, { diff: false, recursive: false, noHook: true });
			}
			return show(doc, { force: true, users: userIds });
		},
		rejectClose: false,
		options: { jQuery: false },
	});
}

function show(doc, { force = false, users = [] } = {}) {
	if (doc.documentName !== 'Actor') return;
	if (!doc.isOwner) throw new Error(game.i18n.localize('JOURNAL.ShowBadPermissions'));
	const strings = Object.fromEntries(['all', 'authorized', 'selected'].map((k) => [k, game.i18n.localize(k)]));
	return new Promise((resolve) => {
		game.socket.emit(`module.${NAME}`, doc.uuid, { force, users }, () => {
			_showActor(doc.uuid, force);
			ui.notifications.info(
				game.i18n.format('JOURNAL.ActionShowSuccess', {
					title: doc.name,
					which: users.length ? strings.selected : force ? strings.all : strings.authorized,
				})
			);
			return resolve(doc);
		});
	});
}

async function _showActor(uuid, force = false) {
	let entry = await fromUuid(uuid);
	const options = { tempOwnership: force };
	if (entry.permission < CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED) entry.ownership[game.userId] = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
	if (!force && !entry.visible) return;

	// Show the sheet with the appropriate mode
	entry.sheet.render(true, options);
}

Hooks.once('ready', () => {
	game.socket.on(`module.${NAME}`, _showActor);
});
