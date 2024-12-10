

const absVar = "Abstract";
const founderVar = "Founder";
const countryVar = "Country";
const thumbnailVar = "Thumbnail";
const labelVar = "Label";
const commentVar = "Comment";

function getQuery(ressource){
    ressource = "<http://dbpedia.org/resource/" + ressource + ">";
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

    return `<a href="../${type}/detail.html?uri=${encodeURIComponent(ressource)}&label=${label}"> ${label} </a>`;
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
                            value = getUrifiedForm(value, "Generique", label);
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
    getDetails(ressource);

});
