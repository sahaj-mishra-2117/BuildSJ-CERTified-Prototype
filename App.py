"""Be Ready D10 - tiny Flask server. Run: pip install flask && python app.py
The frontend in docs/ is fully client-side, so the same folder also works
on GitHub Pages (Settings > Pages > deploy from /docs) with no server."""
from flask import Flask, send_from_directory

app = Flask(__name__, docs_folder="docs", docs_url_path="")

@app.route("/")
def index():
    return send_from_directory("docs", "index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
