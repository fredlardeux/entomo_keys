const fs = require("fs");

async function fetchGitHub(repo) {
    const url = `https://api.github.com/repos/${repo}/releases/latest`;

    const res = await fetch(url, {
        headers: {
            "Accept": "application/vnd.github+json"
        }
    });

    const data = await res.json();

    const version = data.tag_name;

    let downloads = 0;
    for (const asset of data.assets || []) {
        downloads += asset.download_count || 0;
    }

    return { version, downloads };
}

async function fetchZenodo(zenodoId) {
    const url = `https://zenodo.org/api/records/${zenodoId}`;
    const res = await fetch(url);
    const data = await res.json();

    return {
        doi: data.doi,
        downloads: data.stats?.downloads || 0
    };
}

async function main() {
    const tools = JSON.parse(fs.readFileSync("data/tools.json"));

    const stats = {};

    for (const t of tools) {
        const gh = await fetchGitHub(t.github_repo);
        const zn = await fetchZenodo(t.zenodo_id);

        stats[t.id] = {
            github_version: gh.version,
            github_downloads: gh.downloads,
            zenodo_downloads: zn.downloads,
            zenodo_doi: zn.doi
        };
    }

    fs.writeFileSync(
        "data/stats.json",
        JSON.stringify(stats, null, 2)
    );

    console.log("Stats updated");
}

main();