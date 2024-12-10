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
    "Caractéristiques Techniques": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?os; SEPARATOR=" | ") AS ?os)
        (GROUP_CONCAT(DISTINCT ?soc; SEPARATOR=" | ") AS ?soc)
        (GROUP_CONCAT(DISTINCT ?cpu; SEPARATOR=" | ") AS ?cpu)
        (GROUP_CONCAT(DISTINCT ?gpu; SEPARATOR=" | ") AS ?gpu)
        (GROUP_CONCAT(DISTINCT ?memory; SEPARATOR=" | ") AS ?memory)
        (GROUP_CONCAT(DISTINCT ?storage; SEPARATOR=" | ") AS ?storage)
        (GROUP_CONCAT(DISTINCT ?display; SEPARATOR=" | ") AS ?display)
        (GROUP_CONCAT(DISTINCT ?frontCamera; SEPARATOR=" | ") AS ?frontCamera)
        (GROUP_CONCAT(DISTINCT ?rearCamera; SEPARATOR=" | ") AS ?rearCamera)
        (GROUP_CONCAT(DISTINCT ?battery; SEPARATOR=" | ") AS ?battery)
        (GROUP_CONCAT(DISTINCT ?charging; SEPARATOR=" | ") AS ?charging)
        (GROUP_CONCAT(DISTINCT ?connectivity; SEPARATOR=" | ") AS ?connectivity)
        (GROUP_CONCAT(DISTINCT ?networks; SEPARATOR=" | ") AS ?networks)
        (GROUP_CONCAT(DISTINCT ?waterResist; SEPARATOR=" | ") AS ?waterResist)
      WHERE {
        OPTIONAL { ${ressource} dbp:os ?os. }
        OPTIONAL { ${ressource} dbp:soc ?soc. }
        OPTIONAL { ${ressource} dbp:cpu ?cpu. }
        OPTIONAL { ${ressource} dbp:gpu ?gpu. }
        OPTIONAL { ${ressource} dbp:memory ?memory. }
        OPTIONAL { ${ressource} dbp:storage ?storage. }
        OPTIONAL { ${ressource} dbp:display ?display. }
        OPTIONAL { ${ressource} dbp:frontCamera ?frontCamera. }
        OPTIONAL { ${ressource} dbp:rearCamera ?rearCamera. }
        OPTIONAL { ${ressource} dbp:battery ?battery. }
        OPTIONAL { ${ressource} dbp:charging ?charging. }
        OPTIONAL { ${ressource} dbp:connectivity ?connectivity. }
        OPTIONAL { ${ressource} dbp:networks ?networks. }
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
  $('#content-tab-prop').append(`<tr><th colspan="2">${category}</th></tr>`);

  if (results.length === 0) {
    $('#content-tab-prop').append(`<tr><td colspan="2">Aucune information trouvée</td></tr>`);
    return;
  }

  results.forEach(result => {
    for (const key in result) {
      let value = result[key].value || '';

      // Si la valeur est une URL d'image, afficher l'image
      if (['depiction', 'thumbnail', 'logo'].includes(key)) {
        let html = ''
        for (const src of value.split(' | ')) html += `<img src="${src}" alt="${key}" style="max-width:200px; max-height:200px;" />`
        $('#content-tab-prop').append(`
          <tr>
          <td>${key}</td>
          <td>${html}</td>
          </tr>
          `);
      } else {
        const html = value.split(' | ').filter(i => i != "").map(item => {
          // Pour les URLs dbpedia.org/resource, extraire uniquement le dernier segment
          if (item.startsWith('http://dbpedia.org/resource/')) return `<a href="${item}">${item.split('/').pop()}</a>`
          return item;
        }).join(', ')

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

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  var ressource = urlParams.get("uri");
  var label = urlParams.get("label");

  $('#page-title').html(`Détails du ${label}`);

  const categories = [
    "Informations Générales",
    "Caractéristiques Techniques",
    "Informations Complémentaires",
    "Historique et Relations"
  ];

  // Fonction récursive pour garantir l'ordre d'affichage
  function fetchCategoriesSequentially(index) {
    if (index < categories.length) {
      fetchDetailsByCategory(ressource, categories[index]);
      setTimeout(() => fetchCategoriesSequentially(index + 1), 500); // Délai pour éviter les requêtes simultanées
    }
  }

  fetchCategoriesSequentially(0);
});
