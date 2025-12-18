import os
import time
from flask import Flask, render_template, request, jsonify, send_from_directory
from playwright.sync_api import sync_playwright

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOT_FOLDER = os.path.join(BASE_DIR, 'screenshots')
if not os.path.exists(SCREENSHOT_FOLDER):
    os.makedirs(SCREENSHOT_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/screenshot', methods=['POST'])
def screenshot():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    if not url.startswith('http'):
        url = 'https://' + url

    try:
        timestamp = int(time.time())
        filename = f'screenshot_{timestamp}.png'
        filepath = os.path.join(SCREENSHOT_FOLDER, filename)
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url, wait_until='networkidle')
            page.set_viewport_size({"width": 1920, "height": 1080})
            
            # Simulate scroll to trigger animations
            # Scroll down to bottom
            page.evaluate("""
                () => {
                    return new Promise((resolve) => {
                        let totalHeight = 0;
                        const distance = 100;
                        const timer = setInterval(() => {
                            const scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;

                            if(totalHeight >= scrollHeight){
                                clearInterval(timer);
                                resolve();
                            }
                        }, 50); // Fast scroll but slow enough to trigger observers
                    });
                }
            """)
            # Wait for animations to settle
            page.wait_for_timeout(2000) 
            # Scroll back to top if needed, but for full_page screenshot it captures everything.
            # However, some animations might need element to be in viewport.
            # Usually full_page screenshot captures current state.
            
            page.screenshot(path=filepath, full_page=True)
            browser.close()
            
        return jsonify({'image_url': f'/screenshots/{filename}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/screenshots/<path:filename>')
def serve_screenshot(filename):
    return send_from_directory(SCREENSHOT_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
