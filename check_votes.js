
async function checkVotes() {
	const teamCode = 'ITPS-001';
	const API = "https://judging-system.yeewengloke.workers.dev";
	try {
		const res = await fetch(`${API}/votes?student_id=${teamCode}`);
		const data = await res.json();
		console.log(`Votes for ${teamCode}:`, data);

		if (data.length > 0) {
			console.log("Data persists in DB.");
		} else {
			console.log(`No data for ${teamCode} found in DB.`);
		}
	} catch (e) {
		console.error("Fetch failed:", e);
	}
}

checkVotes();
