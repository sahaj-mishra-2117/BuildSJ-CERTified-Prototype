"""Be Ready D10 - tiny Flask server. Run: pip install flask && python app.py
The frontend in static/ is fully client-side, so the same folder also works
on GitHub Pages (Settings > Pages > deploy from /static) with no server."""
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder="static", static_url_path="")

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
