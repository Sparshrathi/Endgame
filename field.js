// creating the all grid area
function generateGrid() {
    let html = "";
    for (let i = 0; i < gridCount; i++) {
        html += "<div class='row'>"
        for (let j = 0; j < gridCount; j++) {
            html += '<div class="grid-item" data-y=' + i + ' data-x=' + j + '> </div>'
        }
        html += "</div>"
    }
    $('#battle-field').append(html);

}