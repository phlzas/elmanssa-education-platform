import paramiko
import time
import sys

host = "76.13.36.5"
port = 22
username = "root"
password = "elmanssa1234.COM"

print(f"Connecting to {host}...")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, port=port, username=username, password=password, timeout=30)
    print("Connected!")
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)

def run_cmd(cmd):
    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
        output = stdout.read().decode()
        error = stderr.read().decode()
        if error:
            print(f"STDERR: {error}")
        return output
    except Exception as e:
        print(f"Command error: {e}")
        return ""

# 1. Grant permissions
print("\n=== Granting PostgreSQL permissions ===")
out = run_cmd('sudo -u postgres psql -d elmanssa_datebase -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"')
print(out if out else "Done")

out = run_cmd('sudo -u postgres psql -d elmanssa_datebase -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"')
print(out if out else "Done")

# 2. Kill existing processes
print("\n=== Killing existing processes ===")
print(run_cmd("pkill -9 -f elmanassa || true"))

# 3. Start the service
print("\n=== Starting service ===")
print(run_cmd("cd /var/www/elmanassa_backend && nohup dotnet elmanassa.dll > /tmp/elmanssa.log 2>&1 &"))

# 4. Wait 8 seconds
print("\n=== Waiting 8 seconds for startup ===")
time.sleep(8)

# 5. Verify running
print("\n=== Verifying process ===")
print(run_cmd("ps aux | grep elmanassa"))

# 6. Test API
print("\n=== Testing API ===")
response = run_cmd("curl -s http://localhost:5000/api/v1/courses")
print(response)

client.close()
print("\n=== Done ===")
