document.addEventListener('DOMContentLoaded', function() {
    const species1Select = document.getElementById('species1');
    const species2Select = document.getElementById('species2');
    const resultsDiv = document.getElementById('results');
    let data = {}; // Define data at a higher scope to be accessible throughout

    // Fetch the animal data from the JSON file
    fetch('animals.json')
        .then(response => response.json())
        .then(json => {
            data = json; // Store the fetched data in the 'data' variable
            populateDropdown(species1Select, data);
            populateDropdown(species2Select, data, true);
        })
        .catch(error => {
            console.error('Failed to load data:', error);
            resultsDiv.innerHTML = '<p>Error loading data. Please check the console for more details.</p>';
        });

    // Form submission handler
    document.getElementById('compatibilityForm').onsubmit = function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        const species1 = species1Select.value;
        const species2 = species2Select.value;
        displayCompatibility(data, species1, species2, resultsDiv);
    };
});

// Function to populate dropdowns
function populateDropdown(dropdown, data, includeEmpty = false) {
    if (includeEmpty) {
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'None';
        defaultOption.value = '';
        dropdown.appendChild(defaultOption);
    }
    for (const animal in data) {
        const option = document.createElement('option');
        option.textContent = animal;
        option.value = animal;
        dropdown.appendChild(option);
    }
}

// Function to display compatibility results
function displayCompatibility(data, species1, species2, resultsDiv) {
    let html = '';
    if (species1 && species2 && species1 === species2) {
        // If the same species is selected, give em heck
        html = `<p>Looks like ${species1} really likes its own company! Try selecting different animals for a real compatibility check.</p>`;
    } else if (species2) {
        if (data[species1] && data[species1].compatibility && data[species1].compatibility[species2] !== undefined) {
            const compatibility = data[species1].compatibility[species2];
            const description = getDetailedCompatibilityDescription(species1, species2, compatibility);
            html = `<p><span class="compatibility-${compatibility}">${description}</span></p>`;
        } else {
            html = `<p>Compatibility data not available for ${species1} and ${species2}.</p>`;
        }
    } else {
        if (data[species1] && data[species1].compatibility) {
            const compatibilityLevels = {};
            Object.keys(data[species1].compatibility).forEach(animal => {
                const level = data[species1].compatibility[animal];
                if (!compatibilityLevels[level]) {
                    compatibilityLevels[level] = [];
                }
                compatibilityLevels[level].push(animal);
            });

            html += `<p>Compatibility for ${species1} with others:</p>`;
            Object.keys(compatibilityLevels).sort((a, b) => b - a).forEach(level => {
                let animals = compatibilityLevels[level].join(', ');
                html += `<p><span class="compatibility-${level}">${getCompatibilityDescription(level)}:</span> ${animals}</p>`;
            });
        } else {
            html = `<p>No compatibility data available for ${species1}.</p>`;
        }
    }
    resultsDiv.innerHTML = html;
}

// Function to convert compatibility numbers to descriptive text
function getCompatibilityDescription(level) {
    const descriptions = {
        "4": "Best compatibility—provides the interspecies enrichment bonus",
        "3": "Very compatible—matching origin and habitat requirements",
        "2": "Semi-compatible—slightly different terrain/plant preferences",
        "1": "Incompatible animals—peaceful but have conflicting habitat requirements",
        "0": "Hostile animals—will fight or intimidate"
    };
    return descriptions[level] || "Unknown compatibility"; // Default text if level is undefined
}

function getDetailedCompatibilityDescription(species1, species2, level) {
    const descriptions = {
        "4": `${species1} and ${species2} are fully compatible and receive an interspecies enrichment bonus.`,
        "3": `${species1} and ${species2} are a great match, they have the same origin and habitat requirements but do not receive an interspecies enrichment bonus.`,
        "2": `${species1} and ${species2} are somewhat compatible, they can live together well but have slightly different terrain or plant preferences.`,
        "1": `${species1} and ${species2} are incompatible. They are peaceful but have very different habitat requirements. They will suffer welfare issues.`,
        "0": `${species1} and ${species2} are incompatible and very hostile. Fighting and intimidation will occur.`
    };
    return descriptions[level] || "Compatibility information is unavailable."; // Default text if level is undefined
}

// Helper function to get numeric level from description for sorting
function getDescriptionLevel(description) {
    const levelMap = {
        "Best compatibility—provides the interspecies enrichment bonus": 4,
        "Very compatible—matching origin and habitat requirements": 3,
        "Semi-compatible—slightly different terrain/plant preferences": 2,
        "Incompatible animals—peaceful but have conflicting habitat requirements": 1,
        "Hostile animals—will fight or intimidate": 0
    };
    return levelMap[description] || -1; // Return -1 for unknown descriptions
}