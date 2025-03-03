/**
 * WordCloud.js - Creates a D3-based word cloud for visualizing frequent terms
 */

/**
 * Create a word cloud visualization
 * @param {Array} words - Array of word objects with text and size properties
 */
function createWordCloud(words) {
    // Clear previous word cloud
    d3.select("#wordCloud").html("");
    
    // Set dimensions based on container size
    const container = document.getElementById('wordCloudContainer');
    const width = container.clientWidth;
    const height = 300;
    
    // Filter out words with too small counts
    const filteredWords = words.filter(w => w.size > 1);
    
    // Scale word sizes for better visualization
    const minSize = Math.min(...filteredWords.map(w => w.size));
    const maxSize = Math.max(...filteredWords.map(w => w.size));
    const fontSizeScale = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([12, 40]);
    
    // Prepare data for D3 cloud
    const scaledWords = filteredWords.map(w => ({
        text: w.text,
        size: fontSizeScale(w.size)
    }));
    
    // Color scale for the words
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Create the word cloud layout
    const layout = d3.layout.cloud()
        .size([width, height])
        .words(scaledWords)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .fontSize(d => d.size)
        .on("end", draw);
    
    // Start the layout calculation
    layout.start();
    
    // Draw the word cloud
    function draw(words) {
        d3.select("#wordCloud")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`)
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", d => `${d.size}px`)
            .style("fill", (d, i) => colorScale(i))
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
            .text(d => d.text);
    }
}
