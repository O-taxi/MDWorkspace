# テスト
## ブロック作成の例
- インラインコード  
 `pip install -U pip`
- コードブロック
```python
print("Hello World!")
```
- URL  
[github markdown css](https://github.com/sindresorhus/github-markdown-css/tree/main)
- 画像
	- `/static`下に置くことで`/static/<path_to_file>`とすることで画像表示可能
		- Flaskの機能で配信してるっぽい。
		- マークダウンもHTMLも機能してる。
			- `![<画像の名前>](/static/<path_to_file>)`
			- `<img src="/static/<path_to_file>" width="<size(px)>">`

![ファイル追加](/static/images/add_file.png)
<img src="/static/images/add_file.png" width="40">

- チェックボックス  
	- [ ] `- [ ]`：未チェック
	- [x] `- [x]`：チェック

- 数式
	- `\\\[ <数式> \\\]`という風に書くことで数式が書ける。
	- レンダリングに少しラグがあるのがちょっと気になるけどそんなに数式書くことないと思うからいいか。

\\\[
a^2 + b^2 = c^2
\\\]
\\\[
dU = -p~\\left\\{\\left(\\frac {\\partial V}{\\partial T}\\right)_p dT + \\left(\\frac {\\partial V}{\\partial p}\\right)_T\\right\\} + dQ \\tag{1}
\\\]


- html
	- htmlタグもある程度使えるっぽい。
		- 例１：`<h3><font color="red">こんにちは</font></h3>` 
		<h3><font color="red">こんにちは</font></h3>
		- 例２：`<div style="color: #FF5733;">This is an orange text.</div>`  
		<div style="color: #FF5733;">This is an orange text.</div>
		- 例３：`<div style="text-align: center">センター</div>`
		<div style="text-align: center">センター</div>
	