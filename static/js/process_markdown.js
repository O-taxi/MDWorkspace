// SimpleMDEを初期化
var simplemde = new EasyMDE({ element: document.getElementById("editor") });
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


let autoSaveIntervalId; // グローバル変数としてintervalIdを保持
// 内容の変更を確認して保存(5sごと)
function startAutoSaveInterval() {
    autoSaveIntervalId = setInterval(function() {
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
}

// インターバルを停止
function stopInterval(intervalId) {
    clearInterval(intervalId);
}

// 名前変更リンク生成
function createRenameLink(item, updateFileList) {
    let renameLink = $('<a>').text('rename').addClass('rename clickable');
    renameLink.attr('href', "#");
    renameLink.on('click', function(event) {
        event.preventDefault();
        var newFileName = prompt("新しいファイル名を入力してください:");
        if (newFileName) {
            stopInterval(autoSaveIntervalId)
            $.post('/rename_file', {old_name: item.name, new_name: newFileName}, function(data){
                alert(data);
                updateFileList();
            });
            startAutoSaveInterval()
        }
    });
    return renameLink;
}

// ファイル削除リンク生成
function createDeleteLink(item, updateFileList) {
    let deleteLink =  $('<a>').text('delete').addClass('delete clickable');
    deleteLink.attr('href', "#");
    deleteLink.on('click', function(event) {
        event.preventDefault();
        var confirmDelete = confirm("削除したファイルは元に戻せません。本当にファイルを削除しますか？");
        if (confirmDelete) {
            stopInterval(autoSaveIntervalId)
            $.post('/delete_file', {filename: item.name}, function(data){
                alert(data);
                updateFileList();
            });
            startAutoSaveInterval()
        }
    });
    return deleteLink;
}

// ドロップダウンメニュー生成
function createDropdownMenu(item, updateFileList) {
    let dropdownMenu = $('<div>').addClass('dropdown-menu');
    let renameLink = createRenameLink(item, updateFileList);
    let deleteLink = createDeleteLink(item, updateFileList);
    dropdownMenu.append(renameLink, deleteLink);
    return dropdownMenu;
}

// サイドバーに表示するファイルリストを更新する関数
function updateFileList() {
    $('#sidebar').empty();  // 一覧を初期化
    // "/files"エンドポイントからファイル名一覧を取得してサイドバー追加
    $.getJSON('/files', function(data){
        // ファイルコンテナをサイドバーに追加
        data.forEach(function(item){
            let fileContainer = $('<div>').addClass('file-container');
            let itemNameDiv = $('<div>').text((item.name).replace(/\.md$/, "")).addClass('itemname clickable');
            itemNameDiv.addClass(item.type); // 'file'または'directory'をクラスとして追加

            // ファイル削除、名前変更のドロップダウンメニュー
            let menuButton = $('<button>').text('≡').addClass('menu-icon').hide(); // このボタンは最初は非表示です
            let dropdownMenu = createDropdownMenu(item, updateFileList);

            fileContainer.append(itemNameDiv, menuButton, dropdownMenu);

            $('#sidebar').append(fileContainer);
        });
    });
};

// ファイル名をクリックしたときに、そのファイルの内容を取得してエディタに表示
$('#sidebar').on("click", '.file', function(){
    stopInterval(autoSaveIntervalId)
    currentFile = $(this).text() + ".md";
    $('#currentFile').text(currentFile);
    $.get('/file/' + currentFile, function(data){
    simplemde.value(data);
    lastContent = simplemde.value();
    });
    startAutoSaveInterval()
});
// ディレクトリ名をクリックしたときに、ディレクトリ内のファイルを展開して表示
$('#sidebar').on("click", '.directory', function(){
    $(this).text()
    // TODO
});
// ファイルコンテナにホバーしているときにメニューアイコンを表示
$('#sidebar').on("mouseenter", ".file-container", function(){
    $(this).find('.menu-icon').show();
});
$('#sidebar').on("mouseleave", ".file-container", function(){
    $(this).find('.menu-icon').hide();
});
// メニューアイコンをクリックされるとドロップダウンメニューが表示
$("#sidebar").on('click', '.menu-icon', function() {
    // 他の開いているメニューを閉じる
    $('.dropdown-menu').hide();
    // クリックされたアイコンに対応するメニューをトグルする
    $(this).siblings('.dropdown-menu').toggle();
});
// 新規ファイル作成
$(".sidebar").on('click', '#create-file-icon', function() {
    var newFileName = prompt("新しいファイル名を入力してください:");
    if (newFileName) {
        $.post('/create_file', {filename: newFileName}, function(data){
            alert(data);
            updateFileList();
        });
    }
});
// 新規ディレクトリ作成
$(".sidebar").on('click', '#create-dir-icon', function() {
    var newDirectoryName = prompt("新しいディレクトリ名を入力してください:");
    if (newDirectoryName) {
        $.post('/create_directory', {dir_name: newDirectoryName}, function(data){
            alert(data);
            updateFileList();
        });
    }
});
// ドロップダウンメニュー外をクリックしたときにメニューを閉じる
$(document).on('click', function(event) {
    if (!$(event.target).closest('.file-container').length) {
        $('.dropdown-menu').hide();
    }
});

// ページロード時の動作
$(document).ready(function(){
    updateFileList()
    startAutoSaveInterval()
});