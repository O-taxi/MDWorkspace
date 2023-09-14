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
<img src="/static/images/add_file.png" width="65">

- チェックボックス  
	- [ ] `- [ ]`：未チェック
	- [x] `- [x]`：チェック

- 数式
	- ```math
	a = b
	\frac{1}{2} - \frac{1}{3} = \frac{1}{6} \
  \frac{a+b}{2ab}
	```