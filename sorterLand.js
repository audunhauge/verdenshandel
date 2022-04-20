// @ts-check

/**
 * @param {String[]} landListe 
 */
const tegnMedLand = async landListe => {
    document.getElementById("main").innerHTML = `<div id="disp"></div>`

    const { floor, random } = Math;
    const url = "WorldData.json";
    const response = await fetch(url);
    const data = await response.json();

    const initData = {};
    initData.nodes = landListe.map(id => ({ id }));
    initData.links = [];

    for (const land of landListe) {
        try{
            const exp = data[land].eksport;
            const tot = exp.tot;
            const partnere = Object.keys(exp);
            for (const part of partnere) {
                if(part === "tot") continue;
                if (!landListe.includes(part)) continue;
    
                if (part !== "tot") {
                    const prosent = exp[part] / 100;
                    if (!initData.nodes.find(n => n.id === part)) {
                        initData.nodes.push({ id: part });
                    }
                    initData.links.push(
                        {
                            source: land, target: part,
                            value: 0.1 * prosent * tot,
                            curvature: 0.1 + random() * 0.8,
                            rotation: Math.PI * random()
                        }
                    );
                }
            }
        }
        catch(err) {}
    }
    console.log(initData);

    const Graph = ForceGraph3D()
        (document.getElementById('disp'))
        .graphData(initData)
        .nodeAutoColorBy(d => floor(Number(d.gdp / 10)))
        .linkDirectionalParticles("value")
        .linkCurvature('curvature')
        .linkCurveRotation('rotation')
        .linkDirectionalParticleSpeed(d => 0.002)
        .onNodeClick(node => {
            alert(node.id);
        })
        .nodeThreeObject(node => {
            const sprite = new SpriteText(node.id);
            sprite.material.depthWrite = false; // make sprite background transparent
            sprite.color = node.color;
            sprite.textHeight = 8;
            return sprite;
        });

    Graph
        .d3Force('link')
        .distance(link => 150 / (1 + link.value));
}

// tegnMedLand("norway,united_states,australia,sweden,poland,belarus,ukraine,france,south_africa,united_arab_emirates,russia".split(",")).then(res => console.log(res));