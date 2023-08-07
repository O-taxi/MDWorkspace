export class FileContainer {
    constructor(containerElement) {
      this.containerElement = containerElement;
    }
  
    createDropdownMenu() {
      // ドロップダウンメニューコンテナを作成
      let dropdownMenu = document.createElement("div");
      dropdownMenu.className = "dropdown-menu";
  
      // 'ファイル名を変更する'リンクを作成
      let renameLink = document.createElement("a");
      renameLink.href = "#";
      renameLink.className = "rename";
      renameLink.textContent = "ファイル名を変更する";
      dropdownMenu.appendChild(renameLink);  // メニューに追加
  
      // 'ファイルを削除する'リンクを作成
      let deleteLink = document.createElement("a");
      deleteLink.href = "#";
      deleteLink.className = "delete";
      deleteLink.textContent = "ファイルを削除する";
      dropdownMenu.appendChild(deleteLink);  // メニューに追加
  
      this.containerElement.appendChild(dropdownMenu);
    }
  }