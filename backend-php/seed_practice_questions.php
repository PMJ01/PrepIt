<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

set_time_limit(300);
ini_set('memory_limit', '512M');

require_once 'db_connect.php';

// Truncate table before seeding
$conn->query("TRUNCATE TABLE practice_questions");

$stmt = $conn->prepare("INSERT INTO practice_questions (id, title, category, difficulty, acceptance, time_limit, tags, prompt, explanation, solving_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

// 1. Seed 3,100 DSA Questions
$dsaTopics = [
    "Arrays", "Strings", "Linked List", "Binary Search", "Trees", "Binary Search Tree",
    "Graphs", "Dynamic Programming", "Greedy Algorithms", "Backtracking", "Stack & Queue",
    "Trie", "Heaps / Priority Queue", "Bit Manipulation", "Sliding Window", "Two Pointers",
    "Segment Tree", "Disjoint Set Union (DSU)", "Math & Number Theory"
];
$difficulties = ["Easy", "Medium", "Hard"];

for ($i = 1; $i <= 3100; $i++) {
    $id = "dsa-db-" . $i;
    $topic = $dsaTopics[$i % count($dsaTopics)];
    $title = $topic . ": Problem Set #" . $i;
    $category = "DSA";
    $diff = $difficulties[$i % count($difficulties)];
    $acc = number_format(28 + (($i * 7) % 55), 1);
    $time = (10 + ($i % 35)) . " min";
    $tags = $topic . ", Interview Prep";
    $prompt = "Solve this core " . $topic . " challenge asked in product and service company recruitment rounds.";
    $exp = "Optimal solution requires maintaining invariants over " . $topic . " and avoiding redundant operations.";
    $notes = "Algorithm Pattern:\n1. Initialize required pointers/data structure.\n2. Iterate through input elements maintaining time/space limits.\n3. Verify edge cases (empty input, single element, negative boundaries).";

    $stmt->bind_param("ssssssssss", $id, $title, $category, $diff, $acc, $time, $tags, $prompt, $exp, $notes);
    $stmt->execute();
}

// 2. Comprehensive Aptitude Topic Knowledge Base Mapping
$aptitudeKnowledgeBase = [
    "Quantitative - Time & Work" => [
        "prompt" => "A can complete a job in 12 days and B in 18 days. Working together, how long will they take to complete the entire job?",
        "exp" => "Formula: Combined Time = (A * B) / (A + B). Shortcut: 1/Total = 1/A + 1/B.",
        "notes" => "=== FORMULA SHEET ===\n• Work Done = Rate × Time\n• Combined Rate = 1/A + 1/B\n• Days required together = (A × B) / (A + B)\n\n=== STEP-BY-STEP SOLUTION ===\n1. Calculate A's 1-day work rate = 1/12.\n2. Calculate B's 1-day work rate = 1/18.\n3. Combined 1-day work rate = (1/12) + (1/18) = (3 + 2)/36 = 5/36.\n4. Total time taken = 36/5 = 7.2 days."
    ],
    "Quantitative - Speed, Distance & Time" => [
        "prompt" => "A train 240m long running at 72 km/h crosses a platform in 25 seconds. Calculate the length of the platform.",
        "exp" => "Speed in m/s = Km/h × (5/18). Total Distance = Length of Train + Length of Platform.",
        "notes" => "=== FORMULA SHEET ===\n• Speed = Distance / Time\n• Conversion (Km/h to m/s) = Multiply by 5/18\n• Conversion (m/s to Km/h) = Multiply by 18/5\n\n=== STEP-BY-STEP SOLUTION ===\n1. Convert Speed: 72 × (5/18) = 20 m/s.\n2. Total Distance in 25 sec = 20 m/s × 25 s = 500 meters.\n3. Platform Length = Total Distance - Train Length = 500m - 240m = 260 meters."
    ],
    "Quantitative - Profit & Loss" => [
        "prompt" => "A shopkeeper sells an item at a 20% profit. If the cost price was ₹500, calculate the selling price and net margin.",
        "exp" => "Selling Price (SP) = Cost Price (CP) × (1 + Profit%/100).",
        "notes" => "=== FORMULA SHEET ===\n• Profit % = [(SP - CP) / CP] × 100\n• SP = CP × (100 + Profit%) / 100\n• CP = SP × 100 / (100 + Profit%)\n\n=== STEP-BY-STEP SOLUTION ===\n1. Given CP = ₹500, Profit% = 20%.\n2. SP = 500 × (100 + 20) / 100 = 500 × 1.20 = ₹600.\n3. Net Profit Margin = SP - CP = ₹600 - ₹500 = ₹100."
    ],
    "Quantitative - Simple & Compound Interest" => [
        "prompt" => "Determine the compound interest earned on ₹10,000 for 2 years at an annual interest rate of 10% compounded annually.",
        "exp" => "Compound Amount A = P(1 + R/100)^n. CI = A - P.",
        "notes" => "=== FORMULA SHEET ===\n• Simple Interest (SI) = (P × R × T) / 100\n• Compound Amount (A) = P × (1 + R/100)^T\n• CI = A - P\n• 2-Year CI/SI Difference Formula = P × (R/100)^2\n\n=== STEP-BY-STEP SOLUTION ===\n1. P = 10000, R = 10%, T = 2 years.\n2. Amount A = 10000 × (1 + 10/100)^2 = 10000 × (1.1)^2 = ₹12,100.\n3. CI = ₹12,100 - ₹10,000 = ₹2,100."
    ],
    "Quantitative - Permutations & Combinations" => [
        "prompt" => "In how many ways can 5 candidates be selected out of 8 applicants for an interview round?",
        "exp" => "Combination Formula: nCr = n! / (r! × (n - r)!). Order does not matter.",
        "notes" => "=== FORMULA SHEET ===\n• Permutation (Order matters): nPr = n! / (n - r)!\n• Combination (Selection only): nCr = n! / [r! × (n - r)!]\n\n=== STEP-BY-STEP SOLUTION ===\n1. Identify n = 8 total applicants, r = 5 to select.\n2. Apply Formula: 8C5 = 8C3 = (8 × 7 × 6) / (3 × 2 × 1).\n3. Result = 56 ways."
    ],
    "Quantitative - Probability" => [
        "prompt" => "What is the probability of obtaining a sum of 8 when two unbiased six-sided dice are rolled simultaneously?",
        "exp" => "P(Event) = Favorable Outcomes / Total Sample Space (36 for 2 dice).",
        "notes" => "=== FORMULA SHEET ===\n• Probability P(A) = Favorable Cases / Total Outcomes\n• Total outcomes for 2 dice = 6^2 = 36\n\n=== STEP-BY-STEP SOLUTION ===\n1. Sample space S = 36.\n2. Favorable pairs for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 cases.\n3. P(Sum = 8) = 5 / 36."
    ],
    "Logical Reasoning - Blood Relations" => [
        "prompt" => "Pointing to a photograph, Rahul said, 'She is the daughter of my grandfather's only son.' How is the person in the photograph related to Rahul?",
        "exp" => "Grandfather's only son = Rahul's Father. Daughter of Rahul's father = Rahul's Sister.",
        "notes" => "=== RELATIONAL MAP RULES ===\n• Grandfather's only son = Father\n• Father's daughter = Sister\n• Mother's brother = Maternal Uncle\n\n=== STEP-BY-STEP SOLUTION ===\n1. Break down: 'My grandfather's only son'.\n2. Grandfather's only son is Rahul's Father.\n3. 'She is the daughter of my father' -> Rahul's Sister.\n4. Relation: Sister."
    ],
    "Logical Reasoning - Syllogisms" => [
        "prompt" => "Statements: All cars are vehicles. Some vehicles are electric.\nConclusion I: Some cars are electric.\nConclusion II: Some vehicles are cars.",
        "exp" => "Use Venn Diagrams. Universal affirmative (All A are B) implies Particular (Some B are A).",
        "notes" => "=== DEDUCTION RULES ===\n• All A are B  => Some B are A (Valid conversion)\n• Some A are B => No direct relation between A and third sets unless explicitly bounded.\n\n=== STEP-BY-STEP SOLUTION ===\n1. Evaluate Conclusion I: No direct overlap guaranteed between cars and electric. (Invalid)\n2. Evaluate Conclusion II: 'All cars are vehicles' logically converts to 'Some vehicles are cars'. (Valid)\n3. Answer: Only Conclusion II follows."
    ],
    "Logical Reasoning - Coding & Decoding" => [
        "prompt" => "If 'SYSTEM' is coded as 'SYSMET' in a pattern cipher, how is 'FRACTION' coded under the same rules?",
        "exp" => "Word splitting pattern: Divide word into two halves and reverse the second half.",
        "notes" => "=== CIPHER PATTERN RULES ===\n• Position Shift: Check alphabet index differences (+1, -1, +2, -2).\n• Reversal: Check if whole word or substrings are reversed.\n\n=== STEP-BY-STEP SOLUTION ===\n1. Split 'FRACTION' into equal halves: 'FRAC' and 'TION'.\n2. Keep 1st half: 'FRAC'.\n3. Reverse 2nd half: 'NOIT'.\n4. Combine: 'FRACNOIT'."
    ]
];

$aptKeys = array_keys($aptitudeKnowledgeBase);

for ($i = 1; $i <= 3100; $i++) {
    $id = "apt-db-" . $i;
    $topic = $aptKeys[$i % count($aptKeys)];
    $kb = $aptitudeKnowledgeBase[$topic];

    $title = $topic . ": Practice Set #" . $i;
    $category = "General Aptitude";
    $diff = $difficulties[$i % 2];
    $acc = number_format(52 + (($i * 11) % 40), 1);
    $time = (4 + ($i % 11)) . " min";
    $tags = explode(" - ", $topic)[0] . ", Aptitude";
    
    $prompt = $kb["prompt"];
    $exp = $kb["exp"];
    $notes = $kb["notes"];

    $stmt->bind_param("ssssssssss", $id, $title, $category, $diff, $acc, $time, $tags, $prompt, $exp, $notes);
    $stmt->execute();
}

echo json_encode([
    "status" => "success", 
    "message" => "Database successfully populated with 6,200 questions including formulas, step-by-step solving guides, and notes!"
]);

$stmt->close();
$conn->close();
?>