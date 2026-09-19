import urllib.request
import urllib.error
try:
    with urllib.request.urlopen('http://127.0.0.1:8000/', timeout=5) as r:
        body = r.read().decode('utf-8', errors='replace')
        print('STATUS', r.getcode())
        print(body[:500])
except Exception as e:
    print('ERROR', e)
