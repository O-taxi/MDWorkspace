# 概要
ブラウザからマークダウンで作業記録を作るためのウェブシステムです。  
ローカルにクローンして、ファイル管理などもローカルに保存して使うことを想定しています。  
![現状](./images/screenshot.png)

# 注意
個人開発で手元で動かしてみることを目的に開発しているためセキュリティ周りは何も考慮されていません。  
初心者がJavaScriptやHTMLの勉強に使っているリポジトリのためどんどんプルリクエストを送っていただければと思います。  
`app.py`内での`Flask`実行が`run(debug=True)`のままになっています。特に追加で変更しない場合は`False`にしてください。  

# 開発環境
Microsoft Edgeで動作を確認しています。  
今後他のブラウザでも動くか試す予定。  

# クローンとパッケージインストール
```
git clone https://github.com/O-taxi/MDWorkspace.git
cd MDworkspace
mkdir works
pip install -r requirement.txt
```

# 実行
```
python app.py
```
実行すると
```
 * Running on http://127.0.0.1:8000
 * Running on http://<ip adress>:8000
```
等と表示されます。  
この`http://<ip adress>:8000`をブラウザに入れることで閲覧できます。