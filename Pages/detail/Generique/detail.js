
const descVar = "Description";


function getUrl(ressource){
    ressource = "<http://dbpedia.org/resource/" + ressource + ">";
    query = `
                    SELECT DISTINCT ?Property (GROUP_CONCAT(?Value; SEPARATOR = ",  ") AS ?Value)
                    WHERE {
                        ${ressource} ?Property ?Value .
                        FILTER (isIRI(?Value) || isBlank(?Value) || LANG(?Value) = "en" || LANG(?Value) = "").
                        FILTER (!regex(?Property, ".*type.*","i")) .
                        FILTER (!regex(?Property, ".*differentFrom.*","i")) .
                        FILTER (!regex(?Property, ".*depiction.*","i")) .
                        FILTER (!regex(?Property, ".*logo.*","i")) .
                        FILTER (!regex(?Property, ".*subject.*","i")) .
                        FILTER (!regex(?Property, ".*SameAs.*","i")) .
                        FILTER (!regex(?Property, ".*sid.*","i")) .
                        FILTER (!regex(?Property, ".*soc.*","i")) .
                        FILTER (!regex(?Property, ".*input.*","i")) .
                        FILTER (!regex(?Property, ".*topic.*","i")) .
                        FILTER (!regex(?Property, ".*UsesTemplate.*","i")) .
                        FILTER (!regex(?Property, ".*Wiki.*Id","i")) .
                        FILTER (!regex(?Property, ".*Wiki.*length","i")) .
                        OPTIONAL{${ressource} dbo:thumbnail ?Value .}
                    }
                    GROUP BY ?Property
                    LIMIT 60
                `;
    url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    return url;
}


function getDetails(ressource){
    
    const url = getUrl(ressource);
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
        .done((data) => {
            const items = data.results.bindings;
            items.forEach(item => {
                if(item.Property){
                    var newRow;
                    var prop = item["Property"].value;
                    const lastHashIndex = prop.lastIndexOf("#");
                    prop = prop.substring(lastHashIndex + 1);
                    const lastSlashIndex = prop.lastIndexOf("/");
                    prop = prop.substring(lastSlashIndex + 1);
                    prop = String(prop).charAt(0).toUpperCase() + String(prop).slice(1);
                    var value = item["Value"].value;
                    switch(prop){
                        case "Thumbnail":
                            $('#image').attr('src', value);
                            break;
                        case "ImageCaption":
                            $('#image').attr('alt', value);
                            break;
                        case "WikiPageExternalLink":
                        case "WikiPageWikiLink":
                            newRow = `
                                <tr>
                                    <td>${prop}</td>
                                    <td><ul>${value.split(',').map((sub)=>{
                                        // Si c'est une URI on récupère que le texte après le dernier '/'
                                        if(sub.includes("dbpedia.org/")){
                                            label = sub.substring(sub.lastIndexOf("/") + 1);
                                            return `<li>${getUrifiedForm("..", label, label, label)}</li>`;
                                        }
                                        else{
                                            return `<li><a href='${sub}'>${sub}</a></li>`
                                        }
                                    }).join("")} 
                                    </ul></td>
                                </tr>
                                `;
                            $('#content-tab-links').append(newRow);
                            break;
                        default:
                            const include = value.includes("http://");
                            if(include) {
                                
                                newRow = `
                                    <tr>
                                        <td>${prop}</td>
                                        <td>${value.split(',').map((sub)=>{
                                            // Si c'est une URI on récupère que le texte après le dernier '/'
                                            if(sub.includes("dbpedia.org/")){
                                                const lastSlashIndex = sub.lastIndexOf("/");
                                                label = sub.substring(lastSlashIndex + 1);
                                                return getUrifiedForm("..", label, label, label);
                                            }
                                            else{
                                                return `<a href='${sub}'>${sub}</a>`
                                            }
                                        })} 
                                        </td>
                                    </tr>
                                `;
                            }
                            else {

                                newRow = `
                                    <tr>
                                        <td>${prop}</td>
                                        <td>${value}</td>
                                    </tr>
                                `;
                            }
                                
            
                            $('#content-tab-prop').append(newRow);
                            break;
                    }
                }

            });
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
