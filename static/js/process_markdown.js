// チェックボックス表示機能の追加
const renderer = new marked.Renderer();
const originalListitem = renderer.listitem;
renderer.listitem = function(text) {
    if (/^\s*\[[x ]\]\s*/.test(text)) {
        text = text
            .replace(/^\s*\[ \]\s*/, '<input type="checkbox" class="task-list-item-checkbox" disabled> ')
            .replace(/^\s*\[x\]\s*/, '<input type="checkbox" class="task-list-item-checkbox" checked disabled> ');
    return '<li style="list-style: none">' + text + '</li>';
    } else {
        return originalListitem(text);
    }
};

// SimpleMDEを初期化
var easymde = new EasyMDE({ 
    element: document.getElementById("editor"),
    renderingConfig: {
        markedOptions: {
            renderer: renderer
        }
    } 
});

// previewの設定
easymde.codemirror.on("change", function(){
    var renderedHTML = marked(easymde.value(), { renderer: renderer });
    document.getElementById('preview').innerHTML = renderedHTML;
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'preview']);
  });
document.getElementById('preview').classList.add("markdown-body")

// 現在のパスを格納する変数
var currentPath = "";
// 現在開いているファイル名を格納する変数
var currentFile = "";
// 選択中のディレクトリ名を格納する変数
var dirName = "";
// 初期内容を保存
var lastContent = easymde.value();
// グローバル変数としてオートセーブのインターバルIdを保持（一時停止と再開のため）
let autoSaveIntervalId; 
// 現在の編集/プレビューのモードがどちらか記録する変数
let isPreviewMode = false;  

// 内容の変更を確認してファイル保存
function saveFile() {
    if (isPreviewMode) {
        return;
    }
    var currentContent = easymde.value();
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
}

// インターバルでオート保存(5sごと)
function startAutoSaveInterval() {
    autoSaveIntervalId = setInterval(saveFile, 5000); // 5秒ごとに実行
}

// インターバルを停止
function stopInterval(intervalId) {
    clearInterval(intervalId);
}

// ファイルコンテナ生成
function createFileContainer(item) {
    // ファイルコンテナ
    let fileContainer = $('<div>').addClass('file-container');
    // アイテム名
    let itemNameDiv = $('<div>').text((item.name).replace(/\.md$/, "")).addClass('itemname clickable');
    itemNameDiv.addClass(item.type)

    // ディレクトリの場合`▷`アイコンを表示
    if (item.type == "directory") {
        let icon = $('<i>').addClass('fas fa-caret-right');
        itemNameDiv.prepend(icon, " ");
    }

    // nameとpathの登録
    fileContainer.attr('filename', item.name);
    fileContainer.attr('file-path', item.dir);

    // ファイル削除、名前変更のドロップダウンメニューを表示するためのボタン
    let menuButton = $('<button>').text('≡').addClass('menu-icon').hide(); // このボタンは最初は非表示です
  
    // コンテナに要素を追加
    fileContainer.append(itemNameDiv, menuButton);
  
    return fileContainer;
}

