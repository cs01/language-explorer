import json
import sys

try:
    users = json.loads(sys.stdin.read())
except json.JSONDecodeError as e:
    print(f"error: {e}", file=sys.stderr)
    sys.exit(1)

result = [
    {"name": u["name"], "email": u["email"]}
    for u in users
    if u["active"] and u["age"] > 18
]
print(json.dumps(result))
