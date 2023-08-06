// SimpleMDEを初期化
var simplemde = new SimpleMDE({ element: document.getElementById("editor") });
simplemde.codemirror.on("change", function(){
    var renderedHTML = marked(simplemde.value());
    document.getElementById('preview').innerHTML = renderedHTML;
  });
document.getElementById('preview').classList.add("markdown-body")
// 現在開いているファイル名を格納する変数
var currentFile = "";
// 初期内容を保存
var lastContent = simplemde.value();

// 内容の変更を確認して保存(5sごと)
setInterval(function() {
    var currentContent = simplemde.value();
    if (lastContent !== currentContent) { // 変更がある場合のみ
        $.ajax({
            type: "POST",
            url: "/save",
            data: { 
                content: currentContent, 
                filename: currentFile
            },
            success: function(response) {
                console.log("Saved successfully!");
                lastContent = currentContent; // 現在の内容を保存
            },
            error: function(error) {
                console.log("Error while saving:", error);
            }
        });
    }
}, 5000); // 5秒ごとに実行

// ページロード時にファイル一覧を取得し、サイドバーに表示
$(document).ready(function(){
    $.getJSON('/files', function(data){
    data.forEach(function(file){
        $('#sidebar').append($('<div>').text(file).addClass('filename clickable'));
    });

    // ファイル名をクリックしたときに、そのファイルの内容を取得してエディタに表示
    $('.filename').click(function(){
        currentFile = $(this).text();
        $('#currentFile').text(currentFile);
        $.get('/file/' + currentFile, function(data){
        simplemde.value(data);
        lastContent = simplemde.value();
        });
    });
    });
});

