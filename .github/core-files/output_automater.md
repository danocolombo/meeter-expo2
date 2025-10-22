# Output Automater

Use this pattern to have the LLM generate a script or other automation artifact that can automatically perform any steps it recommends taking as part of its output.

Note though that much of this functionality is now available in the /new command in VS Code.

## Simple Example

```text
From now on, whenever you generate code that spans more than one file, generate a Python script that can be run to automatically create the specified files.

Now, create a simple web application that displays weather data fetched from an external API.  The application should have a front-end made with HTML and CSS for displaying the weather  information, and a back-end written in Python using Flask. It should also include a JSON  file to store API keys securely and a README file with instructions on how to set up  and run the project.
```

## Example with More Details

```text
From now on, whenever you generate code that spans more than one file, generate a Python script that can be run to automatically create the specified files.

Let's scaffold a simple web application that displays weather data fetched from an external API. The application should have a front-end made with HTML and CSS for displaying the weather information, and a back-end written in Python using Flask. It should also include a JSON file to store API keys securely and a README file with instructions on how to set up and run the project.

The application should be able to fetch weather data from an external API and display it on the front-end. The user should be able to input a location and the application should display the current weather information for that location.

The back-end should be responsible for fetching the weather data from the external API and passing it to the front-end. It should also handle any errors that may occur during the process.

The front-end should be responsible for displaying the weather information to the user in a user-friendly way. It should also handle any user input and pass it to the back-end for processing.

The JSON file should be used to store the API key securely so that it is not exposed to the public. The README file should include instructions on how to set up and run the project, including how to obtain an API key and where to store it in the JSON file.

The project should be well-documented and easy to understand.

The project should have the following file structure:

weather_data_fetcher/
    ├── app/
    │   ├── static/
    │   │   ├── css/
    │   │   │   └── style.css
    │   ├── templates/
    │   │   └── index.html
    │   ├── __init__.py
    │   ├── app.py
    │   └── weather.py
    ├── README.md
    └── api_keys.json

Include boilerplate code. Never use comments like `# Flask application goes here`. Understand that we're just scaffolding here, but use your best effort!

```

### Sample Output from Detailed Prompt

```python
import os
import json

# Define the directory structure
dirs = [
    'weather_data_fetcher/app/static/css',
    'weather_data_fetcher/app/templates'
]

# Create directories
for dir in dirs:
    os.makedirs(dir, exist_ok=True)

# Create files with boilerplate code
files = {
    'weather_data_fetcher/app/__init__.py': '',
    'weather_data_fetcher/app/app.py': """
from flask import Flask, render_template, request
from .weather import fetch_weather

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    weather = None
    if request.method == 'POST':
        city = request.form.get('city')
        weather = fetch_weather(city)
    return render_template('index.html', weather=weather)
""",
    'weather_data_fetcher/app/weather.py': """
import requests
import json

def fetch_weather(city):
    with open('api_keys.json') as f:
        keys = json.load(f)
    response = requests.get(f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={keys["openweathermap"]}')
    return response.json()
""",
    'weather_data_fetcher/app/templates/index.html': """
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <form method="POST">
        <input type="text" name="city" placeholder="Enter a city" required>
        <button type="submit">Get Weather</button>
    </form>
    {% if weather %}
        <h1>{{ weather['name'] }}</h1>
        <h2>{{ weather['main']['temp'] }}°C</h2>
    {% endif %}
</body>
</html>
""",
    'weather_data_fetcher/app/static/css/style.css': """
body {
    font-family: Arial, sans-serif;
}
""",
    'weather_data_fetcher/README.md': """
# Weather Data Fetcher

This is a simple web application that fetches and displays weather data from an external API.

## Setup

1. Obtain an API key from OpenWeatherMap and add it to the `api_keys.json` file.
2. Install the required Python packages: `flask` and `requests`.
3. Run the application with `flask run`.

## Usage

Enter a city in the input field and click "Get Weather" to display the current weather information for that city.
""",
    'weather_data_fetcher/api_keys.json': json.dumps({'openweathermap': 'your_api_key_here'})
}

for file, content in files.items():
    with open(file, 'w') as f:
        f.write(content)
 
```
