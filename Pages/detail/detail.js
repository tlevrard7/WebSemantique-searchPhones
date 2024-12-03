nomTel="Iphone_14"


$(document).ready( function () {

        const query = `
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT ?tel, ?label, ?abstract  WHERE {
            ?tel a dbo:Device; 
                rdfs:label ?label;  
                dbp:type ?type ;
                dbo:abstract ?abstract . 
            FILTER (lang(?abstract) = "en") .
            FILTER(LANG(?label)="en") .
            FILTER (regex(?type,  ".*PHONE.*", "i")) .
            FILTER(regex(?label, ".*${searchTxt}.*", "i")) .

        }
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
    console.log(bindings);
    const results = bindings.map((binding) => binding.abstract.value);

    // Display results
    //$("ul#res").text("<li>" + results.join("</li><li>") + "</li>");
    })
    .fail(function (error) {
    alert(
    "La requête s'est terminée en échec. Infos : " + JSON.stringify(error)
    );
    })
    .always(function () {});
        
    });




