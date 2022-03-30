// @ts-check

/**
 * @param {String[]} landListe 
 */
const tegnMedLand = async landListe => {
    const { floor, random } = Math;
    const url = "world.json";
    const response = await fetch(url);
    const data = await response.json();

    return "Lag en graf ut i fra disse landene: " + landListe.join(", ");
}

tegnMedLand("polen,usa,norway,uk,sweden,china".split(",")).then(res => console.log(res));