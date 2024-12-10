function getAttributes(ressource, ...attributes) {
    ressource = escapeSparqlChars(ressource);
    const vars = attributes.map(a => '?' + a.replace(':', '_'))
    const filters = attributes.map((a, i) => typeof(a) == String ? null : a[1])
    const uris = attributes.map((a, i) => typeof (a) == String ? a : a[0])
    
    const selects = uris.map((a, i) => `GROUP_CONCAT(DISTINCT ${vars[i]}; SEPARATOR=" | ") AS ${vars[i]}`)
    const options  = attributes.map((a, i) => `OPTIONAL { ${typeof (a) == Stringuris[i]} ${a} ${vars[i]}.`)
    
    return `
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbp: <http://dbpedia.org/property/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX prov: <http://www.w3.org/ns/prov#>
        PREFIX dc: <http://purl.org/dc/terms/>
        SELECT ${selects.join(' ')}
        WHERE { ${options.join(' ')}}
    `;
}

function escapeSparqlChars(ressource) {
    for (const c of '(){};.') ressource = ressource.replace(c, '\\' + c)
    return ressource
}