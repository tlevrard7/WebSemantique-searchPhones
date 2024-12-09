$(document).ready(function() {
    console.log("done");
    var searchBar = document.getElementById("searchBar"); 
    var searchBtn = document.getElementById("searchBtn"); 

    searchBtn.addEventListener("click", search); 
    searchBar.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();// Cancel the default action, if needed
            searchBtn.click();
        }
    }); 
    
});

///Recherche-----------------------------------------------------

// Enter sur la barre de recherche


function search(){
    console.log("clicked");
    var searchBar = document.getElementById("searchBar"); 
    var searchTxt = searchBar.value;
    const query = `
            PREFIX dbr: <http://dbpedia.org/resource/>
            PREFIX dbo: <http://dbpedia.org/ontology/>
            SELECT DISTINCT ?tel, ?label WHERE {
                ?tel a dbo:Device; 
                     rdfs:label ?label;  
                     dbp:type ?type ;
                     dbo:abstract ?abstract . 
                FILTER (lang(?abstract) = "en") .
                FILTER(LANG(?label)="en") .
                {FILTER (regex(?type,  ".*PHONE.*", "i")) .}
                UNION
                {FILTER (regex(?type,  ".*PHABLET.*", "i")) .}
                FILTER(regex(?label, ".*${searchTxt}.*", "i")) .

            } LIMIT 20
        `;
    const url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    
    $.ajax({
      url: url,
      method: "GET",
      dataType: "json",
    })
      .done(data => {
        // Process the results
        const bindings = data.results.bindings;
        const results = bindings.map(binding => binding.label.value);

        console.log(results)

        // Display results
        if (results.length) {
          $("ul#res").html(results.map((r) => 
              `<li> <a href="../detail/detail.html?label=${encodeURIComponent(r)}"> ${r} </a> </li>`
          ));
        } 
        else 
        {
          $("ul#res").html("");
        }
      })
      .fail(error => {
        alert("La requête s'est terminée en échec. Infos : " + JSON.stringify(error));
      })
}