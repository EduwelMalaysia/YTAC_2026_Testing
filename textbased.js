(function () {
    // Challenge data
    let challenges = [];
    const API = "https://judging-system.yeewengloke.workers.dev"; // your D1 API

    // Fetch challenges from D1 Database
    fetch(`${API}/questions`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.questions) {
                challenges = data.questions.map(q => mapDbToChallenge(q));
                verifySessionAndInit();
            } else {
                console.error('Failed to load questions from DB:', data.error);
            }
        })
        .catch(error => console.error('Error loading questions:', error));

    function mapDbToChallenge(q) {
        const defaultStarter = {
            "python": "import sys, math\n\n# Auto-generated code below aims at helping you parse\n# the standard input according to the problem statement.\ndata = input()\n\n# Write an answer using print as below\nprint(\"write your output here\")",
            "javascript": "/**\n * Auto-generated code below aims at helping you parse\n * the standard input according to the problem statement.\n **/\n\nconst fs = require('fs');\nconst data = fs.readFileSync(0, 'utf-8').trim();\n\n// Write an answer using console.log()\n// To debug: console.error('Debug messages...');\n\nconsole.log('write your output here');",
            "java": "import java.util.*;\nimport java.io.*;\nimport java.math.*;\n\n/**\n * Auto-generated code below aims at helping you parse\n * the standard input according to the problem statement.\n **/\nclass Main {\n\n    public static void main(String args[]) {\n        Scanner in = new Scanner(System.in);\n        if (in.hasNextLine()) {\n            String data = in.nextLine();\n        }\n\n        // Write an answer using System.out.println()\n        // To debug: System.err.println(\"Debug messages...\");\n\n        System.out.println(\"write your output here\");\n    }\n}",
            "c": "#include <stdlib.h>\n#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\n/**\n * Auto-generated code below aims at helping you parse\n * the standard input according to the problem statement.\n **/\n\nint main() {\n    char data[4096];\n    // Reading one line. Adjust if needed.\n    if (fgets(data, 4096, stdin) != NULL) {\n        // data contains the line\n    }\n\n    // Write an answer using printf()\n    // To debug: fprintf(stderr, \"Debug messages...\\n\");\n\n    printf(\"write your output here\\n\");\n\n    return 0;\n}",
            "cpp": "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\n/**\n * Auto-generated code below aims at helping you parse\n * the standard input according to the problem statement.\n **/\n\nint main() {\n    string data;\n    getline(cin, data);\n\n    // Write an answer using cout. DON'T FORGET THE \"<< endl\"\n    // To debug: cerr << \"Debug messages...\" << endl;\n\n    cout << \"write your output here\" << endl;\n}",
            "lua": "-- Auto-generated code below aims at helping you parse\n-- the standard input according to the problem statement.\n\nlocal data = io.read(\"*l\")\n\n-- Write an answer using print()\n-- To debug: io.stderr:write(\"Debug message\\n\")\n\nprint(\"write your output here\")",
            "r": "# Auto-generated code below aims at helping you parse\n# the standard input according to the problem statement.\n\ninput_data <- readLines(con = \"stdin\", n = 1)\n\n# Write an answer using cat() or print()\n# To debug: message(\"Debug message\")\n\ncat(\"write your output here\\n\")",
            "ruby": "# Auto-generated code below aims at helping you parse\n# the standard input according to the problem statement.\n\ndata = gets.chomp\n\n# Write an answer using puts\n# To debug: STDERR.puts \"Debug messages...\"\n\nputs \"write your output here\" ",
            "php": "<?php\n// Auto-generated code below aims at helping you parse\n// the standard input according to the problem statement.\n\n$data = stream_get_line(STDIN, 1024, \"\\n\");\n\n// Write an answer using echo\n// To debug: error_log('Debug messages...');\n\necho \"write your output here\\n\";\n?>",
            "csharp": "using System;\n\n/**\n * Auto-generated code below aims at helping you parse\n * the standard input according to the problem statement.\n **/\nclass Solution\n{\n    static void Main(string[] args)\n    {\n        string data = Console.ReadLine();\n\n        // Write an answer using Console.WriteLine()\n        // To debug: Console.Error.WriteLine(\"Debug messages...\");\n\n        Console.WriteLine(\"write your output here\");\n    }\n}",
            "nodejs": "/**\n * Auto-generated code below aims at helping you parse\n * the standard input according to the problem statement.\n **/\n\nconst fs = require('fs');\nconst data = fs.readFileSync(0, 'utf-8').trim();\n\n// Write an answer using console.log()\n// To debug: console.error('Debug messages...');\n\nconsole.log('write your output here');"
        };

        const diffMap = {
            "Easy": "super_easy",
            "Normal": "easy",
            "Hard": "normal",
            "Extreme": "hard"
        };

        const testCases = [];
        for (let i = 1; i <= 10; i++) {
            let inputRaw = q[`test_case_input_${i}`];
            let outputRaw = q[`test_case_output_${i}`];

            if (inputRaw != null && outputRaw != null) {
                try {
                    let cleanInput = inputRaw;
                    if (typeof inputRaw === 'string' && (inputRaw.startsWith('"') || inputRaw.startsWith('{'))) {
                        try { cleanInput = JSON.parse(inputRaw); } catch (e) { }
                    }

                    let cleanOutput = outputRaw;
                    if (typeof outputRaw === 'string' && (outputRaw.startsWith('"') || outputRaw.startsWith('{'))) {
                        try { cleanOutput = JSON.parse(outputRaw); } catch (e) { }
                    }

                    let finalStdin = "";
                    let testCaseDesc = `Test Case ${i}`;
                    if (typeof cleanInput === 'object' && cleanInput !== null) {
                        finalStdin = cleanInput.raw || JSON.stringify(cleanInput);
                        if (cleanInput.desc) testCaseDesc = cleanInput.desc;
                    } else {
                        finalStdin = String(cleanInput);
                    }

                    let finalStdout = "";
                    if (typeof cleanOutput === 'object' && cleanOutput !== null) {
                        finalStdout = cleanOutput.raw || JSON.stringify(cleanOutput);
                    } else {
                        finalStdout = String(cleanOutput);
                    }

                    testCases.push({
                        stdin: finalStdin,
                        stdout: finalStdout,
                        desc: testCaseDesc
                    });
                } catch (e) {
                    console.warn("Failed to parse test case", i, e);
                    testCases.push({
                        stdin: String(inputRaw),
                        stdout: String(outputRaw),
                        desc: `Test Case ${i}`
                    });
                }
            }
        }

        return {
            id: q.question_code,
            level: diffMap[q.difficulty] || "super_easy",
            title: q.question_title,
            description: q.problem_statement,
            category: q.category, // Pass category through
            starterCode: defaultStarter,
            testCases: testCases
        };
    }

    async function verifySessionAndInit() {
        const team_code = localStorage.getItem("team_code");
        if (!team_code) {
            window.location.href = "index.html";
            return;
        }

        try {
            const res = await fetch(`${API}/start-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_id: team_code })
            });
            const data = await res.json();
            if (!data.success) {
                alert("Session already completed. Redirecting...");
                window.location.href = "student_dashboard.html";
                return;
            }

            // Initialize questions with student category
            initQuestionList(data.category);

            // Hide Blockly for non-primary students
            const isPrimary = typeof data.category === 'string' && data.category.toLowerCase().includes('primary');
            const blocklyOption = languageSelect.querySelector('option[value="blockly"]');
            if (!isPrimary && blocklyOption) {
                blocklyOption.remove();
            }

        } catch (err) {
            console.error("Session verification failed", err);
            // Fallback to all or secondary if fail? Let's just init without filter (shows all) or empty
            initQuestionList(null);
        }
    }


    // State management
    let currentQuestion = 0;
    // ... (rest of state vars unchanged)
    let startTime = null;
    let timerInterval = null;
    let completedQuestions = new Set();
    let questionScores = {}; // Store scores for each question
    let currentOutput = "";
    let hasRunCode = false;
    let currentMatchPercentage = 0;
    let isCorrect = false;
    let currentCode = "";
    let currentTestCase = null;
    let passCount = 0;
    let currentLanguage = "python";
    let currentUser = "";
    const COMPETITION_DURATION = 2 * 60 * 60; // 2 hours in seconds

    const languageFiles = {
        "python": "main.py",
        "javascript": "index.js",
        "java": "Main.java",
        "c": "main.c",
        "cpp": "main.cpp",
        "csharp": "HelloWorld.cs",
        "nodejs": "index.js",
        "lua": "main.lua",
        "r": "main.r",
        "ruby": "main.rb",
        "php": "main.php"
    };

    // DOM Elements
    const startScreen = document.getElementById('startScreen');
    const languageSelect = document.getElementById('languageSelect');
    const usernameInput = document.getElementById('username');
    const challengeContent = document.getElementById('challengeContent');
    const completionScreen = document.getElementById('completionScreen');
    const questionList = document.getElementById('questionList');
    const questionContent = document.getElementById('questionContent');
    const timerDisplay = document.getElementById('timerDisplay');
    const outputArea = document.getElementById('outputArea');
    const matchPercentage = document.getElementById('matchPercentage');
    const btnStart = document.getElementById('btnStart');
    const btnRun = document.getElementById('btnRun');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnRestart = document.getElementById('btnRestart');
    const btnEnd = document.getElementById('btnEnd');
    const iframe = document.getElementById('oc-editor');
    const customModal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const btnModalCancel = document.getElementById('btnModalCancel');
    const btnModalConfirm = document.getElementById('btnModalConfirm');
    const fileUpload = document.getElementById('fileUpload');
    const finalSteps = document.getElementById('finalSteps');

    // Custom Modal Function
    function showModal(title, message, onConfirm, isConfirmation = true) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        if (isConfirmation) {
            btnModalCancel.style.display = 'inline-block';
            btnModalConfirm.textContent = 'Confirm';
        } else {
            btnModalCancel.style.display = 'none';
            btnModalConfirm.textContent = 'OK';
        }

        customModal.style.display = 'flex';

        // Use onclick to override previous event listeners
        btnModalConfirm.onclick = () => {
            customModal.style.display = 'none';
            if (onConfirm) onConfirm();
        };

        btnModalCancel.onclick = () => {
            customModal.style.display = 'none';
        };
    }

    // Initialize question list
    function initQuestionList(userCategory) {
        questionList.innerHTML = '';
        console.log("Initializing questions for category:", userCategory);

        const levels = ['super_easy', 'easy', 'normal', 'hard'];
        const levelTitles = {
            'super_easy': 'Super Easy',
            'easy': 'Easy',
            'normal': 'Normal',
            'hard': 'Hard'
        };

        // Group challenges by level
        const groupedChallenges = {
            'super_easy': [],
            'easy': [],
            'normal': [],
            'hard': []
        };

        const isPrimary = typeof userCategory === 'string' && userCategory.toLowerCase().includes('primary');

        challenges.forEach((challenge, index) => {
            // Filter logic
            if (isPrimary) {
                if (challenge.category !== 'primary') return;
            } else {
                // Secondary students see everything EXCEPT primary? 
                // Or explicitly 'secondary' and null.
                if (challenge.category === 'primary') return;
            }

            if (groupedChallenges[challenge.level]) {
                groupedChallenges[challenge.level].push({ ...challenge, originalIndex: index });
            }
        });

        levels.forEach(level => {
            if (groupedChallenges[level].length > 0) {
                // Create Header
                const header = document.createElement('h6');
                header.className = 'level-header';
                header.textContent = levelTitles[level];
                questionList.appendChild(header);

                // Create Grid Container
                const grid = document.createElement('div');
                grid.className = 'question-grid';

                groupedChallenges[level].forEach(item => {
                    const btn = document.createElement('div');
                    btn.className = `question-btn btn-${level}`;
                    btn.textContent = item.id;
                    btn.dataset.index = item.originalIndex;

                    btn.addEventListener('click', () => {
                        // Prevent clicking if question is completed (locked)
                        if (completedQuestions.has(item.originalIndex)) {
                            return;
                        }
                        showQuestion(item.originalIndex);
                    });

                    grid.appendChild(btn);
                });

                questionList.appendChild(grid);
            }
        });

        updateQuestionList();
    }

    // Update question list styling
    function updateQuestionList() {
        const items = document.querySelectorAll('.question-btn');
        items.forEach(item => {
            const index = parseInt(item.dataset.index);
            item.classList.remove('active', 'completed', 'locked');

            if (completedQuestions.has(index)) {
                item.classList.add('completed', 'locked');
            } else if (index === currentQuestion) {
                item.classList.add('active');
            }
        });
    }

    // Show question
    function showQuestion(index) {
        // If question is completed, do not allow showing (redundant check but safe)
        if (completedQuestions.has(index)) return;

        currentQuestion = index;
        const challenge = challenges[index];

        questionContent.innerHTML = `
        <h4>Question ${challenge.id}: ${challenge.title}</h4>
        <p>${challenge.description}</p>
    `;

        // Get starter code for current language
        // Fallback to python or empty string if not found
        if (typeof challenge.starterCode === 'object') {
            currentCode = challenge.starterCode[currentLanguage] || "";
        } else {
            currentCode = challenge.starterCode; // Legacy support or default
        }

        const fileName = languageFiles[currentLanguage] || "main.py";

        // Load starter code into iframe
        // INCREASED TIMEOUT to ensure iframe is ready on production logic
        setTimeout(() => {
            // console.log("Sending starter code to OneCompiler...");
            iframe.contentWindow.postMessage({
                eventType: 'populateCode',
                language: currentLanguage,
                files: [
                    {
                        name: fileName,
                        content: currentCode
                    }
                ],
                stdin: challenge.testCases[0].stdin
            }, '*');
        }, 1000); // Increased from 500ms

        // Populate test case table
        const tableBody = document.getElementById('testCaseTableBody');
        tableBody.innerHTML = '';
        challenge.testCases.forEach((testCase, i) => {
            const row = document.createElement('tr');
            row.id = `test-case-row-${i}`;
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${testCase.desc || `Test Case ${i + 1}`}</td>
            <td class="status-pending">Pending</td>
        `;
            tableBody.appendChild(row);
        });

        outputArea.value = ' ';
        matchPercentage.textContent = 'Match: 0%';
        matchPercentage.className = 'match-percentage match-none';
        matchPercentage.className = 'match-percentage match-none';
        hasRunCode = false;
        btnSubmit.disabled = false;
        btnRun.disabled = false;
        currentMatchPercentage = 0;
        isCorrect = false;
        currentTestCase = null;
        updateQuestionList();
    }

    // Start timer
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = COMPETITION_DURATION - elapsed;

            if (remaining <= 0) {
                endCompetition();
                return;
            }

            const hours = Math.floor(remaining / 3600);
            const minutes = Math.floor((remaining % 3600) / 60);
            const seconds = remaining % 60;
            timerDisplay.textContent = `Time Remaining: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} `;
        }, 1000);
    }

    // Stop timer
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Format final time
    function getFinalTime() {
        if (!startTime) return "--";
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} `;
    }

    // Download code file
    function downloadCodeFile(questionId, code, language) {
        const teamCode = localStorage.getItem("team_code") || "UNKNOWN";
        const extensions = {
            "python": "py", "javascript": "js", "java": "java", "c": "c", "cpp": "cpp",
            "csharp": "cs", "nodejs": "js", "lua": "lua", "r": "r", "ruby": "rb", "php": "php", "blockly": "xml"
        };
        const ext = extensions[language] || "txt";
        const filename = `${questionId}_${teamCode}.${ext}`;
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Read file as Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // End Competition
    async function endCompetition() {
        // 1️⃣ End session in backend
        const student_id = localStorage.getItem("team_code");
        if (student_id) {
            try {
                const res = await fetch(`${API}/end-session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ student_id })
                });
                const data = await res.json();
                if (!data.success) {
                    alert(data.message || "Failed to end session. Try again.");
                    return; // stop if session cannot be recorded
                }
                localStorage.setItem("sessionEnded", "true");
            } catch (err) {
                console.error(err);
                alert("Failed to end session. Try again.");
                return;
            }
        }

        // 2️⃣ Show completion screen
        stopTimer();
        completionScreen.style.display = 'flex';
        if (finalSteps) finalSteps.style.display = 'block';
        document.getElementById('finalTime').textContent = `Final Time: ${getFinalTime()} `;

        // 3️⃣ Calculate total score
        const totalScore = Object.values(questionScores).reduce((sum, score) => sum + score, 0);
        const averageScore = completedQuestions.size > 0 ? Math.floor(totalScore / completedQuestions.size) : 0;

        // 4️⃣ Update completion message
        document.getElementById('completionMessage').textContent = `You've completed ${completedQuestions.size} challenges!`;

        // 5️⃣ Export & Save results
        const results = {
            team_code: localStorage.getItem("team_code"),
            username: currentUser,
            totalTime: getFinalTime(),
            questionsAttempted: completedQuestions.size,
            totalScore: totalScore,
            detailedScores: questionScores,
            solvedQuestions: Array.from(completedQuestions).map(idx => ({
                id: challenges[idx].id,
                title: challenges[idx].title,
                score: questionScores[idx] || 0
            }))
        };

        // Save to backend
        try {
            await fetch(`${API}/tier1-results`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    team_code: results.team_code,
                    total_score: results.totalScore,
                    total_time: results.totalTime,
                    questions_attempted: results.questionsAttempted,
                    detailed_results: results
                })
            });
        } catch (err) {
            console.error("Failed to save results to backend:", err);
        }
    }

    btnEnd.addEventListener('click', () => {
        showModal("End Competition", "Are you sure you want to end the competition?", async () => {
            // Wait for the session to end and results to export
            await endCompetition();

            // After competition ends, redirect
            window.location.href = "student_dashboard.html";
        });
    });

    // Calculate match percentage using Levenshtein distance or simple char matching
    function calculateMatchPercentage(output, expected) {
        if (!output || !expected) return 0;

        const outputStr = output.trim();
        const expectedStr = expected.trim();

        if (outputStr === expectedStr) return 100;

        let matches = 0;
        const len = Math.max(outputStr.length, expectedStr.length);

        for (let i = 0; i < Math.min(outputStr.length, expectedStr.length); i++) {
            if (outputStr[i] === expectedStr[i]) {
                matches++;
            }
        }

        return Math.floor((matches / len) * 100);
    }

    // Check if answer is correct using the 'result.output' from iframe
    function isAnswerCorrect(output, expectedOutput) {
        return output.trim() === expectedOutput.trim();
    }


    // Update match percentage display
    function updateMatchDisplay(percentage, isCorrect) {
        matchPercentage.textContent = `Match: ${percentage}%`;

        if (isCorrect) {
            matchPercentage.className = 'match-percentage match-100';
        } else if (percentage > 0) {
            matchPercentage.className = 'match-percentage match-partial';
        } else {
            matchPercentage.className = 'match-percentage match-none';
        }
    }

    // Event listeners
    btnStart.addEventListener('click', () => {

        const username = usernameInput.value.trim();
        if (!username) {
            showModal("Missing Name", "Please enter your name to start.", null, false);
            return;
        }
        currentUser = username;
        currentLanguage = languageSelect.value;
        // Update iframe src with selected language
        let newSrc = `https://onecompiler.com/embed/${currentLanguage}?listenToEvents=true&codeChangeEvent=true&hideResult=true&hideStdin=true&hideLanguageSelection=true&hideNew=true&hideRun=true&hideResult=true`;
        if (currentLanguage === 'blockly') {
            newSrc = `https://block-coding-onecompiler.pages.dev/?listenToEvents=true&codeChangeEvent=true&hideResult=true&hideStdin=true&hideLanguageSelection=true&hideNew=true&hideRun=true&hideResult=true`;
        }

        // Wait for iframe to load before starting
        iframe.onload = () => {
            showQuestion(0);
            iframe.onload = null;
        };
        iframe.src = newSrc;

        startScreen.style.display = 'none';
        challengeContent.style.display = 'flex';
        startTimer();
    });

    // Sidebar Toggle
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const sidebar = document.querySelector('.challenge-sidebar');

    if (btnToggleSidebar && sidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-hidden');
            if (sidebar.classList.contains('sidebar-hidden')) {
                btnToggleSidebar.textContent = '❯'; // Point right when hidden (to expand)
            } else {
                btnToggleSidebar.textContent = '❮'; // Point left when visible (to collapse)
            }
        });
    }

    // Run next test case
    function runNextTestCase(code) {
        if (currentTestIndex < testQueue.length) {
            currentTestCase = testQueue[currentTestIndex];

            // console.log(`Running test case ${currentTestIndex + 1}/${testQueue.length} with stdin:`, currentTestCase.stdin);

            // Update status to Running
            const row = document.getElementById(`test-case-row-${currentTestIndex}`);
            if (row) {
                const statusCell = row.cells[2];
                statusCell.textContent = 'Running...';
                statusCell.className = 'status-running';
            }

            const fileName = languageFiles[currentLanguage] || "main.py";

            // Update stdin and code using populateCode to ensure stdin is updated
            iframe.contentWindow.postMessage({
                eventType: 'populateCode',
                language: currentLanguage,
                files: [
                    {
                        name: fileName,
                        content: code
                    }
                ],
                stdin: currentTestCase.stdin
            }, '*');

            // Trigger run after a short delay
            // INCREASED due to production latency (50ms -> 500ms)
            setTimeout(() => {
                // console.log("Triggering run execution...");
                iframe.contentWindow.postMessage({
                    eventType: 'triggerRun'
                }, '*');
            }, 500);
        }
        else {
            // All test cases completed
            const percentage = Math.floor((passCount / testQueue.length) * 100);
            updateMatchDisplay(percentage, percentage === 100);

            // Enable submit button if code has been run (regardless of result)
            btnSubmit.disabled = false;
            btnRun.disabled = false;
        }
    }

    btnRun.addEventListener('click', () => {
        const currentChallenge = challenges[currentQuestion];
        testQueue = currentChallenge.testCases;
        currentTestIndex = 0;
        passCount = 0;

        // Reset display
        outputArea.value = 'Running tests...';
        matchPercentage.textContent = 'Running...';
        matchPercentage.className = 'match-percentage';
        btnSubmit.disabled = true;
        btnRun.disabled = true;

        runNextTestCase(currentCode);
    });

    btnSubmit.addEventListener('click', async () => {
        if (hasRunCode) {
            // Allow submission regardless of pass count
            showModal("Submit Answer", "Are you sure you want to submit? This will save your progress and download your code.", async () => {
                const currentChallenge = challenges[currentQuestion];

                // Calculate score for this question (percentage of passed test cases)
                const score = Math.floor((passCount / currentChallenge.testCases.length) * 100);

                // 1. Prepare submission data
                let fileData = null;
                let fileName = null;
                if (fileUpload && fileUpload.files.length > 0) {
                    const file = fileUpload.files[0];
                    fileName = file.name;
                    fileData = await readFileAsBase64(file);
                }

                const submission = {
                    team_code: localStorage.getItem("team_code"),
                    question_code: currentChallenge.id,
                    score: score,
                    code: currentCode,
                    language: currentLanguage,
                    attached_file_name: fileName,
                    attached_file_data: fileData, // Base64
                    pass_count: passCount,
                    total_test_cases: currentChallenge.testCases.length
                };

                // 2. Save to backend
                try {
                    const res = await fetch(`${API}/submit-answer`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(submission)
                    });
                    const data = await res.json();
                    if (!data.success) {
                        console.error("Submission failed:", data.error);
                    }
                } catch (err) {
                    console.error("Backend submission failed", err);
                }

                // 3. Trigger Download
                downloadCodeFile(currentChallenge.id, currentCode, currentLanguage);

                // 4. Update UI
                questionScores[currentQuestion] = score;
                completedQuestions.add(currentQuestion);
                updateQuestionList(); // This will lock it
                if (fileUpload) fileUpload.value = ""; // Clear file input

                // Move to next available question
                let nextQ = currentQuestion + 1;
                while (nextQ < challenges.length && completedQuestions.has(nextQ)) {
                    nextQ++;
                }

                if (nextQ < challenges.length) {
                    showQuestion(nextQ);
                } else {
                    showModal("Completed", "All questions completed!", null, false);
                }
            });
        } else {
            showModal("Run Code Required", "Please run your code at least once before submitting.", null, false);
        }
    });



    // Listen for messages from iframe
    window.addEventListener('message', function (e) {
        const data = e.data;
        // console.log(data)

        // Check if it's a code change event
        if (data.action === 'codeUpdate' && data.files && data.files.length > 0) {
            currentCode = data.files[0].content;

        }

        // Check if it's a run complete event from the iframe
        if (data.action === 'runComplete' && data.result && data.result.output !== undefined) {
            currentOutput = data.result.output.trim();
            outputArea.value = currentOutput;

            // Update code capture area - REMOVED
            // if (currentCode) {
            //     document.getElementById('parent-code-capture').value = currentCode;
            // }

            hasRunCode = true;

            // Check if answer is correct for current test case
            if (currentTestCase) {
                const expectedOutput = currentTestCase.stdout;
                const isCaseCorrect = isAnswerCorrect(currentOutput, expectedOutput);
                // console.log("Run Complete. Expected:", expectedOutput, "Got:", currentOutput);

                if (isCaseCorrect) {
                    passCount++;
                }

                // Update table status
                const row = document.getElementById(`test-case-row-${currentTestIndex}`);
                if (row) {
                    const statusCell = row.cells[2];
                    if (isCaseCorrect) {
                        statusCell.textContent = 'Success';
                        statusCell.className = 'status-success';
                    } else {
                        statusCell.textContent = 'Failed';
                        statusCell.className = 'status-failed';
                    }
                }

                // Move to next test case
                currentTestIndex++;
                setTimeout(() => {
                    runNextTestCase(currentCode);
                }, 100); // Increased slightly
            } else {
                // Fallback
                updateMatchDisplay(0, false);
            }
        }
    });
})();
