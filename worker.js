function cors(response) {
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	response.headers.set("Access-Control-Allow-Headers", "Content-Type");
	return response;
}

function toJsonString(value) {
	try {
		return JSON.stringify(JSON.parse(value)); // if it's JSON, normalize it
	} catch {
		return JSON.stringify(value); // if it's plain text, store as JSON string
	}
}

function extractInput(input) {
	if (typeof input === "string") return input;
	if (input && typeof input.raw === "string") return input.raw;
	return "";
}

var worker_default = {
	async fetch(request, env2) {
		const url = new URL(request.url);
		const db = env2.DB;
		const method = request.method;
		const API = "https://judging-system.yeewengloke.workers.dev";

		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type"
		};

		if (method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
			status,
			headers: { ...corsHeaders, "Content-Type": "application/json" }
		});


		// --- QUESTIONS: CREATE OR UPDATE (MANUAL UPSERT) ---
		if (url.pathname === "/questions" && method === "POST") {
			try {
				const data = await request.json();
				const { code, difficulty, title, statement, testCases } = data;
				let { category } = data;
				if (!category) category = "secondary"; // Default

				// 1. Check if question exists
				const existing = await env2.DB.prepare("SELECT 1 FROM questions WHERE question_code = ?").bind(code).first();

				if (existing) {
					// UPDATE
					const updateQuery = `
            UPDATE questions SET
              difficulty = ?,
              question_title = ?,
              problem_statement = ?,
              category = ?,
              test_case_input_1 = ?, test_case_output_1 = ?,
              test_case_input_2 = ?, test_case_output_2 = ?,
              test_case_input_3 = ?, test_case_output_3 = ?,
              test_case_input_4 = ?, test_case_output_4 = ?,
              test_case_input_5 = ?, test_case_output_5 = ?,
              test_case_input_6 = ?, test_case_output_6 = ?,
              test_case_input_7 = ?, test_case_output_7 = ?,
              test_case_input_8 = ?, test_case_output_8 = ?,
              test_case_input_9 = ?, test_case_output_9 = ?,
              test_case_input_10 = ?, test_case_output_10 = ?
            WHERE question_code = ?
          `;

					const result = await env2.DB.prepare(updateQuery)
						.bind(
							difficulty, title, statement, category,
							toJsonString(testCases[0].input), toJsonString(testCases[0].output),
							toJsonString(testCases[1].input), toJsonString(testCases[1].output),
							toJsonString(testCases[2].input), toJsonString(testCases[2].output),
							toJsonString(testCases[3].input), toJsonString(testCases[3].output),
							toJsonString(testCases[4].input), toJsonString(testCases[4].output),
							toJsonString(testCases[5].input), toJsonString(testCases[5].output),
							toJsonString(testCases[6].input), toJsonString(testCases[6].output),
							toJsonString(testCases[7].input), toJsonString(testCases[7].output),
							toJsonString(testCases[8].input), toJsonString(testCases[8].output),
							toJsonString(testCases[9].input), toJsonString(testCases[9].output),
							code // WHERE clause
						)
						.run();

					return jsonResponse({ success: true, updated: true });

				} else {
					// INSERT
					const insertQuery = `
            INSERT INTO questions
            (
              question_code, difficulty, question_title, problem_statement, category,
              test_case_input_1,  test_case_output_1,
              test_case_input_2,  test_case_output_2,
              test_case_input_3,  test_case_output_3,
              test_case_input_4,  test_case_output_4,
              test_case_input_5,  test_case_output_5,
              test_case_input_6,  test_case_output_6,
              test_case_input_7,  test_case_output_7,
              test_case_input_8,  test_case_output_8,
              test_case_input_9,  test_case_output_9,
              test_case_input_10, test_case_output_10
            )
            VALUES (
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
          `;

					const result = await env2.DB.prepare(insertQuery)
						.bind(
							code, difficulty, title, statement, category,
							toJsonString(testCases[0].input), toJsonString(testCases[0].output),
							toJsonString(testCases[1].input), toJsonString(testCases[1].output),
							toJsonString(testCases[2].input), toJsonString(testCases[2].output),
							toJsonString(testCases[3].input), toJsonString(testCases[3].output),
							toJsonString(testCases[4].input), toJsonString(testCases[4].output),
							toJsonString(testCases[5].input), toJsonString(testCases[5].output),
							toJsonString(testCases[6].input), toJsonString(testCases[6].output),
							toJsonString(testCases[7].input), toJsonString(testCases[7].output),
							toJsonString(testCases[8].input), toJsonString(testCases[8].output),
							toJsonString(testCases[9].input), toJsonString(testCases[9].output)
						)
						.run();

					return jsonResponse({ success: true, id: result.lastRowId ?? null });
				}

			} catch (err) {
				// If "no such column: category", user needs to migrate.
				// We can fallback? No, let's return error so they know.
				return jsonResponse({ success: false, error: String(err) }, 500);
			}
		}


		// --- LOGIN ---
		if (url.pathname === "/login" && method === "POST") {
			try {
				const { username, password } = await request.json();

				// 1️⃣ Try to find a judge
				const judgeResult = await db.prepare(`
          SELECT username
          FROM users
          WHERE username = ? AND password = ?
        `).bind(username, password).first();

				if (judgeResult) {
					return cors(new Response(JSON.stringify({
						success: true,
						type: "judge",
						user: {
							username: judgeResult.username
						}
					}), { headers: { "Content-Type": "application/json" } }));
				}


				// 2️⃣ Try to find a student
				const studentResult = await db.prepare(`
          SELECT team_code, password, team_name
          FROM teams
          WHERE team_code = ? AND password = ?
        `).bind(username, password).first();

				if (studentResult) {
					return cors(new Response(JSON.stringify({
						success: true,
						type: "team",
						user: {
							team_id: studentResult.team_code,  // standardized field for frontend
							team_name: studentResult.team_name
						}
					}), { headers: { "Content-Type": "application/json" } }));
				}

				// 3️⃣ No match
				return cors(new Response(JSON.stringify({ success: false, message: "Invalid login credentials." }), {
					status: 401,
					headers: { "Content-Type": "application/json" }
				}));

			} catch (err) {
				return cors(new Response(JSON.stringify({ success: false, message: String(err) }), {
					status: 500,
					headers: { "Content-Type": "application/json" }
				}));
			}
		}

		if (url.pathname === "/criteria" && method === "GET") {
			const { results } = await db.prepare("SELECT * FROM criteria").all();
			return jsonResponse(results);
		}
		if (url.pathname === "/teams" && method === "GET") {
			const { results } = await db.prepare("SELECT * FROM teams").all();
			return jsonResponse(results);
		}
		if (url.pathname === "/judges" && method === "GET") {
			const { results } = await db.prepare("SELECT judge_id, judge_name FROM judges ORDER BY judge_name").all();
			return jsonResponse(results);
		}
		// POST /assigned-teams — assign teams to a judge (additive)
		if (url.pathname === "/assigned-teams" && method === "POST") {
			try {
				const { judge_id, team_codes } = await request.json();

				if (!judge_id || !Array.isArray(team_codes) || team_codes.length === 0) {
					return jsonResponse({ success: false, error: "judge_id and non-empty team_codes[] required" }, 400);
				}

				const stmts = team_codes.map(tc =>
					db.prepare(`
            INSERT INTO Assigned_Teams (team_code, judge_id)
            VALUES (?, ?)
            ON CONFLICT(team_code, judge_id) DO NOTHING
          `).bind(tc, judge_id)
				);

				await db.batch(stmts);

				return jsonResponse({ success: true, count: team_codes.length });
			} catch (e) {
				return jsonResponse({ success: false, error: String(e?.message || e) }, 500);
			}
		}

		if (url.pathname === "/assigned-teams" && method === "DELETE") {
			try {
				const { judge_id, team_codes } = await request.json();
				if (!judge_id || !Array.isArray(team_codes) || team_codes.length === 0) {
					return jsonResponse({ success: false, error: "judge_id and non-empty team_codes[] required" }, 400);
				}
				const qs = team_codes.map(() => "?").join(",");
				await db.prepare(`
      DELETE FROM Assigned_Teams
      WHERE judge_id = ?
        AND team_code IN (${qs})
    `).bind(judge_id, ...team_codes).run();
				return jsonResponse({ success: true, count: team_codes.length });
			} catch (e) {
				return jsonResponse({ success: false, error: String(e?.message || e) }, 500);
			}
		}
		if (url.pathname === `${API}/teams` && request.method === "GET") {
			try {
				const stmt = env2.DB.prepare(`SELECT * FROM teams`).all();
				const result = await stmt.all();
				return jsonResponse(result.results || result);
			} catch (e) {
				return jsonResponse({ error: e.message }, 500);
			}
		}
		if (url.pathname === "/assigned-teams" && method === "GET") {
			const judge_id = url.searchParams.get("judge_id");
			if (!judge_id) {
				return jsonResponse({ error: "judge_id is required" }, 400);
			}
			const { results } = await db.prepare(`
          SELECT t.team_code, t.team_name, t.category
          FROM teams t
          INNER JOIN Assigned_Teams a ON t.team_code = a.team_code
          WHERE a.judge_id = ?
        `).bind(judge_id).all();
			return jsonResponse(results);
		}

		if (url.pathname === '/students') {
			if (request.method === 'OPTIONS') {
				return new Response(null, { status: 204, headers: corsHeaders });
			}

			if (request.method === "POST") {
				try {
					const body = await request.json();
					let { student_code, student_name, category } = body || {};
					student_code = (student_code || "").trim().toUpperCase();
					student_name = (student_name || "").trim();
					category = (category || "").trim();

					if (!student_code || !student_name || !category) {
						return jsonResponse({ error: "student_code, student_name, and category are required." }, 400);
					}

					const stmt = env2.DB.prepare(`
                  INSERT INTO student_info (student_code, student_name, category)
                  VALUES (?, ?, ?)
              `).bind(student_code, student_name, category);

					const result = await stmt.run();

					return jsonResponse({ ok: true, id: result.lastRowId ?? null });

				} catch (e) {
					const msg = String(e?.message || e);
					const status = /UNIQUE constraint failed/i.test(msg) ? 409 : 500;
					return jsonResponse({ error: msg }, status);
				}
			}

			if (request.method === 'GET') {
				try {
					const { results } = await env2.DB.prepare('SELECT * FROM student_info ORDER BY created_at DESC').all();
					return jsonResponse(results);
				} catch (e) {
					return jsonResponse({ error: String(e?.message || e) }, 500);
				}
			}

			// Optional: respond to unsupported methods
			return jsonResponse({ error: "Method not allowed" }, 405);
		}


		if (url.pathname.startsWith("/teams/") && method === "PATCH") {
			const team_code = url.pathname.split("/")[2];
			const { award, grade } = await request.json();
			const fields = [];
			const values = [];
			if (award !== void 0) {
				fields.push("award = ?");
				values.push(award || null);
			}
			if (grade !== void 0) {
				fields.push("grade = ?");
				values.push(grade || null);
			}
			if (fields.length === 0) {
				return jsonResponse({ success: false, error: "No fields to update" }, 400);
			}
			values.push(team_code);
			const query = `UPDATE teams SET ${fields.join(", ")} WHERE team_code = ?`;
			await env2.DB.prepare(query).bind(...values).run();
			return jsonResponse({ success: true });
		}
		if (url.pathname === "/export" && method === "GET") {
			const { results } = await db.prepare(`
        SELECT 
          s.team_code,
          t.team_name,
          j.judge_name,
          AVG(s.score) AS avg_score,
          t.final_score
        FROM scores s
        LEFT JOIN teams t ON s.team_code = t.team_code
        LEFT JOIN judges j ON s.judge_id = j.judge_id
        GROUP BY s.team_code, s.judge_id
        ORDER BY s.team_code
      `).all();
			if (!results.length)
				return new Response("No data found.", {
					status: 404,
					headers: corsHeaders
				});
			let csv = "Team Code,Team Name,Judge Name,Average Score,Team Final Score\n";
			results.forEach((r) => {
				csv += `${r.team_code},"${r.team_name}","${r.judge_name}",${r.avg_score.toFixed(
					2
				)},${r.final_score?.toFixed(2) || 0}
`;
			});
			return new Response(csv, {
				headers: {
					"Content-Type": "text/csv",
					"Content-Disposition": 'attachment; filename="scores_export.csv"',
					...corsHeaders
				}
			});
		}
		if (url.pathname === "/teams" && request.method === "POST") {
			try {
				const body = await request.json();
				let { team_code, password, team_name, category, student_names } = body || {};
				team_code = (team_code || "").trim().toUpperCase();
				password = (password || "").trim();
				team_name = (team_name || "").trim();
				category = (category || "").trim();
				student_names = (student_names || "").trim();
				if (!team_code || !team_name || !category || !student_names) {
					return jsonResponse({ error: "team_code, team_name, category and student_names are required." }, 400);
				}
				const stmt = env2.DB.prepare(`
      INSERT INTO teams (team_code, password, team_name, category, student_names)
      VALUES (?, ?, ?, ?, ?)
    `).bind(team_code, password, team_name, category, student_names);
				const result = await stmt.run();
				return jsonResponse({ ok: true, id: result.lastRowId ?? null });
			} catch (e) {
				const msg = String(e?.message || e);
				const status = /UNIQUE constraint failed/i.test(msg) ? 409 : 500;
				return jsonResponse({ error: msg }, status);
			}
		}


		// PATCH /students/:code - Update student
		if (url.pathname.startsWith("/students") && method === "PATCH") {
			const student_code = url.pathname.split("/")[2];
			const updates = await request.json();

			const fields = Object.keys(updates).filter(k => ['student_name', 'category'].includes(k));
			if (fields.length === 0) {
				return jsonResponse({ error: "No valid fields to update" }, 400);
			}

			const sets = fields.map(f => `${f} = ?`).join(', ');
			const values = fields.map(f => updates[f]);

			try {
				await db.prepare(`UPDATE student_info SET ${sets} WHERE student_code = ?`)
					.bind(...values, student_code).run();

				return jsonResponse({ success: true });
			} catch (e) {
				return jsonResponse({ error: String(e?.message || e) }, 500);
			}
		}

		if (url.pathname === "/judges" && request.method === "GET") {
			try {
				const stmt = env2.DB.prepare(`
      SELECT
        judge_id,           -- TEXT/INT: your unique id (or code)
        judge_name,         -- TEXT
        category,           -- TEXT (if judges have a specific category)
        email,              -- TEXT (optional)
        phone,              -- TEXT (optional)
        assigned_count,     -- INT (optional: number of teams assigned)
        created_at          -- TEXT (optional)
      FROM judges
      ORDER BY judge_name ASC
    `);
				const result = await stmt.all();
				return jsonResponse(result.results || result);
			} catch (e) {
				return jsonResponse({ error: String(e?.message || e) }, 500);
			}
		}

		// --- REPLACED: POST /questions handle is at the top with UPSERT ---

		if (url.pathname === "/votes" && method === "POST") {
			try {
				const data = await request.json();
				const { student_id, votes } = data;

				if (!student_id || !votes || typeof votes !== "object") {
					return jsonResponse({ success: false, message: "student_id and votes object are required" }, 400);
				}

				// ✨ Use env2.DB instead of env.DB
				const stmts = Object.entries(votes).map(([category, voted_for]) =>
					env2.DB.prepare(`
            INSERT INTO votes (student_id, category, voted_for)
            VALUES (?, ?, ?)
          `).bind(student_id, category, voted_for)
				);

				await env2.DB.batch(stmts);

				return jsonResponse({ success: true, count: Object.keys(votes).length });

			} catch (err) {
				return jsonResponse({ success: false, message: String(err) }, 500);
			}
		}

		// START FIX: Add GET /votes endpoint
		if (url.pathname === "/votes" && method === "GET") {
			try {
				// Return all votes or aggregated - as requested by admin dashboard logic
				const { results } = await db.prepare("SELECT * FROM votes").all();
				return jsonResponse(results);
			} catch (err) {
				return jsonResponse({ success: false, error: String(err) }, 500);
			}
		}
		// END FIX

		if (url.pathname === "/questions" && method === "GET") {
			try {
				const result = await db.prepare(`SELECT * FROM questions`).all();

				return jsonResponse({ success: true, questions: result.results });

			} catch (err) {
				return jsonResponse({ success: false, error: String(err) }, 500);
			}
		}



		if (url.pathname === "/judges" && method === "POST") {
			try {
				const body = await request.json();
				let { judge_id, judge_name } = body || {};
				judge_id = (judge_id || "").trim().toUpperCase();
				judge_name = (judge_name || "").trim().toUpperCase();
				if (!judge_id || !judge_name) {
					return jsonResponse({ error: "judge_id and judge_name are required" }, 400);
				}
				const result = await db.prepare("INSERT INTO judges (judge_id, judge_name) VALUES (?, ?)").bind(judge_id, judge_name).run();
				return jsonResponse({ ok: true, last_row_id: result.meta?.last_row_id ?? null });
			} catch (e) {
				const msg = String(e?.message || e);
				const status = /UNIQUE constraint failed/i.test(msg) ? 409 : 500;
				return jsonResponse({ error: msg }, status);
			}
		}

		// Start session
		if (url.pathname === "/start-session" && method === "POST") {
			const { student_id } = await request.json();

			// Check if the session already exists
			const sessionRow = await env2.DB.prepare(`
        SELECT completed
        FROM student_sessions
        WHERE student_id = ?
      `).bind(student_id).first();

			if (sessionRow && sessionRow.completed === 1) {
				return jsonResponse({
					success: false,
					message: "Session already completed"
				}, 403);
			}

			// Get team category
			const teamRow = await env2.DB.prepare(`
				SELECT category FROM teams WHERE team_code = ?
			`).bind(student_id).first();

			// Session allowed
			return jsonResponse({
				success: true,
				category: teamRow ? teamRow.category : null
			});
		}

		if (url.pathname === "/end-session" && method === "POST") {
			const { student_id } = await request.json();

			await env2.DB.prepare(`
        INSERT INTO student_sessions (student_id, completed, completed_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(student_id) DO UPDATE SET
          completed = 1,
          completed_at = CURRENT_TIMESTAMP
      `).bind(student_id).run();

			return jsonResponse({ success: true });
		}

		if (url.pathname === '/tier1-results' && method === 'POST') {
			const { team_code, total_score, total_time, questions_attempted, detailed_results } = await request.json();
			await env2.DB.prepare(
				"INSERT INTO tier1_results (team_code, total_score, total_time, questions_attempted, detailed_results) VALUES (?, ?, ?, ?, ?)"
			).bind(team_code, total_score, total_time, questions_attempted, JSON.stringify(detailed_results)).run();
			return jsonResponse({ success: true });
		}

		// GET handler for /tier1-results - retrieves all saved coding results
		if (request.method === 'GET' && url.pathname === '/tier1-results') {
			try {
				const results = await env2.DB.prepare(
					'SELECT * FROM tier1_results ORDER BY created_at DESC'
				).all();

				return jsonResponse(results.results);
			} catch (error) {
				return jsonResponse({
					error: 'Failed to fetch results',
					message: error.message
				}, 500);
			}
		}

		if (url.pathname === "/scores" && method === "POST") {
			try {
				const { judge_id, team_code, scores } = await request.json();

				if (!judge_id || !team_code || !scores || typeof scores !== "object") {
					return jsonResponse({ success: false, error: "Invalid payload" }, 400);
				}

				const stmts = [];

				for (const [criteria_code, score] of Object.entries(scores)) {
					stmts.push(
						db.prepare(`
              INSERT INTO scores (judge_id, team_code, criteria_code, score)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(judge_id, team_code, criteria_code)
              DO UPDATE SET score = excluded.score
            `).bind(judge_id, team_code, criteria_code, score)
					);
				}

				await db.batch(stmts);

				return jsonResponse({ success: true, count: stmts.length });
			} catch (e) {
				console.error("SAVE SCORES ERROR:", e);
				return jsonResponse(
					{ success: false, error: e.message || String(e) },
					500
				);
			}
		}

		// GET /all-scores (For Admin aggregation)
		if (url.pathname === "/all-scores" && method === "GET") {
			try {
				const { results } = await db.prepare("SELECT * FROM scores").all();
				return jsonResponse(results);
			} catch (e) {
				return jsonResponse({ error: e.message }, 500);
			}
		}

		if (url.pathname === "/run" && method === "POST") {
			try {
				const input = await request.json();

				// ✅ FIX IS HERE
				const s = extractInput(input);

				// Find first non-whitespace character
				for (const ch of s) {
					if (!/\s/.test(ch)) {
						return jsonResponse({ output: ch });
					}
				}

				return jsonResponse({ output: "" });

			} catch (e) {
				return jsonResponse({ error: String(e.message || e) }, 500);
			}
		}


		return new Response("\u2705 Judging System API is running.", {
			headers: corsHeaders
		});
	}
};

export {
	worker_default as default
};
