from SPARQLWrapper import SPARQLWrapper, JSON
import pandas as pd
import os

# Vérifie si le répertoire courant est accessible en écriture
current_directory = os.getcwd()
if os.access(current_directory, os.W_OK):
    print(f"Le répertoire {current_directory} est accessible en écriture.")
else:
    print(f"Le répertoire {current_directory} n'est pas accessible en écriture.")

# Configuration de l'endpoint SPARQL DBpedia
sparql = SPARQLWrapper("https://dbpedia.org/sparql")

def get_resource_properties(resource_uri):
    """
    Interroge toutes les propriétés et valeurs d'une ressource DBpedia.
    """
    query = f"""
    SELECT DISTINCT ?property ?value
    WHERE {{
        <{resource_uri}> ?property ?value .
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return results

def parse_results(results):
    """
    Transforme les résultats SPARQL en dictionnaire {propriété: valeur}.
    """
    data = {}
    if "results" in results and "bindings" in results["results"]:
        for result in results["results"]["bindings"]:
            property_name = result["property"]["value"]
            value = result["value"]["value"]
            if property_name not in data:
                data[property_name] = value
            else:
                # Concaténer si plusieurs valeurs existent pour une même propriété
                data[property_name] += f", {value}"
    return data

def build_comparison_table(resource_uris):
    """
    Construit un tableau comparatif pour plusieurs smartphones.
    """
    smartphones_data = []
    for uri in resource_uris:
        print(f"Fetching data for: {uri}")
        results = get_resource_properties(uri)
        parsed_data = parse_results(results)
        parsed_data["resource"] = uri  # Ajoute une colonne pour l'URI
        smartphones_data.append(parsed_data)

    # Convertir les données en DataFrame pandas
    df = pd.DataFrame(smartphones_data).set_index("resource")
    return df

# Liste des URI des smartphones à comparer
resource_uris = [
    "http://dbpedia.org/resource/Samsung_Galaxy_S22",
    "http://dbpedia.org/resource/IPhone_14",
    "http://dbpedia.org/resource/Xiaomi_Mi_11",
    "http://dbpedia.org/resource/Pixel_6",
    "http://dbpedia.org/resource/OnePlus_10_Pro",
    "http://dbpedia.org/resource/Sony_Xperia_1_III",
    "http://dbpedia.org/resource/Motorola_Edge_30",
    "http://dbpedia.org/resource/LG_Wing",
    "http://dbpedia.org/resource/Nokia_9_PureView",
    "http://dbpedia.org/resource/BlackBerry_Key2",
    "http://dbpedia.org/resource/Fairphone_4",
    "http://dbpedia.org/resource/Essential_Phone",
    "http://dbpedia.org/resource/HTC_One_M9",
]

# Construire et afficher le tableau comparatif
if __name__ == "__main__":
    comparison_table = build_comparison_table(resource_uris)
    # Sauvegarder en CSV ou afficher directement
    try:
        comparison_table.to_csv("smartphone_comparison_full.csv", index=True)
        print("Fichier CSV généré avec succès.")
    except Exception as e:
        print(f"Erreur lors de l'écriture du fichier CSV : {e}")