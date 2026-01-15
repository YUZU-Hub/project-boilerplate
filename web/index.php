<?php
/**
 * Main entry point
 *
 * Configure your API URL in .env or directly below
 */

// Load environment (simple approach for shared hosting)
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            putenv(trim($line));
        }
    }
}

$apiUrl = getenv('API_URL') ?: 'http://localhost:8090';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Name</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        .status { padding: 1rem; border-radius: 4px; margin: 1rem 0; }
        .status.connected { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        #items { list-style: none; padding: 0; }
        #items li { padding: 0.5rem; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <h1>Project Name</h1>

    <div id="api-status" class="status">Checking API connection...</div>

    <h2>Example: Fetch Records</h2>
    <ul id="items"></ul>

    <!-- PocketBase JS SDK -->
    <script src="https://cdn.jsdelivr.net/npm/pocketbase@0.25.0/dist/pocketbase.umd.min.js"></script>
    <script>
        const API_URL = '<?= htmlspecialchars($apiUrl) ?>';
        const pb = new PocketBase(API_URL);

        // Check API health
        async function checkHealth() {
            const statusEl = document.getElementById('api-status');
            try {
                const response = await fetch(`${API_URL}/api/health`);
                if (response.ok) {
                    statusEl.textContent = `Connected to API at ${API_URL}`;
                    statusEl.className = 'status connected';
                } else {
                    throw new Error('API not healthy');
                }
            } catch (e) {
                statusEl.textContent = `Cannot connect to API at ${API_URL}`;
                statusEl.className = 'status error';
            }
        }

        // Example: Fetch records from a collection
        async function fetchItems() {
            const listEl = document.getElementById('items');
            try {
                // Replace 'your_collection' with your actual collection name
                // const records = await pb.collection('your_collection').getList(1, 10);
                // records.items.forEach(item => {
                //     const li = document.createElement('li');
                //     li.textContent = item.name || item.id;
                //     listEl.appendChild(li);
                // });

                listEl.innerHTML = '<li><em>Uncomment fetchItems() code and replace collection name</em></li>';
            } catch (e) {
                listEl.innerHTML = `<li>Error: ${e.message}</li>`;
            }
        }

        // Initialize
        checkHealth();
        fetchItems();
    </script>
</body>
</html>
