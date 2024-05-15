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
    const highlightedAnimals = new Set([
        "African Wild Dog", "American Alligator", "Amur Leopard", "Arctic Fox", 
        "Arctic Wolf", "Asian Water Monitor", "Bengal Tiger", "Caracal", 
        "Cheetah", "Clouded Leopard", "Cougar", "Dhole", "Dingo", "Eurasian Lynx", 
        "Formosan Black Bear", "Fossa", "Grizzly Bear", "Himalayan Brown Bear", 
        "Jaguar", "Komodo Dragon", "Nile Monitor", "Polar Bear", "Red Fox", 
        "Saltwater Crocodile", "Sand Cat", "Siberian Tiger", "Snow Leopard", 
        "Spotted Hyena", "Striped Hyena", "Tasmanian Devil", "Timber Wolf", 
        "West African Lion", "Wolverine"
    ]);

    if (includeEmpty) {
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'None';
        defaultOption.value = '';
        dropdown.appendChild(defaultOption);
    }
    Object.keys(data).forEach(animal => {
        const option = document.createElement('option');
        option.textContent = animal;
        option.value = animal;
        if (highlightedAnimals.has(animal)) {
            option.classList.add('highlighted-animal');
        }
        dropdown.appendChild(option);
    });
}

// Function to display compatibility results
function displayCompatibility(data, species1, species2, resultsDiv) {
    let html = '';
    if (species1 && species2 && species1 === species2) {
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
                let animals = compatibilityLevels[level].map(animal => 
                    highlightedAnimals.has(animal) 
                    ? `<span class="highlighted-animal">${animal}</span>` 
                    : animal
                ).join(', ');
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
