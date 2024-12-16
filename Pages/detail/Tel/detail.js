// Fonction pour échapper les caractères spéciaux dans les chaînes SPARQL
function escapeSparqlChars(str) {
  return str.replace(/["'\\()]/g, '\\$&'); // Échappe les guillemets, barres obliques inverses et parenthèses
}

function getQueryByCategory(ressource, category) {
  ressource = "dbr:" + escapeSparqlChars(ressource)

  const prefixes = `
    PREFIX dbr: <http://dbpedia.org/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbp: <http://dbpedia.org/property/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    PREFIX dc: <http://purl.org/dc/terms/>
  `;

  const queries = {
    // -------------------- Informations Générales --------------------
    "Informations Générales": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?name; SEPARATOR=" | ") AS ?name)
        (GROUP_CONCAT(DISTINCT ?abstract; SEPARATOR=" | ") AS ?abstract)
        (GROUP_CONCAT(DISTINCT ?brand; SEPARATOR=" | ") AS ?brand)
        (GROUP_CONCAT(DISTINCT ?manufacturer; SEPARATOR=" | ") AS ?manufacturer)
      WHERE {
        OPTIONAL { ${ressource} foaf:name ?name. }
        OPTIONAL { ${ressource} dbo:abstract ?abstract. FILTER(LANG(?abstract) = "en") }
        OPTIONAL { ${ressource} dbp:brand ?brand. }
        OPTIONAL { ${ressource} dbp:manufacturer ?manufacturer. }
      }
    `,

    // -------------------- Caractéristiques Techniques --------------------
    "Système d'exploitation et SoC": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?os; SEPARATOR=" | ") AS ?os)
        (GROUP_CONCAT(DISTINCT ?soc; SEPARATOR=" | ") AS ?soc)
      WHERE {
        OPTIONAL { ${ressource} dbp:os ?os. }
        OPTIONAL { ${ressource} dbp:soc ?soc. }
      }
    `,

    "CPU et GPU": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?cpu; SEPARATOR=" | ") AS ?cpu)
        (GROUP_CONCAT(DISTINCT ?gpu; SEPARATOR=" | ") AS ?gpu)
      WHERE {
        OPTIONAL { ${ressource} dbp:cpu ?cpu. }
        OPTIONAL { ${ressource} dbp:gpu ?gpu. }
      }
    `,

    "Mémoire et Stockage": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?memory; SEPARATOR=" | ") AS ?memory)
        (GROUP_CONCAT(DISTINCT ?storage; SEPARATOR=" | ") AS ?storage)
      WHERE {
        OPTIONAL { ${ressource} dbp:memory ?memory. }
        OPTIONAL { ${ressource} dbp:storage ?storage. }
      }
    `,

    "Écran et Caméras": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?display; SEPARATOR=" | ") AS ?display)
        (GROUP_CONCAT(DISTINCT ?frontCamera; SEPARATOR=" | ") AS ?frontCamera)
        (GROUP_CONCAT(DISTINCT ?rearCamera; SEPARATOR=" | ") AS ?rearCamera)
      WHERE {
        OPTIONAL { ${ressource} dbp:display ?display. }
        OPTIONAL { ${ressource} dbp:frontCamera ?frontCamera. }
        OPTIONAL { ${ressource} dbp:rearCamera ?rearCamera. }
      }
    `,

    "Batterie et Chargement": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?battery; SEPARATOR=" | ") AS ?battery)
        (GROUP_CONCAT(DISTINCT ?charging; SEPARATOR=" | ") AS ?charging)
      WHERE {
        OPTIONAL { ${ressource} dbp:battery ?battery. }
        OPTIONAL { ${ressource} dbp:charging ?charging. }
      }
    `,

    "Connectivité et Réseaux": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?connectivity; SEPARATOR=" | ") AS ?connectivity)
        (GROUP_CONCAT(DISTINCT ?networks; SEPARATOR=" | ") AS ?networks)
      WHERE {
        OPTIONAL { ${ressource} dbp:connectivity ?connectivity. }
        OPTIONAL { ${ressource} dbp:networks ?networks. }
      }
    `,

    "Étanchéité": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?waterResist; SEPARATOR=" | ") AS ?waterResist)
      WHERE {
        OPTIONAL { ${ressource} dbp:waterResist ?waterResist. }
      }
    `,

    // -------------------- Informations Complémentaires --------------------
    "Informations Complémentaires": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?memoryCard; SEPARATOR=" | ") AS ?memoryCard)
        (GROUP_CONCAT(DISTINCT ?input; SEPARATOR=" | ") AS ?input)
        (GROUP_CONCAT(DISTINCT ?form; SEPARATOR=" | ") AS ?form)
        (GROUP_CONCAT(DISTINCT ?colors; SEPARATOR=" | ") AS ?colors)
        (GROUP_CONCAT(DISTINCT ?weight; SEPARATOR=" | ") AS ?weight)
      WHERE {
        OPTIONAL { ${ressource} dbp:memoryCard ?memoryCard. }
        OPTIONAL { ${ressource} dbp:input ?input. }
        OPTIONAL { ${ressource} dbp:form ?form. }
        OPTIONAL { ${ressource} dbp:colors ?colors. }
        OPTIONAL { ${ressource} dbo:weight ?weight. }
      }
    `,

    // -------------------- Historique et Relations --------------------
    "Historique et Relations": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?released; SEPARATOR=" | ") AS ?released)
        (GROUP_CONCAT(DISTINCT ?available; SEPARATOR=" | ") AS ?available)
        (GROUP_CONCAT(DISTINCT ?predecessor; SEPARATOR=" | ") AS ?predecessor)
        (GROUP_CONCAT(DISTINCT ?successor; SEPARATOR=" | ") AS ?successor)
      WHERE {
        OPTIONAL { ${ressource} dbp:released ?released. }
        OPTIONAL { ${ressource} dbp:available ?available. }
        OPTIONAL { ${ressource} dbp:predecessor ?predecessor. }
        OPTIONAL { ${ressource} dbp:successor ?successor. }
      }
    `
  };
  return prefixes + queries[category];
}

