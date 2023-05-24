To run the prototype:

1. Install Python (preferable 3.7 as it was the one used for development) on your machine
Download link for Python: https://www.python.org/downloads/
Download link for Python 3.7: https://www.python.org/downloads/release/python-370/

2. Extract the downloaded prototype zip file

3. Open a terminal window inside the extracted folder

4. Run command "python3 -m venv venv" to create a virtual environment

5. Activate the environment by using on the following commands:
For windows: venv\Scripts\Activate
For Mac/Linux: source venv/bin/activate

6. Run command "python3 -m pip install -r requirements.txt" to install the necessary libraries

7. Run command "export FLASK_APP=server.py" to tell Flask it should use "server.py" as the server Scripts

8. Run command "flask run" to start the server

9. Access the URL provided in the terminal by Flask (should be http://127.0.0.1:5000/)