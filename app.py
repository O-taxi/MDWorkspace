import os

from flask import Flask, render_template, jsonify, send_from_directory, request
from markdown import markdown

app = Flask(__name__)

@app.route('/')
def index():
    filename = 'Please choice file to open.'  # 仮のファイル名
    return render_template('index.html', filename=filename)

@app.route('/files', methods=['GET'])
def get_files():
    base_dir = './works'
    files = os.listdir(base_dir)
    return jsonify(files)

@app.route('/file/<path:filename>', methods=['GET'])
def get_file(filename):
    base_dir = './works'
    return send_from_directory(base_dir, filename, as_attachment=False)

@app.route('/save', methods=['POST'])
def save_file():
    filename = request.form.get('filename')
    content = request.form.get('content')
    if type(filename) == str:
        filepath = os.path.join("./works", filename)
        with open(filepath, 'w') as file:
            file.write(content)
        ret = jsonify({"message": "Saved successfully!"}), 200
    else:
        ret = jsonify({"message": "filename broken"}), 200
    
    return ret

@app.route('/rename_file', methods=['POST'])
def rename_file():
    base_dir = './works'
    old_name = request.form.get('old_name')
    new_name = request.form.get('new_name')
    if not new_name.endswith(".md"):
        new_name += ".md"
    old_path = os.path.join(base_dir, old_name)
    new_path = os.path.join(base_dir, new_name)
    if os.path.exists(old_path): 
        os.rename(old_path, new_path)  # ファイル名を変更
        return "File renamed successfully", 200
    else:
        return f"{old_path} does not exist", 404

@app.route('/delete_file', methods=['POST'])
def delete_file():
    base_dir = './works'
    filename = request.form.get('filename')
    filepath = os.path.join(base_dir, filename)
    os.remove(filepath)  # ファイルを削除
    return "File deleted successfully", 200

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)