function fetchDetailsByCategory(ressource, category) {
  const query = getQueryByCategory(ressource, category);
  const url = "https://dbpedia.org/sparql?query=" + encodeURIComponent(query) + "&format=json";

  $.ajax({
    url: url,
    method: "GET",
    dataType: "json",
  })
    .done((data) => {
      
      const results = data.results.bindings;
      displayCategoryResults(category, results);
    })
    .fail((error) => {
      console.error(`Erreur pour la catégorie ${category} :`, error);
      
    });
    
}

function displayCategoryResults(category, results) {
  // Liste des sous-catégories des Caractéristiques Techniques
  const technicalSubCategories = [
    "Système d'exploitation et SoC",
    "CPU et GPU",
    "Mémoire et Stockage",
    "Écran et Caméras",
    "Batterie et Chargement",
    "Connectivité et Réseaux",
    "Étanchéité"
  ];

  // Liste des catégories principales
  const mainCategories = [
    "Informations Générales",
    "Caractéristiques Techniques",
    "Informations Complémentaires",
    "Historique et Relations"
  ];

  // Appliquer le style main-category pour les catégories principales
  if (mainCategories.includes(category)) {
    $('#content-tab-prop').append(`<tr><th colspan="2" class="main-category">${category}</th></tr>`);
  } 
  // Appliquer le style sub-category pour les sous-catégories techniques
  else if (technicalSubCategories.includes(category)) {
    $('#content-tab-prop').append(`<tr><th colspan="2" class="sub-category">${category}</th></tr>`);
  }

  // Afficher les résultats
  results.forEach(result => {
    for (const key in result) {
      let value = result[key].value || '';

      // Si la valeur est une URL d'image, afficher l'image
      if (['depiction', 'thumbnail', 'logo'].includes(key)) {
        let html = '';
        for (const src of value.split(' | ')) {
          html += `<img src="${src}" alt="${key}" style="max-width:200px; max-height:200px;" />`;
        }
        $('#content-tab-prop').append(`
          <tr>
            <td>${key}</td>
            <td>${html}</td>
          </tr>
        `);
      } else {
        const html = value.split(' | ').filter(i => i !== "").map(item => {
          // Pour les URLs dbpedia.org/resource, extraire uniquement le dernier segment
          if (item.startsWith('http://dbpedia.org/resource/')) {
            ressource = item.substring(item.lastIndexOf("/") + 1);
            return `<a href="../Generique/detail.html?uri=${ressource}&label=${ressource}">${item.split('/').pop()}</a>`;
          }
          return item;
        }).join(', ');

        $('#content-tab-prop').append(`
          <tr>
            <td>${key}</td>
            <td>${html}</td>
          </tr>
        `);
      }
    }
  });
}

// Fonction pour vérifier si une URL est une image
function isImageUrl(url) {
  return url.match(/\.(jpeg|jpg|gif|png|svg|webp|bmp)$/i);
}

// Fonction pour récupérer l'image depuis Wikipedia
function fetchWikipediaImage(ressourceLabel) {
  const wikipediaApiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(ressourceLabel)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;

  $.ajax({
    url: wikipediaApiUrl,
    method: "GET",
    dataType: "json",
  })
    .done((data) => {
      const pages = data.query.pages;
      for (const pageId in pages) {
        if (pages[pageId].thumbnail) {
          const imageUrl = pages[pageId].thumbnail.source;
          displayWikipediaImage(imageUrl);
        }
      }
    })
    .fail((error) => {
      console.error("Erreur lors de la récupération de l'image Wikipédia :", error);
    });
}

function displayWikipediaImage(imageUrl) {
  $('#content-tab-prop').prepend(`
    <tr>
      <td colspan="2"><img src="${imageUrl}" alt="Image du téléphone" style="max-width:300px; max-height:300px; display:block; margin:auto;" /></td>
    </tr>
  `);
}

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  var ressource = urlParams.get("uri");
  var label = urlParams.get("label");

  $('#page-title').html(`${label}`);

  // Appel pour récupérer l'image depuis Wikipédia
  fetchWikipediaImage(label);
  
  // Fonction récursive pour garantir l'ordre d'affichage
  const categories = [
  "Informations Générales",
  "Caractéristiques Techniques",
  "Système d'exploitation et SoC",
  "CPU et GPU",
  "Mémoire et Stockage",
  "Écran et Caméras",
  "Batterie et Chargement",
  "Connectivité et Réseaux",
  "Étanchéité",
  "Informations Complémentaires",
  "Historique et Relations"
];

function fetchCategoriesSequentially(index) {
  if (index < categories.length) {
    if (categories[index] === "Caractéristiques Techniques") {
      // Afficher le titre principal "Caractéristiques Techniques"
      $('#content-tab-prop').append(`<tr><th colspan="2" class="main-category">Caractéristiques Techniques</th></tr>`);
      fetchCategoriesSequentially(index + 1); // Passer à la sous-catégorie suivante sans délai
    } else {
      fetchDetailsByCategory(ressource, categories[index]);
      setTimeout(() => fetchCategoriesSequentially(index + 1), 300); // Délai de 0.3 seconde pour éviter la saturation
    }
  }
}
  // Lancement de l'affichage des catégories séquentiellement
  fetchCategoriesSequentially(0);
});
