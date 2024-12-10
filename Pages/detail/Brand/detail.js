/*
function getImageTelephone_WikiData(nomTel){

    const query = 
    `
        SELECT ?phone ?image 
        WHERE {
            ?phone wdt:P306 ?os. # Permet de filtrer avant de rechercher par label (j'ai pas trouvé de type bien défini pour les smartphones sur wikidata)
            ?phone rdfs:label ?label.
            FILTER(regex(?label, ".*${nomTel}.*", "i")).
            OPTIONAL { ?phone wdt:P18 ?image. } # Image associée au téléphone
        }
        LIMIT 1
    `;
    
    const url = "https://query.wikidata.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
    .done((data) => {
        const result = data.results.bindings[0];
        const imageUrl = result.image.value;
        console.log(imageUrl)
        $('#imageTel').attr('src', imageUrl); 
    
    })
    .fail((error) => {
        alert("La requête a échoué. Infos : " + JSON.stringify(error));
    });
}
*/

const absVar = "Abstract";
const founderVar = "Founder";
const countryVar = "Country";
const thumbnailVar = "Thumbnail";
const labelVar = "Label";
const commentVar = "Comment";

function getQuery(ressource){
    ressource = "dbr:" + ressource;
    return `
                    PREFIX dbr: <http://dbpedia.org/resource/>
                    PREFIX dbo: <http://dbpedia.org/ontology/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    SELECT ?${labelVar} ?${absVar} ?${founderVar} ?${countryVar} ?${thumbnailVar} ?${commentVar}
                    WHERE {
                        OPTIONAL { ${ressource} rdfs:label ?${labelVar}. }
                        OPTIONAL { ${ressource} dbo:abstract ?${absVar}. }
                        OPTIONAL { ${ressource} dbo:foundedBy ?${founderVar}. }
                        OPTIONAL { ${ressource} dbo:locationCountry ?${countryVar}. }
                        OPTIONAL { ${ressource} dbo:thumbnail ?${thumbnailVar}. }
                        OPTIONAL { ${ressource} rdfs:comment ?${commentVar}. }
                    }
                `;
}

function getUrifiedForm(ressource, type, label){

    return `<a href="../${type}/detail.html?uri=${ressource}&label=${label}"> ${label} </a>`;
}


function getDetails(ressource){
    
    const query = getQuery(ressource);
    
    const url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
        .done((data) => {
            const item = data.results.bindings[0];
            console.log(data);
                
            for (const key in item) {
                var value = item[key].value;
                switch(key){
                    case `${thumbnailVar}`:
                        $('#imageBrand').attr('src', value);
                        break;
                    default:
                        const include = value.includes("http://dbpedia.org/");
                        console.log(value, include);
                        if(include) {
                            // Si c'est une URI on récupère que le texte après le dernier '/'
                            const lastSlashIndex = value.lastIndexOf("/");
                            label = value.substring(lastSlashIndex + 1);
                            var type = "Generique";
                            if(type === predVar) type ="Tel";
                            value = getUrifiedForm(value, type, label);
                        }

                        let newRow = `
                            <tr>
                                <td>${key}</td>
                                <td>${value}</td>
                            </tr>
                        `;

                        $('#content-tab-prop').append(newRow);
                }
            }
        })
        .fail((error) => {
            alert("La requête a échoué. Infos : " + JSON.stringify(error));
        });
}

$(document).ready(function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    var label = urlParams.get("label");
    var ressource = urlParams.get("uri");

    $('#page-title').html(`Détails du ${label}`);
    console.log(ressource);
    const lastSlashIndex = ressource.lastIndexOf("/");
    ressource = ressource.substring(lastSlashIndex + 1);
    console.log(ressource);
    getDetails(ressource);

});
