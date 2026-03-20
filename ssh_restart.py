import paramiko
import time

host = '76.13.36.5'
port = 22
username = 'root'
password = 'elmanssa1234.COM'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, port=port, username=username, password=password)

def run_command(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    output = stdout.read().decode()
    error = stderr.read().decode()
    if error:
        print(f"STDERR: {error}")
    return output

print("=" * 60)
print("1. Restarting PostgreSQL...")
print(run_command("sudo systemctl restart postgresql"))

print("2. Waiting 3 seconds...")
time.sleep(3)

print("=" * 60)
print("3. Testing database connection...")
print(run_command("sudo -u postgres psql -d elmanssa_datebase -c \"SELECT 1;\""))

print("=" * 60)
print("4. Granting permissions...")
print("Tables:")
print(run_command("sudo -u postgres psql -d elmanssa_datebase -c \"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;\""))
print("Sequences:")
print(run_command("sudo -u postgres psql -d elmanssa_datebase -c \"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;\""))

print("=" * 60)
print("5. Killing old elmanassa processes...")
print(run_command("pkill -9 -f elmanassa || true"))

print("=" * 60)
print("6. Starting service from /var/www/elmanassa_backend...")
print(run_command("cd /var/www/elmanassa_backend && nohup dotnet elmanassa.dll > /tmp/elmanssa.log 2>&1 &"))

print("7. Waiting 8 seconds...")
time.sleep(8)

print("=" * 60)
print("8. Checking if service is running...")
print(run_command("ps aux | grep elmanassa | grep -v grep"))

print("=" * 60)
print("9. Testing API - http://localhost:5000/api/v1/courses")
response = run_command("curl -s http://localhost:5000/api/v1/courses")
print(response)

client.close()
