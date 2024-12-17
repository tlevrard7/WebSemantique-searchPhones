

const absVar = "Abstract";
const founderVar = "Founder";
const countryVar = "Country";
const thumbnailVar = "Thumbnail";
const labelVar = "Label";
const commentVar = "Comment";

function getUrl(ressource){
    ressource = "dbr:" + ressource;
    query = `
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbp: <http://dbpedia.org/property/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?${labelVar} ?${absVar} ?${founderVar} ?${countryVar} ?${thumbnailVar} ?${commentVar}
        WHERE {
            ${ressource} rdfs:label ?${labelVar}.
            FILTER(lang(?${labelVar}) = "en") .
            OPTIONAL { ${ressource} dbo:abstract ?${absVar}. }
            OPTIONAL { ${ressource} dbo:foundedBy ?${founderVar}. }
            OPTIONAL { ${ressource} dbo:locationCountry ?${countryVar}. }
            OPTIONAL { ${ressource} dbo:thumbnail ?${thumbnailVar}. }
            OPTIONAL { ${ressource} rdfs:comment ?${commentVar}. }
        }
    `;
    const url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    return url;
}

function getUrifiedForm(ressource, type, label){

    return `<a href="../${type}/detail.html?uri=${encodeURIComponent(ressource)}&label=${label}"> ${label} </a>`;
}


function getDetails(ressource){
    
    const url = getUrl(ressource);
    
    
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
        .done((data) => {
            const item = data.results.bindings[0];
            
                
            for (const key in item) {
                var value = item[key].value;
                switch(key){
                    case `${thumbnailVar}`:
                        $('#imageBrand').attr('src', value);
                        break;
                    default:
                        const include = value.includes("http://dbpedia.org/");
                        
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

    $('#page-title').html(`${label}`);
    getDetails(ressource);

});
