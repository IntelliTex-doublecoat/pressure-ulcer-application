/**
 * @param {number} size
 * @param {string} iconId
 * @param {boolean} interactionMouse
 * @param {boolean} animationAuto
 */
function drawIcon(size, iconId, interactionMouse, animationAuto) {
    const
        width = size,
        height = size;

    const svg = d3.select(`#${iconId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")

    const circleCx = width / 2;
    const circleCy = height / 2;

    const layer1Cnt = 10;
    const layer2Cnt = 15;
    const layer3Cnt = 20;
    const line_ratio = 0.5;
    const layer1Radius = Math.round(size / 7.5);
    const layer2Radius = Math.round(size / 5);
    const layer3Radius = Math.round(size / 3.75);
    const layer1Radius_ratio = 1.15;
    const layer2Radius_ratio = 1.1;
    const layer3Radius_ratio = 1.09;
    const strokeLineWid = Math.round(size / 37.5);
    const animationAngleOffset = 20;

    function linesClose() {
        d3.selectAll(".layer1Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer1Radius + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer1Radius}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer1Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer1Radius}
                    `
            })
            .ease(d3.easePoly)
            .duration(1000);

        d3.selectAll(".layer2Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer2Radius}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer2Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(250)
            .duration(1000)

        d3.selectAll(".layer3Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer3Radius}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer3Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(500)
            .duration(1000)
    }

    function lineOpen() {
        d3.selectAll(".layer1Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer1Radius * layer1Radius_ratio + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer1Radius * layer1Radius_ratio}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer1Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer1Radius}
                    `
            })
            .ease(d3.easePoly)
            .duration(1000);

        d3.selectAll(".layer2Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer2Radius * layer2Radius_ratio + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer2Radius * layer2Radius_ratio}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer2Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(250)
            .duration(1000)

        d3.selectAll(".layer3Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer3Radius * layer3Radius_ratio + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer3Radius * layer3Radius_ratio}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer3Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(500)
            .duration(1000)
    }

    function addMouseInteraction() {
        svg.append("circle")
            .attr("cx", `${circleCx}px`)
            .attr("cy", `${circleCy}px`)
            .attr("r", `${layer3Radius * layer3Radius_ratio}px`)
            .attr("fill", "rgba(0,0,0,0)") 
            .on("mouseover", () => {
                linesClose();
            })
            .on("mouseleave", () => {
                lineOpen();
            })
    }

    function autoAnimClose() {
        d3.selectAll(".layer1Line")
            .transition()
            .attr('d', (d) => {

                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer1Radius + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer1Radius}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer1Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer1Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(3000)
            .duration(700)
            .end() 
            .then(()=>{
                autoAnimOpen()
            });

        d3.selectAll(".layer2Line")
            .transition()
            .attr('d', (d) => {

                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer2Radius}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer2Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(3300)
            .duration(700);

        d3.selectAll(".layer3Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer3Radius}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer3Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(3600)
            .duration(700)
            
    }

    function autoAnimOpen() {
        d3.selectAll(".layer1Line")
            .transition()
            .attr('d', (d) => {

                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer1Radius * layer1Radius_ratio + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer1Radius * layer1Radius_ratio}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer1Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer1Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(100)
            .duration(1000);

        d3.selectAll(".layer2Line")
            .transition()
            .attr('d', (d) => {

                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer2Radius * layer2Radius_ratio + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer2Radius * layer2Radius_ratio}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer2Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(400)
            .duration(1000)

        d3.selectAll(".layer3Line")
            .transition()
            .attr('d', (d) => {
                return `
                    M${Math.sin(d.startAng * (Math.PI / 180)) * layer3Radius * layer3Radius_ratio + circleCx},
                    ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer3Radius * layer3Radius_ratio}
                    L${Math.sin(d.endAng * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer3Radius}
                    `
            })
            .ease(d3.easePoly)
            .delay(700)
            .duration(1000)
            .end()
            .then(()=>{
                autoAnimClose()
            })
    }


    {
        for (let i = 0; i < layer1Cnt; i++) {

            svg.append("path").datum(
                {
                    startAng: 360 / layer1Cnt * i,
                    endAng: 360 / layer1Cnt * i + 360 / layer1Cnt * line_ratio
                }
            )
                .attr('d', (d) => {
                    return `
                            M${Math.sin((d.startAng - animationAngleOffset) * (Math.PI / 180)) * layer1Radius + circleCx},
                            ${circleCy - Math.cos((d.startAng - animationAngleOffset) * (Math.PI / 180)) * layer1Radius}
                            L${Math.sin((d.endAng - animationAngleOffset) * (Math.PI / 180)) * layer1Radius + circleCx},
                            ${circleCy - Math.cos((d.endAng - animationAngleOffset) * (Math.PI / 180)) * layer1Radius}
                        `
                })
                .attr("class", "layer1Line")
                .attr("stroke", "#49aa39")
                .attr("stroke-width", strokeLineWid)
                .attr("fill", "none")
                .attr("stroke-linecap", "round")
                .attr("opacity", "0")

        }
        d3.selectAll(".layer1Line")
            .transition()
            .attr('d', (d) => {

                return `
                        M${Math.sin(d.startAng * (Math.PI / 180)) * layer1Radius * layer1Radius_ratio + circleCx},
                        ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer1Radius * layer1Radius_ratio}
                        L${Math.sin(d.endAng * (Math.PI / 180)) * layer1Radius + circleCx},
                        ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer1Radius}
                    `
            })
            .attr("opacity", "0.8")
            .ease(d3.easePoly)
            .duration(1000)

    }

    {
        for (let i = 0; i < layer2Cnt; i++) {

            svg.append("path").datum(
                {
                    startAng: 360 / layer2Cnt * i,
                    endAng: 360 / layer2Cnt * i + 360 / layer2Cnt * line_ratio
                }
            )
                .attr('d', (d) => {
                    return `
                    M${Math.sin((d.startAng - animationAngleOffset) * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos((d.startAng - animationAngleOffset) * (Math.PI / 180)) * layer2Radius}
                    L${Math.sin((d.endAng - animationAngleOffset) * (Math.PI / 180)) * layer2Radius + circleCx},
                    ${circleCy - Math.cos((d.endAng - animationAngleOffset) * (Math.PI / 180)) * layer2Radius}
                `
                })
                .attr("class", "layer2Line")
                .attr("stroke", "#49aa39")
                .attr("stroke-width", strokeLineWid)
                .attr("fill", "none")
                .attr("stroke-linecap", "round")
                .attr("opacity", "0")
        }
        d3.selectAll(".layer2Line")
            .transition()
            .attr('d', (d) => {

                return `
                M${Math.sin(d.startAng * (Math.PI / 180)) * layer2Radius * layer2Radius_ratio + circleCx},
                ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer2Radius * layer2Radius_ratio}
                L${Math.sin(d.endAng * (Math.PI / 180)) * layer2Radius + circleCx},
                ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer2Radius}
            `
            })
            .attr("opacity", "0.6")
            .ease(d3.easePoly)
            .delay(250)
            .duration(1000)
    }

    {
        for (let i = 0; i < layer3Cnt; i++) {

            svg.append("path").datum(
                {
                    startAng: 360 / layer3Cnt * i,
                    endAng: 360 / layer3Cnt * i + 360 / layer3Cnt * line_ratio
                }
            )
                .attr('d', (d) => {
                    return `
                    M${Math.sin((d.startAng - animationAngleOffset) * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos((d.startAng - animationAngleOffset) * (Math.PI / 180)) * layer3Radius}
                    L${Math.sin((d.endAng - animationAngleOffset) * (Math.PI / 180)) * layer3Radius + circleCx},
                    ${circleCy - Math.cos((d.endAng - animationAngleOffset) * (Math.PI / 180)) * layer3Radius}
                `
                })
                .attr("class", "layer3Line")
                .attr("stroke", "#49aa39")
                .attr("stroke-width", strokeLineWid)
                .attr("fill", "none")
                .attr("stroke-linecap", "round")
                .attr("opacity", "0")

        }
        d3.selectAll(".layer3Line")
            .transition()
            .attr('d', (d) => {

                return `
                M${Math.sin(d.startAng * (Math.PI / 180)) * layer3Radius * layer3Radius_ratio + circleCx},
                ${circleCy - Math.cos(d.startAng * (Math.PI / 180)) * layer3Radius * layer3Radius_ratio}
                L${Math.sin(d.endAng * (Math.PI / 180)) * layer3Radius + circleCx},
                ${circleCy - Math.cos(d.endAng * (Math.PI / 180)) * layer3Radius}
            `
            })
            .attr("opacity", "0.3")
            .ease(d3.easePoly)
            .delay(500)
            .duration(1000)
            .end()
            .then(() => {
                if(interactionMouse)
                {
                    addMouseInteraction();
                }

                if(animationAuto)
                {
                    autoAnimClose();
                }

            });
    }

}