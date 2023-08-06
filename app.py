import os

from flask import Flask, render_template, jsonify, send_from_directory, Markup, request
from markdown import markdown

app = Flask(__name__)

def read_md(filepath) -> str:
    with open(filepath, mode='r') as mdfile:
        mdcontent = mdfile.read()
    return Markup(markdown(mdcontent))

@app.route('/')
def index():
    filename = './works/sample.md'  # 仮のファイル名
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

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)