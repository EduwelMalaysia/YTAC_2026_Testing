

async function checkVotes() {
	try {
		const res = await fetch("https://judging-system.yeewengloke.workers.dev/votes");
		const data = await res.json();
		console.log("Total votes:", data.length);
		const target = data.filter(v => v.student_id === 'ITSH-009' || v.team_code === 'ITSH-009');
		console.log("Votes for ITSH-009:", target);

		if (target.length > 0) {
			console.log("Data persists in DB.");
		} else {
			console.log("No data for ITSH-009 found. Frontend issue?");
		}
	} catch (e) {
		console.error(e);
	}
}

checkVotes();
