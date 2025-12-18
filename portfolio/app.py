import os
from flask import Flask, render_template

# Initialize Flask app
app = Flask(__name__, template_folder='templates', static_folder='../', static_url_path='')

@app.route('/')
def gallery():
    # Dynamic template listing
    showcase_dir = os.path.join(app.template_folder, 'showcase')
    templates = []
    if os.path.exists(showcase_dir):
        for filename in os.listdir(showcase_dir):
            if filename.endswith('.html'):
                # Create a human-readable name from filename
                name = filename.replace('.html', '').replace('_', ' ').title()
                templates.append({
                    'filename': filename,
                    'name': name
                })
    return render_template('gallery.html', templates=templates)

@app.route('/view/<filename>')
def view_template(filename):
    # Securely render the template from showcase folder
    return render_template(f'showcase/{filename}')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
