import paramiko
import time

host = '76.13.36.5'
port = 22
username = 'root'
password = 'elmanssa1234.COM'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=username, password=password, timeout=30)
    
    # Part 1: Database commands
    db_commands = [
        'echo "=== 1. Check table permissions ==="',
        'sudo -u postgres psql -d elmanssa_datebase -c "\\dp \\"Courses\\""',
        'echo "=== 2. Revoke and re-grant ==="',
        'sudo -u postgres psql -d elmanssa_datebase -c "REVOKE ALL ON TABLE \\"Courses\\" FROM PUBLIC;"',
        'sudo -u postgres psql -d elmanssa_datebase -c "GRANT ALL ON TABLE \\"Courses\\" TO postgres;"',
        'sudo -u postgres psql -d elmanssa_datebase -c "GRANT SELECT ON TABLE \\"Courses\\" TO postgres;"',
        'echo "=== 3. Verify ==="',
        'sudo -u postgres psql -d elmanssa_datebase -c "\\dp \\"Courses\\""',
    ]
    
    full_command = ' && '.join(db_commands)
    stdin, stdout, stderr = client.exec_command(full_command, timeout=30)
    output = stdout.read().decode()
    errors = stderr.read().decode()
    
    print("=== DATABASE OUTPUT ===")
    print(output)
    if errors:
        print("=== DB ERRORS ===")
        print(errors)
    
    # Part 2: Restart service (non-blocking)
    print("\n=== Restarting service ===")
    stdin, stdout, stderr = client.exec_command(
        'sudo -u postgres bash -c "pkill -9 -f elmanassa || true; cd /var/www/elmanassa_backend && nohup dotnet elmanassa.dll > /tmp/elmanssa.log 2>&1 &"',
        timeout=10
    )
    print("Service restart command sent")
    
    print("\n=== Waiting 7 seconds ===")
    time.sleep(7)
    
    # Part 3: Test API
    print("\n=== Testing API ===")
    stdin, stdout, stderr = client.exec_command('curl -s http://localhost:5000/api/v1/courses', timeout=15)
    output = stdout.read().decode()
    errors = stderr.read().decode()
    
    print("=== API RESPONSE ===")
    print(output if output else "(empty response)")
    if errors:
        print("=== API ERRORS ===")
        print(errors)
    
    client.close()
except Exception as e:
    print(f"Error: {e}")
