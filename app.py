import os

from flask import Flask, render_template, jsonify, send_from_directory, request

app = Flask(__name__)

@app.route('/')
def index():
    filename = 'Please choice file to open.'  # 仮のファイル名
    return render_template('index.html', filename=filename)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), '/images/favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/files', methods=['GET'])
@app.route('/files/<path:subpath>', methods=['GET'])
def get_files(subpath=None):
    base_dir = './works'
    if subpath:
        base_dir = os.path.join(base_dir, subpath)
    else:
        subpath = ""

    files = os.listdir(base_dir)
    file_list = []
    for f in files:
        full_path = os.path.join(base_dir, f)
        if os.path.isdir(full_path):
            file_type = 'directory'
        else:
            file_type = 'file'
        file_list.append({"name": f, "type": file_type, "dir": subpath})
    return jsonify(file_list)

@app.route('/file/<path:filename>', methods=['GET'])
def get_file(filename):
    filename = filename
    base_dir = './works'
    return send_from_directory(base_dir, filename, as_attachment=False)

@app.route('/save', methods=['POST'])
def save_file():
    filename = request.form.get('filename')
    filename = filename
    content = request.form.get('content')
    if type(filename) == str:
        filepath = os.path.join("./works", filename)
        with open(filepath, 'w') as file:
            file.write(content)
        ret = jsonify({"message": "Saved successfully!"}), 200
    else:
        ret = jsonify({"message": "filename broken"}), 200
    
    return ret

@app.route('/create_file', methods=['POST'])
def create_file():
    base_dir = './works'
    filename = request.form.get('filename')
    if not filename.endswith(".md"):
        filename += ".md"
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        with open(filepath, 'w'): pass
        return "File made successfully", 200
    else:
        return f"!! `{filename}` has already existed. !!", 400

@app.route('/create_directory', methods=['POST'])
def create_directory():
    base_dir = './works'
    dir_name = request.form.get('dir_name')
    dirpath = os.path.join(base_dir, dir_name)
    if not os.path.exists(dirpath):
        os.mkdir(dirpath)
        return "Directoey made successfully", 200
    else:
        return f"!! `{dir_name}` has already existed. !!", 400

@app.route('/rename_file', methods=['POST'])
def rename_file():
    base_dir = './works'
    filepath = request.form.get('filepath')
    old_name = request.form.get('old_name')
    new_name = request.form.get('new_name')

    old_path = os.path.join(base_dir, filepath, old_name)
    print(old_path)
    if not (os.path.isdir(old_path) or new_name.endswith(".md")):
        new_name += ".md"
    new_path = os.path.join(base_dir, filepath, new_name)
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