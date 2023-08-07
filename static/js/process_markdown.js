// SimpleMDEを初期化
var simplemde = new SimpleMDE({ element: document.getElementById("editor") });
// 現在開いているファイル名を格納する変数
var currentFile = "";
// 初期内容を保存
var lastContent = simplemde.value();

// previewの設定
simplemde.codemirror.on("change", function(){
    var renderedHTML = marked(simplemde.value());
    document.getElementById('preview').innerHTML = renderedHTML;
  });
document.getElementById('preview').classList.add("markdown-body")

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

// サイドバーに表示するファイルリストを更新する関数
function updateFileList() {
    $('#sidebar').empty();  // 一覧を初期化
    // "/files"エンドポイントからファイル名一覧を取得してサイドバー追加
    $.getJSON('/files', function(data){
        // ファイルコンテナをサイドバーに追加
        data.forEach(function(file){
            let fileContainer = $('<div>').addClass('file-container');
            let fileNameDiv = $('<div>').text(file).addClass('filename clickable');
            // ファイル削除、名前変更のドロップダウンメニュー
            let menuButton = $('<button>').text('≡').addClass('menu-icon').hide(); // このボタンは最初は非表示です
            let dropdownMenu = $('<div>').addClass('dropdown-menu');
            // 名前変更
            let renameLink = $('<a>').text('rename').addClass('rename clickable');
            renameLink.attr('href', "#");
            renameLink.on('click', function(event) {
                event.preventDefault();
                var newFileName = prompt("新しいファイル名を入力してください:");
                if (newFileName) {
                    $.post('/rename_file', {old_name: file, new_name: newFileName}, function(data){
                        alert(data);
                        updateFileList()
                    });
                }
            });
            // ファイル削除
            let deleteLink =  $('<a>').text('delete').addClass('delete clickable');
            deleteLink.attr('href', "#");
            deleteLink.on('click', function(event) {
                event.preventDefault();
                var confirmDelete = confirm("削除したファイルは元に戻せません。本当にファイルを削除しますか？");
                if (confirmDelete) {
                    $.post('/delete_file', {filename: file}, function(data){
                        alert(data);
                        updateFileList()
                    });
                }
            });
            dropdownMenu.append(renameLink, deleteLink);  // メニューに追加

            fileContainer.append(fileNameDiv, menuButton, dropdownMenu);

            $('#sidebar').append(fileContainer);
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
        // ファイルコンテナにホバーしているときにメニューアイコンを表示
        $('.file-container').hover(function(){
            $(this).find('.menu-icon').show();
        }, function(){
            $(this).find('.menu-icon').hide();
        });
        // メニューアイコンをクリックされるとドロップダウンメニューが表示
        $('.menu-icon').on('click', function() {
            // 他の開いているメニューを閉じる
            $('.dropdown-menu').hide();
        
            // クリックされたアイコンに対応するメニューをトグルする
            $(this).siblings('.dropdown-menu').toggle();
        });
    });
};
// ページロード時updateFileListを実行
$(document).ready(function(){
    updateFileList()
});

// ドロップダウンメニュー外をクリックしたときにメニューを閉じる
$(document).on('click', function(event) {
    if (!$(event.target).closest('.file-container').length) {
        $('.dropdown-menu').hide();
    }
});