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
function makeVisible(element){
    if (element.classList.contains("hidden")) {
        element.classList.replace("hidden", "visible"); // Replaces "red" with "blue"
    }
}

function makeInvisible(element){
    if (element.classList.contains("visible")) {
        element.classList.replace("visible", "hidden"); // Replaces "red" with "blue"
    }
}

function removeFromTable(event){
    const button = event.target;
    const cell = button.closest("th, td");
    const row = cell.parentElement;
    const cells = Array.from(row.children);
    const columnIndex = cells.indexOf(cell);
    
    const table = document.getElementById("compare");
  
    // Remove column from thead
    const theadRows = table.querySelectorAll("thead tr");
    theadRows.forEach(row => {
      const cells = row.children;
      if (cells[columnIndex]) {
        cells[columnIndex].remove();
      }
    });
  
    // Remove column from tbody
    const tbodyRows = table.querySelectorAll("tbody tr");
    tbodyRows.forEach(row => {
      const cells = row.children;
      if (cells[columnIndex]) {
        cells[columnIndex].remove();
      }
    });

    // Get the number of columns in the table
    const firstRow = table.querySelector("thead tr") || table.querySelector("tbody tr");
    const totalColumns = firstRow ? firstRow.children.length : 0;

    if(totalColumns == 1) makeInvisible(document.getElementById("compareBoard"));
}

function addToCompare(id){
    ressource = "<http://dbpedia.org/resource/" + id + ">";
    
    query = `
        SELECT DISTINCT 
            (GROUP_CONCAT(DISTINCT ?os; SEPARATOR=", ") AS ?os),
            ?name, 
            ?thumbnail,
            (GROUP_CONCAT(DISTINCT ?cpu; SEPARATOR=", ") AS ?cpu),
            (GROUP_CONCAT(DISTINCT ?gpu; SEPARATOR=", ") AS ?gpu),
            (GROUP_CONCAT(DISTINCT ?memory; SEPARATOR=", ") AS ?memory),
            (GROUP_CONCAT(DISTINCT ?storage; SEPARATOR=", ") AS ?storage),
            (GROUP_CONCAT(DISTINCT ?display; SEPARATOR=", ") AS ?display),
            (GROUP_CONCAT(DISTINCT ?rearCamera; SEPARATOR=", ") AS ?rearCamera),
            (GROUP_CONCAT(DISTINCT ?battery; SEPARATOR=", ") AS ?battery)
        WHERE {
            ${ressource} rdfs:label ?name.
            FILTER(lang(?name) = "en") .
            OPTIONAL { ${ressource} dbp:os ?os. }
            OPTIONAL { ${ressource} foaf:name ?name. }
            OPTIONAL { ${ressource} dbp:cpu ?cpu. }
            OPTIONAL { ${ressource} dbp:gpu ?gpu. }
            OPTIONAL { ${ressource} dbp:memory ?memory. }
            OPTIONAL { ${ressource} dbp:storage ?storage. }
            OPTIONAL { ${ressource} dbp:display ?display. }
            OPTIONAL { ${ressource} dbp:rearCamera ?rearCamera. }
            OPTIONAL { ${ressource} dbp:battery ?battery. }
            OPTIONAL{${ressource} dbo:thumbnail ?thumbnail .}
        }`;
    url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
    .done(data => {
        const result = data.results.bindings[0];
        image = "";
        if(result.thumbnail != null){
            image = `<img class="phone-image" src="${result.thumbnail.value}" style="max-width:100px; max-height:50px;"/>`;
        }
         
        document.getElementById("phoneNameHeader").innerHTML += `<th scope="col">${image}<br/>
                                                                                ${`<a class="phone-link" href="#" onclick='redirect("../detail", "${id}", "${result.name.value}")'>${result.name.value}</a>`} 
                                                                                <button class="phoneCompareRemoveBtn" onclick="removeFromTable(event)">-</button></th>`;
        document.getElementById("spec1").innerHTML += `<th scope="col">${result.cpu.value == null ? "¯\_(ツ)_/¯": result.cpu.value}</th>`;
        document.getElementById("spec2").innerHTML += `<th scope="col">${result.gpu.value == null ? "¯\_(ツ)_/¯": result.gpu.value}</th>`;
        document.getElementById("spec3").innerHTML += `<th scope="col">${result.memory.value == null ? "¯\_(ツ)_/¯": result.memory.value}</th>`;
        document.getElementById("spec4").innerHTML += `<th scope="col">${result.storage.value == null ? "¯\_(ツ)_/¯": result.storage.value}</th>`;
        document.getElementById("spec5").innerHTML += `<th scope="col">${result.battery.value == null ? "¯\_(ツ)_/¯": result.battery.value}</th>`;
        document.getElementById("spec6").innerHTML += `<th scope="col">${result.display.value == null ? "¯\_(ツ)_/¯": result.display.value}</th>`;
        document.getElementById("spec7").innerHTML += `<th scope="col">${result.rearCamera.value == null ? "¯\_(ツ)_/¯": result.rearCamera.value}</th>`;
        makeVisible(document.getElementById("compareBoard"));
    })
    .fail(error => {
        alert("La requête s'est terminée en échec. Infos : " + JSON.stringify(error));
    });
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
                    dbo:abstract ?abstract;
                    dbp:cpu ?cpu.
                FILTER (regex(?abstract, "smartphone", "i")).
            }
            UNION
            {
                ?tel dbp:type dbr:Smartphone;
                dbo:abstract ?abstract.       
            }
            ?tel rdfs:label ?label.
            FILTER (lang(?abstract) = "en").
            FILTER (lang(?label) = "en").   
            FILTER (regex(?label, ".*${searchTxt}.*", "i")).
            OPTIONAL { ?tel dbo:thumbnail ?thumbnail }
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
              content = `${thumbnail ? `<img src="${thumbnail}" alt="${label}" style="max-width: 100px; max-height: 100px; margin-right: 10px; vertical-align: middle;"/>` : ''}
                         ${label}`
              return `
                  <li>
                      ${getUrifiedForm("../detail", telUri, label, content)}
                      <button class="phoneCompareBtn" onclick="addToCompare('${telUri}')">+</button>
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