// 名前変更リンク生成
function createRenameLink(item, updateFileList) {
    let renameLink = $('<a>').text('rename').addClass('rename clickable');
    renameLink.attr('href', "#");
    renameLink.on('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        var newFileName = prompt("新しいファイル名を入力してください:");
        if (newFileName) {
            stopInterval(autoSaveIntervalId)
            $.post('/rename_file', {old_name: item.name, new_name: newFileName, filepath: item.dir}, function(data){
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
            if (dirName) {
                deleteFileName = dirName + "/" + item.name;
            } else {
                deleteFileName = item.name;
            }
            $.post('/delete_file', {filename: deleteFileName}, function(data){
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
            let fileContainer = createFileContainer(item)
            let dropdownMenu = createDropdownMenu(item, updateFileList);
            fileContainer.append(dropdownMenu);
            
            $('#sidebar').append(fileContainer);
        });
    });
};

// ファイル名をクリックしたときに、そのファイルの内容を取得してエディタに表示
$('#sidebar').on("click", '.file', function(event){
    event.stopPropagation();
    stopInterval(autoSaveIntervalId)
    saveFile()
    const filename = $(this).closest('.file-container').attr("filename")
    var filePath = $(this).closest('.file-container').attr("file-path")
    if (filePath) {
        currentFile = filePath + "/" + filename;
    } else {
        currentFile = filename;
    }
    
    $('#currentFile').text(currentFile);
    $.get('/file/' + currentFile, function(data){
    easymde.value(data);
    lastContent = easymde.value();
    });

    startAutoSaveInterval()
});

// ディレクトリ名をクリックしたときに、ディレクトリ内のファイルを展開して表示
$('#sidebar').on("click", '.directory', function(){
    const dirContainer = this
    // アイコンの状態に応じて処理
    const icon = $(this).find('i');
    if (icon.hasClass('fa-caret-right')) {
        // ディレクトリを開く処理
        dirName = $(this).closest('.file-container').attr("filename");
        $('#selectedDir').text(dirName);
        icon.removeClass('fa-caret-right').addClass('fa-caret-down');
        $.getJSON('/files/' + dirName, function(data) {
            data.forEach(function(item){
                let fileContainer = createFileContainer(item)
                let dropdownMenu = createDropdownMenu(item, updateFileList);
                fileContainer.append(dropdownMenu);
                $(dirContainer).append(fileContainer)
            })
        });
    } else {
        // ディレクトリを閉じる処理
        dirName = ''
        $('#selectedDir').text("Directory is not selected.");
        icon.removeClass('fa-caret-down').addClass('fa-caret-right');
        $(dirContainer).find('.file-container:not(dirContainer)').remove()
    }
});

$('#sidebar').on("click", function(e) {
    if (!$(e.target).hasClass('directory')) {
        dirName = ''; // .directory 以外がクリックされた場合、dirName をリセット
        console.log("reset dirName")
    }
});

// ファイルコンテナにホバーしているときにメニューアイコンを表示
$('#sidebar').on("mouseenter", '.directory, .file', function(event){
    if (event.target === event.currentTarget) {
        $(this).addClass('hovered');
      }
});
$('#sidebar').on("mouseleave", '.directory, .file', function(event){
    if (event.target === event.currentTarget) {
        $(this).removeClass('hovered');
    }
});
$('#sidebar').on("mouseenter", '.directory, .file', function(){
    $(this).closest('.directory:not(this)').removeClass("hovered");
});

// ファイルコンテナにホバーしているときにメニューアイコンを表示
$('#sidebar').on("mouseenter", ".file-container", function(){
    $(this).find('.menu-icon').show();
});
$('#sidebar').on("mouseleave", ".file-container", function(){
    $(this).find('.menu-icon').hide();
});

// メニューアイコンをクリックされるとドロップダウンメニューが表示
$("#sidebar").on('click', '.menu-icon', function(event) {
    event.stopPropagation();
    // 他の開いているメニューを閉じる
    $('.dropdown-menu').hide();
    // クリックされたアイコンに対応するメニューをトグルする
    $(this).siblings('.dropdown-menu').toggle();
});

// 新規ファイル作成
$(".sidebar").on('click', '#create-file-icon', function() {
    var newFileName = prompt("新しいファイル名を入力してください:");
    if (newFileName) {
        if (dirName) {
            newFileName = dirName + "/" + newFileName;
        } else {
            console.log("dir not selected")
        }
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

// 編集、プレビューモード切り替えボタンの挙動
$(document).on('click', '#toggle-edit-preview', function(event) {
    const editorDiv = document.querySelector('.editor');
    const previewDiv = document.querySelector('.preview');
      
    if (isPreviewMode) {
        // プレビューモードから編集モードに切り替え
        editorDiv.style.display = 'block';
        this.textContent = '編集/プレビュー切替';
    } else {
        // 編集モードからプレビューモードに切り替え
        saveFile()
        editorDiv.style.display = 'none';
        this.textContent = 'プレビュー/編集切替';
    }
    isPreviewMode = !isPreviewMode;
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
});

// ウィンドウを閉じるときの動作（開いているファイルを保存する）
$(window).on('beforeunload', function() {
    if (!isPreviewMode) {
        saveFile();
        return "Latest changes saved!";
    }
});