const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'ai_agent.db');
const DATA_DIR = path.dirname(DB_PATH);

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Open DB
const db = new sqlite3.Database(DB_PATH);

// Init tables
db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS conversations (
		id TEXT PRIMARY KEY,
		title TEXT,
		context TEXT,
		created_at TEXT,
		updated_at TEXT
	)`);

	db.run(`CREATE TABLE IF NOT EXISTS messages (
		id TEXT PRIMARY KEY,
		conversation_id TEXT,
		role TEXT,
		content TEXT,
		metadata TEXT,
		timestamp TEXT
	)`);
});

function run(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (err) {
			if (err) return reject(err);
			resolve(this);
		});
	});
}

function get(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) return reject(err);
			resolve(row);
		});
	});
}

function all(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) return reject(err);
			resolve(rows);
		});
	});
}

// Conversations
async function createConversation({ title = 'New Conversation', context = {}, createdAt = new Date().toISOString() }) {
	const id = uuidv4();
	await run(
		`INSERT INTO conversations (id, title, context, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
		[id, title, JSON.stringify(context), createdAt, createdAt]
	);
	return { id, title, context, createdAt, updatedAt: createdAt };
}

async function updateConversation(id, { title, context, metadata, updatedAt = new Date().toISOString() }) {
	const conversation = await getConversationOnly(id);
	if (!conversation) throw new Error('Conversation not found');

	await run(
		`UPDATE conversations SET title = COALESCE(?, title), context = COALESCE(?, context), updated_at = ? WHERE id = ?`,
		[
			title || null,
			context ? JSON.stringify(context) : null,
			updatedAt,
			id
		]
	);
	return getConversationById(id);
}

async function deleteConversation(id) {
	await run(`DELETE FROM messages WHERE conversation_id = ?`, [id]);
	await run(`DELETE FROM conversations WHERE id = ?`, [id]);
	return { success: true };
}

async function getAllConversations() {
	const rows = await all(`SELECT id, title, context, created_at as createdAt, updated_at as updatedAt FROM conversations ORDER BY updated_at DESC`);
	return rows.map(r => ({ ...r, context: safeParse(r.context) }));
}

async function getConversationOnly(id) {
	const row = await get(`SELECT id, title, context, created_at as createdAt, updated_at as updatedAt FROM conversations WHERE id = ?`, [id]);
	if (!row) return null;
	return { ...row, context: safeParse(row.context) };
}

async function getConversationById(id) {
	const convo = await getConversationOnly(id);
	if (!convo) return null;
	const messages = await getConversationMessages(id, 1000, 0);
	return { ...convo, messages };
}

async function getConversationMessages(conversationId, limit = 50, offset = 0) {
	const rows = await all(
		`SELECT id, conversation_id as conversationId, role, content, metadata, timestamp
		 FROM messages
		 WHERE conversation_id = ?
		 ORDER BY timestamp ASC
		 LIMIT ? OFFSET ?`,
		[conversationId, limit, offset]
	);
	return rows.map(r => ({ ...r, metadata: safeParse(r.metadata) }));
}

async function getConversationHistory(conversationId, limit = 10) {
	const rows = await all(
		`SELECT role, content
		 FROM messages
		 WHERE conversation_id = ?
		 ORDER BY timestamp DESC
		 LIMIT ?`,
		[conversationId, limit]
	);
	return rows.reverse();
}

// Messages
async function saveMessage({ role, content, conversationId, metadata = {}, timestamp = new Date().toISOString() }) {
	let cid = conversationId;
	if (!cid || cid === 'new') {
		const created = await createConversation({ title: 'New Conversation' });
		cid = created.id;
	}
	const id = uuidv4();
	await run(
		`INSERT INTO messages (id, conversation_id, role, content, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
		[id, cid, role, content, JSON.stringify(metadata), timestamp]
	);
	return { id, conversationId: cid, role, content, metadata, timestamp };
}

// Search/Stats/Export
async function searchMessages({ query = '', conversationId = null, role = null, limit = 20 }) {
	let where = [];
	let params = [];
	if (query) {
		where.push('(content LIKE ?)');
		params.push(`%${query}%`);
	}
	if (conversationId) {
		where.push('conversation_id = ?');
		params.push(conversationId);
	}
	if (role) {
		where.push('role = ?');
		params.push(role);
	}
	const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
	const rows = await all(
		`SELECT id, conversation_id as conversationId, role, content, metadata, timestamp
		 FROM messages
		 ${whereSql}
		 ORDER BY timestamp DESC
		 LIMIT ?`,
		[...params, limit]
	);
	return rows.map(r => ({ ...r, metadata: safeParse(r.metadata) }));
}

async function getStats() {
	const convoCount = await get(`SELECT COUNT(*) as count FROM conversations`);
	const msgCount = await get(`SELECT COUNT(*) as count FROM messages`);
	return {
		conversations: convoCount.count || 0,
		messages: msgCount.count || 0
	};
}

async function exportConversation(conversationId, format = 'json') {
	const convo = await getConversationById(conversationId);
	if (!convo) throw new Error('Conversation not found');
	if (format === 'json') {
		return convo;
	}
	throw new Error('Unsupported export format');
}

// Helpers
function safeParse(s) {
	try { return s ? JSON.parse(s) : {}; } catch { return {}; }
}

module.exports = {
	createConversation,
	updateConversation,
	deleteConversation,
	getAllConversations,
	getConversationById,
	getConversationMessages,
	getConversationHistory,
	saveMessage,
	searchMessages,
	getStats,
	exportConversation
};