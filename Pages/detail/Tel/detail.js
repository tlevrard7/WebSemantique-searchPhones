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
    "IG": `
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
    "SOC": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?os; SEPARATOR=" | ") AS ?os)
        (GROUP_CONCAT(DISTINCT ?soc; SEPARATOR=" | ") AS ?soc)
      WHERE {
        OPTIONAL { ${ressource} dbp:os ?os. }
        OPTIONAL { ${ressource} dbp:soc ?soc. }
      }
    `,

    "CPU": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?cpu; SEPARATOR=" | ") AS ?cpu)
        (GROUP_CONCAT(DISTINCT ?gpu; SEPARATOR=" | ") AS ?gpu)
      WHERE {
        OPTIONAL { ${ressource} dbp:cpu ?cpu. }
        OPTIONAL { ${ressource} dbp:gpu ?gpu. }
      }
    `,

    "RAM": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?memory; SEPARATOR=" | ") AS ?memory)
        (GROUP_CONCAT(DISTINCT ?storage; SEPARATOR=" | ") AS ?storage)
      WHERE {
        OPTIONAL { ${ressource} dbp:memory ?memory. }
        OPTIONAL { ${ressource} dbp:storage ?storage. }
      }
    `,

    "DIS": `
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

    "BAT": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?battery; SEPARATOR=" | ") AS ?battery)
        (GROUP_CONCAT(DISTINCT ?charging; SEPARATOR=" | ") AS ?charging)
      WHERE {
        OPTIONAL { ${ressource} dbp:battery ?battery. }
        OPTIONAL { ${ressource} dbp:charging ?charging. }
      }
    `,

    "CON": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?connectivity; SEPARATOR=" | ") AS ?connectivity)
        (GROUP_CONCAT(DISTINCT ?networks; SEPARATOR=" | ") AS ?networks)
      WHERE {
        OPTIONAL { ${ressource} dbp:connectivity ?connectivity. }
        OPTIONAL { ${ressource} dbp:networks ?networks. }
      }
    `,

    "WET": `
      SELECT DISTINCT 
        (GROUP_CONCAT(DISTINCT ?waterResist; SEPARATOR=" | ") AS ?waterResist)
      WHERE {
        OPTIONAL { ${ressource} dbp:waterResist ?waterResist. }
      }
    `,

    // -------------------- Informations Complémentaires --------------------
    "IC": `
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
    "HIS": `
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

        document.getElementById(`content-sub-${category}`).insertAdjacentHTML("afterend", `
          <tr>
            <td class="styled-table-spec-name">${key}</td>
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
  $('#content').prepend(`
    <img src="${imageUrl}" alt="Image du téléphone" style="max-width:300px; max-height:300px; display:block; margin:auto;" />
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
    [
      "IG", "Informations Générales"
    ], [
      "CT", "Caractéristiques Techniques", [
        ["SOC", "Système d'exploitation et SoC"],
        ["CPU", "CPU et GPU"],
        ["RAM", "Mémoire et Stockage"],
        ["DIS", "Écran et Caméras"],
        ["BAT", "Batterie et Chargement"],
        ["CON", "Connectivité et Réseaux"],
        ["WET", "Étanchéité"],
      ]
    ], [
      "IC", "Informations Complémentaires"
    ], [
      "HIS", "Historique et Relations"
    ]
  ];


  for (const category of categories) {
    let mainId = `content-main-${category[0]}`
    let subTables = ""
    if (category.length === 3) {
      for (sub of category[2]) {
        subTables += `<tr id="content-sub-${sub[0]}"><th colspan="2" class="sub-category">${sub[1]}</th></tr>`
        fetchDetailsByCategory(ressource, sub[0]);
      }
    } else {
      subTables += `<tr id="content-sub-${category[0]}" style="display: none"><th colspan="2" class="sub-category">${category[1]}</th></tr>`
      fetchDetailsByCategory(ressource, category[0]);
    }
    $('#content').append(`
      <table class="styled-table">
        <thead>
          <tr><th colspan="2" class="main-category">${category[1]}</th></tr>
        </thead>
        <tbody id="${mainId}">
          ${subTables}
        </tbody>
      </table>
    `);
  }
});
