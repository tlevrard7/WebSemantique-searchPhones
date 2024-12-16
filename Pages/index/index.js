$(document).ready(function() {
  var searchBar = document.getElementById("searchBar"); 
  var searchBtn = document.getElementById("searchBtn"); 

  searchBtn.addEventListener("click", search); 
  searchBar.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
          event.preventDefault(); // Cancel the default action, if needed
          searchBtn.click();
      }
  }); 

  if (searchBar.value.length) searchBtn.click();
});

// Comparaison

function addToCompare(predicate){

}

///Recherche-----------------------------------------------------

function search() {
  var searchBar = document.getElementById("searchBar"); 
  var searchTxt = searchBar.value;

  const query = `
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbp: <http://dbpedia.org/property/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?tel ?label ?thumbnail WHERE {
            {
                ?tel a dbo:Device; 
                    rdfs:label ?label;  
                    dbo:abstract ?abstract.
                
                FILTER (lang(?abstract) = "en").
                FILTER (lang(?label) = "en").
                
                FILTER (regex(?abstract, "smartphone", "i")).
                FILTER (regex(?label, ".*${searchTxt}.*", "i")).
                
                OPTIONAL { ?tel dbo:thumbnail ?thumbnail }
            }
            UNION
            {
                ?tel dbp:type dbr:Smartphone;
                    rdfs:label ?label;
                    dbo:abstract ?abstract.
                
                FILTER (lang(?abstract) = "en").
                FILTER (lang(?label) = "en").
                
                FILTER (regex(?label, ".*${searchTxt}.*", "i")).
                
                OPTIONAL { ?tel dbo:thumbnail ?thumbnail }
            }
        }
    `;


  const url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";

  $.ajax({
      url: url,
      method: "GET",
      dataType: "json",
  })
  .done(data => {
      const bindings = data.results.bindings;

      if (bindings.length) {
          $("ul#res").html(bindings.map(b => {
              const telUri = encodeURIComponent(b.tel.value.substring(b.tel.value.lastIndexOf("/") + 1));
              const label = b.label.value;
              const thumbnail = b.thumbnail ? b.thumbnail.value : ''; // Pas de placeholder si pas de thumbnail
              
              // Construire l'affichage avec ou sans thumbnail
              return `
                  <li>
                      <a href="../detail/Generique/detail.html?uri=${telUri}&label=${encodeURIComponent(label)}">
                          ${thumbnail ? `<img src="${thumbnail}" alt="${label}" style="max-width: 100px; max-height: 100px; margin-right: 10px; vertical-align: middle;"/>` : ''}
                          ${label}
                      </a>
                      <button id="phoneComapreBtn" onclick="addToCompare(${telUri})">+</button>
                  </li>
              `;
          }).join(''));
      } else {
          $("ul#res").html("<li>Aucun résultat trouvé</li>");
      }
  })
  .fail(error => {
      alert("La requête s'est terminée en échec. Infos : " + JSON.stringify(error));
  });
}